---
name: carousel-studio
description: >
  Make Instagram carousels in three styles from one place, and ask the user every time which one. (1) 100% motion
  graphics: every slide is a looping 4:5 video with music and sound effects, made in code, $0. (2) Motion graphics +
  avatar: the user (their real photos, an AI version of them, or a mascot) as the hero of a cinematic cover, then the
  slides brought to life with motion and music. (3) Style-sheet reference: a polished static carousel built from a
  style sheet and carousel guardrails, free ($0) or with paid AI backgrounds. Text is always rendered by code, never
  drawn by an image model, and nothing that costs money happens before the user says "go". Use whenever the user asks
  for a carousel, an Instagram post with slides, a "live" or moving carousel, an avatar carousel, a style-sheet
  carousel, "/carousel", or gives a topic for a post.
---

# Carousel Studio

Three engines in one skill. **You do all the work. The user answers a few questions and approves once.**

```
carousel-studio/                     (this folder: SKILL_DIR)
  SKILL.md                           this router
  references/avatar.md               the creative director for avatar carousels
  references/character.md            setting up the user's character (once)
  engines/live-carousel/             motion graphics engine  -> read its ROUTER-NOTES.md before running it
  engines/carousel/                  style-sheet engine      -> read its ROUTER-NOTES.md before running it
```

## 0 · The profile and the workspace
- The **workspace** is where the user's carousels live: the folder the skill was installed into (the folder that holds
  `.claude/`), or `~/Carousels` if the skill is installed globally. Save its absolute path in the profile.
- Every style-sheet engine command runs with `CAROUSEL_WORKSPACE=<workspace>` (its profile.json, my-images/, runs/
  and output/ live there). Live carousels go to `<workspace>/motion/<slug>/` and `<workspace>/avatar/<slug>/live/`.
- The **profile** is `<workspace>/studio-profile.json`:
  `{"handle": "@...", "niche": "...", "signoff": "...", "first_style": "...", "workspace": "...",
    "character": {...} (see references/character.md), "defaults": {"slides": 6}}`
- If the profile exists, greet them by their handle and skip every question it already answers.
- Keep the style-sheet engine's own `<workspace>/profile.json` in step (copy `engines/carousel/profile.example.json`
  the first time and write the handle and niche into it), and put `handle` on every plan.

## 1 · First run (no profile yet)
1. **Set up the engines, silently.** Run each engine's setup/check exactly as its `ROUTER-NOTES.md` says (the
   live-carousel `setup.sh`, the carousel `doctor.py`). If something free is missing (Node.js, ffmpeg, Python),
   install it the official free way for their computer, and ask before anything that needs their password.
2. **Ask, in one `AskUserQuestion` round:**
   - **What's your Instagram handle?** (e.g. `@brightsmile.dental`)
   - **Which style do you want to try first?** 100% motion graphics · Motion graphics + avatar · Style-sheet reference
   - optionally, in the same round: **What's your niche?** (who they make content for). It shapes topics and voice.
3. Save the profile. Then go straight into §2 with the style they chose.

## 2 · Every carousel: ask TWO things, every time
In one `AskUserQuestion` round (even if they already said a topic, confirm the style):
1. **What's the topic?** Offer 3 topics that fit their niche as options; they can type their own.
2. **Which style?**
   - **100% motion graphics.** Every slide moves, with music and sound effects. $0.
   - **Motion graphics + avatar.** You (or your character) on a cinematic cover, brought to life. The motion is $0;
     AI character images cost credits (real photos are $0).
   - **Style-sheet reference.** A polished static carousel from one of 7 style sheets (Midnight, Archival, Celestial,
     Chalk, Sun-Faded, Sky-Blue, Surf), or their own. Free, or paid AI backgrounds.

Then follow the matching path. Always **plan first** (hook, every slide, the CTA), show the plan, and build when they
say go. Check every number you put on a slide against a primary source, and credit any screenshot or photo.

