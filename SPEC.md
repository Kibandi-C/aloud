# Aloud — Build Specification for Claude Code

> Paste this whole file into Claude Code as your first instruction, **or** save it in the
> repo root as `SPEC.md` and tell Claude Code: *"Read SPEC.md and build it milestone by
> milestone (Section 15). Stop after each milestone so I can verify before you continue."*
> Also drop the "Non-negotiable constraints" (Section 2) into a `CLAUDE.md` so they persist
> across the whole session.

---

## 1. What you are building

**Aloud** is a free, browser-native text-to-speech web app: a user pastes, uploads, or
photographs text, presses play, and hears it read aloud while the current sentence is
highlighted. It ships as one Vite single-page app with a marketing landing page and the
reader tool, installable as a PWA.

**The core architectural fact that governs every decision:** speech synthesis is done
entirely in the browser, with **two swappable client-side engines** — the **Web Speech API**
(`window.speechSynthesis`, instant, the default "Standard" voice) and **Kokoro**, an
on-device neural TTS model that gives natural "Natural" voices (Section 17). There is **no
TTS API, no API key, no backend, and no running cost** for either. PDF parsing
(`pdfjs-dist`) and image OCR (`tesseract.js`) also run client-side in WASM. The whole product
is a static site.

If at any point a task seems to require a server, a paid API, or a key — stop and
reconsider, because it almost certainly does not for this MVP.

---

## 2. Non-negotiable constraints  *(put these in CLAUDE.md)*

- **Frontend only.** No backend, no database, no server functions, no auth, no accounts.
- **Zero running cost.** No paid APIs, no API keys, nothing that bills.
- **TTS runs entirely client-side** via two engines: the browser **Web Speech API**
  (instant, default) and **Kokoro** (on-device neural voices, Section 17). No cloud TTS, no
  API key, no server — both run in the user's browser.
- **Must work on iOS Safari** (iPhone) — this is the primary target device. Respect its
  quirks (Section 13).
- **Mobile-first**, responsive, installable as a PWA.
- **Accessible:** keyboard operable, visible focus, ARIA on controls, `prefers-reduced-motion`
  respected, WCAG AA contrast.
- **TypeScript throughout.** No `any` unless genuinely unavoidable.
- All persistence is `localStorage` only. Never invent a sync/cloud feature.

---

## 3. Tech stack (use exactly these)

- **React 18 + Vite + TypeScript**
- **Tailwind CSS** for styling (configure the design tokens from Section 5 into
  `tailwind.config`)
- **React Router** (`react-router-dom`) — two routes: `/` (landing), `/read` (app)
- **Zustand** for app state (Section 11)
- **vite-plugin-pwa** for installability + offline shell
- **pdfjs-dist** for PDF text extraction
- **tesseract.js** for image/camera OCR
- **kokoro-js** for on-device neural voices (lazy-loaded; Section 17)
- **lucide-react** for icons
- No UI kit. Build components from Tailwind + the tokens. Keep dependencies minimal.

---

## 4. Project structure

