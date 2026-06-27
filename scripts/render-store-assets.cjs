const fs = require("node:fs");
const path = require("node:path");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

const root = path.resolve(__dirname, "..");
const rawDir = path.join(
  "/var/folders/j3/2d6kyhwx5wsf0lsq3sxt_qlh0000gn/T",
  "astral-store-assets/raw",
);
const enhancedMode = process.argv.includes("--enhanced");
const highQualityRealMode = process.argv.includes("--high-quality-real");
const providedHighQualityMode = process.argv.includes("--provided-high-quality");
const outputDir = providedHighQualityMode
  ? path.join(
      root,
      "app-store-assets/iphone-6.9/high-quality-real-screens/provided-screenshot-pass",
    )
  : highQualityRealMode
    ? path.join(root, "app-store-assets/iphone-6.9/high-quality-real-screens")
    : enhancedMode
      ? path.join(root, "app-store-assets/iphone-6.9/enhanced-phone-screens")
      : path.join(root, "app-store-assets/iphone-6.9");
const enhancedScreens = {
  "02-set-your-intention": "02-intentions-legible.png",
  "03-evolving-journeys": "03-journeys-legible.png",
  "04-live-frequency": "04-player-legible.png",
  "05-custom-chamber": "05-chamber-legible.png",
  "06-private-dream-lab": "06-journal-legible.png",
  "07-lifetime-access": "07-lifetime-legible.png",
};
const highQualityRealScreens = {
  "01-journey-through-states": "01-different-hq.png",
  "02-set-your-intention": "02-intentions-hq.png",
  "03-evolving-journeys": "03-journeys-hq.png",
  "04-live-frequency": "04-journey-detail-hq.png",
  "05-custom-chamber": "05-chamber-hq.png",
  "06-private-dream-lab": "06-dream-lab-hq.png",
  "07-lifetime-access": "07-paywall-hq.png",
};
const providedHighQualityScreens = {
  "01-journey-through-states": "01-different-provided.png",
  "03-evolving-journeys": "03-journeys-provided.png",
  "04-live-frequency": "04-journey-detail-provided.png",
  "05-custom-chamber": "05-chamber-provided.png",
  "06-private-dream-lab": "06-dream-lab-provided.png",
  "07-lifetime-access": "07-paywall-provided.png",
  "08-gateway-inspired": "08-guides-provided.png",
  "09-ambient-mixes": "09-ambient-mixes-provided.png",
};

const shots = [
  {
    name: "01-journey-through-states",
    sourceScreen: "journey-through-states-legible.png",
    eyebrow: "Evolving Binaural Journeys",
    title: ["Not Just A Tone.", "A Journey That Evolves."],
    sub: "Frequencies shift as each session unfolds.",
    accent: "#c8b4ff",
  },
  {
    name: "02-set-your-intention",
    raw: "intentions.png",
    eyebrow: "Begin With Purpose",
    title: ["Choose Where", "You Want To Go."],
    sub: "Rest, meditate, dream lucidly, or explore inward.",
    accent: "#8fc8ff",
  },
  {
    name: "03-evolving-journeys",
    raw: "journeys.png",
    eyebrow: "12+ Guided Experiences",
    title: ["Guided Journeys Take", "You Deeper Within."],
    sub: "From a first descent to deep delta rest.",
    accent: "#c8b4ff",
  },
  {
    name: "04-live-frequency",
    raw: "journey-detail.png",
    eyebrow: "Watch The Shift",
    title: ["Evolving Frequencies", "Guide Contact."],
    sub: "Follow carrier tones, beat states, and time remaining.",
    accent: "#8fc8ff",
  },
  {
    name: "05-custom-chamber",
    raw: "chamber.png",
    eyebrow: "Your Frequency Chamber",
    title: ["Tune The Signal.", "Open The Doorway."],
    sub: "Fine-tune tones, presets, timers, and ambience.",
    accent: "#c8b4ff",
  },
  {
    name: "06-private-dream-lab",
    raw: "dream-lab.png",
    eyebrow: "Private By Design",
    title: ["A Dream Journal That", "Stays On Your Device."],
    sub: "Capture dreams, moods, patterns, and lucid moments.",
    accent: "#e9acd8",
  },
  {
    name: "07-lifetime-access",
    raw: "paywall.png",
    eyebrow: "Keep The Signal Clear",
    title: ["No Music.", "Clean Signal."],
    sub: "Clean tones preserve the left/right binaural relationship.",
    accent: "#c8b4ff",
  },
  {
    name: "08-gateway-inspired",
    raw: "guides.png",
    eyebrow: "Audio-Guided Inner Exploration",
    title: ["Inspired By The", "Gateway Experience."],
    sub: "Binaural journeys for relaxation, lucid dreaming, and exploration.",
    accent: "#8fc8ff",
  },
  {
    name: "09-ambient-mixes",
    sourceScreen: "provided-high-quality/09-ambient-mixes-provided.png",
    eyebrow: "Controlled Ambience",
    title: ["Layer The Atmosphere.", "Control The Mix."],
    sub: "Use presets or fine-tune ambient sound beneath the beat.",
    accent: "#c8b4ff",
  },
];

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawSpacedText(ctx, text, centerX, y, spacing) {
  const chars = [...text];
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + spacing * (chars.length - 1);
  let x = centerX - total / 2;
  chars.forEach((char, index) => {
    ctx.fillText(char, x, y);
    x += widths[index] + spacing;
  });
}

