const fs = require("node:fs");
const path = require("node:path");
const { createCanvas } = require("@napi-rs/canvas");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "app-store-assets/source-screens");
const canvas = createCanvas(912, 2012);
const ctx = canvas.getContext("2d");

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function spacedText(text, centerX, y, spacing) {
  const chars = [...text];
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + spacing * (chars.length - 1);
  let x = centerX - total / 2;
  chars.forEach((char, index) => {
    ctx.fillText(char, x, y);
    x += widths[index] + spacing;
  });
}

function drawFeature(y, symbol, title, lines, accent) {
  roundedRect(72, y, 768, 220, 20);
  ctx.fillStyle = "rgba(8,9,20,.84)";
  ctx.fill();
  ctx.strokeStyle = "rgba(192,176,240,.28)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(156, y + 110, 43, 0, Math.PI * 2);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (symbol === "diamond") {
    ctx.beginPath();
    ctx.moveTo(156, y + 99);
    ctx.lineTo(167, y + 110);
    ctx.lineTo(156, y + 121);
    ctx.lineTo(145, y + 110);
    ctx.closePath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.stroke();
  } else {
    ctx.textAlign = "center";
    ctx.font = "29px Arial";
    ctx.fillStyle = accent;
    ctx.fillText(symbol, 156, y + 120);
  }

  ctx.textAlign = "left";
  ctx.font = "700 21px Arial";
  ctx.fillStyle = accent;
  ctx.fillText(title, 226, y + 78);
  ctx.font = "23px Arial";
  ctx.fillStyle = "#c8d3e2";
  lines.forEach((line, index) => ctx.fillText(line, 226, y + 122 + index * 31));
}

const background = ctx.createRadialGradient(456, 50, 0, 456, 700, 1300);
background.addColorStop(0, "#241020");
background.addColorStop(0.45, "#080713");
background.addColorStop(1, "#02040b");
ctx.fillStyle = background;
ctx.fillRect(0, 0, 912, 2012);

ctx.save();
ctx.globalAlpha = 0.3;
ctx.fillStyle = "#c8b4ff";
for (let index = 0; index < 24; index += 1) {
  const x = 45 + ((index * 181) % 830);
  const y = 40 + ((index * 257) % 1900);
  ctx.beginPath();
  ctx.arc(x, y, (index % 2) + 1, 0, Math.PI * 2);
  ctx.fill();
}
ctx.restore();

ctx.textAlign = "left";
ctx.font = "700 18px Arial";
ctx.fillStyle = "#8fc8ff";
ctx.fillText("WHAT MAKES US DIFFERENT", 72, 82);
ctx.textAlign = "right";
ctx.fillText("1 / 3", 840, 82);

ctx.textAlign = "center";
ctx.font = "700 18px Arial";
ctx.fillStyle = "#e9acd8";
spacedText("NOT A STATIC TRACK", 456, 165, 7);

ctx.font = "76px Georgia";
ctx.fillStyle = "#ffffff";
ctx.fillText("A Journey Through", 456, 275);
ctx.fillStyle = "#c8b4ff";
ctx.fillText("States.", 456, 360);

ctx.font = "25px Arial";
ctx.fillStyle = "#d2dbea";
ctx.fillText("Each session moves through carefully chosen", 456, 426);
ctx.fillText("frequencies, guiding you from one state to another.", 456, 460);

roundedRect(72, 525, 768, 330, 22);
ctx.fillStyle = "rgba(10,10,24,.88)";
ctx.fill();
ctx.strokeStyle = "rgba(192,176,240,.35)";
ctx.lineWidth = 2;
ctx.stroke();

ctx.strokeStyle = "#8e8aad";
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(160, 660);
ctx.lineTo(752, 660);
ctx.stroke();

const stages = [
  { x: 185, name: "BETA", state: "CLEAR", color: "#8fc8ff" },
  { x: 456, name: "ALPHA", state: "CALM", color: "#c8b4ff" },
  { x: 727, name: "THETA", state: "DEEP", color: "#e9acd8" },
];

stages.forEach((stage, index) => {
  ctx.strokeStyle = stage.color;
  ctx.lineWidth = index === 2 ? 4 : 2;
  ctx.beginPath();
  ctx.moveTo(stage.x, 630);
  ctx.lineTo(stage.x, 690);
  ctx.stroke();

  if (index === 2) {
    ctx.shadowColor = stage.color;
    ctx.shadowBlur = 22;
    ctx.fillStyle = stage.color;
    ctx.beginPath();
    ctx.arc(stage.x, 660, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.textAlign = "center";
  ctx.font = "700 20px Arial";
  ctx.fillStyle = stage.color;
  ctx.fillText(stage.name, stage.x, 747);
  ctx.font = "17px Arial";
  ctx.fillStyle = "#9aa9bc";
  ctx.fillText(stage.state, stage.x, 780);
});

ctx.font = "700 16px Arial";
ctx.fillStyle = "#c8b4ff";
spacedText("FREQUENCIES SHIFT AS THE JOURNEY UNFOLDS", 456, 825, 4);

drawFeature(
  915,
  "diamond",
  "PRIVATE DREAM LAB",
  ["Capture what surfaced, notice patterns,", "and keep a private record on your device."],
  "#e9acd8",
);
drawFeature(
  1165,
  "~",
  "AMBIENT SOUNDSCAPES",
  ["Blend white, pink, and brown noise", "with wind or ocean waves beneath each journey."],
  "#8fc8ff",
);
drawFeature(
  1415,
  "∞",
  "EVOLVING SESSIONS",
  ["Move through beta, alpha, theta, and delta", "without manually changing the frequency."],
  "#c8b4ff",
);

roundedRect(72, 1770, 768, 112, 18);
ctx.fillStyle = "#c8b4ff";
ctx.fill();
ctx.textAlign = "center";
ctx.font = "700 20px Arial";
ctx.fillStyle = "#080610";
spacedText("CONTINUE", 456, 1840, 8);

ctx.font = "15px Arial";
ctx.fillStyle = "rgba(200,180,255,.5)";
spacedText("ASTRAL CHAMBER", 456, 1950, 7);

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "journey-through-states-legible.png"), canvas.toBuffer("image/png"));