```
aloud/
├─ public/
│  ├─ icons/ (PWA icons: 192, 512, maskable, apple-touch)
│  └─ tesseract/ (optional: self-hosted worker + lang data; otherwise CDN)
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                 # router
│  ├─ index.css               # Tailwind directives + base
│  ├─ lib/
│  │  ├─ sentences.ts         # text → sentence[] splitter
│  │  ├─ extractTxt.ts        # File → string
│  │  ├─ extractPdf.ts        # File → string (pdfjs-dist)
│  │  └─ extractImage.ts      # File → string (tesseract.js)
│  ├─ tts/
│  │  ├─ types.ts             # TTSProvider interface (Section 7)
│  │  ├─ WebSpeechProvider.ts # default "Standard" voice, instant
│  │  └─ KokoroProvider.ts    # on-device neural "Natural" voice, lazy-loaded (Section 17)
│  ├─ hooks/
│  │  └─ useSpeech.ts         # orchestrates a TTSProvider (Section 7)
│  ├─ store/
│  │  └─ useAppStore.ts       # Zustand (Section 11)
│  ├─ components/
│  │  ├─ landing/             # Hero, Features, HowItWorks, CTA, Footer
│  │  ├─ reader/
│  │  │  ├─ InputTabs.tsx     # Paste | Upload | Photo
│  │  │  ├─ ReadingPane.tsx   # rendered sentences + active highlight
│  │  │  ├─ PlaybackDock.tsx  # play/pause/reset, speed, voice, progress
│  │  │  └─ LibraryDrawer.tsx # saved/recent texts
│  │  └─ ui/                  # Button, Tabs, Spinner, Toast, etc.
│  └─ pages/
│     ├─ Landing.tsx
│     └─ Reader.tsx
├─ tailwind.config.ts
├─ vite.config.ts             # incl. VitePWA()
└─ index.html
```

---

## 5. Design system

Editorial-but-modern. A warm paper reading surface inside a deep ink shell, one confident
coral accent, and a butter-yellow "highlighter" sweep on the sentence being read. Avoid the
generic dark-mode-acid-green dashboard look.

**Color tokens** (add to Tailwind theme):

```
shell      #16151D   app background (deep ink)
shell-2    #1E1D27   raised surfaces / cards
paper      #FFFDF8   reading surface (light, high legibility)
ink        #23222B   text on paper
muted      #6B6A75   secondary text
line       #2A2935   borders on dark / #E7E2D6 on paper
accent     #FF6B5A   primary action (play, CTAs)
accent-ink #241007   text on accent
mark       #FFE39A   active-sentence highlight (the signature element)
done       #8C8678   already-read sentence text on paper
```

**Typography** (Google Fonts):

- Display: **Fraunces** (600) — landing headlines, logo wordmark. Used with restraint.
- Reading: **Newsreader** (400/500) — the reading pane and long-form text. Made for reading.
- UI: **Space Grotesk** (400/500/600) — buttons, labels, nav, dock.

Scale: display 40–64px landing hero; reading pane 18px mobile / 20px desktop, line-height
~1.85; UI 13–15px.

**Signature element:** the active sentence in the reading pane gets a `--mark` highlighter
background that the eye can track like a finger under the line, plus smooth `scrollIntoView`
keeping it centered. Already-read sentences fade to `--done`. This is the one bold thing;
keep everything else quiet.

**Radius:** 12–14px on cards/controls; 50% on the round play button.
**Motion:** subtle. A small audio-bars animation in the logo; sentence highlight transitions
~0.2s. All animation off under `prefers-reduced-motion`.

(Reference implementation of the reading pane + dock already exists — match its behavior, raise
its polish.)

---

## 6. Routes & screens

### `/` — Landing page

Single scrolling page, sections in order:

1. **Hero.** Wordmark "Aloud". Headline conveying "turn anything you read into something you
   hear — free, in your browser." One primary CTA button → `/read` ("Start listening").
   Subcopy naming the three inputs (paste, file, photo). No signup, state that plainly.
2. **How it works** — three steps: *Add text → Press play → Listen along.* Encode as a real
   3-step sequence (numbering is meaningful here).
3. **Features** — paste/upload/photo, sentence highlighting, 1×/1.5×/2× speed, works offline
   once installed, install-to-home-screen. Plain, honest copy — no marketing fluff.
4. **Install / CTA** — "Add Aloud to your home screen" + a second link into `/read`.
5. **Footer** — name, a line that it runs entirely in your browser, link to source if public.

Landing must be fast and static; no heavy libs loaded here (lazy-load the reader's pdf/ocr
chunks only on `/read`).

### `/read` — The reader app

Layout: input zone (top), reading pane (center, the hero of this screen), playback dock
(sticky bottom), library drawer (slide-in).