async function render(shot) {
  const canvas = createCanvas(1320, 2868);
  const ctx = canvas.getContext("2d");
  const phoneX = 180;
  const phoneY = 690;
  const phoneWidth = 960;
  const phoneHeight = 2060;
  const screenX = phoneX + 24;
  const screenY = phoneY + 24;
  const screenWidth = phoneWidth - 48;
  const screenHeight = phoneHeight - 48;

  const background = ctx.createRadialGradient(660, 360, 0, 660, 550, 1700);
  background.addColorStop(0, "#35102f");
  background.addColorStop(0.38, "#10091f");
  background.addColorStop(1, "#02050d");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1320, 2868);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = shot.accent;
  ctx.shadowColor = shot.accent;
  ctx.shadowBlur = 180;
  ctx.beginPath();
  ctx.arc(660, 850, 420, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#d7caff";
  for (let index = 0; index < 24; index += 1) {
    const x = 45 + ((index * 193) % 1240);
    const y = 75 + ((index * 271) % 2680);
    ctx.beginPath();
    ctx.arc(x, y, (index % 3) + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.textAlign = "left";
  ctx.font = "700 27px Arial";
  ctx.fillStyle = "#91c8ff";
  drawSpacedText(ctx, shot.eyebrow, 660, 152, 9);

  ctx.textAlign = "center";
  ctx.font = "103px Georgia";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(shot.title[0], 660, 300);
  ctx.fillStyle = shot.accent;
  ctx.fillText(shot.title[1], 660, 412);

  ctx.font = "31px Arial";
  ctx.shadowColor = "rgba(2,5,13,.9)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#e3efff";
  ctx.fillText(shot.sub, 660, 565);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.9)";
  ctx.shadowBlur = 85;
  roundedRect(ctx, phoneX, phoneY, phoneWidth, phoneHeight, 112);
  ctx.fillStyle = "#090811";
  ctx.fill();
  ctx.restore();

  const frame = ctx.createLinearGradient(phoneX, phoneY, phoneX + phoneWidth, phoneY + phoneHeight);
  frame.addColorStop(0, "#a895cc");
  frame.addColorStop(0.18, "#292339");
  frame.addColorStop(0.68, "#080710");
  frame.addColorStop(1, "#776391");
  roundedRect(ctx, phoneX, phoneY, phoneWidth, phoneHeight, 112);
  ctx.fillStyle = frame;
  ctx.fill();

  roundedRect(ctx, screenX, screenY, screenWidth, screenHeight, 82);
  ctx.fillStyle = "#02050d";
  ctx.fill();

  const enhancedScreen = enhancedMode ? enhancedScreens[shot.name] : undefined;
  const highQualityRealScreen = highQualityRealMode ? highQualityRealScreens[shot.name] : undefined;
  const providedHighQualityScreen = providedHighQualityMode
    ? providedHighQualityScreens[shot.name]
    : undefined;
  const screenshotPath = providedHighQualityScreen
    ? path.join(
        root,
        "app-store-assets/source-screens/provided-high-quality",
        providedHighQualityScreen,
      )
    : highQualityRealScreen
      ? path.join(root, "app-store-assets/source-screens/high-quality-real", highQualityRealScreen)
      : enhancedScreen
        ? path.join(root, "app-store-assets/source-screens/enhanced", enhancedScreen)
        : shot.sourceScreen
          ? path.join(root, "app-store-assets/source-screens", shot.sourceScreen)
          : path.join(rawDir, shot.raw);
  const screenshot = await loadImage(screenshotPath);
  ctx.save();
  roundedRect(ctx, screenX, screenY, screenWidth, screenHeight, 82);
  ctx.clip();
  ctx.drawImage(screenshot, screenX, screenY, screenWidth, screenHeight);
  if (shot.screenLift) {
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = shot.screenLift;
    ctx.fillStyle = "#b8a8e8";
    ctx.fillRect(screenX, screenY, screenWidth, screenHeight);
  }
  ctx.restore();

  ctx.font = "20px Arial";
  ctx.fillStyle = "rgba(220,210,255,.55)";
  drawSpacedText(ctx, "ASTRAL CHAMBER", 660, 2818, 8);

  fs.writeFileSync(path.join(outputDir, `${shot.name}.png`), canvas.toBuffer("image/png"));
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const requestedName = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  const defaultShots = providedHighQualityMode
    ? shots.filter((shot) => providedHighQualityScreens[shot.name])
    : enhancedMode
      ? shots.slice(1)
      : shots;
  const selectedShots = requestedName
    ? shots.filter((shot) => shot.name === requestedName)
    : defaultShots;
  if (requestedName && selectedShots.length === 0)
    throw new Error(`Unknown screenshot: ${requestedName}`);
  for (const shot of selectedShots) await render(shot);

  if (requestedName) return;

  const preview = createCanvas(1400, 1600);
  const ctx = preview.getContext("2d");
  ctx.fillStyle = "#05030c";
  ctx.fillRect(0, 0, 1400, 1600);
  ctx.font = "700 34px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("ASTRAL CHAMBER · APP STORE SCREENSHOTS", 52, 66);

  for (let index = 0; index < selectedShots.length; index += 1) {
    const shot = selectedShots[index];
    const image = await loadImage(path.join(outputDir, `${shot.name}.png`));
    const column = index % 4;
    const row = Math.floor(index / 4);
    const x = 52 + column * 337;
    const y = 105 + row * 735;
    ctx.drawImage(image, x, y, 300, 652);
    ctx.font = "700 17px Arial";
    ctx.fillStyle = "#91c8ff";
    ctx.fillText(shot.name.slice(0, 2), x, y + 680);
  }

  fs.writeFileSync(
    enhancedMode || highQualityRealMode || providedHighQualityMode
      ? path.join(outputDir, "contact-sheet.png")
      : path.join(root, "app-store-assets/contact-sheet.png"),
    preview.toBuffer("image/png"),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
