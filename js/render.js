import { renderBorder } from "./borders.js";
import { iconById } from "./miniCanvasicons.js";

export const materials = {
  acrylicBlack: {
    name: "Acrylic Black",
    swatch: "linear-gradient(135deg, #050505, #24201d 45%, #050505 72%, #5b554c)",
    textShadow: "rgba(255, 225, 141, 0.42)",
    bgStops: ["#070707", "#211d1a", "#080808"],
    shine: "rgba(255,255,255,0.18)"
  },
  acrylicWhite: {
    name: "Acrylic White",
    swatch: "linear-gradient(135deg, #ffffff, #ece6dc 48%, #ffffff 75%)",
    textShadow: "rgba(70, 54, 22, 0.2)",
    bgStops: ["#ffffff", "#ece7dd", "#fffaf1"],
    shine: "rgba(255,255,255,0.64)"
  },
  ssSilver: {
    name: "Stainless Steel Silver",
    swatch: "linear-gradient(105deg, #8a8d8f, #f7f8f8 28%, #9da2a5 52%, #f1f1ef 76%, #767b7e)",
    textShadow: "rgba(255,255,255,0.42)",
    bgStops: ["#8a8d8f", "#f7f8f8", "#9da2a5", "#f1f1ef", "#767b7e"],
    shine: "rgba(255,255,255,0.36)"
  },
  ssGold: {
    name: "Stainless Steel Gold",
    swatch: "linear-gradient(105deg, #8a661b, #ffe29a 28%, #bd842b 52%, #fff0bf 76%, #6d4a11)",
    textShadow: "rgba(255,255,255,0.38)",
    bgStops: ["#8a661b", "#ffe29a", "#bd842b", "#fff0bf", "#6d4a11"],
    shine: "rgba(255,255,255,0.32)"
  },
  roseGold: {
    name: "Rose Gold",
    swatch: "linear-gradient(105deg, #8d5146, #ffd0bd 30%, #bd7462 56%, #ffe5dc 78%, #744035)",
    textShadow: "rgba(255,255,255,0.34)",
    bgStops: ["#8d5146", "#ffd0bd", "#bd7462", "#ffe5dc", "#744035"],
    shine: "rgba(255,255,255,0.3)"
  }
};