- **InputTabs:** three tabs — **Paste**, **Upload**, **Photo**.
  - Paste: a textarea + word count + "Load & read".
  - Upload: drag/drop or pick a `.txt` or `.pdf`. Show a spinner + "Extracting…" while
    parsing. On a scanned PDF with no extractable text, show a clear message offering the
    Photo/OCR path instead.
  - Photo: `<input type="file" accept="image/*" capture="environment">` (opens the camera on
    mobile). Run OCR with a visible progress %; warn first run downloads ~2–4MB of language
    data.
- **ReadingPane:** renders the loaded text as sentence `<span>`s. The active sentence gets
  the `--mark` highlight; read sentences get `--done`. Tapping a sentence seeks playback to
  it. Auto-scroll the active sentence to center.
- **PlaybackDock (sticky):** round Play/Pause, Reset-to-start, a thin top progress bar
  (sentence index / total), the current voice name, a speed segmented control
  (1× / 1.5× / 2×), and a **Voice toggle: Standard | Natural** (Standard = Web Speech,
  Natural = Kokoro; flipping to Natural the first time triggers the one-time model download
  flow in Section 17, with a progress bar). Disabled state until text is loaded.
- **LibraryDrawer:** list of recent loaded texts (title = first ~6 words, saved to
  localStorage), tap to reload, swipe/X to delete. Cap at ~20 entries.

---

## 7. The speech engine — providers + `useSpeech.ts`  *(the crux; spec it precisely)*

The engine is split into two layers so voices are swappable without touching playback logic:

- **A `TTSProvider` abstraction** (`src/tts/types.ts`) — a uniform interface implemented by
  `WebSpeechProvider` (default, instant) and `KokoroProvider` (on-device neural, Section 17).
- **`useSpeech.ts`** — owns the sentence loop, index/state, pause/resume/seek/rate, and just
  drives whichever provider is active.

The hard problems (reliable highlighting, pause/resume, speed changes, cross-browser
stability) are solved by **sentence chunking**: never synthesize the whole text at once.
Speak/generate one sentence at a time and advance when it finishes. This gives exact
sentence highlighting **and** sidesteps Chrome's bug where a long utterance silently stops
after ~15s. It also maps cleanly onto Kokoro, which generates per-sentence audio.

### Provider interface (`src/tts/types.ts`)

```ts
export type ProviderId = 'webspeech' | 'kokoro';
export interface TTSVoice { id: string; label: string; lang: string; }
export interface SpeakOpts { rate: number; voice: string; }

export interface TTSProvider {
  id: ProviderId;
  /** Load voices / model. onProgress is 0..1 (Kokoro download). Resolves when ready. */
  init(onProgress?: (p: number) => void): Promise<void>;
  listVoices(): TTSVoice[];
  /** Speak ONE sentence. Resolves when it finishes; rejects if stopped mid-way. */
  speak(text: string, opts: SpeakOpts): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;                                    // cancel current sentence
  /** Optional: warm up the next sentence while the current one plays (Kokoro). */
  prefetch?(text: string, opts: SpeakOpts): void;
  dispose(): void;
}
```

Both providers expose the same surface; the difference is internal. `WebSpeechProvider`
wraps `speechSynthesis.speak` and resolves on the utterance's `onend`. `KokoroProvider`
generates an audio Blob and plays it through an `HTMLAudioElement`, resolving on `ended`
(Section 17).

### `useSpeech` orchestration

```ts
type SpeechState = 'idle' | 'loading' | 'playing' | 'paused' | 'done';

interface UseSpeech {
  state: SpeechState;
  currentIndex: number;
  provider: ProviderId;          // 'webspeech' (default) | 'kokoro'
  voices: TTSVoice[];
  voice: string;
  rate: number;                  // 1 | 1.5 | 2
  supported: boolean;            // no Web Speech AND no Kokoro path → notice
  modelProgress: number | null;  // 0..1 while Kokoro downloads, else null
  load(sentences: string[]): void;
  play(): void;                  // MUST be called from a user gesture (iOS)
  pause(): void;
  resume(): void;
  reset(): void;
  seekTo(index: number): void;
  setRate(rate: number): void;
  setVoice(id: string): void;
  setProvider(id: ProviderId): Promise<void>;   // may trigger Kokoro init/download
}
```

