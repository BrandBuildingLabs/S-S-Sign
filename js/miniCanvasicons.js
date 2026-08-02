export const iconCategories = ["All", "Hindu", "Islamic", "Buildings"];

export const icons = [
  {
    id: "hindu-symbol",
    name: "Hindu Symbol",
    category: "Hindu",
    svg: "iconsNameplate/hindu/hindu-symbol-svgrepo-com.svg"
  },
  {
    id: "hindu-temple-1",
    name: "Hindu Temple 1",
    category: "Hindu",
    svg: "iconsNameplate/hindu/hindu-temple-svgrepo-com.svg"
  },
  {
    id: "hindu-temple-2",
    name: "Hindu Temple 2",
    category: "Hindu",
    svg: "iconsNameplate/hindu/hindu-temple-svgrepo-com (1).svg"
  },
  {
    id: "namaste",
    name: "Namaste",
    category: "Hindu",
    svg: "iconsNameplate/hindu/namaste-religion-svgrepo-com.svg"
  },
  {
    id: "trisul",
    name: "Trisul",
    category: "Hindu",
    svg: "iconsNameplate/hindu/trisul-hinduist-svgrepo-com.svg"
  },
  {
    id: "islamic-symbol",
    name: "Islamic Symbol",
    category: "Islamic",
    svg: "iconsNameplate/islam/islam-muslim-svgrepo-com.svg"
  },
  {
    id: "kaaba",
    name: "Kaaba",
    category: "Islamic",
    svg: "iconsNameplate/islam/kaaba-svgrepo-com.svg"
  },
  {
    id: "mosque-1",
    name: "Mosque Design 1",
    category: "Islamic",
    svg: "iconsNameplate/islam/mosque-islam-svgrepo-com (1).svg"
  },
  {
    id: "mosque-2",
    name: "Mosque Design 2",
    category: "Islamic",
    svg: "iconsNameplate/islam/mosque-islam-svgrepo-com (2).svg"
  },
  {
    id: "mosque-3",
    name: "Mosque Design 3",
    category: "Islamic",
    svg: "iconsNameplate/islam/mosque-svgrepo-com.svg"
  },
  {
    id: "islamic-religion",
    name: "Islamic Design",
    category: "Islamic",
    svg: "iconsNameplate/islam/religion-islamic-svgrepo-com.svg"
  },
  {
    id: "india-building",
    name: "India Building",
    category: "Buildings",
    svg: "iconsNameplate/india-svgrepo-com.svg"
  },

  // flowers
  {
    id: "flower-1",
    name: "Flower 1",
    category: "Flowers",
    svg: "iconsNameplate/flowers/flower-1-svgrepo-com.svg"
  },
  {
    id: "flower-2",
    name: "Flower 2",
    category: "Flowers",
    svg: "iconsNameplate/flowers/flower-2-svgrepo-com.svg"
  },
  {
    id: "flower-3",
    name: "Flower 3",
    category: "Flowers",
    svg: "iconsNameplate/flowers/flower-3-svgrepo-com.svg"
  },
  {
    id: "flower-4",
    name: "Flower 4",
    category: "Flowers",
    svg: "iconsNameplate/flowers/flower-4-svgrepo-com.svg"
  },
  {
    id: "flower-5",
    name: "Flower 5",
    category: "Flowers",
    svg: "iconsNameplate/flowers/flower-5-svgrepo-com.svg"
  } 


];

export function iconById(id) {
  return icons.find((icon) => icon.id === id) || icons[0];
}

export function iconsByCategory(category) {
  if (!category || category === "All") return icons;
  return icons.filter((icon) => icon.category === category);
}

export function iconSvgPreview(icon) {
  return `
    <span class="svg-icon-preview">
      <img src="${icon.svg}" alt="" loading="lazy">
    </span>
  `;
}
