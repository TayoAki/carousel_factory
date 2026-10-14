#!/usr/bin/env python3
"""Audio -> build -> check -> render every slide -> verify -> contact sheet + seam strips + swipe preview.

  py render_all.py [project-dir] [--only 01-hook 03-weight] [--workers 2] [--quality looks]
                   [--no-audio] [--no-check] [--check-only]

Outputs, all inside the project:
  renders/slide-<name>.mp4     one 1080x1350 30 fps MP4 per slide, sound included (what you post)
  renders/contact-sheet.jpg    top row = frame 0 of every slide, bottom row = mid-slide
  renders/seams/<name>.jpg     last frame | first frame, to eyeball the loop seam
  renders/frame0-check.txt     (photo mode) frame 0 of every slide vs the original image, whole + per text box
  preview.html                 local Instagram-style swipe preview of the renders
"""
import argparse
import html
import json
import subprocess
import sys
from pathlib import Path

HF = "hyperframes@0.8.121"


def run(cmd, cwd, quiet=False):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if not quiet or r.returncode:
        out = (r.stdout + r.stderr).strip()
        if out:
            print("\n".join("    " + line for line in out.splitlines()[-40:]))
    return r.returncode


def probe(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_type:format=duration", "-of", "json", str(path)],
        capture_output=True,
        text=True,
    )
    d = json.loads(r.stdout or "{}")
    kinds = [s.get("codec_type") for s in d.get("streams", [])]
    return float(d.get("format", {}).get("duration", 0)), "audio" in kinds


