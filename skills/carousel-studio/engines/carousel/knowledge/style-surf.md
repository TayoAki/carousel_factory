# Style — Sun-Bleached Surf Poster (`surf`)

Sheet: `$ENGINE/assets/styles/surf.jpg` · template: `template-surf.html` · theme: `surf`
(`scripts/themes/surf.json`). Mood: reckless, sun-bleached, kinetic, nostalgic.
**$0 path:** freely-licensed surf photographs (Wikimedia) + Apple Vision cutouts, all local.

## 1. What the sheet says
**Palette** — Rush Mustard `#C8BF3C` · Bleached Sky `#E6E9E6` · Horizon Haze `#B7AE9A` · Wet Sand `#8C8372` ·
Wetsuit Shadow `#2B2823` · Flare Cream `#F1ECDB`.

**Rules (absolutes)**
- Mustard is the ONLY type colour. No white type, no black type, ever.
- Mustard never fills a background, a box or a bar — it lives only in letters and hairlines.
- The photograph owns every other colour. Nothing is painted on top of it.
- Shadow is for the subject's silhouette only, never for text.

**System notes**
- The subject always stands in front of the headline. The headline is never fully readable.
- The script always crosses the headline. It never sits cleanly above it.
- Every photo is in motion. Nothing is ever sharp except the type.
- One type colour only. No boxes, no banners, no gradients, no drop shadows.
- Every slide carries the meta row and the footer. Neither is ever dropped.
- Body copy stays small, centred and quiet. It never competes with the headline.

**Type** — flourished calligraphic script (`Pinyon Script`) crossing a huge heavy condensed caps word
(`Anton`); a casual handwritten tagline between asterisks (`Caveat`); meta/footer in a small tracked mono
(`DM Mono`); body copy in a light sans (`DM Sans`).

**Component zoo** — outlined pills (`TAG`, `0009`), a circled monogram, thin `+` crosshairs, the three-up
label row separated by `+`, a soft cream sun flare.

**Anatomy (top → bottom)** — meta row (date · handle · series) · pills flanking the headline · script over the
big word, subject in front · asterisk tagline · three-up `+` row · small centred body copy · footer
(made by · "series" · week/folio).

## 2. How the template enforces it
| Rule | Mechanism |
|---|---|
| Mustard only type colour | one token `--m:#C8BF3C`; every `color:` and every border/hairline uses it; no other text colour exists |
| Never a fill | no `background:` uses `--m`; stats are numbers + labels, pills are outlines only |
| Nothing painted on top | only a *grade* (sepia/saturation/brightness filter + edge falloff in wetsuit shadow) and grain; no panels |
| No text shadow | no `text-shadow` anywhere in the file. Readability comes from the grade, which pulls the photo down into the sheet's dusky range |
| Subject in front | stack: photo (1) → big word (3) → script (4) → cutout (5) → tagline/body/meta (6+) |
| Motion | SVG horizontal motion-blur filter on the photo (`motion`, default 7px) and a lighter one on the cutout (`subject_motion`, default 1.6px) |

## 3. Per-slide fields
`kicker` = the script line ("Live 4 the") · `headline` = the big word ("RUSH", "3%") · `subtitle` = the asterisk
tagline (asterisks added) · `caption` = body copy (`<br>` allowed via `\n`) · `content` = `stats` renders the
three-up `+` row · `cta_pill`/`microcopy` = CTA said as body lines · `topic_tag` = left pill · `meta1` = top-left
(date) · `meta2` = top-right (series) · `meta3` = photo credit (tiny, under the footer).
Plan: `handle`, `tagline` (footer centre, quoted), `made_by`.

Knobs: `head_top` (px, default 330), `head_width` (.86), `head_max` (460), `script_dx`/`script_dy` (script offset,
px), `script_size` (150), `tag_y` (px), `sub_top` (auto: under the word), `body_top` (auto 1040), `flare`
{x,y,r} or `false`, `motion`, `subject_motion`, `bright` (grade brightness, .82), `photo_pos`.
