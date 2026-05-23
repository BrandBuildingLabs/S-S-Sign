import { fonts } from "./fonts.js";
import { borders, borderThumbnail } from "./borders.js";
import { icons, iconSvg } from "./miniCanvasicons.js";
import { materials, NameplateRenderer } from "./render.js";

const canvas = document.querySelector("#nameplateCanvas");
const renderer = new NameplateRenderer(canvas);

const state = {
  font: "Cinzel",
  fontFamily: fonts[0].family,
  border: "royal",
  material: "ssGold",
  textColor: "#2b2113",
  accentColor: "#6f4810",
  width: 18,
  height: 8,
  unit: "in",
  activeId: "text-main",
  texts: [
    {
      id: "text-main",
      text: "Naseer Ahmed",
      x: 0.5,
      y: 0.5,
      size: 54,
      color: "#2b2113",
      font: "Cinzel",
      fontFamily: fonts[0].family,
      weight: 700
    }
  ],
  icons: [
    { id: "icon-1", iconId: "ganesh", x: 0.17, y: 0.5, size: 0.2, color: "#6f4810" }
  ]
};

const controls = {
  fontSelect: document.querySelector("#fontSelect"),
  textColor: document.querySelector("#textColor"),
  accentColor: document.querySelector("#accentColor"),
  objectSize: document.querySelector("#objectSize"),
  plateWidth: document.querySelector("#plateWidth"),
  plateHeight: document.querySelector("#plateHeight"),
  measurementUnit: document.querySelector("#measurementUnit"),
  materialOptions: document.querySelector("#materialOptions"),
  borderOptions: document.querySelector("#borderOptions"),
  iconOptions: document.querySelector("#iconOptions"),
  whatsappBtn: document.querySelector("#whatsappBtn"),
  resetLayoutBtn: document.querySelector("#resetLayoutBtn"),
  deleteSelectedBtn: document.querySelector("#deleteSelectedBtn")
};

let queued = false;
let idCounter = 2;
let pointerMoved = false;

applyEstimatorDefaults();
init();

function init() {
  hydrateFonts();
  hydrateMaterials();
  hydrateBorders();
  hydrateIcons();
  syncControlsFromState();
  bindInputs();
  bindCanvasEditing();
  resizeCanvas();
  scheduleRender();
  setInterval(() => {
    renderer.setCaretVisible(!renderer.showCaret);
    scheduleRender();
  }, 520);
}

function applyEstimatorDefaults() {
  const params = new URLSearchParams(window.location.search);
  const material = params.get("material");
  const width = Number(params.get("width"));
  const height = Number(params.get("height"));
  const unit = params.get("unit") || "in";
  const mappedMaterial = mapEstimatorMaterial(material);

  if (mappedMaterial) {
    state.material = mappedMaterial.material;
    state.textColor = mappedMaterial.textColor;
    state.accentColor = mappedMaterial.accentColor;
    state.border = mappedMaterial.border;
    state.texts[0].color = mappedMaterial.textColor;
    state.icons[0].color = mappedMaterial.accentColor;
  }

  if (width > 0 && height > 0) {
    const inches = convertToInches(width, height, unit);
    state.width = clamp(Math.round(inches.width * 100) / 100, 8, 48);
    state.height = clamp(Math.round(inches.height * 100) / 100, 4, 24);
    state.unit = "in";
  }
}

function mapEstimatorMaterial(material) {
  if (!material) return null;
  if (material.includes("gold")) {
    return { material: "ssGold", textColor: "#2b2113", accentColor: "#6f4810", border: "royal" };
  }
  if (material.includes("silver") || material.includes("ss-letters")) {
    return { material: "ssSilver", textColor: "#1f2933", accentColor: "#71767a", border: "premiumGold" };
  }
  if (material.includes("acrylic")) {
    return { material: "acrylicBlack", textColor: "#f4c96b", accentColor: "#e8b647", border: "double" };
  }
  if (material.includes("white")) {
    return { material: "acrylicWhite", textColor: "#1f2933", accentColor: "#b58b34", border: "simple" };
  }
  if (material.includes("granite")) {
    return { material: "acrylicBlack", textColor: "#f7f1e3", accentColor: "#d6b15d", border: "minimal" };
  }
  return null;
}

function convertToInches(width, height, unit) {
  const multiplier = unitMultiplier(unit);
  return { width: width * multiplier, height: height * multiplier };
}

function unitMultiplier(unit) {
  return {
    mm: 1 / 25.4,
    cm: 1 / 2.54,
    m: 39.37007874,
    in: 1,
    ft: 12
  }[unit] || 1;
}

function syncControlsFromState() {
  controls.fontSelect.value = state.font;
  controls.textColor.value = state.textColor;
  controls.accentColor.value = state.accentColor;
  controls.objectSize.value = Math.round(state.texts[0].size);
  controls.plateWidth.value = fromInches(state.width, state.unit);
  controls.plateHeight.value = fromInches(state.height, state.unit);
  controls.measurementUnit.value = state.unit;
  markSelected("[data-material]", state.material);
  markSelected("[data-border]", state.border);
}