def frame(src, t, out, w=360):
    """Grab one frame at t seconds; t=None grabs the very last frame."""
    seek = ["-sseof", "-0.3"] if t is None else ["-ss", f"{max(0, t):.3f}"]
    tail = ["-update", "1"] if t is None else ["-frames:v", "1"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", *seek, "-i", str(src), *tail, "-vf", f"scale={w}:-2", str(out)], check=True)


def stack(images, out, layout):
    args = ["ffmpeg", "-v", "error", "-y"]
    for im in images:
        args += ["-i", str(im)]
    args += ["-filter_complex", layout, "-q:v", "3", str(out)]
    subprocess.run(args, check=True)


def frame0_check(proj, slides, renders):
    """Photo mode promise: frame 0 IS the user's image (only grain is added). Compare it, whole frame and per
    detected text box: grain + encoding is ~5/255; a smeared or shifted word shows up as a spike in its box."""
    try:
        import cv2
        import numpy as np
    except ImportError:
        print("    (frame-0 check skipped: needs numpy + opencv; run setup.sh)")
        return True
    lines, ok = [], True
    tmp = renders / ".frames"
    tmp.mkdir(parents=True, exist_ok=True)
    for s in slides:
        out = renders / f"slide-{s}.mp4"
        srcs = sorted((proj / "source").glob(f"{s}.*"))
        if not out.exists() or not srcs:
            continue
        f0p = tmp / f"{s}-f0.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-frames:v", "1", str(f0p)], check=True)
        f0 = cv2.imread(str(f0p)).astype(np.float32)
        o = cv2.imread(str(srcs[0]))
        h, w = o.shape[:2]  # centre-crop to 4:5 exactly like prep_photo.fit45
        if abs(w / h - 0.8) > 0.01:
            if w / h > 0.8:
                nw = int(round(h * 0.8))
                o = o[:, (w - nw) // 2 : (w - nw) // 2 + nw]
            else:
                nh = int(round(w / 0.8))
                o = o[(h - nh) // 2 : (h - nh) // 2 + nh]
        o = cv2.resize(o, (f0.shape[1], f0.shape[0]), interpolation=cv2.INTER_AREA).astype(np.float32)
        d = np.abs(f0 - o).mean(axis=2)
        whole = float(d.mean())
        gp = proj / "assets" / s / "geo.json"
        geo = json.loads(gp.read_text()) if gp.exists() else {}
        # worst 40 px tile inside any text box: a smeared word is local, a box average would hide it
        worst, wbox, T = 0.0, None, 40
        for b in geo.get("text", []):
            x0, y0, x1, y1 = b
            for y in range(y0, max(y0 + 1, y1 - T + 1), T // 2):
                for x in range(x0, max(x0 + 1, x1 - T + 1), T // 2):
                    v = float(d[y : y + T, x : x + T].mean())
                    if v > worst:
                        worst, wbox = v, [x, y, x + T, y + T]
        bad = whole > 10 or worst > 30
        ok &= not bad
        line = f"{s}: whole {whole:.1f}/255, worst text tile {worst:.1f}/255 at {wbox or '-'}" + ("   <- CHECK THIS SLIDE" if bad else "   ok")
        lines.append(line)
        print("    " + line)
    (renders / "frame0-check.txt").write_text("frame 0 vs the original image (mean abs difference, 0-255)\n" + "\n".join(lines) + "\n")
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project", nargs="?", default=".")
    ap.add_argument("--only", nargs="*", default=[])
    ap.add_argument("--workers", default="2")
    ap.add_argument("--quality", default="looks")
    ap.add_argument("--no-audio", action="store_true")
    ap.add_argument("--no-check", action="store_true")
    ap.add_argument("--check-only", action="store_true", help="build and check, no render")
    a = ap.parse_args()

    proj = Path(a.project).expanduser().resolve()
    cfg_path = proj / "carousel.json"
    cfg = json.loads(cfg_path.read_text()) if cfg_path.exists() else {}
    slides = cfg.get("slides") or sorted(p.stem for p in (proj / "src").glob("*.html") if not p.stem.startswith("_"))
    todo = [s for s in slides if not a.only or s in a.only]
    py = sys.executable

    if not a.no_audio and (proj / "audio/make_audio.py").exists():
        print("» audio")
        if run([py, "make_audio.py"], proj / "audio"):
            sys.exit("audio/make_audio.py failed")
    print("» build")
    if run([py, "build.py", *todo], proj):
        sys.exit("build.py failed")

    if not a.no_check:
        failed = []
        for s in todo:
            print(f"» check {s}")
            if run(["npx", "--yes", HF, "check"], proj / "slides" / s, quiet=True):
                failed.append(s)
        if failed:
            sys.exit(f"check failed for: {', '.join(failed)}. Fix the errors above, then run again.")
    if a.check_only:
        print("checks passed")
        return

    renders = proj / "renders"
    (renders / "seams").mkdir(parents=True, exist_ok=True)
    frames = renders / ".frames"
    frames.mkdir(exist_ok=True)
    for s in todo:
        out = renders / f"slide-{s}.mp4"
        print(f"» render {s}")
        code = run(["npx", "--yes", HF, "render", "-o", str(out), "--workers", str(a.workers), "--quality", a.quality, "--quiet"], proj / "slides" / s, quiet=True)
        if code or not out.exists():
            sys.exit(f"render failed for {s}")

    print("» verify")
    ok_all = True
    for s in slides:
        out = renders / f"slide-{s}.mp4"
        if not out.exists():
            continue
        dur, has_audio = probe(out)
        flag = "" if has_audio else "   <- NO AUDIO"
        ok_all &= has_audio
        print(f"    slide-{s}.mp4  {dur:.2f}s  {out.stat().st_size / 1e6:.1f} MB{flag}")
        frame(out, 0, frames / f"{s}-first.png")
        frame(out, dur * 0.45, frames / f"{s}-mid.png")
        frame(out, None, frames / f"{s}-last.png")
        stack([frames / f"{s}-last.png", frames / f"{s}-first.png"], renders / "seams" / f"{s}.jpg", "[0][1]hstack=inputs=2")

    f0_ok = True
    if cfg.get("mode") == "photo":
        print("» frame 0 vs original")
        f0_ok = frame0_check(proj, slides, renders)

    done = [s for s in slides if (renders / f"slide-{s}.mp4").exists()]
    if done:
        firsts = [frames / f"{s}-first.png" for s in done]
        mids = [frames / f"{s}-mid.png" for s in done]
        n = len(done)
        if n == 1:
            layout = "[0][1]vstack=inputs=2"
        else:
            top = "".join(f"[{i}]" for i in range(n)) + f"hstack=inputs={n}[t];"
            bot = "".join(f"[{n + i}]" for i in range(n)) + f"hstack=inputs={n}[b];"
            layout = top + bot + "[t][b]vstack=inputs=2"
        stack(firsts + mids, renders / "contact-sheet.jpg", layout)

        tpl = proj / ".preview.template.html"
        if tpl.exists():
            esc = html.escape
            vids = "\n".join(
                f'          <video src="renders/slide-{s}.mp4" playsinline loop muted preload="auto"></video>' for s in done
            )
            dots = "".join('<i class="on"></i>' if i == 0 else "<i></i>" for i in range(n))
            page = (
                tpl.read_text()
                .replace("<!--@VIDEOS@-->", vids)
                .replace("<!--@DOTS@-->", dots)
                .replace("@N@", str(n))
                .replace("@TITLE@", esc(cfg.get("title", "Live carousel")))
                .replace("@HANDLE@", esc(cfg.get("handle", "your_handle")))
                .replace("@CAPTION@", esc(cfg.get("caption", "")))
            )
            (proj / "preview.html").write_text(page)
    print()
    print(f"renders:        {renders}")
    print(f"contact sheet:  {renders / 'contact-sheet.jpg'}")
    print(f"loop seams:     {renders / 'seams'}")
    if (proj / "preview.html").exists():
        print(f"swipe preview:  {proj / 'preview.html'}")
    if not f0_ok:
        print("frame 0 differs from the original on a slide above: look at it (a word over the subject, a mask, a hit at 0.0?)")
    if not ok_all:
        sys.exit("some renders have no audio track: check audio/out/ and the <audio> element in the slide")


if __name__ == "__main__":
    main()
