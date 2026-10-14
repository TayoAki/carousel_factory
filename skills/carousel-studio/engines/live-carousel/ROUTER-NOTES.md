# live-carousel engine: notes for the carousel-studio router

This engine turns a carousel into a **live carousel**: one looping MP4 per slide (1080x1350, 30 fps, with
music and sound effects), so every slide moves when people swipe. Everything is local and $0
(HyperFrames via `npx`, Node, ffmpeg, Python with numpy + opencv). It has two modes:

| carousel type the user asks for | mode | input |
| --- | --- | --- |
| **100% motion graphics** | **motion** | a topic (plus optional theme, slide count, CTA keyword) |
| **motion graphics + avatar** | **photo** | a folder of finished PNG/JPG slides, usually the avatar slides the style-sheet engine just made |

`ENGINE` below means this folder (`.../carousel-studio/engines/live-carousel`). Every script finds its own
templates relative to itself, so it works wherever carousel-studio is installed. Run Python through
`ENGINE/scripts/py`, the wrapper that uses the environment setup prepared.

## 0. Setup (once per machine)

```bash
bash "ENGINE/scripts/setup.sh"
```
It checks Node 22+, ffmpeg and Python 3.9+. It reuses a system Python that already has numpy + opencv
(writing `ENGINE/.python`), or creates a private venv in `ENGINE/.venv`. It downloads HyperFrames' headless
Chrome once. It's safe to re-run, and it prints "All set" when ready. Measured on a base M5 Air: about 10 s
when everything is cached.

## 1. MOTION mode: topic → new live carousel

```bash
OUT="<folder the user/caller chose>/<slug>"          # e.g. ./live-carousels/pricing-mistakes
"ENGINE/scripts/py" "ENGINE/scripts/new_carousel.py" "$OUT" --theme cobalt|tomato|forest|noir \
    --title "<series name>" --caption "<post caption>"
# Claude then rewrites BRIEF.md / STORYBOARD.md / frame.md and src/*.html + audio/make_audio.py for the
# topic (one protagonist object, 4 slides: hook, 2 value, CTA). Read ENGINE/ENGINE.md section 2a first.
"ENGINE/scripts/py" "ENGINE/scripts/render_all.py" "$OUT"            # audio -> build -> check -> render -> QA files
```
- The scaffold is a complete, working 4-slide carousel ("Motion Design 101", a bouncing ball), so rendering it
  unchanged is a valid demo. A real carousel means rewriting the 4 slide files. Expect 30-60 min of Claude work
  per carousel, most of it design and QA.
- Themes: `cobalt` (default), `tomato`, `forest`, `noir`. Use a different theme for carousels shown side by side.
- If the user wants the cover in the house style the style-sheet engine uses, pass its palette as the theme
  (write the 8 tokens into `$OUT/theme.json`, see `references/house-style.md`).

## 2. PHOTO mode: finished slides → brought to life (the "motion graphics + avatar" path)

```bash
OUT="<folder the user/caller chose>/<slug>"
"ENGINE/scripts/py" "ENGINE/scripts/new_carousel.py" "$OUT" --mode photo --images slide-01.png slide-02.png ...
cd "$OUT" && "ENGINE/scripts/py" prep_photo.py --cutout          # --cutout when a person (the avatar) is on a slide
# LOOK at $OUT/prep/NN_maskvis.jpg: red = held still, green = text, blue = headline, magenta = type over the person.
# Fix with: --headline NN=x0,y0,x1,y1[:light|dark] (wrong headline), --subject-box NN=x0,y0,x1,y1 (crowd),
# --busy / --edge (see references/photo-mode.md). Then direct one moment per slide in carousel.json -> cues.
"ENGINE/scripts/py" "ENGINE/scripts/render_all.py" "$OUT"
```
- **Input:** the slide images in order, any size. Non-4:5 images are centre-cropped to 4:5. The avatar slides from
  the style-sheet engine go straight in. Pass them in slide order.
- **What `--cutout` does:** it cuts the person out (local model, about 170 MB downloaded once, already cached here) so they pop
  forward like a 3D photo on the hit while the background drifts. Their face, hair and glasses are held still and never warp.
  Type printed **over** the person is kept on a static layer above the cut-out automatically, which fixes the "higgsfield."
  smear. A cut-out covering most of the frame (a slide with no person) is ignored.
- **Default motion per slide:** a hit with a 3D extrusion of the headline (the cover hits at 0.5 s), light sweeps across
  the text, a sky drift, dust motes, a slow camera push, and music that carries on from slide to slide. Give each slide
  one moment that fits what it says (pills lighting up, a count-up, a cursor press): recipes are in
  `references/photo-mode.md`, and custom moments go in `src/NN.html` + `extra()` in `audio/make_audio.py`.
- **The promise:** frame 0 of every slide is the original image (only fine grain is added).

## 3. Outputs (same for both modes, all inside `$OUT`)

| file | what |
| --- | --- |
| `renders/slide-<name>.mp4` | one MP4 per slide, 1080x1350, 30 fps, H.264 + AAC. Post them in order as one carousel |
| `renders/contact-sheet.jpg` | top row = frame 0 of every slide, bottom row = mid-slide |
| `renders/seams/<name>.jpg` | last frame \| first frame, to check the loop |
| `renders/frame0-check.txt` | (photo) frame 0 vs the original image: whole frame + worst 40 px text tile, `ok` or `CHECK THIS SLIDE` |
| `preview.html` | a local Instagram-style swipe preview |

Slides are 4, 6 or 8 s (whole 120 BPM bars). A 4-slide carousel is about 24-30 s and 40-60 MB of MP4s.

## 4. Render time and disk

Measured on a base M5 Air (16 GB), 2 workers: **about 10-20 s per 6-8 s slide**, so roughly a minute for a
4-slide carousel (`render_all.py` renders one slide at a time). Photo prep with `--cutout` takes about 15-30 s per
slide. Every render needs a few hundred MB of temporary space. **HyperFrames refuses to render under 1 GB free disk**,
so check `df -h ~` first on a full machine. `--only <slide>` re-renders a single slide, and `--check-only` builds and
checks without rendering.

## 5. QA (do it before calling a carousel done; the details are in references/render-qa.md)

1. `render_all.py` must finish with every slide listed with its length and **no "NO AUDIO"**. `check` errors stop it
   before rendering (layout overlap, off-canvas, contrast), so fix those in `src/`.
2. **Look at** `renders/contact-sheet.jpg`. The top row must be finished designs (photo: identical to the originals),
   and the bottom row must show each slide's moment with nothing clipped.
3. **Look at** `renders/seams/*.jpg`: the last and first frames match, so the loop is invisible.
4. Photo: `renders/frame0-check.txt` says `ok` for every slide.
5. Hand back the MP4 paths in order, the contact sheet, `preview.html`, and the caption + CTA keyword.

## Things to know

- HyperFrames is pinned to `hyperframes@0.8.121` (fetched by `npx` on first use).
- Real recorded sound effects are used when HyperFrames' media-use skill is installed (or `LC_SFX_DIR` points at a
  folder of them). Otherwise synthesized stand-ins are used, so it always works.
- Before zipping, delete `ENGINE/.python` / `ENGINE/.venv`: they are this machine's environment and setup recreates them.
- Never route the work through paid image, video or music APIs: this engine animates designs that already exist.