**The sentence loop** (single source of truth; a `session` counter guards stale callbacks):

```ts
let session = 0;
async function run(from: number) {
  const my = ++session;
  for (let i = from; i < sentences.length; i++) {
    if (my !== session) return;                       // superseded by stop/seek/rate change
    setIndex(i);
    provider.prefetch?.(sentences[i + 1], { rate, voice });   // optional warm-up
    try { await provider.speak(sentences[i], { rate, voice }); }
    catch { return; }                                 // stopped mid-sentence
    if (my !== session) return;
  }
  finish();
}
```

**Required behaviors:**

- **play():** if idle/paused, `run(currentIndex)`; set state `playing`. The first call MUST be
  inside a user gesture (iOS) — true for both engines.
- **pause()/resume():** `provider.pause()` / `provider.resume()`. The pending `speak` promise
  stays open across the pause, so the loop just waits. Do **not** bump `session`.
- **reset():** `++session`, `provider.stop()`, index → 0, state → idle.
- **seekTo(i):** `++session`, `provider.stop()`, index = i, and if it was playing, `run(i)`.
- **setRate(r):** rate is baked into a sentence (neither engine retunes mid-sentence), so
  `++session`, `provider.stop()`, then `run(currentIndex)` at the new rate — keeps the place.
- **setProvider(id):** stop playback, lazy-init the new provider (Kokoro may download — surface
  `modelProgress`), remap to a sensible default voice, stay paused at `currentIndex` so the
  user resumes in the new voice. Default provider on first load is always `webspeech`.
- **Voice loading is async** (Web Speech): `getVoices()` is often empty on first call — also
  handle `onvoiceschanged`. Default = first `en-US` local voice, else first `en*`, else `[0]`.
- **Keep-alive (Chrome, Web Speech only):** guarded `setInterval` calling `synth.resume()`
  every ~10s while playing; clear otherwise.
- **Cleanup:** `provider.stop()` + `dispose()` on unmount / route change away from `/read`;
  pause on `document.visibilitychange` → hidden to avoid zombie audio.

---

## 8. Input pipelines (`src/lib`)

- **extractTxt:** `FileReader.readAsText(file)` → string. Trivial.
- **extractPdf:** `pdfjs-dist` — load the document from `file.arrayBuffer()`, loop pages,
  concatenate `getTextContent().items[].str`. Configure the pdf.js worker correctly for Vite
  (import the worker via `?url` or set `GlobalWorkerOptions.workerSrc`). If total extracted
  text is empty/whitespace, return a typed result that signals "no text layer — likely
  scanned" so the UI can suggest OCR.
- **extractImage:** `tesseract.js` `recognize(file, 'eng')`, surfacing the progress callback
  to the UI. Lazy-import this module so the WASM/lang payload only loads when the user picks
  the Photo tab.
- All three feed the **same** `sentences.ts` splitter, then `useSpeech.load()`.
- **sentences.ts:** collapse whitespace, split into sentences keeping terminal punctuation,
  trim, drop empties. Reasonable regex is fine; handle the no-terminal-punctuation case
  (return the whole string as one sentence). Don't over-engineer abbreviation handling for v1.

---

## 9. Local library (localStorage)

- On successful load, save `{ id, title, text, createdAt }` (title = first ~6 words).
- LibraryDrawer lists entries newest-first, tap to reload into the reader, delete removes it.
- Cap ~20; evict oldest. Wrap all storage access in try/catch (private mode can throw).
- This is the **only** persistence. No accounts, no sync — that's an explicit non-goal.

---