### A · 100% motion graphics → `engines/live-carousel` (motion mode)
- Read `engines/live-carousel/ROUTER-NOTES.md` (and `ENGINE.md` §2a before designing) and run motion mode with the
  topic, output into `<workspace>/motion/<slug>/`. Expect 30–60 minutes of your work per carousel, mostly design and
  QA; the render itself is about a minute. Let them pick a colour theme if they care; otherwise choose one that differs from
  their last carousel.
- One protagonist object that proves every point by moving; 4 slides is the default (hook, 2 value slides, CTA with a
  comment word); every slide a whole number of music bars so the loop is clean.
- Run its QA (contact sheet, loop seams) before showing anything.

### B · Motion graphics + avatar → character → avatar slides → `engines/live-carousel` (photo mode)
1. No `profile.character` yet → `references/character.md` first.
2. `references/avatar.md`: the creative director plans the cover and the slides (feeling → world, borrow, object,
   one big word) and writes the image prompts. Show the plan **and the exact credit cost** if any image is AI, and wait
   for "go".
3. Make the character images (or pick their real photos), import them with the style-sheet engine's
   `import_images.py` (own-photos mode, `engines/carousel/ROUTER-NOTES.md` §3), plan the slides on
   `template-own.html`, then `render` → `check_own.py` → `export`. The PNGs land in
   `<workspace>/output/<run>/`.
4. Bring them to life with the live-carousel engine's **photo mode, `--cutout`**, into `<workspace>/avatar/<slug>/live/`.
   Frame 0 of every slide must be the finished image, and the type that crosses the person must be intact.
5. Deliver both: the static slides (they can post those too) and the live MP4s.

### C · Style-sheet reference → `engines/carousel`
- Read `engines/carousel/ROUTER-NOTES.md` (and `ENGINE.md` for the plan fields). Open the style gallery
  (`gallery.py`), recommend 1–2 styles for their niche (`best_for` in styles.json), let them pick a number, then ask
  **Free ($0) or Paid?** If they have their own style sheet image, add it as a new style
  (`knowledge/new-style-from-a-sheet.md`) and use that: their own style beats a borrowed one.
- Free: Midnight is painted in code; every photo style fetches freely licensed Commons photos (credited on the
  slide). Paid: AI backgrounds painted from the style sheet, through the Higgsfield connector (cost preflight with
  `get_cost`) or kie.ai (`carousel_run.py quote`); say N images × price = total, **wait for "go"**.
- The guardrails, every time: 5–7 slides, one idea per slide (two ideas → split it), slide 1 is the hook, the last
  slide asks for one action, one highlighted word per slide, the middle of every slide carries a visual (a chart, a
  number, a real screenshot), never empty.

## 3 · Delivery (every path)
- Look at every slide yourself before showing it (clipped text, faces covered, numbers hidden, smeared letters).
- Show the contact sheet, open the output folder, and write the caption: hook line, the idea in one paragraph, the
  comment CTA, and 5–8 hashtags.
- Tell them to check it **on their phone**: can they read every slide? Does slide 1 say what the post is about?
- Live carousels: upload the slide MP4s **in order** as one carousel post (Instagram allows up to 20 photos/videos).

## 4 · Changes
Ask for precise feedback ("bigger headline", "less text on slide 3", "keep that chart longer"), change only that, and
re-render only what changed. "Make it better" is not feedback; ask what exactly.

## The rules that never bend
- **Text is code.** Headlines, numbers, handles and captions are rendered by the templates, never drawn by an AI image.
- **Money:** nothing paid happens before the user sees the exact cost and says "go".
- **Their face stays their face:** the reference plus the look in words on every generation; drifted images are redone.
- **Their photos stay theirs:** imported and processed on their computer, never uploaded anywhere.
- **Their style, not someone else's:** encourage their own references and style sheets; if everyone uses the same
  settings, every carousel looks the same again.
