# Aloud — Build Progress

Stack confirmed: React+Vite+TS+Tailwind+Router+Zustand. Deploy target: Cloudflare Pages.

- [x] Stage 0 — Scaffold & foundation
- [ ] Stage 1 — Speech engine (provider abstraction + Web Speech) + reader UI
- [ ] Stage 2 — Natural voices (Kokoro)
- [ ] Stage 3 — Input pipelines (.txt / .pdf / OCR)
- [ ] Stage 4 — Local library
- [ ] Stage 5 — Landing page
- [ ] Stage 6 — PWA (install + offline)
- [ ] Stage 7 — Polish & accessibility
- [ ] Stage 8 — Build & deploy

## Notes / where I stopped

### Stage 0 — done (2026-06-13)
- Scaffolded Vite + React 18 + TypeScript by hand (dir wasn't empty — had the .md files).
- Deps installed: `react-router-dom`, `zustand`, `lucide-react` (+ `@types/node`). PDF/OCR/Kokoro
  deliberately NOT installed — later stages add them.
- Tailwind configured with the SPEC §5 color tokens + the three Google Fonts (Fraunces /
  Newsreader / Space Grotesk, loaded in `index.html`).
- §4 folder structure created; lib/tts/hooks/store/components are compile-only stubs
  (`export {};` + a comment naming the stage that fills them in).
- Routes `/` (Landing stub) and `/read` (Reader stub) wired under a shared `Layout` with a
  sticky header (Wordmark + "Start listening" CTA).
- `npm run build` is clean (`tsc -b && vite build`); `npm run dev` serves both routes (200).
- Notes: `git init` was run this session (repo started untracked). `.claude/settings.local.json`
  and tsc config-emit artifacts (`vite.config.js/.d.ts`) are gitignored.
- Last commit before this PROGRESS update: "chore: ignore tsc -b config emit artifacts".

### Next up
- **Stage 1 — Speech engine + reader UI** (largest stage; commit after each of its 5 sub-tasks).
  Start with `sentences.ts` + the Zustand content store, then `tts/types.ts` +
  `WebSpeechProvider`, then `useSpeech.ts`, then `ReadingPane` + paste `InputTabs`, then
  `PlaybackDock` (omit the Natural toggle — that's Stage 2).
