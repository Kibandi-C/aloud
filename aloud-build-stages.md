# Aloud — Staged Build Plan (resumable across Claude Code limits)

Use this alongside `SPEC.md` in the repo root. Each stage is a self-contained prompt you paste
into a **fresh Claude Code session**. Stages reference `SPEC.md` instead of repeating it, so
each prompt stays small and a session won't run out of room just reading the plan.

---

## How to use this

**At the start of every session, paste this first:**

> Read `SPEC.md` and `PROGRESS.md` in full before doing anything. Work **only** on the stage I
> name below. Do not start the next stage. Commit your work in small steps (after each
> sub-task), and at the end update `PROGRESS.md`. If you are running low on context, stop at
> the last clean commit, write where you stopped in `PROGRESS.md`, and tell me.

Then paste the stage block (e.g. "Stage 1") underneath.

**The resume contract — this is what makes it limit-proof:**
- Every sub-task ends in a **git commit**. A half-done stage is never lost; you resume from the
  last commit.
- `PROGRESS.md` is the single source of truth for "what's done." A fresh session reads it and
  knows exactly where to pick up — it never has to re-read your mind or the whole codebase.
- Stages are ordered by dependency. Don't skip ahead; later stages assume earlier ones exist.

**Create `PROGRESS.md` once (Stage 0 does this). Template:**

```md
# Aloud — Build Progress

Stack confirmed: React+Vite+TS+Tailwind+Router+Zustand. Deploy target: Cloudflare Pages.

- [ ] Stage 0 — Scaffold & foundation
- [ ] Stage 1 — Speech engine (provider abstraction + Web Speech) + reader UI
- [ ] Stage 2 — Natural voices (Kokoro)
- [ ] Stage 3 — Input pipelines (.txt / .pdf / OCR)
- [ ] Stage 4 — Local library
- [ ] Stage 5 — Landing page
- [ ] Stage 6 — PWA (install + offline)
- [ ] Stage 7 — Polish & accessibility
- [ ] Stage 8 — Build & deploy

## Notes / where I stopped
(Claude Code updates this: last commit, any half-done sub-task, decisions made.)
```

---

## Stage 0 — Scaffold & foundation
**Goal:** an empty but runnable app with the design system and both routes stubbed.
**Preconditions:** empty repo.
**Read:** SPEC §2 (constraints), §3 (stack), §4 (structure), §5 (design system).
**Do:**
- Scaffold Vite + React + TypeScript; add Tailwind, `react-router-dom`, `zustand`,
  `lucide-react`. Don't install pdf/ocr/kokoro yet — later stages add them.
- Put the §5 color tokens into `tailwind.config`; load the three Google Fonts.
- Create the folder structure from §4 (empty/stub files are fine).
- Set up routes: `/` (Landing stub) and `/read` (Reader stub) with the base layout + header.
- Create `PROGRESS.md` from the template above.
**Done when:** `npm run dev` shows both routes with correct fonts/colors; `npm run build` is
clean. Commit. Tick Stage 0 in `PROGRESS.md`.
**If you hit a limit:** commit what compiles; note remaining setup in `PROGRESS.md`.

---

## Stage 1 — Speech engine + reader UI  *(the heart — largest stage; commit often)*
**Goal:** paste text → play → hear it (Standard voice) with sentence highlighting and full
transport controls.
**Preconditions:** Stage 0 done.
**Read:** SPEC §5, §6 (Reader screen), §7 (providers + `useSpeech`), §11 (store), §13 (engine
gotchas), §14 items 1–3 & 6.
**Do — commit after each:**
1. `sentences.ts` splitter + the Zustand store (§11) for content.
2. `tts/types.ts` (the `TTSProvider` interface) + `WebSpeechProvider`.
3. `useSpeech.ts` — the sentence loop, session guard, play/pause/resume/reset/seek/setRate,
   async voice loading, Chrome keep-alive, cleanup (all per §7).
4. `ReadingPane` (sentence spans, active `--mark` highlight, `--done` dimming, auto-scroll,
   tap-to-seek) + paste-only `InputTabs`.
5. `PlaybackDock` (Play/Pause, Reset, progress bar, voice name, 1×/1.5×/2× — **omit** the
   Natural toggle for now; Stage 2 adds it).
**Done when:** §14 criteria 1, 2, 3, 6 pass with the Standard voice. Commit. Tick Stage 1.
**If you hit a limit:** the per-sub-task commits mean you resume at the next number. Record
which sub-task is next in `PROGRESS.md`.

---