function hydrateFonts() {
  controls.fontSelect.innerHTML = fonts.map((font) => `<option value="${font.label}">${font.label}</option>`).join("");
}

function hydrateMaterials() {
  controls.materialOptions.innerHTML = Object.entries(materials).map(([id, material]) => `
    <button class="option-card ${id === state.material ? "is-selected" : ""}" data-material="${id}" type="button" title="${material.name}">
      <span class="material-swatch" style="display:block;background:${material.swatch}"></span>
      <span class="option-title">${material.name}</span>
    </button>
  `).join("");
}

function hydrateBorders() {
  controls.borderOptions.innerHTML = borders.map((border) => `
    <button class="option-card ${border.id === state.border ? "is-selected" : ""}" data-border="${border.id}" type="button">
      <span class="thumb">${borderThumbnail(border, state.accentColor)}</span>
      <span class="option-title">${border.name}</span>
    </button>
  `).join("");
}

function hydrateIcons() {
  controls.iconOptions.innerHTML = icons.filter((icon) => icon.id !== "none").map((icon) => `
    <button class="option-card" data-icon="${icon.id}" type="button">
      <span class="thumb">${iconSvg(icon, state.accentColor)}</span>
      <span class="option-title">${icon.name}</span>
    </button>
  `).join("");
}

function bindInputs() {
  controls.fontSelect.addEventListener("change", (event) => {
    const selected = fonts.find((font) => font.label === event.target.value) || fonts[0];
    state.font = selected.label;
    state.fontFamily = selected.family;
    const text = activeText();
    if (text) {
      text.font = selected.label;
      text.fontFamily = selected.family;
    }
    scheduleRender();
  });

  controls.textColor.addEventListener("input", (event) => {
    state.textColor = event.target.value;
    const text = activeText();
    if (text) text.color = state.textColor;
    scheduleRender();
  });

  controls.accentColor.addEventListener("input", debounce((event) => {
    state.accentColor = event.target.value;
    const icon = activeIcon();
    if (icon) icon.color = state.accentColor;
    hydrateBorders();
    hydrateIcons();
    scheduleRender();
  }, 40));

  controls.objectSize.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    const text = activeText();
    const icon = activeIcon();
    if (text) text.size = clamp(value, 14, 140);
    if (icon) icon.size = clamp(value / 200, 0.06, 0.55);
    scheduleRender();
  });

  controls.plateWidth.addEventListener("input", debounce(updateSizeFromFields, 80));
  controls.plateHeight.addEventListener("input", debounce(updateSizeFromFields, 80));
  controls.measurementUnit.addEventListener("change", () => {
    state.unit = controls.measurementUnit.value;
    controls.plateWidth.value = fromInches(state.width, state.unit);
    controls.plateHeight.value = fromInches(state.height, state.unit);
  });

  controls.materialOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-material]");
    if (!button) return;
    state.material = button.dataset.material;
    setActive("[data-material]", button);
    scheduleRender();
  });

  controls.borderOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-border]");
    if (!button) return;
    state.border = button.dataset.border;
    setActive("[data-border]", button);
    scheduleRender();
  });

  controls.iconOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-icon]");
    if (!button) return;
    const index = state.icons.length;
    const newIcon = {
      id: `icon-${idCounter++}`,
      iconId: button.dataset.icon,
      x: clamp(0.42 + (index % 4) * 0.08, 0.12, 0.88),
      y: clamp(0.42 + (Math.floor(index / 4) % 3) * 0.1, 0.16, 0.84),
      size: 0.2,
      color: state.accentColor
    };
    state.icons.push(newIcon);
    state.activeId = newIcon.id;
    canvas.focus();
    scheduleRender();
  });

  controls.resetLayoutBtn.addEventListener("click", () => {
    state.texts = [createText("Naseer Ahmed", 0.5, 0.5, 54)];
    state.icons = [{ id: "icon-1", iconId: "ganesh", x: 0.17, y: 0.5, size: 0.2, color: state.accentColor }];
    state.activeId = state.texts[0].id;
    idCounter = 2;
    scheduleRender();
  });

  controls.deleteSelectedBtn.addEventListener("click", deleteSelected);
  controls.whatsappBtn.addEventListener("click", exportToWhatsapp);
  window.addEventListener("resize", debounce(() => {
    resizeCanvas();
    scheduleRender();
  }, 100));
}

