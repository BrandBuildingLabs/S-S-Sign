export const icons = [
  { id: "none", name: "No Icon", path: "" },
  { id: "ganesh", name: "Ganesh", path: "M48 12c13 0 23 9 23 21 0 7-4 13-9 17 9 5 16 14 16 25H64c0-11-7-19-16-19s-16 8-16 19H18c0-11 7-20 16-25-6-4-9-10-9-17 0-12 10-21 23-21Zm-3 16c-6 1-10 6-10 12 0 8 6 14 13 14s13-6 13-14c0-5-3-10-8-12 2 8 0 14-6 18 2-7 0-13-2-18Zm-18 7c-9 2-14 10-13 18 1 9 9 16 19 16v-9c-5 0-9-4-10-9-1-4 1-8 4-10v-6Zm42 0v6c3 2 5 6 4 10-1 5-5 9-10 9v9c10 0 18-7 19-16 1-8-4-16-13-18Z" },
  { id: "om", name: "Om", path: "M42 17c10 0 17 7 17 17 0 8-5 15-13 17 6 6 10 13 10 22H43c0-12-7-20-18-20V41c10 0 20-1 20-8 0-4-3-7-8-7-6 0-11 4-14 10L12 29c6-8 15-12 30-12Zm30 5c8 3 13 10 13 19 0 7-4 13-10 16l-7-10c3-2 5-5 5-8 0-4-2-7-6-9l5-8Zm-3 37h16v13H69V59Zm-47 0c8 0 14 6 14 14S30 87 22 87 8 81 8 73s6-14 14-14Z" },
  { id: "crescent", name: "Crescent", path: "M65 16c-12 7-19 19-19 34 0 17 10 31 24 38-4 1-8 2-12 2-22 0-40-18-40-40s18-40 40-40c2 0 5 0 7 1v5Z" },
  { id: "star", name: "Star", path: "m50 10 12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3 12-26Z" },
  { id: "swastik", name: "Swastik", path: "M44 14h14v28h28v14H58v30H44V56H14V42h30V14Zm14 0h28v14H72v14H58V14ZM14 14h14v14h16v14H14V14Zm58 42h14v30H58V72h14V56ZM14 58h30v14H28v14H14V58Z" },
  { id: "home", name: "Home", path: "M12 47 50 15l38 32-9 10-7-6v35H58V62H42v24H28V51l-7 6-9-10Z" },
  { id: "flat", name: "Flat Icon", path: "M20 18h60v68H20V18Zm12 12v10h12V30H32Zm24 0v10h12V30H56ZM32 52v10h12V52H32Zm24 0v10h12V52H56ZM32 74v12h12V74H32Zm24 0v12h12V74H56Z" },
  { id: "villa", name: "Villa Icon", path: "M10 49 50 18l40 31-8 10-6-5v31H24V54l-6 5-8-10Zm28 5v31h24V54H38Zm-8-25h40l8 14H22l8-14Z" }
];

export function iconById(id) {
  return icons.find((icon) => icon.id === id) || icons[0];
}

export function iconSvg(icon, color = "#c79a38") {
  if (!icon.path) {
    return `<svg viewBox="0 0 100 100" role="img" aria-label="No icon"><path d="M24 50h52" stroke="${color}" stroke-width="7" stroke-linecap="round"/></svg>`;
  }
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${icon.name}"><path d="${icon.path}" fill="${color}"/></svg>`;
}
