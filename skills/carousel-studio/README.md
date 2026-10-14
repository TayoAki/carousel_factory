# Carousel Studio

One Claude Code skill for three kinds of Instagram carousels. Every time you ask for one, it asks you the topic and
which style you want:

| style | what you get | cost |
|---|---|---|
| **100% motion graphics** | every slide is a looping 4:5 video with music and sound effects, designed in code | $0 |
| **Motion graphics + avatar** | you (your real photos, an AI version of you, or a mascot) on a cinematic cover, then every slide brought to life | $0 with your photos; AI character images cost credits |
| **Style-sheet reference** | a polished static carousel built from a style sheet and carousel guardrails | $0 free route; paid AI backgrounds optional |

Text is always rendered by code (sharp, spelled right), and nothing that costs money happens before you see the exact
cost and say "go".

**Install:** put `carousel-studio.zip` in a new folder, open Claude Code in that folder, and paste the install prompt
(`INSTALL PROMPT.txt`). After that, open Claude Code in the same folder and say "make me a carousel".

**What's inside:** `SKILL.md` (asks the questions and picks the engine), `references/` (the avatar creative director
and the one-time character setup), `engines/live-carousel/` (motion graphics: HyperFrames, GSAP, ffmpeg, all
local and free), `engines/carousel/` (style sheets, layouts, guardrails, free and paid routes).