## 10. PWA requirements (`vite-plugin-pwa`)

- Web app manifest: name "Aloud", short_name "Aloud", theme/background colors from tokens,
  display `standalone`, icons (192/512/maskable + apple-touch-icon).
- Service worker precaches the app shell so it opens offline. (TTS itself is offline-capable;
  OCR/PDF libs can be cached on first use.)
- Verify the **Add to Home Screen** flow works in iOS Safari and the standalone app launches
  with no browser chrome.

---

## 11. State (`useAppStore.ts`, Zustand)

```ts
interface AppStore {
  rawText: string;
  sentences: string[];
  sourceTitle: string;
  library: LibraryItem[];
  setText(text: string, title?: string): void;   // splits + sets sentences
  saveToLibrary(): void;
  loadFromLibrary(id: string): void;
  deleteFromLibrary(id: string): void;
}
```

Playback state (index, state) lives in `useSpeech`; the store holds content + library.
Keep the boundary clean: store = *what* to read, hook = *how* it's read. Persist the user's
**voice preferences** (provider `'webspeech'|'kokoro'`, voice id, rate) to `localStorage` so
the choice survives reloads, and restore them on startup — but **never auto-download the
Kokoro model on load**: only fetch it when the user is on the Natural setting and presses play
(Section 17).

---

## 12. Accessibility & quality floor

- Every control reachable and operable by keyboard; visible `:focus-visible` rings.
- Play/Pause is one button with correct `aria-label` that updates with state; speed control
  is a labelled group with `aria-pressed`.
- Reading pane: active sentence announced politely is optional, but ensure contrast on the
  `--mark` highlight (dark text on butter passes AA).
- `prefers-reduced-motion`: disable the logo bars + highlight transitions.
- Hit targets ≥44px on mobile. Test one full pass at 375px width.

---

## 13. Edge cases & platform gotchas (read before coding the engine)

- **iOS Safari requires a user gesture to start speech.** The first `synth.speak` must occur
  inside the Play button's click handler. Chained sentences after that generally work, but if
  iOS stops the chain, the keep-alive `resume()` and/or re-speak fallback covers it. Do **not**
  try to autoplay on page load.
- **`getVoices()` empties / late population** — always handle `onvoiceschanged`; don't assume
  voices exist synchronously.
- **Cancel fires onend/onerror** — hence the session guard (Section 7), or you'll double-skip.
- **Long-utterance cutoff in Chrome** — mitigated by sentence chunking; keep-alive as backup.
- **Scanned PDFs** have no text layer → extractPdf returns empty → UI routes user to OCR.
- **OCR is slow** (seconds) and downloads lang data on first use → show progress + a one-time
  heads-up. Never block the UI thread expectation silently.
- **Kokoro model download (first use only).** The neural-voice model is tens to a few hundred
  MB depending on quantization. Transformers.js caches it (Cache API / IndexedDB), so it
  downloads **once** then loads instantly afterward. Never fetch it on page load — only when
  the user selects Natural and presses play. Show a progress bar; on a metered connection
  (`navigator.connection.saveData`, or `effectiveType` of `2g`/`3g`) confirm before downloading.
- **WebGPU vs WASM (Kokoro).** Detect `('gpu' in navigator)`: use `device: 'webgpu'` when
  present (near real-time on modern hardware, incl. iOS 26 Safari), else fall back to
  `device: 'wasm'` (works everywhere, slower). Default to the quantized `q8` dtype to keep the
  first download small; allow a larger/better dtype on desktop only.
- **Mobile performance (Kokoro).** Generation is heavier and uses battery on a phone. Prefetch
  only one sentence ahead (not the whole text), and keep Web Speech as the instant default so
  the app opens fast — Natural is an opt-in upgrade.
- **Empty / huge input** — disable Play when no sentences; for very large texts, rendering all
  spans is fine but verify scroll performance; virtualize only if it actually janks.