function bindCanvasEditing() {
  canvas.addEventListener("pointerdown", (event) => {
    canvas.focus();
    pointerMoved = false;
    const resizeTarget = renderer.resizeHitTest(event.clientX, event.clientY);
    const target = resizeTarget || renderer.hitTest(event.clientX, event.clientY);
    if (target) {
      state.activeId = target;
      const item = [...state.texts, ...state.icons].find((entry) => entry.id === target);
      if (resizeTarget && item) {
        renderer.startResize(target, event.clientX, event.clientY, item);
      } else {
        renderer.startDrag(target, event.clientX, event.clientY);
      }
      syncActiveControls();
    } else {
      const point = renderer.getPlatePoint(event.clientX, event.clientY);
      const text = createText("", point.x, point.y, 42);
      state.texts.push(text);
      state.activeId = text.id;
      syncActiveControls();
    }
    scheduleRender();
  });

  canvas.addEventListener("pointermove", (event) => {
    const resizeTarget = renderer.resizeHitTest(event.clientX, event.clientY);
    const hoverTarget = renderer.hitTest(event.clientX, event.clientY);
    canvas.style.cursor = resizeTarget || renderer.dragTarget?.mode === "resize" ? "nwse-resize" : renderer.dragTarget || hoverTarget ? "grab" : "text";
    const allItems = [...state.texts, ...state.icons];
    if (renderer.drag(event.clientX, event.clientY, allItems)) {
      pointerMoved = true;
      syncActiveControls();
      scheduleRender();
    }
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    canvas.addEventListener(eventName, () => {
      renderer.stopDrag();
      if (!pointerMoved) syncActiveControls();
    });
  });

  canvas.addEventListener("keydown", (event) => {
    const text = activeText();
    if (!text) {
      if (event.key === "Backspace" || event.key === "Delete") deleteSelected();
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      text.text += event.key;
      event.preventDefault();
    } else if (event.key === "Enter") {
      text.text += "\n";
      event.preventDefault();
    } else if (event.key === "Backspace") {
      text.text = text.text.slice(0, -1);
      event.preventDefault();
    } else if (event.key === "Delete") {
      deleteSelected();
      event.preventDefault();
    }
    scheduleRender();
  });
}

function createText(text, x, y, size) {
  return {
    id: `text-${idCounter++}`,
    text,
    x,
    y,
    size,
    color: state.textColor,
    font: state.font,
    fontFamily: state.fontFamily,
    weight: 700
  };
}

function syncActiveControls() {
  const text = activeText();
  const icon = activeIcon();
  if (text) {
    controls.fontSelect.value = text.font;
    controls.textColor.value = text.color;
    controls.objectSize.value = Math.round(text.size);
  }
  if (icon) {
    controls.accentColor.value = icon.color || state.accentColor;
    controls.objectSize.value = Math.round(icon.size * 200);
  }
}

function updateSizeFromFields() {
  const multiplier = unitMultiplier(state.unit);
  const width = Math.max(Number(controls.plateWidth.value) || 1, 1);
  const height = Math.max(Number(controls.plateHeight.value) || 1, 1);
  state.width = clamp(width * multiplier, 8, 48);
  state.height = clamp(height * multiplier, 4, 24);
  resizeCanvas();
  scheduleRender();
}

function resizeCanvas() {
  const wrap = document.querySelector("#canvasWrap");
  const maxWidth = Math.min(wrap.clientWidth - 24, 1100);
  const aspect = state.width / state.height;
  renderer.resize(Math.max(320, maxWidth), aspect);
}

function scheduleRender() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    renderer.render(state);
  });
}

function exportToWhatsapp() {
  renderer.render(state);
  const imageUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = `nameplate-preview-${Date.now()}.png`;
  link.click();

  const orderJson = {
    text: state.texts.map((item) => item.text).filter(Boolean),
    font: state.font,
    border: readableBorder(),
    material: materials[state.material].name,
    icons: state.icons.map((item) => iconName(item.iconId)),
    colors: {
      text: state.textColor,
      accent: state.accentColor
    },
    size: `${state.width}x${state.height} in`
  };
  const message = `Nameplate preview generated. Please attach the downloaded PNG image.\n\n${JSON.stringify(orderJson, null, 2)}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

function deleteSelected() {
  if (!state.activeId) return;
  state.texts = state.texts.filter((item) => item.id !== state.activeId);
  state.icons = state.icons.filter((item) => item.id !== state.activeId);
  state.activeId = state.texts[0]?.id || state.icons[0]?.id || null;
  scheduleRender();
}

function activeText() {
  return state.texts.find((item) => item.id === state.activeId);
}

function activeIcon() {
  return state.icons.find((item) => item.id === state.activeId);
}

function readableBorder() {
  return borders.find((border) => border.id === state.border)?.name || state.border;
}

function iconName(id) {
  return icons.find((icon) => icon.id === id)?.name || id;
}

function setActive(selector, activeButton) {
  document.querySelectorAll(selector).forEach((button) => button.classList.remove("is-active", "is-selected"));
  activeButton.classList.add(activeButton.classList.contains("option-card") ? "is-selected" : "is-active");
}

function markSelected(selector, value) {
  document.querySelectorAll(selector).forEach((button) => {
    const key = selector.replace("[data-", "").replace("]", "");
    const isSelected = button.dataset[key] === value;
    button.classList.toggle("is-selected", isSelected);
    button.classList.toggle("is-active", isSelected && !button.classList.contains("option-card"));
  });
}

function fromInches(value, unit) {
  const converted = value / unitMultiplier(unit);
  return Math.round(converted * 100) / 100;
}

function debounce(callback, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), wait);
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
