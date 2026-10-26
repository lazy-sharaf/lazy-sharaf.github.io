"use client";

import { useState } from "react";

const SESSIONS = [
  "7f3a91",
  "b2e0c4",
  "19d8ae",
  "e6402f",
  "a91c73",
  "3c5b18",
  "d07f62",
  "58a4eb",
  "c13d80",
  "6e2f45",
];

const MINE = 4;

/**
 * The whole bug in one control: the same topic, with and without `+`.
 * Defaults to the wide subscription because that is the finding.
 */
export function WildcardDiagram() {
  const [wide, setWide] = useState(true);
  const count = wide ? SESSIONS.length : 1;

  return (
    <figure className="wild" data-wide={wide}>
      <div className="wild-bar">
        <span className="wild-label">subscribe</span>

        <button
          type="button"
          className="wild-topic"
          onClick={() => setWide((value) => !value)}
          aria-pressed={wide}
          aria-label={
            wide
              ? "Narrow the subscription back to a single session"
              : "Widen the subscription with a wildcard"
          }
        >
          <span>client/</span>
          <span className="wild-plus">+</span>
          <span>/chat_session</span>
        </button>

        <span className="wild-count">
          {String(count).padStart(2, "0")} {count === 1 ? "session" : "sessions"}
        </span>
      </div>

      <ul className="wild-list">
        {SESSIONS.map((id, index) => {
          const on = wide || index === MINE;
          return (
            <li key={id} data-on={on}>
              <span className="wild-dot" aria-hidden="true" />
              <span className="wild-id">client/{id}/chat_session</span>
              <span className="wild-tag">
                {index === MINE ? "yours" : on ? "exposed" : "quiet"}
              </span>
            </li>
          );
        })}
      </ul>

      <figcaption className="wild-cap">
        <span>
          {wide
            ? "One character. Ten live customer sessions."
            : "One session — the subscription the app intended."}
        </span>
        <span className="wild-hint">
          Click the topic to {wide ? "narrow" : "widen"} it.
        </span>
      </figcaption>
    </figure>
  );
}
