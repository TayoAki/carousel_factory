# Live Carousel: a free Claude Code skill

Make carousels where **every slide moves**. Each slide is a looping 1080x1350 video with music and
sound effects, so people swipe and every slide moves.

- **From a topic.** Describe the post and Claude designs a new carousel in an editorial "big word"
  style: one bold colour, one accent, a moving hero object, a beat that runs across the slides.
  There are four colour themes: cobalt, tomato, forest and noir.
- **From your own slides.** Give Claude your finished carousel images. They stay exactly as you
  designed them, and they come alive with a drifting sky, a 3D headline pop on the beat, light sweeps
  across the type, floating sparkles and music.

## Cost: $0

| piece | what it is | price |
| --- | --- | --- |
| HyperFrames | open-source HTML → video renderer, run with `npx` | free |
| GSAP | animation library | free |
| Node.js, ffmpeg, Python + numpy/opencv | standard tools | free |
| Fonts: Anybody, Fraunces, JetBrains Mono, Anton | SIL Open Font License, bundled | free |
| Music + sound effects | synthesized in code (plus an optional free SFX pack) | free |

There are no API keys, credits, sign-ups or watermarks. All you need is Claude Code.

## Install

1. Download `live-carousel-skill.zip` (from Skool, Drive, wherever you got it).
2. Open Claude Code and paste the prompt from **INSTALL-PROMPT.md**.
3. Claude installs it, sets up the free tools, and renders a demo carousel to show it works.

Prefer doing it by hand? Copy this folder to `~/.claude/skills/live-carousel/`, then run
`bash ~/.claude/skills/live-carousel/scripts/setup.sh`.

## Use

Just ask:
- "Make me a live carousel about pricing your freelance work. Forest theme."
- "Animate my carousel in ~/Desktop/launch-post/ and add music."
- "Make slide 2 punchier and move the beat drop to 2 seconds."

Each carousel gets its own folder in `./live-carousels/<name>/`:
`renders/slide-*.mp4` (post these in order), `renders/contact-sheet.jpg`, and `preview.html`
(a swipe preview).

## What's inside

```
SKILL.md                 the workflow Claude follows
references/              house style, slide recipes, engine API, sound, photo mode, QA
scripts/setup.sh         checks/installs the free toolchain
scripts/new_carousel.py  starts a project (motion or photo mode)
scripts/render_all.py    audio → build → check → render → contact sheet → preview
templates/               the reference carousel, engine, fonts, audio synth, photo toolkit
```

Third-party licences: see LICENSES.md.
