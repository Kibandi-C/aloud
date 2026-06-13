# CLAUDE.md — Aloud

You are building **Aloud**: one React/Vite web app that is also an installable PWA. A user
pastes, uploads, or photographs text; the app reads it aloud and highlights the current
sentence. Everything runs in the browser — no server, no cost.

The full blueprint is in **`SPEC.md`**. The work is cut into stages in
**`aloud-build-stages.md`**. This file holds the rules that apply to **every** session.

---

## Working agreement (follow every session)

- **Read `SPEC.md` and `PROGRESS.md` in full before doing anything.**
- **Work on ONLY the one stage I name.** Do not start or scaffold the next stage.
- **Commit after every small sub-task**, not just at the end of a stage.
- At the end of the stage, **update `PROGRESS.md`**: tick the stage and note the last commit.
- If you are running low on context, **stop at the last clean commit**, write where you
  stopped in `PROGRESS.md`, and tell me. Do not rush to "finish" with uncommitted work.
- Ask before introducing any dependency, pattern, or file not described in `SPEC.md`.

---

## Non-negotiable constraints (never violate)

- **Frontend only.** No backend, no database, no server functions, no auth, no accounts.
- **Zero running cost.** No paid APIs, no API keys, nothing that bills. If a task seems to
  need a server or a key, STOP and flag it — it almost certainly doesn't for this MVP.
- **TTS is 100% client-side**, via two swappable engines behind one `TTSProvider` interface:
  - **Standard** = browser Web Speech API (default, instant).
  - **Natural** = Kokoro on-device neural TTS (`kokoro-js`), lazy-loaded. See SPEC §17.
  - No cloud TTS (no ElevenLabs/OpenAI/etc.), no voice cloning, no celebrity voices.
- **Build the engine before the second voice.** The provider abstraction + Web Speech
  (Stage 1) must be committed before Kokoro (Stage 2) is added — Kokoro plugs into it.
- **Never auto-download the Kokoro model on load.** Only when the user selects Natural and
  presses play; show progress; confirm first on a metered connection.
- **Must work on iOS Safari (iPhone)** — the primary device. First `play()` must come from a
  user gesture. Respect the gotchas in SPEC §13.
- **Mobile-first**, responsive, installable as a PWA.
- **All persistence is `localStorage` only.** No sync, no cloud.
- **TypeScript throughout.** Avoid `any` unless genuinely unavoidable.
- **Accessible:** keyboard-operable, visible focus, ARIA on controls,
  `prefers-reduced-motion` respected, WCAG AA contrast.

---

## Fixed tech stack (do not substitute)

React 18 + Vite + TypeScript · Tailwind CSS · `react-router-dom` (routes `/` and `/read`) ·
Zustand · `vite-plugin-pwa` · `pdfjs-dist` · `tesseract.js` · `kokoro-js` · `lucide-react`.
No UI kit. Keep dependencies minimal. Deploy target: Cloudflare Pages (static, no env vars).

---

## Scope guardrail

The value is the core loop — text in, audio out, current sentence tracked — done extremely
well, for free. Out of scope: cloud/paid voices, cloning, accounts, sync, browser extensions,
AI summarization, anything needing a key or a server. Don't build these even if asked mid-build
without updating `SPEC.md` first.