# How I Hacked a Live Chatbot and Earned My First $$$$ (4-Digit) Bounty

Assalamu Alaikum. I'm **Mahbubur Rahman Soraf**, a part-time bug bounty hunter from **Bangladesh.**

This is my **first writeup ever**. I'm sharing how I found my **first 4-digit bounty on HackerOne**

This is the story of how I found a critical bug in a **live customer support chatbot** on a major website-and earned that bounty. In this write-up, I'll walk you through the entire process step by step, sharing how I discovered, analyzed, and responsibly reported the vulnerability.

---

## The Target and Where I Started

I was hunting on a **private HackerOne program**. The main site -**https://www.[REDACTED].com-**looked normal at first glance. In the corner there was a familiar **customer support chat widget**: the little bubble you click when you need help.

I did not start with fancy scanners or deep exploitation chains. I did something simple that many hunters still swear by: I **viewed the page source** of the homepage. Page source is the raw HTML and embedded data your browser downloads before it draws the page. Companies sometimes hide API URLs, feature flags, or backend hostnames in that data. I was hoping something useful would be there.

It was.

---

## A Chat API URL Hidden in the Page

Inside the page source I found a block called **Drupal settings JSON**. Drupal is a common website CMS, this block is basically a bag of configuration the front end needs. The homepage uses it to wire up features-including the support chat widget in the corner.

I searched that JSON for anything related to chat. There was a small object for the chat integration. The important field was `apiUrl`. It pointed to a full URL on a **different host**, not `www.[REDACTED].com`:

```
https://chat-backend.[REDACTED]:8081/custom?token=[redacted]
```

That was my first real clue. The main site was telling the browser: "when someone opens chat, talk to this server on port **8081**." The hostname `chat-backend.[REDACTED]` is where the chat application actually lives. If something was misconfigured, it would likely be there - not only on the marketing homepage.

So my next move was to **follow that host** and keep doing what had already worked on the main site: **JavaScript recon**.

---

## Finding env_app.js During JS Recon

The `apiUrl` from Drupal settings told me the chat lived on `chat-backend.[REDACTED]:8081`. I did not stop at the homepage. I moved recon to that server and started **collecting and reading JavaScript files** tied to the chat - the same mindset as analyzing bundles on the main site, just on the chat backend this time.

During that JS review I came across `env_app.js`. I opened it in the browser:

```
https://chat-backend.[REDACTED]:8081/env_app.js
```

There was **no login**, **no cookie** check. The file just loaded.

`env_app.js` is not marketing copy. It is **environment configuration** for the chat application - the same kind of file the live chat widget loads so it knows how to connect to backends. Because it was public, anyone on the internet could read it. Inside I saw MQTT connection details, including lines like:

```
CWC_CONNECTION_USERNAME: 'cwc_user'
CWC_CONNECTION_PASSWORD: '[redacted]'
REACT_APP_CWC_MQTT_URL: 'wss://chat-backend.[REDACTED]:8081/mqtt'
```

So the chat app talks to a service using **MQTT over WebSocket** (`wss://...`). It even had a username and password for a user called `cwc_user`. Even if I never went further, leaking broker URLs and credentials in a JS file is already a bad sign: it tells attackers exactly where to knock and which keys might work.

At this point I hit a wall I think many beginners hit: **I did not know what MQTT was.** I had never used it in a hunt before. I only knew the chat "felt" real-time, and this config was how the app achieved that.

**[ IMAGE recon — place `visuals/cb-recon.png` here ]**
![Page source to broker: the recon chain](visuals/cb-recon.png)

*The chain that mattered: page source to `apiUrl`, to the chat host, to `env_app.js`, to the broker URL.*

---

## What MQTT Actually Means

Before I show the command I ran, here is MQTT in everyday terms.

Imagine a **post office in the middle** (the **broker**). Apps do not usually message each other directly, they send packets to the broker. Each packet goes to a **topic**, which is like a **channel name** on a radio. Other apps **subscribe** to topics they care about. When someone **publishes** to a topic, every subscriber gets a copy.

For this chat system, each customer session had its own topic shape:

```
client/{session-id}/chat_session
```

So one topic per chat. That is good design **if** the broker only lets you subscribe to **your** session's topic.

The problem is MQTT also supports **wildcards**. The `+` symbol means "match any single level here." So this topic:

```
client/+/chat_session
```

means "**every** customer's chat session at once." If the broker allows that subscription for a weak user like `admin`, you are no longer listening to one chat - you are listening to **the whole support queue**.

**[ IMAGE wildcard — place `visuals/cb-wildcard.png` here ]**
![One topic per session, versus the wildcard](visuals/cb-wildcard.png)

*`client/{session-id}/chat_session` is one conversation. `client/+/chat_session` matches every one of them.*

That is what I needed to test. But first I needed a way to log in to the broker.

---

## A Clue in the JavaScript (main.js)

The credentials in `env_app.js` were for `cwc_user`, not `admin`. I wanted to understand how the app chooses usernames, so I followed the chatbot's front-end build.

I opened **asset-manifest.json** (a map of built files) and used it to find **main.js -**the main application bundle. Reading minified JS is tedious, but you are looking for needles: hardcoded secrets, debug endpoints, fallback logins.

I found a fallback in the code logic: **if environment variables are not set**, the app defaults to:

```
username: "admin"
password: "admin"
```

That is a classic smell. Developers sometimes leave a default account for local testing and forget it on the server. The code said `admin` / `admin`, but when I tested the broker I used username `admin` with an **empty password** - and **that** is what worked. (So the live misconfiguration was even weaker than the literal fallback string.)

That gave me a clear hypothesis: connect as `admin`, then try the wildcard topic.

---

## Building the Test (With AI's Help)