## Stage 2 — Natural voices (Kokoro)
**Goal:** a Standard | Natural toggle; Natural runs on-device neural TTS, lazy-loaded.
**Preconditions:** Stage 1 done (the provider abstraction must exist).
**Read:** SPEC §7 (`setProvider`), §13 (Kokoro gotchas), §17 (full Kokoro spec + reference
`KokoroProvider`), §14 items 12–13.
**Do — commit after each:**
1. `npm i kokoro-js`. Implement `KokoroProvider` per §17 (dynamic import, WebGPU/WASM detect,
   per-sentence render→play, one-ahead prefetch, cache). Verify the audio→Blob method name
   against the installed version.
2. Wire `useSpeech.setProvider('kokoro')`: lazy init, `modelProgress`, metered-connection
   confirm, fall back to Standard on failure.
3. Add the **Standard | Natural** toggle to `PlaybackDock` + download progress bar; persist the
   choice (§11) but never auto-download on load.
**Done when:** §14 criteria 12–13 pass; highlighting/pause/seek/speed behave identically in
both voices. Commit. Tick Stage 2.

---

## Stage 3 — Input pipelines (.txt / .pdf / OCR)
**Goal:** load text from a file or a photo, not just paste.
**Preconditions:** Stage 1 done.
**Read:** SPEC §6 (InputTabs), §8 (pipelines), §13 (PDF/OCR gotchas), §14 items 4–5.
**Do — commit after each (these are independent; if a limit hits, you've banked the prior one):**
1. `.txt` via `extractTxt` + Upload tab UI (drag/drop).
2. `.pdf` via `pdfjs-dist` (`extractPdf`); configure the worker for Vite; empty-text →
   "likely scanned, try Photo" message.
3. Camera OCR via `tesseract.js` (`extractImage`), lazy-imported, with progress % and the
   one-time lang-download heads-up; Photo tab with `capture="environment"`.
**Done when:** §14 criteria 4–5 pass. Commit. Tick Stage 3.

---

## Stage 4 — Local library
**Goal:** recent texts saved and reloadable.
**Preconditions:** Stage 1 (store) done.
**Read:** SPEC §6 (LibraryDrawer), §9, §11, §14 item 7.
**Do:** add `library` to the store + `localStorage` persistence (save on load, cap ~20, evict
oldest, try/catch); build `LibraryDrawer` (list newest-first, tap to reload, delete).
**Done when:** §14 criterion 7 passes (survives refresh). Commit. Tick Stage 4.

---

## Stage 5 — Landing page
**Goal:** finish the marketing surface.
**Preconditions:** Stage 0 done (works in parallel with 1–4, but do after the app proves out so
the copy is honest).
**Read:** SPEC §5, §6 (Landing).
**Do:** build all five sections (Hero, How it works, Features, Install/CTA, Footer) with real
copy; keep heavy libs off this route (lazy-load pdf/ocr/kokoro only on `/read`).
**Done when:** landing renders fast, CTAs route to `/read`, no heavy chunks on `/`. Commit.
Tick Stage 5.

---

## Stage 6 — PWA (install + offline)
**Goal:** installable, launches standalone, opens offline.
**Preconditions:** Stages 0–5 done.
**Read:** SPEC §10, §14 item 8.
**Do:** add `vite-plugin-pwa`; manifest (name/colors/display standalone); icons
(192/512/maskable + apple-touch); service worker precaching the app shell.
**Done when:** §14 criterion 8 passes; Add-to-Home-Screen works in iOS Safari. Commit. Tick
Stage 6.

---

## Stage 7 — Polish & accessibility
**Goal:** clear the quality floor.
**Preconditions:** Stages 0–6 done.
**Read:** SPEC §5, §12, §13, §14 items 9, 10, 13.
**Do:** keyboard + `:focus-visible` on every control; correct ARIA on Play/Pause and speed;
`prefers-reduced-motion`; ≥44px hit targets; one full pass at 375px; **real iPhone test of both
Standard and Natural voices.**
**Done when:** §14 criteria 9, 10, 13 pass. Commit. Tick Stage 7.

---

## Stage 8 — Build & deploy
**Goal:** live on the web, $0.
**Preconditions:** Stages 0–7 done.
**Read:** SPEC §10, §14 item 11.
**Do:** confirm `npm run build` is clean with no env vars; deploy the static output to
Cloudflare Pages; verify the deployed PWA installs and the offline shell loads.
**Done when:** §14 criterion 11 passes on the live URL. Commit. Tick Stage 8 — done.

---

## Quick reference — stage dependencies

```
Stage 0 ──┬─► Stage 1 ──┬─► Stage 2 (Natural voices)
          │             ├─► Stage 3 (inputs)
          │             └─► Stage 4 (library)
          └─► Stage 5 (landing, can run any time after 0)
Stages 1–5 ─► Stage 6 (PWA) ─► Stage 7 (polish) ─► Stage 8 (deploy)
```

Stage 1 is the only one that's genuinely large; its five committed sub-tasks are your safety
net. Everything after it is small enough to finish well inside a single session.
