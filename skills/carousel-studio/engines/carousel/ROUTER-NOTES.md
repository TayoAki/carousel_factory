# Carousel engine: notes for the router

This engine makes finished **static** Instagram carousels (1080×1350, 4:5). It has two modes:
- **style-sheet mode:** pick one of 7 style sheets. Free renders everything locally; paid paints AI
  images from the sheet.
- **own-photos mode:** lay the user's photos into editorial layouts. The avatar path feeds it avatar images.

Text is always rendered by code (HTML/SVG in headless Chromium), never by an image model. The full
rules and every plan field are in `ENGINE.md`; this page is the quick reference.

## 0 · Paths (set these first)

```bash
ENGINE="<skill>/engines/carousel"            # this folder, wherever the skill is installed
export CAROUSEL_WORKSPACE="<user's folder>"  # profile.json, my-images/, runs/, output/ go here
```

- Every script finds the engine from its own location, so commands work from any working directory.
- The workspace comes from `--workspace <dir>` on any command, else `$CAROUSEL_WORKSPACE`. If neither
  is set: `./carousel-workspace` when the engine sits under a `.claude/` folder, otherwise the engine
  folder itself (old standalone-kit behaviour). **Always set it.**
- Relative paths in a plan or manifest (e.g. `assets/shots/x.png`, `my-images/set/a.jpg`) resolve in
  the workspace first, then the engine.
- The engine folder stays read-only during use. The only writes outside the workspace are the Vision
  cutout helper, compiled once to `~/.cache/carousel-engine/cutout`, and `gallery.py` rebuilding
  `STYLES.html`.

**Setup check (first run):**
```bash
python3 "$ENGINE/scripts/doctor.py"          # READY / NOT READY; also prints engine + workspace
python3 "$ENGINE/scripts/doctor.py" --fix    # pip --user installs + Playwright Chromium
```
- Needs Python 3.9+, Pillow, numpy, requests, python-dotenv, Playwright + Chromium.
- Optional: pillow-heif (or macOS `sips`) for HEIC.
- Optional: `swiftc` (Xcode CLT) + macOS 14+ for the free subject cutouts. Without it, cutout-based
  layouts still render, just without the "word behind the subject" effect.

**Profile:**
- The user's answers live in `$CAROUSEL_WORKSPACE/profile.json`: `handle`, `tagline`, `niche`,
  `logo`, `default_style`, `default_mode`.
- Copy `profile.example.json` there to start. No profile = footer shows `@yourhandle`, so always
  set `handle` on the plan.

## 1 · Style-sheet mode, FREE ($0)

```bash
python3 "$ENGINE/scripts/gallery.py"                          # opens STYLES.html; user picks a number
RUN=$(python3 "$ENGINE/scripts/carousel_run.py" init "<topic>" | tail -1)   # prints the run folder
# write $RUN/plan.json  (fields: ENGINE.md → plan.json + the style's "specifics")
```

**Midnight** (backgrounds painted in code, no photos needed):
```bash
python3 "$ENGINE/scripts/carousel_run.py" build "$RUN"        # paint backgrounds + render + export
```

**Every photo style** (archival, celestial, chalk, sunfaded, skyblue, surf): one freely-licensed
Commons photo per slide, with credits.
```bash
python3 "$ENGINE/scripts/fetch_photos.py" "$CAROUSEL_WORKSPACE/assets/photos/<set>" "<search 1>" "<search 2>" ...
python3 "$ENGINE/scripts/cutout.py" photo.4x5.jpg photo.4x5.cutout.png   # sunfaded / skyblue / surf subjects
# set each slide's bg_file (+ subject_file) and its credit field, then:
python3 "$ENGINE/scripts/carousel_run.py" render "$RUN"
python3 "$ENGINE/scripts/carousel_run.py" export "$RUN"
```
`credits.json` lands next to the photos.

**Proof on a slide:**
```bash
python3 "$ENGINE/scripts/capture.py" "<url>" "$CAROUSEL_WORKSPACE/assets/shots/x.png" --selector "<css>"   # real web screenshot
python3 "$ENGINE/scripts/fetch_logo.py" "$CAROUSEL_WORKSPACE/assets/logos" "<Company>"                   # real logo
```
Credit screenshots on the slide ("via …"). Verify every number from a primary source.

## 2 · Style-sheet mode, PAID: **never spend before the user says "go"**

Same plan as free; the paid step only replaces each slide's background image.