I still did not know the exact MQTT client commands. I used **AI step by step** to understand brokers, topics, subscribe vs publish, and what `client/+/chat_session` would do. Then I turned that into a small proof-of-concept in **Node.js** using the `mqtt` library.

First install the library:

```
npm install mqtt
```

Then I ran a one-liner (host redacted):

```
node -e "const c=require('mqtt').connect('wss://chat-backend.[REDACTED]:8081/mqtt',{username:'admin',password:'',rejectUnauthorized:false});c.on('connect',()=>{console.log('CONNECTED');c.subscribe('client/+/chat_session',{qos:0},()=>console.log('SUBSCRIBED'))});c.on('message',(t,m)=>console.log(t+': '+m.toString()));setTimeout(()=>process.exit(),60000)"
```

This script does four things:

1. **Connect** to the MQTT broker over WebSocket (`wss://...`) as user `admin` with an empty password. `rejectUnauthorized: false` only tells Node to accept the TLS certificate in this test setup - the important part is the weak login.
2. On **connect**, **subscribe** to `client/+/chat_session` so the broker should send me traffic from all matching chat topics.
3. On every **message**, print the topic name and the JSON/text payload to the terminal.
4. After **60 seconds**, exit so the test does not run forever.

I did not need a company account, VPN, or special network. Just Node and network access to the broker URL that was already in public JS.

---

## When It Worked

I ran the script. It connected. It subscribed. Then lines started appearing in my terminal-fast.

This was not a staging sandbox. These were **live customer support chats** happening on the target site **right then**. Each line was a topic plus a JSON blob: session metadata, chat history, sometimes **JWT tokens** and **session IDs**. When customers typed personal details into the chat-phone numbers, home addresses, contract or service information-those showed up in the same stream. Some messages were also security-sensitive in nature (for example SIM unlock requests), which makes the impact worse than just reading marketing questions.

I let it run for about **three minutes** to confirm the issue was real and repeatable. In that short window I counted **88 messages** across **10 different customer sessions**. That was more than enough proof.

**[ IMAGE stream — place `visuals/cb-stream.png` here ]**
![Ten sessions, eighty-eight messages](visuals/cb-stream.png)

*One wildcard subscription, ten different customer sessions, and 88 live messages in about three minutes.*

Then I **stopped**. I did not need to hoard data. For a report you want to show the flaw exists, not archive people's conversations.

---

## Why This Breaks Trust

When someone opens a support chat, they assume only the company (and maybe an agent) can see it. They type account problems, delivery questions, phone numbers, addresses-things you would not post on social media.

Here, two failures stacked:

1. **Authentication:** the broker accepted a trivial `admin` login (empty password).
2. **Authorization:** that user could subscribe to a **wildcard** topic and receive **many unrelated sessions**.

An attacker could sit quietly anywhere in the world and **read active support chats in real time** without registering an account. No complex exploit chain-one script, built from clues already public in JavaScript files.

---

## Reporting and Outcome

I packaged the finding for **HackerOne** in mid-March 2026: clear reproduction steps, the Node command pattern, a short PoC video, redacted samples, and a plain impact section (unauthorized access to private support conversations, exposure of personal data, high confidentiality risk).

Triage did not end in one message. I had to explain the real issue more than once. In the end the program accepted it as a **valid critical-severity issue**. For me it was also personal: my **first 4-digit bounty**.

---

## After I Reported (Conversation with the Triager)

The first reply from the triager was polite, but it sounded like a **duplicate** of older reports. They said the program had already reviewed similar findings. The earlier conclusion was roughly this: exposed chat configuration and a public MQTT connection might be **intentional**, because the chat widget itself is public and user authentication happens later and-according to that earlier review-you could **not** read or intercept **other people's** messages with what was exposed.

I knew my finding was different, so I replied calmly and stuck to facts.

A public broker connection might be acceptable by design. But that was not the core bug. The core bug was **authorization on MQTT topics**: anyone could subscribe to `client/+/chat_session` and receive **live chat sessions from other customers**. My PoC video showed real fields - home addresses, phone numbers, service IDs - flowing in real time. I also asked a direct question: did the older reports actually demonstrate **live cross-customer data**, or did they only mention exposed config files and credentials? Those are not the same severity.

That message changed the tone.

The triager came back after their engineering team retested from their side. In short, they confirmed what I had been saying:

> We tested this and confirmed on the engineering side that it was *real customer data*. Earlier reports did not show any *live* data leaks. The chatbot has been *taken down* until the issue is fixed.

I thanked them. Taking the chatbot offline immediately was the right call while live customer PII was still possible.

A few days later they asked me to **retest** the fix and to share IP addresses and timestamps so they could improve logging and exclude my traffic from the investigation. I retested and confirmed the vulnerability was **gone -** I could no longer subscribe to the wildcard topic. I shared the network and time details. The chatbot stayed down until the backend was safe again.

---

## Closing Thoughts

This hunt reminded me that boring recon still wins. Page source led to the chat `apiUrl`, the chat host led to `env_app.js`, that file led to a protocol I had to learn on the fly, and the application JS gave me the last hint for which account to try. AI helped me learn and assemble the test, but the evidence came from what was already exposed on the public internet.

---

## Before I Wrap Up

Before I close this writeup, there is one person I cannot leave unmentioned.

First and foremost, all praise belongs to Allah. I truly believe that every achievement comes from Him. For this milestone, the person He made a means of guidance and support was **@emptymahbob**.

Thank you for your mentorship, encouragement, and for always pushing me to learn and improve. My first 4-digit bounty is not only a personal milestone-it also reflects the knowledge and motivation I received from you.

I will always be grateful.

**My Bug Bounty Boss - @emptymahbob ❤️**
