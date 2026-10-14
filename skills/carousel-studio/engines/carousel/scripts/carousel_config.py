"""Config for the Instagram Carousel Generator (engine build).

Two roots:
  CAROUSEL_ROOT  the engine itself (scripts, templates, style sheets, knowledge). Found from
                 this file's own location, so the engine runs from wherever it is installed.
  WORKSPACE      where the user's work goes: profile.json, my-images/, runs/, output/, and any
                 photos / screenshots / logos fetched for a carousel. Chosen by the caller:
                   1. `--workspace <dir>` anywhere on a script's command line, or
                   2. the CAROUSEL_WORKSPACE environment variable, else
                   3. ./carousel-workspace (current directory) when the engine sits inside a
                      .claude/ skills folder, else the engine folder itself (standalone kit).
Paid images use the Higgsfield connector, or kie.ai with the user's own KIE_API_KEY from a .env file.
"""
import os
import sys
from pathlib import Path

CAROUSEL_ROOT = Path(__file__).resolve().parent.parent   # .../engines/carousel
PROJECT_ROOT = CAROUSEL_ROOT.parent


def _workspace_flag():
    """Take `--workspace <dir>` / `--workspace=<dir>` off the command line (each script's own
    argument handling never sees it)."""
    for i, a in enumerate(sys.argv[1:], 1):
        if a == "--workspace" and i + 1 < len(sys.argv):
            v = sys.argv[i + 1]
            del sys.argv[i:i + 2]
            return v
        if a.startswith("--workspace="):
            del sys.argv[i]
            return a.split("=", 1)[1]
    return None


_ws = _workspace_flag() or os.getenv("CAROUSEL_WORKSPACE")
if _ws:
    WORKSPACE = Path(_ws).expanduser().resolve()
elif ".claude" in CAROUSEL_ROOT.parts:
    WORKSPACE = (Path.cwd() / "carousel-workspace").resolve()
else:
    WORKSPACE = CAROUSEL_ROOT
os.environ["CAROUSEL_WORKSPACE"] = str(WORKSPACE)    # child processes see the same workspace


def resolve(path):
    """A path from a plan or manifest: absolute as-is; relative -> the workspace first (the user's
    photos, shots, logos, my-images), then the engine (bundled style sheets and previews)."""
    if not path:
        return None
    p = Path(str(path)).expanduser()
    if p.is_absolute():
        return p
    for base in (WORKSPACE, CAROUSEL_ROOT, Path.cwd()):
        if (base / p).exists():
            return base / p
    return WORKSPACE / p


# Load KIE_API_KEY (and other vars) from a .env file if python-dotenv is installed.
try:
    from dotenv import load_dotenv
    for _env in (WORKSPACE / ".env", Path.cwd() / ".env", PROJECT_ROOT / ".env", CAROUSEL_ROOT / ".env"):
        if _env.exists():
            load_dotenv(_env)
            break
except Exception:
    pass  # dotenv optional; env vars still work

# --- Paths ---
ASSETS_DIR = CAROUSEL_ROOT / "assets"          # bundled, read-only
KNOWLEDGE_DIR = CAROUSEL_ROOT / "knowledge"
RUNS_DIR = WORKSPACE / "runs"                   # the user's work
OUTPUT_DIR = WORKSPACE / "output"
MY_IMAGES_DIR = WORKSPACE / "my-images"
PROFILE = WORKSPACE / "profile.json"
TEMPLATE = CAROUSEL_ROOT / "scripts" / "template.html"
# The single bundled style reference (swap this file to change the look — ONE only).
STYLE_REFERENCE = ASSETS_DIR / "carousel-style-reference.jpg"

# --- Output canvas: Instagram carousel 4:5 (1080x1350) ---
CANVAS_W = int(os.getenv("CAROUSEL_W", "1080"))
CANVAS_H = int(os.getenv("CAROUSEL_H", "1350"))
RENDER_SCALE = int(os.getenv("CAROUSEL_RENDER_SCALE", "2"))

# --- Background generation via kie.ai (bring your own KIE_API_KEY) ---
KIE_API_KEY = os.getenv("KIE_API_KEY", "")                 # get one at https://kie.ai/api-key
KIE_BASE_URL = os.getenv("KIE_BASE_URL", "https://api.kie.ai")
# Nano Banana Pro (Gemini 3 Pro Image) — matches the look, supports 4:5 natively.
# Swap to another kie model here if you like (e.g. "nano-banana-2", "gpt-image-2-image-to-image").
MODEL_IMAGE = os.getenv("CAROUSEL_MODEL", "nano-banana-pro")
BG_ASPECT = os.getenv("CAROUSEL_BG_ASPECT", "4:5")
BG_RESOLUTION = os.getenv("CAROUSEL_BG_RESOLUTION", "2K")   # 1K | 2K | 4K
WORKERS = int(os.getenv("CAROUSEL_WORKERS", "3"))
STYLE_REFERENCE_URL = os.getenv("CAROUSEL_STYLE_REFERENCE_URL", "")
UPLOAD_PROVIDER = os.getenv("UPLOAD_PROVIDER", "catbox")    # catbox | 0x0 (hosts the style ref for kie)

# --- Polling (kie fallback) ---
POLL_INTERVAL = float(os.getenv("POLL_INTERVAL", "6"))
POLL_TIMEOUT = float(os.getenv("POLL_TIMEOUT", "900"))
