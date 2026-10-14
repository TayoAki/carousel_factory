# Avatar carousels: the creative director

Read this whenever the user picks **Motion graphics + avatar**, or asks for an avatar / character carousel.
Their character is set up once (`references/character.md`) and saved in the studio profile. This file is the part that
changes every post: the **world**, the **borrow**, the **object**, the **type** and the **hook**.

The cover does the job of a reel hook with none of the tools: no sound, no motion, seen at the size of a stamp.
**A hook was never a line of text. It is whether the image survives being small.**

## The mistake to avoid
Do NOT make a picture *of* the topic ("pricing" → a person holding money). That is a stock photo with words on it.
Do NOT make abstract, glowing or sci-fi art. The image is a real-looking, cinematic photograph of a strange, specific
situation that *feels* like the topic.

## The 5 rules (run every one, in order)

### 1. The World: build the feeling, not the topic
Ask what the topic FEELS like (clarity, wonder, tension, patience, chaos, being copied, pairing, building…), then put
the character in a world with that feeling. Worlds are big, open, physical, sunlit places with one clean horizon:
desert dunes, cracked red earth, a green hill under a blue sky, a beach at dusk, salt flats, a lone shack.
- **Clarity** → a handshake between two figures, flat desert, clean sky
- **Wonder** → an astronaut kneeling in a sunset flower field, holding the Earth
- **Tension** → the character calm in a camp chair on cracked asphalt while a car burns behind them
- **Scale / legacy** → a giant eroded stone head of the character half-buried in dunes, a tiny figure walking past
- **Building / order** → the character on a wooden ladder in open sky, pinning posters to the clouds
- **Standing out / being copied** → the only person looking at the camera in a field of identical grey mannequins
- **Contrast / cheap vs expensive** → two objects side by side in sand dunes, curved arrows, no person
- **Calm / solitude** → a tiny red house alone in a yellow field by the sea

Who is in frame, decided per post: the character as hero (head-on, deadpan, looking into camera, never cheesy smiling);
the character plus a borrowed second figure (knight, undertaker, sheep, a genre archetype); a stand-in archetype with
the character absent; no person at all (comparisons, tools); a tiny figure in a huge landscape (inner mood slides).

### 2. The Borrow: something people already know
Recognition beats reading. Pun the topic with something instantly recognisable: a famous kind of pairing, a genre
scene, a myth, an iconic composition. ("X just killed X" → dressed as an undertaker over an open coffin.)
Borrow the **signals** (wardrobe, props, setting, colour, composition) and cast an **invented** second character.
**Never render a real actor's or public figure's face**; the costume and scene do the recognition work.

### 3. The Cut: one hero colour, hard edges
One dominant sky/ground colour plus one accent. The character cut hard from the background: clear silhouette, strong
directional sunlight, real shadow. It must read at thumbnail size.

### 4. The Object: put the thing in the scene
Whatever the post is about exists as a **real physical object** in the world: printed pages in the sand, a book in
their hands, posters pinned to the sky, a coffin full of old tools. Real shadow, real light. Never a floating mockup.

### 5. The Shape: one word, too big
ONE word fills the frame. Loud + quiet pairing: a huge high-contrast serif or heavy condensed sans next to a small plain
sans or italic serif. Stack: small line above, BIG WORD, small line below. **Leave the top ~40% of the image as clean
sky** for the headline, and the text is always set by the template in code, never drawn by the image model.

## Two tests before it ships
1. Put it in a real feed at thumbnail size. Does the eye catch?
2. Could this image sit on someone else's topic and still make sense? If yes it is a stock photo: redo World/Borrow.

## The face stays the face (the sneaky one)
A reference image alone drifts: different hair, skin tone, glasses, chin, and soon it's "your cousin". So **every image
prompt also describes the look in words** (`profile.character.look`, written once in `character.md`), and the
character's reference goes in on every generation. Deadpan, serious, looking straight at the camera: a magazine cover,
not a stock photo. If a generation drifts anyway, don't use it; regenerate (and say so before spending).

## Output: plan first, then images
For a full avatar carousel (5–7 slides) write the plan and show it before any image is generated:
- **Feeling → World**, **Borrow**, **Object** for the cover
- **Per slide:** the idea (one per slide), the headline (small line / BIG WORD / small line), and whether it carries a
  character image (at least 3 slides do, each in a different situation that shows that slide's point; never the same
  pose pasted in a corner) or a mood/plain slide
- **Image prompt per character slide** (4:5): photorealistic cinematic editorial magazine-cover photograph; the person
  from the reference (exact same face; + the look in words) [pose/action/wardrobe] in [world], [borrowed figure/props],
  [object], [shot type & camera position], strong natural sunlight, hard shadows, one accent colour, subject cut cleanly
  from the background, **top 40% of the frame empty sky for a headline, no text, no logos**
- **Hook (caption line 1)** and a one-word comment CTA
- **Cost:** the exact credits for the images (cost preview), and **wait for "go"**. Nothing is generated before that.

## Building the slides
1. Generate the approved character images (`character.md` → how), save them to the workspace as
   `avatar/<slug>/raw/NN.png`, and look at every one: same face, same hair, same glasses; no warped hands; clean sky.
2. Lay the slides out with the style-sheet engine's **own-photos mode** (`engines/carousel/ROUTER-NOTES.md`): the
   character images are the photos; the headline, numbers and handle are rendered as code on top.
3. Look at every exported slide at phone size and fix anything that breaks.
4. For **Motion graphics + avatar**, hand the finished PNGs to the live-carousel engine's **photo mode with
   `--cutout`** (`engines/live-carousel/ROUTER-NOTES.md`). Frame 0 of every slide must be the finished image; check the
   type that crosses the character is intact (no smeared letters) before calling it done.

## Hook / caption style
Line 1: a counter-intuitive one-liner that pays off the image. Then the common mistake, the named parts in one
paragraph, one extra rule. Close: `Comment [WORD] and I'll send you [specific deliverable].` + their own sign-off
(ask them once and save it in the profile).
