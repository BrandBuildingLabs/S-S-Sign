export const borders = [
  { id: "simple", name: "Simple Border", renderer: simpleBorder },
  { id: "double", name: "Double Line", renderer: doubleBorder },
  { id: "premiumGold", name: "Premium Gold", renderer: premiumGoldBorder },
  { id: "floral", name: "Floral Border", renderer: floralBorder },
  { id: "royal", name: "Royal Border", renderer: royalBorder },
  { id: "minimal", name: "Minimal Border", renderer: minimalBorder },
  { id: "artDeco", name: "Art Deco", renderer: artDecoBorder },
  { id: "diamond", name: "Diamond Line", renderer: diamondBorder },
  { id: "leaf", name: "Corner Leaf", renderer: leafBorder },
  { id: "scallop", name: "Scallop Edge", renderer: scallopBorder },
  { id: "heritage", name: "Heritage Frame", renderer: heritageBorder }
];

export function renderBorder(ctx, borderId, rect, color) {
  const border = borders.find((item) => item.id === borderId) || borders[0];
  border.renderer(ctx, rect, color);
}

export function borderThumbnail(border, color = "#c79a38") {
  const floral = border.id === "floral" ? cornerFlowers(color) : "";
  const royal = border.id === "royal" ? royalCorners(color) : "";
  const lines = {
    simple: `<rect x="8" y="8" width="104" height="44" fill="none" stroke="${color}" stroke-width="3"/>`,
    double: `<rect x="8" y="8" width="104" height="44" fill="none" stroke="${color}" stroke-width="3"/><rect x="15" y="15" width="90" height="30" fill="none" stroke="${color}" stroke-width="1.8"/>`,
    premiumGold: `<rect x="8" y="8" width="104" height="44" rx="3" fill="none" stroke="${color}" stroke-width="4"/><path d="M18 30h84" stroke="${color}" stroke-width="1.5"/>`,
    floral: `<rect x="10" y="10" width="100" height="40" fill="none" stroke="${color}" stroke-width="2"/>${floral}`,
    royal: `<rect x="10" y="10" width="100" height="40" fill="none" stroke="${color}" stroke-width="2.5"/>${royal}<path d="M38 18h44M38 42h44" stroke="${color}" stroke-width="1.4"/>`,
    minimal: `<path d="M10 16V10h18M92 10h18v6M110 44v6H92M28 50H10v-6" fill="none" stroke="${color}" stroke-width="3"/>`,
    artDeco: `<rect x="9" y="9" width="102" height="42" fill="none" stroke="${color}" stroke-width="2.5"/><path d="M18 30h18l8-10 8 20 8-20 8 10h34" fill="none" stroke="${color}" stroke-width="2"/>`,
    diamond: `<rect x="10" y="10" width="100" height="40" fill="none" stroke="${color}" stroke-width="2"/><path d="M22 30 30 22l8 8-8 8-8-8Zm60 0 8-8 8 8-8 8-8-8Z" fill="none" stroke="${color}" stroke-width="2"/>`,
    leaf: `<rect x="10" y="10" width="100" height="40" fill="none" stroke="${color}" stroke-width="2"/><path d="M18 24c10-10 18-7 22-2-9 1-15 5-20 12M102 36c-10 10-18 7-22 2 9-1 15-5 20-12" fill="none" stroke="${color}" stroke-width="2"/>`,
    scallop: `<path d="M12 12h96v36H12Z" fill="none" stroke="${color}" stroke-width="2"/><path d="M18 12q6 8 12 0t12 0 12 0 12 0 12 0 12 0 12 0M18 48q6-8 12 0t12 0 12 0 12 0 12 0 12 0 12 0" fill="none" stroke="${color}" stroke-width="1.6"/>`,
    heritage: `<rect x="8" y="8" width="104" height="44" fill="none" stroke="${color}" stroke-width="3"/><rect x="18" y="17" width="84" height="26" fill="none" stroke="${color}" stroke-width="1.5"/><circle cx="24" cy="30" r="4" fill="${color}"/><circle cx="96" cy="30" r="4" fill="${color}"/>`
  };
  return `<svg viewBox="0 0 120 60" role="img" aria-label="${border.name}">${lines[border.id]}</svg>`;
}

