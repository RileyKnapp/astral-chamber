from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
DOWNLOADS = Path("/Users/riley/Downloads")
OUTPUT = ROOT / "app-store-assets/source-screens/provided-high-quality"

SCREENS = {
    "01-different-provided.png": "Screenshot 2026-06-12 at 2.17.38\u202fPM.png",
    "03-journeys-provided.png": "Screenshot 2026-06-12 at 2.18.17\u202fPM.png",
    "04-journey-detail-provided.png": "Screenshot 2026-06-12 at 2.18.50\u202fPM.png",
    "05-chamber-provided.png": "Screenshot 2026-06-12 at 2.27.47\u202fPM.png",
    "06-dream-lab-provided.png": "Screenshot 2026-06-12 at 2.20.47\u202fPM.png",
    "07-paywall-provided.png": "Screenshot 2026-06-12 at 2.18.04\u202fPM.png",
}

RAW_SCREENS = {
    "08-guides-provided.png": Path(
        "/var/folders/j3/2d6kyhwx5wsf0lsq3sxt_qlh0000gn/T/astral-store-assets/raw/guides.png"
    ),
}

TARGET_WIDTH, TARGET_HEIGHT = 912, 2012
STATUS_BAR_HEIGHT = 145


def prepare(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGB")
    image = image.crop((0, STATUS_BAR_HEIGHT, image.width, image.height))

    target_ratio = TARGET_WIDTH / TARGET_HEIGHT
    crop_width = round(image.height * target_ratio)
    left = (image.width - crop_width) // 2
    image = image.crop((left, 0, left + crop_width, image.height))

    return image.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)


OUTPUT.mkdir(parents=True, exist_ok=True)
for output_name, source_name in SCREENS.items():
    source = DOWNLOADS / source_name
    output = OUTPUT / output_name
    if source.exists():
        prepare(source).save(output, optimize=True)
    elif not output.exists():
        raise FileNotFoundError(source)

for output_name, source in RAW_SCREENS.items():
    image = Image.open(source).convert("RGB")
    image = image.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    image.save(OUTPUT / output_name, optimize=True)
