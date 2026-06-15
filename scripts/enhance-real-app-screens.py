from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parent.parent
RAW = Path(
    "/var/folders/j3/2d6kyhwx5wsf0lsq3sxt_qlh0000gn/T/astral-store-assets/raw"
)
OUTPUT = ROOT / "app-store-assets/source-screens/high-quality-real"

SCREENS = {
    "01-different-hq.png": "different.png",
    "02-intentions-hq.png": "intentions.png",
    "03-journeys-hq.png": "journeys.png",
    "04-journey-detail-hq.png": "journey-detail.png",
    "05-chamber-hq.png": "chamber.png",
    "06-dream-lab-hq.png": "dream-lab.png",
    "07-paywall-hq.png": "paywall.png",
}


def enhance(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGB")
    target_width, target_height = 912, 2012

    scale = max(target_width / image.width, target_height / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )

    left = (resized.width - target_width) // 2
    top = (resized.height - target_height) // 2
    cropped = resized.crop((left, top, left + target_width, top + target_height))

    cropped = ImageEnhance.Contrast(cropped).enhance(1.03)
    cropped = ImageEnhance.Color(cropped).enhance(1.02)
    return cropped.filter(ImageFilter.UnsharpMask(radius=0.7, percent=22, threshold=8))


OUTPUT.mkdir(parents=True, exist_ok=True)
for output_name, source_name in SCREENS.items():
    enhance(RAW / source_name).save(OUTPUT / output_name, optimize=True)