function simpleBorder(ctx, rect, color) {
  strokeRect(ctx, rect, color, 6);
}

function doubleBorder(ctx, rect, color) {
  strokeRect(ctx, rect, color, 6);
  strokeRect(ctx, inset(rect, 22), color, 2.5);
}

function premiumGoldBorder(ctx, rect, color) {
  strokeRect(ctx, rect, color, 8);
  strokeRect(ctx, inset(rect, 14), "rgba(255,255,255,0.52)", 1.6);
  drawSideLines(ctx, inset(rect, 34), color);
}

function floralBorder(ctx, rect, color) {
  strokeRect(ctx, rect, color, 4);
  const points = [
    [rect.x + 36, rect.y + 36],
    [rect.x + rect.w - 36, rect.y + 36],
    [rect.x + 36, rect.y + rect.h - 36],
    [rect.x + rect.w - 36, rect.y + rect.h - 36]
  ];
  points.forEach(([x, y]) => drawFlower(ctx, x, y, color));
}

function royalBorder(ctx, rect, color) {
  strokeRect(ctx, rect, color, 5);
  strokeRect(ctx, inset(rect, 18), color, 1.8);
  drawCrownCorner(ctx, rect.x + 42, rect.y + 34, color, 1);
  drawCrownCorner(ctx, rect.x + rect.w - 42, rect.y + 34, color, -1);
  drawCrownCorner(ctx, rect.x + 42, rect.y + rect.h - 34, color, 1, true);
  drawCrownCorner(ctx, rect.x + rect.w - 42, rect.y + rect.h - 34, color, -1, true);
}

function minimalBorder(ctx, rect, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  const l = 46;
  [[rect.x, rect.y, 1, 1], [rect.x + rect.w, rect.y, -1, 1], [rect.x + rect.w, rect.y + rect.h, -1, -1], [rect.x, rect.y + rect.h, 1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x + sx * 14, y);
    ctx.lineTo(x + sx * l, y);
    ctx.moveTo(x, y + sy * 14);
    ctx.lineTo(x, y + sy * l);
    ctx.stroke();
  });
  ctx.restore();
}

function artDecoBorder(ctx, rect, color) {
  strokeRect(ctx, rect, color, 4);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  const midY = rect.y + rect.h / 2;
  ctx.beginPath();
  ctx.moveTo(rect.x + 30, midY);
  ctx.lineTo(rect.x + 90, midY);
  ctx.moveTo(rect.x + rect.w - 30, midY);
  ctx.lineTo(rect.x + rect.w - 90, midY);
  ctx.stroke();
  drawChevron(ctx, rect.x + 36, rect.y + 36, color);
  drawChevron(ctx, rect.x + rect.w - 36, rect.y + 36, color, true);
  drawChevron(ctx, rect.x + 36, rect.y + rect.h - 36, color, false, true);
  drawChevron(ctx, rect.x + rect.w - 36, rect.y + rect.h - 36, color, true, true);
  ctx.restore();
}

function diamondBorder(ctx, rect, color) {
  strokeRect(ctx, rect, color, 4);
  strokeRect(ctx, inset(rect, 16), color, 1.6);
  const positions = [
    [rect.x + rect.w / 2, rect.y + 18],
    [rect.x + rect.w / 2, rect.y + rect.h - 18],
    [rect.x + 18, rect.y + rect.h / 2],
    [rect.x + rect.w - 18, rect.y + rect.h / 2]
  ];
  positions.forEach(([x, y]) => drawDiamond(ctx, x, y, 12, color));
}

function leafBorder(ctx, rect, color) {
  strokeRect(ctx, rect, color, 4);
  drawLeaf(ctx, rect.x + 44, rect.y + 42, color, 1);
  drawLeaf(ctx, rect.x + rect.w - 44, rect.y + 42, color, -1);
  drawLeaf(ctx, rect.x + 44, rect.y + rect.h - 42, color, 1, true);
  drawLeaf(ctx, rect.x + rect.w - 44, rect.y + rect.h - 42, color, -1, true);
}