- **Unsupported browser** (no `speechSynthesis`) → show a clear notice instead of a dead Play
  button.

---

## 14. Definition of done (acceptance criteria)

1. Pasting text, pressing Play → it reads aloud; the spoken sentence is highlighted and
   auto-scrolls; finished sentences dim.
2. Pause halts mid-sentence; Play resumes from the same place. Reset returns to the top.
3. Speed control switches 1×/1.5×/2× and takes effect immediately without losing place.
4. `.txt` and text-based `.pdf` upload populate the reader; a scanned PDF gives a helpful
   message.
5. Photo/camera input OCRs an image to text with visible progress.
6. Tapping a sentence seeks playback there.
7. Library saves recent texts and reloads them; survives refresh.
8. Installable PWA; launches standalone; app shell opens offline.
9. Fully keyboard-operable with visible focus; reduced-motion respected; AA contrast.
10. **Verified working on iOS Safari on a real iPhone.**
11. `npm run build` is clean; deploys to Cloudflare Pages as a static site with no env vars.
12. Flipping to **Natural** voice downloads the Kokoro model once (with a progress bar), then
    reads aloud in a natural voice; switching back to Standard is instant. The choice persists
    across reloads, and the model is **not** fetched until the user first uses Natural.
13. On a WebGPU-capable browser the Natural voice keeps up near real-time; on a WASM-only
    browser it still works (slower). Highlighting, pause/resume, seek, and speed behave
    identically to Standard.

---

## 15. Build order (milestones — stop after each for review)

1. **Scaffold:** Vite + TS + Tailwind + Router + tokens + base layout + landing page shell.
2. **Engine + provider abstraction:** the `TTSProvider` interface + `WebSpeechProvider`, with
   paste-only input and the reading pane + highlight. Get play/pause/reset/speed/seek
   rock-solid first — this is the heart, and the abstraction must be in place before voices.
3. **Natural voices:** `KokoroProvider` behind the same abstraction + the Standard/Natural
   toggle, with lazy-load, download progress, and the metered-connection guard (Section 17).
4. **Inputs:** `.txt`, then `.pdf` (pdfjs), then camera OCR (tesseract), with loading/error UI.
5. **Library:** localStorage save/load/delete + drawer.
6. **Landing page:** finish all sections + copy.
7. **PWA:** manifest, icons, service worker, install + offline.
8. **Polish & a11y pass:** focus states, reduced motion, mobile 375px pass, iOS device test
   (verify both Standard and Natural voices on a real iPhone).
9. **Build + deploy** to Cloudflare Pages.

---

## 16. Explicit non-goals (do NOT build these)

- **Cloud / paid TTS** (ElevenLabs, OpenAI, Deepgram, etc.) or anything needing an API key or
  a backend proxy. On-device neural voices via **Kokoro are in scope** (Section 17) — they run
  client-side for free.
- Voice cloning or recording, or celebrity/custom voices.
- User accounts, login, or any backend or database.
- Cross-device sync or a browser extension.
- AI summarization or text shortening.
- Anything that requires an API key or incurs cost.

Keep the scope exactly here. The value is doing the core loop — text in, audio out, sentence
tracked — extremely well and for free.

---

## 17. Natural voices — Kokoro provider (`src/tts/KokoroProvider.ts`)

The "Natural" voice is an on-device neural TTS model (**Kokoro**, ~82M params, Apache-2.0)
that runs **100% in the browser** via Transformers.js — WebGPU when available, WASM
everywhere else. No server, no API key, no cost. It is lazy-loaded so it never slows the
initial app load or the Standard (Web Speech) path.

### Dependencies & loading
- `npm i kokoro-js`
- **Dynamic import only.** Never import `kokoro-js` at the top of the app — import it inside
  `KokoroProvider.init()` so the model code + weights load only when the user turns on Natural.
- The model is cached by Transformers.js after first download (Cache API / IndexedDB): it
  downloads once and is instant on later visits. Default dtype `q8` to keep that first
  download small.