export class NameplateRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    this.noisePattern = null;
    this.bounds = new Map();
    this.resizeHandles = new Map();
    this.iconImages = new Map();
    this.iconRequests = new Set();
    this.lastPlate = null;
    this.dragTarget = null;
    this.showCaret = true;
    this.onIconReady = null;
  }

  resize(cssWidth, aspect) {
    const width = Math.round(cssWidth * this.pixelRatio);
    const height = Math.round((cssWidth / aspect) * this.pixelRatio);
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.aspectRatio = `${aspect}`;
  }

  setCaretVisible(visible) {
    this.showCaret = visible;
  }

  render(state) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const pad = Math.max(26, Math.min(w, h) * 0.065);
    const plate = { x: pad, y: pad, w: w - pad * 2, h: h - pad * 2 };
    this.lastPlate = plate;
    this.bounds.clear();
    this.resizeHandles.clear();

    ctx.clearRect(0, 0, w, h);
    this.drawPlate(ctx, plate, state);
    renderBorder(ctx, state.border, inset(plate, Math.min(w, h) * 0.035), state.accentColor);
    this.drawReflections(ctx, plate, state);
    state.icons.forEach((icon) => this.drawIcon(ctx, plate, state, icon));
    state.texts.forEach((text) => this.drawText(ctx, plate, state, text));
  }

  drawPlate(ctx, plate, state) {
    const material = materials[state.material] || materials.acrylicBlack;
    const gradient = ctx.createLinearGradient(plate.x, plate.y, plate.x + plate.w, plate.y + plate.h);
    material.bgStops.forEach((stop, index) => gradient.addColorStop(index / (material.bgStops.length - 1), stop));

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.26)";
    ctx.shadowBlur = 30 * this.pixelRatio;
    ctx.shadowOffsetY = 16 * this.pixelRatio;
    roundRect(ctx, plate.x, plate.y, plate.w, plate.h, 12 * this.pixelRatio);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.26;
    if (!this.noisePattern) this.noisePattern = createNoisePattern(ctx);
    ctx.fillStyle = this.noisePattern;
    roundRect(ctx, plate.x, plate.y, plate.w, plate.h, 12 * this.pixelRatio);
    ctx.fill();
    ctx.restore();
  }

  drawText(ctx, plate, state, item) {
    const material = materials[state.material] || materials.acrylicBlack;
    const x = plate.x + item.x * plate.w;
    const y = plate.y + item.y * plate.h;
    const size = Math.max(18 * this.pixelRatio, item.size * this.pixelRatio);
    const lines = item.text.split("\n");
    const lineHeight = size * 1.18;
    const font = `${item.weight || 700} ${size}px ${item.fontFamily}`;
    const maxWidth = plate.w * 0.84;

    ctx.save();
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = material.textShadow;
    ctx.shadowBlur = 8 * this.pixelRatio;
    ctx.lineWidth = Math.max(1.2, size * 0.035);
    ctx.strokeStyle = "rgba(0,0,0,0.23)";
    ctx.fillStyle = item.color;

    let width = 0;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      const fitted = fitLine(ctx, line, font, maxWidth, size);
      ctx.font = `${item.weight || 700} ${fitted.size}px ${item.fontFamily}`;
      ctx.strokeText(fitted.text, x, startY + index * lineHeight);
      ctx.fillText(fitted.text, x, startY + index * lineHeight);
      width = Math.max(width, fitted.width);
    });

    const height = Math.max(lineHeight, lines.length * lineHeight);
    this.bounds.set(item.id, {
      type: "text",
      x: x - width / 2,
      y: y - height / 2,
      w: width,
      h: height
    });

    if (state.activeId === item.id) {
      const handle = this.drawSelection(ctx, x - width / 2, y - height / 2, width, height);
      this.resizeHandles.set(item.id, handle);
      if (this.showCaret) this.drawCaret(ctx, item, x, startY, lineHeight, size);
    }
    ctx.restore();
  }

  drawCaret(ctx, item, x, startY, lineHeight, size) {
    const lines = item.text.split("\n");
    const lastLine = lines[lines.length - 1] || "";
    const lastY = startY + (lines.length - 1) * lineHeight;
    const textWidth = ctx.measureText(lastLine).width;
    ctx.save();
    ctx.strokeStyle = item.color;
    ctx.lineWidth = Math.max(2, this.pixelRatio);
    ctx.beginPath();
    ctx.moveTo(x + textWidth / 2 + 4, lastY - size * 0.52);
    ctx.lineTo(x + textWidth / 2 + 4, lastY + size * 0.52);
    ctx.stroke();
    ctx.restore();
  }

  drawIcon(ctx, plate, state, item) {
    const icon = iconById(item.iconId);
    if (!icon?.svg) return;
    const size = Math.min(plate.w, plate.h) * item.size;
    const x = plate.x + item.x * plate.w;
    const y = plate.y + item.y * plate.h;
    const color = item.color || state.accentColor;
    const image = this.getIconImage(icon, color);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.26)";
    ctx.shadowBlur = 5 * this.pixelRatio;
    if (image?.complete && image.naturalWidth > 0) {
      ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
    } else {
      this.drawIconPlaceholder(ctx, x, y, size, color);
    }
    ctx.restore();

    this.bounds.set(item.id, { type: "icon", x: x - size / 2, y: y - size / 2, w: size, h: size });
    if (state.activeId === item.id) {
      const handle = this.drawSelection(ctx, x - size / 2, y - size / 2, size, size);
      this.resizeHandles.set(item.id, handle);
    }
  }

  getIconImage(icon, color) {
    const key = `${icon.id}|${color}`;
    if (this.iconImages.has(key)) return this.iconImages.get(key);
    if (this.iconRequests.has(key)) return null;

    this.iconRequests.add(key);
    fetch(icon.svg)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${icon.svg}`);
        return response.text();
      })
      .then((svgText) => {
        const coloredSvg = colorizeSvg(svgText, color);
        const blob = new Blob([coloredSvg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
          URL.revokeObjectURL(url);
          this.iconImages.set(key, image);
          this.iconRequests.delete(key);
          this.onIconReady?.();
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
          this.iconRequests.delete(key);
        };
        image.src = url;
      })
      .catch(() => {
        this.iconRequests.delete(key);
      });

    return null;
  }

  drawIconPlaceholder(ctx, x, y, size, color) {
    ctx.save();
    ctx.globalAlpha = 0.58;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, size * 0.06);
    ctx.beginPath();
    ctx.arc(x, y, size * 0.32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawSelection(ctx, x, y, w, h) {
    const handleSize = 16 * this.pixelRatio;
    const handleX = x + w + 8 - handleSize / 2;
    const handleY = y + h + 8 - handleSize / 2;

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2 * this.pixelRatio;
    ctx.setLineDash([6 * this.pixelRatio, 5 * this.pixelRatio]);
    ctx.strokeRect(x - 8, y - 8, w + 16, h + 16);
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(37,30,20,0.65)";
    ctx.lineWidth = 2 * this.pixelRatio;
    ctx.fillRect(handleX, handleY, handleSize, handleSize);
    ctx.strokeRect(handleX, handleY, handleSize, handleSize);
    ctx.restore();

    return { x: handleX, y: handleY, w: handleSize, h: handleSize };
  }

  drawReflections(ctx, plate, state) {
    const material = materials[state.material] || materials.acrylicBlack;
    const gloss = ctx.createLinearGradient(plate.x, plate.y, plate.x + plate.w, plate.y + plate.h * 0.45);
    gloss.addColorStop(0, material.shine);
    gloss.addColorStop(0.35, "rgba(255,255,255,0.02)");
    gloss.addColorStop(0.52, "rgba(255,255,255,0.18)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");

    ctx.save();
    roundRect(ctx, plate.x, plate.y, plate.w, plate.h, 12 * this.pixelRatio);
    ctx.clip();
    ctx.fillStyle = gloss;
    ctx.beginPath();
    ctx.moveTo(plate.x, plate.y);
    ctx.lineTo(plate.x + plate.w, plate.y);
    ctx.lineTo(plate.x + plate.w * 0.62, plate.y + plate.h);
    ctx.lineTo(plate.x + plate.w * 0.18, plate.y + plate.h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  hitTest(clientX, clientY) {
    const point = this.clientToCanvas(clientX, clientY);
    const entries = Array.from(this.bounds.entries()).reverse();
    const hit = entries.find(([, b]) => point.x >= b.x && point.x <= b.x + b.w && point.y >= b.y && point.y <= b.y + b.h);
    return hit ? hit[0] : null;
  }

  resizeHitTest(clientX, clientY) {
    const point = this.clientToCanvas(clientX, clientY);
    const entries = Array.from(this.resizeHandles.entries()).reverse();
    const hit = entries.find(([, b]) => point.x >= b.x && point.x <= b.x + b.w && point.y >= b.y && point.y <= b.y + b.h);
    return hit ? hit[0] : null;
  }

  getPlatePoint(clientX, clientY) {
    const point = this.clientToCanvas(clientX, clientY);
    const plate = this.lastPlate;
    if (!plate) return { x: 0.5, y: 0.5 };
    return {
      x: clamp((point.x - plate.x) / plate.w, 0.08, 0.92),
      y: clamp((point.y - plate.y) / plate.h, 0.12, 0.88)
    };
  }

  startDrag(id, clientX, clientY) {
    const point = this.clientToCanvas(clientX, clientY);
    this.dragTarget = { id, last: point };
  }

  startResize(id, clientX, clientY, item) {
    const point = this.clientToCanvas(clientX, clientY);
    const bounds = this.bounds.get(id);
    const center = bounds ? { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 } : point;
    this.dragTarget = {
      id,
      mode: "resize",
      startSize: item.size,
      startDistance: Math.max(8, distance(point, center))
    };
  }

  drag(clientX, clientY, items) {
    if (!this.dragTarget || !this.lastPlate) return false;
    const point = this.clientToCanvas(clientX, clientY);
    const item = items.find((entry) => entry.id === this.dragTarget.id);
    if (!item) return false;

    if (this.dragTarget.mode === "resize") {
      const bounds = this.bounds.get(this.dragTarget.id);
      if (!bounds) return false;
      const center = { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 };
      const nextDistance = Math.max(8, distance(point, center));
      const scale = nextDistance / this.dragTarget.startDistance;
      item.size = clamp(this.dragTarget.startSize * scale, item.iconId ? 0.06 : 14, item.iconId ? 0.55 : 140);
      return true;
    }

    const dx = point.x - this.dragTarget.last.x;
    const dy = point.y - this.dragTarget.last.y;
    item.x = clamp(item.x + dx / this.lastPlate.w, 0.08, 0.92);
    item.y = clamp(item.y + dy / this.lastPlate.h, 0.12, 0.88);
    this.dragTarget.last = point;
    return true;
  }

  stopDrag() {
    this.dragTarget = null;
  }

  clientToCanvas(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * this.canvas.width,
      y: ((clientY - rect.top) / rect.height) * this.canvas.height
    };
  }
}

function fitLine(ctx, text, font, maxWidth, startSize) {
  let size = startSize;
  let width = 0;
  do {
    ctx.font = font.replace(`${startSize}px`, `${size}px`);
    width = ctx.measureText(text).width;
    if (width <= maxWidth) return { text, size, width };
    size -= 2;
  } while (size > 18);
  return { text, size, width: Math.min(width, maxWidth) };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function inset(rect, amount) {
  return { x: rect.x + amount, y: rect.y + amount, w: rect.w - amount * 2, h: rect.h - amount * 2 };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function createNoisePattern(ctx) {
  const noise = document.createElement("canvas");
  noise.width = 80;
  noise.height = 80;
  const nctx = noise.getContext("2d");
  const data = nctx.createImageData(80, 80);
  for (let i = 0; i < data.data.length; i += 4) {
    const value = 190 + Math.random() * 65;
    data.data[i] = value;
    data.data[i + 1] = value;
    data.data[i + 2] = value;
    data.data[i + 3] = 12;
  }
  nctx.putImageData(data, 0, 0);
  return ctx.createPattern(noise, "repeat");
}

function colorizeSvg(svgText, color) {
  return svgText
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/currentColor/g, color)
    .replace(/fill="(?!none|transparent)[^"]*"/gi, `fill="${color}"`)
    .replace(/stroke="(?!none|transparent)[^"]*"/gi, `stroke="${color}"`)
    .replace(/fill:(?!none|transparent)[^;"}]+/gi, `fill:${color}`)
    .replace(/stroke:(?!none|transparent)[^;"}]+/gi, `stroke:${color}`)
    .replace(/\.st\d+\{fill:(?!none|transparent)[^;}]+/gi, (match) => match.replace(/fill:[^;}]+/i, `fill:${color}`))
    .replace(/\.st\d+\{stroke:(?!none|transparent)[^;}]+/gi, (match) => match.replace(/stroke:[^;}]+/i, `stroke:${color}`));
}