function scallopBorder(ctx, rect, color) {
  strokeRect(ctx, rect, color, 3);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  const step = Math.max(28, rect.w / 16);
  ctx.beginPath();
  for (let x = rect.x + step; x < rect.x + rect.w - step / 2; x += step) {
    ctx.moveTo(x - step / 2, rect.y);
    ctx.quadraticCurveTo(x, rect.y + 16, x + step / 2, rect.y);
    ctx.moveTo(x - step / 2, rect.y + rect.h);
    ctx.quadraticCurveTo(x, rect.y + rect.h - 16, x + step / 2, rect.y + rect.h);
  }
  ctx.stroke();
  ctx.restore();
}

function heritageBorder(ctx, rect, color) {
  strokeRect(ctx, rect, color, 7);
  strokeRect(ctx, inset(rect, 18), color, 2);
  drawDiamond(ctx, rect.x + 38, rect.y + 38, 13, color);
  drawDiamond(ctx, rect.x + rect.w - 38, rect.y + 38, 13, color);
  drawDiamond(ctx, rect.x + 38, rect.y + rect.h - 38, 13, color);
  drawDiamond(ctx, rect.x + rect.w - 38, rect.y + rect.h - 38, 13, color);
}

function strokeRect(ctx, rect, color, width) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function inset(rect, amount) {
  return { x: rect.x + amount, y: rect.y + amount, w: rect.w - amount * 2, h: rect.h - amount * 2 };
}

function drawSideLines(ctx, rect, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rect.x, rect.y + rect.h / 2);
  ctx.lineTo(rect.x + 110, rect.y + rect.h / 2);
  ctx.moveTo(rect.x + rect.w - 110, rect.y + rect.h / 2);
  ctx.lineTo(rect.x + rect.w, rect.y + rect.h / 2);
  ctx.stroke();
  ctx.restore();
}

function drawFlower(ctx, x, y, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i += 1) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.ellipse(0, -10, 5, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fill();
  ctx.restore();
}

function drawCrownCorner(ctx, x, y, color, direction, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction, flip ? -1 : 1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(12, -16);
  ctx.lineTo(24, 0);
  ctx.lineTo(36, -16);
  ctx.lineTo(48, 0);
  ctx.stroke();
  ctx.restore();
}

function drawChevron(ctx, x, y, color, mirror = false, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(mirror ? -1 : 1, flip ? -1 : 1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(14, -16);
  ctx.lineTo(28, 0);
  ctx.moveTo(12, 0);
  ctx.lineTo(26, -16);
  ctx.lineTo(40, 0);
  ctx.stroke();
  ctx.restore();
}

function drawDiamond(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawLeaf(ctx, x, y, color, direction, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction, flip ? -1 : 1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.bezierCurveTo(14, -4, 34, -16, 56, -10);
  ctx.bezierCurveTo(38, 0, 22, 11, 0, 18);
  ctx.moveTo(12, 12);
  ctx.lineTo(38, -6);
  ctx.stroke();
  ctx.restore();
}

function cornerFlowers(color) {
  return `<g fill="${color}"><circle cx="21" cy="20" r="4"/><circle cx="15" cy="25" r="4"/><circle cx="25" cy="27" r="4"/><circle cx="99" cy="20" r="4"/><circle cx="105" cy="25" r="4"/><circle cx="95" cy="27" r="4"/><circle cx="21" cy="40" r="4"/><circle cx="15" cy="35" r="4"/><circle cx="25" cy="33" r="4"/><circle cx="99" cy="40" r="4"/><circle cx="105" cy="35" r="4"/><circle cx="95" cy="33" r="4"/></g>`;
}

function royalCorners(color) {
  return `<path d="M19 24l7-10 7 10 7-10 7 10M73 24l7-10 7 10 7-10 7 10M19 36l7 10 7-10 7 10 7-10M73 36l7 10 7-10 7 10 7-10" fill="none" stroke="${color}" stroke-width="2"/>`;
}