### Reference implementation (adapt to the installed kokoro-js version)

```ts
import type { TTSProvider, TTSVoice, SpeakOpts } from './types';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

export class KokoroProvider implements TTSProvider {
  id = 'kokoro' as const;
  private tts: any = null;
  private audio = new Audio();
  private cache = new Map<string, string>();              // `${text}|${rate}|${voice}` -> objectURL

  async init(onProgress?: (p: number) => void) {
    const { KokoroTTS } = await import('kokoro-js');       // lazy
    const device = ('gpu' in navigator) ? 'webgpu' : 'wasm';
    const dtype  = device === 'webgpu' ? 'fp32' : 'q8';
    this.tts = await KokoroTTS.from_pretrained(MODEL_ID, {
      dtype, device,
      progress_callback: (e: any) => onProgress?.(e?.progress ? e.progress / 100 : 0),
    });
  }

  listVoices(): TTSVoice[] {
    // tts.list_voices() / tts.voices → ids like 'af_sky', 'am_adam', 'bf_emma', ...
    return Object.keys(this.tts?.voices ?? {}).map(id => ({ id, label: id, lang: 'en' }));
  }

  private async render(text: string, opts: SpeakOpts): Promise<string> {
    const key = `${text}|${opts.rate}|${opts.voice}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const out  = await this.tts.generate(text, { voice: opts.voice, speed: opts.rate });
    const blob = out.toBlob();           // verify method name against the installed version
    const url  = URL.createObjectURL(blob);
    this.cache.set(key, url);
    return url;
  }

  async speak(text: string, opts: SpeakOpts): Promise<void> {
    const url = await this.render(text, opts);
    return new Promise((resolve, reject) => {
      this.audio.src = url;
      this.audio.onended = () => resolve();
      this.audio.onerror = () => reject(new Error('kokoro-playback'));
      this.audio.play().catch(reject);   // first call must originate from a user gesture (iOS)
    });
  }

  prefetch(text: string, opts: SpeakOpts) {
    if (text) this.render(text, opts).catch(() => {});     // warm next sentence, ignore errors
  }

  pause()   { this.audio.pause(); }
  resume()  { this.audio.play().catch(() => {}); }
  stop()    { this.audio.pause(); this.audio.currentTime = 0; this.audio.onended = null; }
  dispose() { this.stop(); this.cache.forEach(URL.revokeObjectURL); this.cache.clear(); this.tts = null; }
}
```

### Lazy-load + metered-connection flow (inside `useSpeech.setProvider('kokoro')`)
1. If already initialized, just switch and return.
2. Check the connection: if `navigator.connection?.saveData` or `effectiveType` is `2g`/`3g`,
   confirm first — *"Natural voices download a one-time ~[size]MB model. Continue?"* (Skip the
   prompt on wifi/unknown.)
3. Call `provider.init(p => setModelProgress(p))`; render a progress bar in the dock.
4. On success, set `modelProgress = null`, map to a default voice, let the user press play.
5. On failure (e.g., neither WebGPU nor WASM usable), toast a clear message and fall back to
   Standard.

### Integration notes
- **iOS gesture rule still applies.** The first `audio.play()` must happen inside the Play
  click. Since `speak()` is reached through the Play handler's `run()` loop, that's satisfied;
  if iOS ever blocks it, "prime" the `Audio` element with a silent `play()` in the same click.
- **Highlighting is unchanged.** The `useSpeech` loop highlights `currentIndex` per sentence;
  Kokoro only changes how each sentence is produced. No `ReadingPane` changes.
- **Prefetch one ahead only** (as above) for gapless playback without overloading mobile.
- **Speed** maps to Kokoro's `speed`; rate changes restart the current sentence via the loop,
  exactly like Web Speech.
- **Persist** `provider: 'kokoro'` in the voice prefs (Section 11) — but still do not
  auto-download on load; wait for the user's first Natural play.
