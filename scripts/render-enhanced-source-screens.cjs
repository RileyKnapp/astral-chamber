const fs = require("node:fs");
const path = require("node:path");
const { createCanvas } = require("@napi-rs/canvas");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "app-store-assets/source-screens/enhanced");
const W = 912;
const H = 2012;

function makeCanvas() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const bg = ctx.createRadialGradient(456, 0, 0, 456, 650, 1450);
  bg.addColorStop(0, "#251020");
  bg.addColorStop(0.45, "#080713");
  bg.addColorStop(1, "#02040b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#c8b4ff";
  for (let i = 0; i < 25; i += 1) {
    ctx.beginPath();
    ctx.arc(35 + ((i * 181) % 845), 40 + ((i * 257) % 1900), (i % 2) + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return { canvas, ctx };
}

function round(ctx, x, y, w, h, r = 20, fill = "rgba(8,9,20,.84)", stroke = "rgba(192,176,240,.28)") {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function spaced(ctx, text, centerX, y, spacing) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  let x = centerX - (widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)) / 2;
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + spacing;
  });
}

function header(ctx, label, title1, title2, description, accent = "#c8b4ff") {
  ctx.textAlign = "center";
  ctx.font = "700 18px Arial";
  ctx.fillStyle = "#8fc8ff";
  spaced(ctx, label, 456, 92, 6);
  ctx.font = "72px Georgia";
  ctx.fillStyle = "#fff";
  ctx.fillText(title1, 456, 205);
  ctx.fillStyle = accent;
  ctx.fillText(title2, 456, 286);
  ctx.font = "24px Arial";
  ctx.fillStyle = "#d2dbea";
  description.forEach((line, i) => ctx.fillText(line, 456, 350 + i * 32));
}

function footerButton(ctx, label = "CONTINUE") {
  round(ctx, 72, 1780, 768, 110, 18, "#c8b4ff", null);
  ctx.font = "700 20px Arial";
  ctx.fillStyle = "#080610";
  spaced(ctx, label, 456, 1848, 8);
  ctx.font = "15px Arial";
  ctx.fillStyle = "rgba(200,180,255,.5)";
  spaced(ctx, "ASTRAL CHAMBER", 456, 1960, 7);
}

function pill(ctx, x, y, text, color) {
  round(ctx, x, y, 125, 38, 19, `${color}18`, `${color}88`);
  ctx.textAlign = "center";
  ctx.font = "700 15px Arial";
  ctx.fillStyle = color;
  ctx.fillText(text, x + 62, y + 25);
}

function save(name, canvas) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, name), canvas.toBuffer("image/png"));
}