**A. Higgsfield connector** (preferred when it's connected):
1. Upload the style sheet `"$ENGINE/assets/styles/<style>.jpg"` (plus the logo, if any) to get media ids.
2. **Preflight every slide:** `generate_image` with `get_cost: true`, model `gpt_image_2_5`, the same
   params you will use (variant `flare`, quality, resolution, aspect), and
   `medias: [{role: "image_references", value: <sheet id>}]`. This returns the credits and submits nothing.
   - Measured on 2026-10-06: high/2k = **2.75**, medium/2k = **1**, low/1k = **0.25** credits per image,
     at 4:5 and at 3:2 alike.
3. Tell the user: N images × price = total, plus their balance (`balance`). **Wait for "go".**
4. Generate each slide from its `image_prompt` (the style's `paid_style` in `styles.json` is the shared
   style sentence).
   - Aspect: 4:5 for full-bleed styles. For archival, use a wide 3:2 and crop to the slide's seam
     window, as with free photos.
   - Download each result to `$RUN/media/slideNN.png` and set `bg_file`.
   - Then run `render` + `export` as in free mode.

**B. kie.ai** (user's own `KIE_API_KEY` in `$CAROUSEL_WORKSPACE/.env`; see `.env.example`):
```bash
python3 "$ENGINE/scripts/carousel_run.py" quote "$RUN"      # FREE preflight: N images, model, resolution
#   → multiply by kie.ai's current per-image price, tell the user, WAIT FOR "go"
python3 "$ENGINE/scripts/carousel_run.py" produce "$RUN"    # generate (paid) + render + export
```
- `generate` uploads the style sheet (and logo) to a public file host (catbox by default) because
  kie.ai needs URLs. It never uploads the user's own photos unless a slide sets `subject_image`.
- It skips slides that already have a background, so re-running retries only failures.

## 3 · Own-photos mode (the avatar path feeds this)

```bash
python3 "$ENGINE/scripts/import_images.py" <set-name> <files or folder ...>   # no paths = $CAROUSEL_WORKSPACE/my-images/inbox/
```
- Converts HEIC and fixes rotation.
- Cuts out each subject (free, on-device).
- Writes `$CAROUSEL_WORKSPACE/my-images/<set>/manifest.json`. Per photo: `file`, `cutout`
  (paths relative to the workspace), subject box, empty side, busy areas and `accent_candidates`.

**Avatar images:** pass the generated avatar PNGs straight in. Each becomes a photo with its cutout,
so layouts can put the headline behind the person.

**Plan:**
- Plan level: `"template":"template-own.html"`, `"theme":"own"`, `handle`, `tagline`.
- Per slide: `layout` (`orbit` / `punch` / `editorial` / `scatter` / `cascade`; pick from the
  manifest with `knowledge/style-own.md`), `bg_file` = manifest `file`, `subject_file` = manifest
  `cutout`, plus the layout's copy fields.
- Accent colours come from the photo; never invent them.

**Build and check:**
```bash
python3 "$ENGINE/scripts/carousel_run.py" render "$RUN"
python3 "$ENGINE/scripts/check_own.py" "$RUN"     # text in frame, no overlaps, contrast on the real pixels → fix what it flags
python3 "$ENGINE/scripts/carousel_run.py" export "$RUN"
```
The user's photos stay local. They never go into a paid generation unless the user asks.

## 4 · Where the finished PNGs land

- `$CAROUSEL_WORKSPACE/output/<run-slug>/01.png, 02.png …`, rendered at 2× (2160×2700) for crisp
  upload. `CAROUSEL_RENDER_SCALE=1` gives 1080×1350.
- Working files are in `$CAROUSEL_WORKSPACE/runs/<run-slug>/`: `plan.json`, `media/` (backgrounds)
  and `slides/` (renders, same as output).
- **Always look at every exported slide** before showing it (overlaps, clipped text, covered faces or
  numbers), fix, re-render.

## 5 · Good to know

- **Network:** the templates load Google Fonts; `fetch_photos` / `capture` / `fetch_logo` need the web.
  Rendering is otherwise local.
- **Speed:** a 5-slide Midnight build takes about 15 s on an M-series Air. An own-photos import is
  about 5 s per photo.
- **Bundled photos:** none. `assets/photos` (64 MB of test photos) was dropped: every photo style
  fetches its own free photos with `fetch_photos.py`, and Midnight paints in code.
- **Shipped:** style sheets + example sets for all 7 styles (incl. Archival and Surf), the 5
  own-layout previews (JPG), all templates, scripts and knowledge. Size is about 11 MB.
- **Not shipped:** runs, output, my-images, photos, shots, logos, caches, `.env`, or the
  `layout-refs`/`library` folders (other creators' designs and client photos).
