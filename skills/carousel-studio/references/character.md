# Setting up the user's character (once)

The avatar styles need a character: the user, a mascot, or a character they build for their brand. Set it up the
first time they pick **Motion graphics + avatar** (or ask for an avatar carousel), save it in the studio profile
(`profile.character`), and never ask again unless they want to change it.

Ask, in one `AskUserQuestion` round:

**Who is the character?**
1. **Me, from my real photos: $0.** Recommended when they have photos. The carousel uses their actual photos,
   cut out and laid out by the style-sheet engine. Nothing is generated, nothing costs money.
2. **Me, as an AI character (paid images).** Their face is locked as a reference once, and every post puts them in a
   new cinematic scene. Each image costs credits.
3. **A mascot or brand character.** They give a PNG (or a few) of the character; it's used like their photos.

## Option 1 · Real photos ($0)
- Ask for 8–15 clear photos: different outfits, places and angles, face visible, good light. They can drag them into
  the chat or drop them into `<workspace>/avatar/character/`.
- Import them with the style-sheet engine's own-photos import (`engines/carousel/ROUTER-NOTES.md`): it converts
  HEIC, fixes rotation and cuts the subject out, on-device. Their photos stay on their computer and are never uploaded.
- `profile.character = {"mode": "photos", "photos": "avatar/character"}`.
- For each carousel, pick the photo per slide that best shows that slide's point (the creative director's World/Borrow
  still decides the slide; with real photos it decides which photo and which crop).

## Option 2 · AI character (paid)
1. **The reference.** Ask for 1–4 sharp photos: front, three-quarter and profile; plain background; no sunglasses,
   no hat; the hair and beard as they normally wear them. A front/side/back reference sheet is ideal.
2. **Lock it.**
   - **With the Higgsfield connector in this Claude** (check the tools available): upload the photos, create a
     **reference element** for the character (the connector's Elements tool, `action: create`), and save its id and
     name. In every image prompt the element goes in as its placeholder (`<<<element_id>>>`), per the connector's own
     instructions; pick a model the connector lists as supporting reference elements.
   - **Without it:** use the style-sheet engine's paid route (kie.ai, `KIE_API_KEY` in `.env`) with the reference
     photos passed as reference images (`engines/carousel/ROUTER-NOTES.md`).
3. **The look in words.** The reference alone drifts. Write one line describing the face and ask the user to confirm
   or correct it, e.g. *"young man, dense curly black hair falling on the forehead, black browline glasses, short dark
   chin beard, lean build"*. It goes into **every** image prompt. Note what it must never become (e.g. "never a full
   beard, never bald").
4. **One test image, after "go".** Show the cost of one image first. Generate a simple head-on portrait in a plain
   sunlit world, and ask: is this you? If the face drifts, adjust the look-in-words or the reference photos and
   test once more (again, say the cost first).
5. `profile.character = {"mode": "higgsfield" | "kie", "element_id": "...", "element_name": "...", "look": "...",
   "never": "...", "reference": "avatar/character/ref.png"}`.

## Option 3 · Mascot
- Ask for the mascot as transparent PNGs (several poses if they have them), into `<workspace>/avatar/character/`.
- `profile.character = {"mode": "mascot", "photos": "avatar/character", "look": "<one line describing it>"}`.
- If they want new poses generated, that is paid: same rules as option 2.

## The money rule (all options)
Images from an AI model cost credits. **Before any generation, say exactly how many images and how many credits (use
the connector's cost preview or the engine's preflight), and wait until they say "go".** Never spend on a guess.
Real photos and mascots cost nothing. The motion graphics, music and sound effects are always $0.