function intentions() {
  const { canvas, ctx } = makeCanvas();
  header(ctx, "SET YOUR INTENTION", "Where Would You", "Like To Go?", [
    "Choose the state that is calling you inward.",
  ], "#8fc8ff");
  const items = [
    ["DEEP REST", "Quiet The Waking Mind", "Delta", "#8fc8ff"],
    ["MEDITATION", "Settle Into Stillness", "Alpha", "#c8b4ff"],
    ["LUCID DREAMING", "Wake The Dreamer", "Theta", "#e9acd8"],
    ["ASTRAL EXPLORATION", "Loosen The Ordinary Edges", "Theta", "#d8ccff"],
  ];
  items.forEach(([label, title, state, color], i) => {
    const y = 470 + i * 280;
    round(ctx, 72, y, 768, 230);
    ctx.beginPath();
    ctx.arc(155, y + 115, 48, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = "31px Georgia";
    ctx.fillStyle = color;
    ctx.fillText(String(i + 1).padStart(2, "0"), 155, y + 126);
    ctx.textAlign = "left";
    ctx.font = "700 19px Arial";
    ctx.fillStyle = color;
    ctx.fillText(label, 235, y + 78);
    ctx.font = "35px Georgia";
    ctx.fillStyle = "#fff";
    ctx.fillText(title, 235, y + 132);
    pill(ctx, 235, y + 160, state, color);
  });
  footerButton(ctx, "CHOOSE YOUR PATH");
  save("02-intentions-legible.png", canvas);
}

function journeys() {
  const { canvas, ctx } = makeCanvas();
  header(ctx, "CURATED FREQUENCY ARCS", "Choose A Journey.", "Follow Its Inner Arc.", [
    "Each experience moves through a distinct sequence",
    "of tones, states, and intentions.",
  ]);
  const items = [
    ["ASTRAL ENERGY PRIMER", "Alpha → Beta → Gamma", "10 MIN", "#8fc8ff"],
    ["THE FIRST DESCENT", "Beta → Alpha → Theta", "20 MIN", "#c8b4ff"],
    ["LUCID THRESHOLD", "Theta with Gamma sparks", "45 MIN", "#e9acd8"],
    ["VOID SITTING", "Deep Delta", "60 MIN", "#d8ccff"],
  ];
  items.forEach(([title, arc, time, color], i) => {
    const y = 480 + i * 292;
    round(ctx, 72, y, 768, 240);
    ctx.textAlign = "left";
    ctx.font = "39px Georgia";
    ctx.fillStyle = "#fff";
    ctx.fillText(title, 112, y + 68);
    pill(ctx, 665, y + 34, time, color);
    ctx.font = "23px Arial";
    ctx.fillStyle = "#c8d3e2";
    ctx.fillText(arc, 112, y + 112);
    ctx.strokeStyle = "rgba(180,170,210,.42)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(112, y + 174);
    ctx.lineTo(792, y + 174);
    ctx.stroke();
    [180, 450, 720].forEach((x, j) => {
      ctx.beginPath();
      ctx.arc(x, y + 174, j === 2 ? 10 : 6, 0, Math.PI * 2);
      ctx.fillStyle = j === 2 ? color : "#77748c";
      ctx.fill();
    });
  });
  footerButton(ctx, "EXPLORE ALL JOURNEYS");
  save("03-journeys-legible.png", canvas);
}

function player() {
  const { canvas, ctx } = makeCanvas();
  header(ctx, "THE FIRST DESCENT", "Watch The Frequency", "Change As You Descend.", [
    "Follow the journey from waking focus",
    "into the dreaming layer.",
  ], "#8fc8ff");
  ctx.beginPath();
  ctx.arc(456, 610, 112, 0, Math.PI * 2);
  ctx.strokeStyle = "#c8b4ff";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#c8b4ff";
  ctx.beginPath();
  ctx.moveTo(435, 565);
  ctx.lineTo(435, 655);
  ctx.lineTo(510, 610);
  ctx.closePath();
  ctx.fill();
  ctx.textAlign = "center";
  ctx.font = "42px Georgia";
  ctx.fillStyle = "#fff";
  ctx.fillText("00:00  /  20:00", 456, 790);
  pill(ctx, 393, 815, "20:00 LEFT", "#8fc8ff");
  round(ctx, 72, 915, 768, 330);
  ctx.font = "700 18px Arial";
  ctx.fillStyle = "#e9acd8";
  spaced(ctx, "CURRENT STATE", 456, 975, 5);
  ctx.font = "60px Georgia";
  ctx.fillStyle = "#fff";
  ctx.fillText("BETA", 456, 1065);
  ctx.font = "23px Arial";
  ctx.fillStyle = "#c8d3e2";
  ctx.fillText("Clear Focus · 16 Hz Beat", 456, 1115);
  ctx.strokeStyle = "#85819c";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(150, 1180);
  ctx.lineTo(762, 1180);
  ctx.stroke();
  ctx.fillStyle = "#8fc8ff";
  ctx.beginPath();
  ctx.arc(175, 1180, 12, 0, Math.PI * 2);
  ctx.fill();
  round(ctx, 72, 1300, 768, 270);
  [["LEFT", "220.0 Hz", "#8fc8ff"], ["BEAT", "16.0 Hz", "#c8b4ff"], ["RIGHT", "236.0 Hz", "#e9acd8"]].forEach(([a, b, c], i) => {
    const x = 185 + i * 270;
    ctx.textAlign = "center";
    ctx.font = "700 18px Arial";
    ctx.fillStyle = c;
    ctx.fillText(a, x, 1380);
    ctx.font = "36px Georgia";
    ctx.fillStyle = "#fff";
    ctx.fillText(b, x, 1440);
  });
  footerButton(ctx, "BEGIN JOURNEY");
  save("04-player-legible.png", canvas);
}

function chamber() {
  const { canvas, ctx } = makeCanvas();
  header(ctx, "YOUR FREQUENCY CHAMBER", "Shape The Sound", "That Carries You.", [
    "Fine-tune tones, presets, timers, and ambience.",
  ]);
  round(ctx, 72, 445, 768, 520);
  [["L", 285, "#8fc8ff"], ["R", 627, "#e9acd8"]].forEach(([label, x, color]) => {
    ctx.beginPath();
    ctx.arc(x, 650, 108, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = "64px Georgia";
    ctx.fillStyle = color;
    ctx.fillText(label, x, 670);
  });
  ctx.textAlign = "center";
  ctx.font = "700 20px Arial";
  ctx.fillStyle = "#c8b4ff";
  spaced(ctx, "ALPHA · 10 HZ", 456, 500, 5);
  ctx.font = "24px Arial";
  ctx.fillStyle = "#c8d3e2";
  ctx.fillText("200 Hz Carrier  ·  210 Hz Right Tone", 456, 885);
  [["CARRIER", "200 Hz", "#8fc8ff"], ["BEAT", "10 Hz", "#c8b4ff"], ["VOLUME", "15%", "#e9acd8"]].forEach(([label, value, color], i) => {
    const y = 1040 + i * 180;
    round(ctx, 72, y, 768, 135);
    ctx.textAlign = "left";
    ctx.font = "700 19px Arial";
    ctx.fillStyle = color;
    ctx.fillText(label, 112, y + 48);
    ctx.textAlign = "right";
    ctx.fillText(value, 800, y + 48);
    ctx.strokeStyle = "#59586a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(112, y + 92);
    ctx.lineTo(800, y + 92);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(270 + i * 105, y + 92, 11, 0, Math.PI * 2);
    ctx.fill();
  });
  footerButton(ctx, "OPEN DOORWAY");
  save("05-chamber-legible.png", canvas);
}

function journal() {
  const { canvas, ctx } = makeCanvas();
  header(ctx, "PRIVATE BY DESIGN", "Your Dream Lab.", "Kept On Your Device.", [
    "Capture dreams, patterns, moods, and lucid moments.",
  ], "#e9acd8");
  round(ctx, 72, 445, 768, 155);
  ctx.textAlign = "left";
  ctx.font = "70px Georgia";
  ctx.fillStyle = "#fff";
  ctx.fillText("12", 118, 545);
  ctx.font = "700 20px Arial";
  ctx.fillStyle = "#e9acd8";
  ctx.fillText("DAYS JOURNALED", 235, 505);
  ctx.font = "23px Arial";
  ctx.fillStyle = "#c8d3e2";
  ctx.fillText("Build a private record, one morning at a time.", 235, 545);
  round(ctx, 72, 650, 768, 650);
  ctx.font = "700 19px Arial";
  ctx.fillStyle = "#c8b4ff";
  ctx.fillText("DREAM JOURNAL", 112, 710);
  round(ctx, 112, 755, 688, 95, 14, "#05050d");
  ctx.font = "23px Arial";
  ctx.fillStyle = "#8995a6";
  ctx.fillText("Title Of The Dream", 145, 815);
  round(ctx, 112, 875, 688, 205, 14, "#05050d");
  ctx.fillText("What Did You See?", 145, 935);
  pill(ctx, 112, 1110, "CALM", "#8fc8ff");
  pill(ctx, 255, 1110, "LUCID", "#e9acd8");
  round(ctx, 112, 1170, 688, 80, 14, "#c8b4ff", null);
  ctx.textAlign = "center";
  ctx.font = "700 18px Arial";
  ctx.fillStyle = "#080610";
  spaced(ctx, "RECORD DREAM", 456, 1220, 6);
  round(ctx, 72, 1350, 768, 260);
  ctx.textAlign = "left";
  ctx.font = "700 20px Arial";
  ctx.fillStyle = "#8fc8ff";
  ctx.fillText("ENCRYPTED BACKUPS", 112, 1420);
  ctx.font = "24px Arial";
  ctx.fillStyle = "#c8d3e2";
  ctx.fillText("Export a password-protected copy", 112, 1475);
  ctx.fillText("without sending journal entries to us.", 112, 1510);
  footerButton(ctx, "ENTER DREAM LAB");
  save("06-journal-legible.png", canvas);
}

function lifetime() {
  const { canvas, ctx } = makeCanvas();
  header(ctx, "PREMIUM CHAMBER", "Everything Included.", "One Simple Unlock.", [
    "No recurring subscription. Restore access anytime.",
  ]);
  round(ctx, 72, 445, 768, 210);
  ctx.textAlign = "center";
  ctx.font = "78px Georgia";
  ctx.fillStyle = "#fff";
  ctx.fillText("$7.99", 456, 545);
  ctx.font = "700 17px Arial";
  ctx.fillStyle = "#c8b4ff";
  spaced(ctx, "ONE-TIME PURCHASE", 456, 605, 5);
  const features = [
    ["12+ JOURNEYS", "Evolving guided frequency arcs", "#8fc8ff"],
    ["FREQUENCY CHAMBER", "Custom tones, presets, and timers", "#c8b4ff"],
    ["AMBIENT MIXER", "Noise, wind, and ocean layers", "#e9acd8"],
    ["PRIVATE DREAM LAB", "Journal and encrypted backups", "#d8ccff"],
  ];
  features.forEach(([title, copy, color], i) => {
    const y = 720 + i * 225;
    round(ctx, 72, y, 768, 180);
    ctx.beginPath();
    ctx.arc(150, y + 90, 40, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = "700 21px Arial";
    ctx.fillStyle = color;
    ctx.fillText(String(i + 1).padStart(2, "0"), 150, y + 98);
    ctx.textAlign = "left";
    ctx.font = "700 21px Arial";
    ctx.fillText(title, 220, y + 70);
    ctx.font = "24px Arial";
    ctx.fillStyle = "#c8d3e2";
    ctx.fillText(copy, 220, y + 115);
  });
  footerButton(ctx, "UNLOCK LIFETIME ACCESS");
  save("07-lifetime-legible.png", canvas);
}

intentions();
journeys();
player();
chamber();
journal();
lifetime();
