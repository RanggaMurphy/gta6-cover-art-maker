// layouts.js — the five multi-panel poster layouts of Neon Bay Cover Studio.
// Every rectangle is a fraction of the cover (0 to 1), so one layout draws
// at any export size: square, portrait or wide.

export const LAYOUTS = [
  {
    id: 'hero-split',
    nama: 'Hero Split',
    titleZone: { x: 0.04, y: 0.74, w: 0.92, h: 0.22 },
    panels: [
      { id: 'hero', nama: 'Hero', x: 0, y: 0, w: 0.56, h: 1 },
      { id: 'top', nama: 'Top', x: 0.565, y: 0, w: 0.435, h: 0.49 },
      { id: 'low', nama: 'Low', x: 0.565, y: 0.495, w: 0.435, h: 0.505 },
    ],
  },
  {
    id: 'triptych',
    nama: 'Triptych',
    titleZone: { x: 0.04, y: 0.72, w: 0.92, h: 0.24 },
    panels: [
      { id: 'left', nama: 'Left', x: 0, y: 0, w: 0.33, h: 1 },
      { id: 'center', nama: 'Center', x: 0.335, y: 0, w: 0.33, h: 1 },
      { id: 'right', nama: 'Right', x: 0.67, y: 0, w: 0.33, h: 1 },
    ],
  },
  {
    id: 'four-corners',
    nama: 'Four Corners',
    titleZone: { x: 0.04, y: 0.40, w: 0.92, h: 0.2 },
    panels: [
      { id: 'top-left', nama: 'Top left', x: 0, y: 0, w: 0.4975, h: 0.4975 },
      { id: 'top-right', nama: 'Top right', x: 0.5025, y: 0, w: 0.4975, h: 0.4975 },
      { id: 'bottom-left', nama: 'Bottom left', x: 0, y: 0.5025, w: 0.4975, h: 0.4975 },
      { id: 'bottom-right', nama: 'Bottom right', x: 0.5025, y: 0.5025, w: 0.4975, h: 0.4975 },
    ],
  },
  {
    id: 'full-bleed',
    nama: 'Full Bleed',
    titleZone: { x: 0.04, y: 0.70, w: 0.92, h: 0.26 },
    panels: [
      { id: 'full', nama: 'Full', x: 0, y: 0, w: 1, h: 1 },
    ],
  },
  {
    id: 'sunset-strip',
    nama: 'Sunset Strip',
    titleZone: { x: 0.04, y: 0.06, w: 0.92, h: 0.2 },
    panels: [
      { id: 'band', nama: 'Band', x: 0, y: 0, w: 1, h: 0.34 },
      { id: 'main', nama: 'Main', x: 0, y: 0.345, w: 0.62, h: 0.655 },
      { id: 'side', nama: 'Side', x: 0.625, y: 0.345, w: 0.375, h: 0.655 },
    ],
  },
];

/**
 * The layout with this id, or the first layout when the id is unknown.
 * "cinema" is an old nickname for the full-bleed single panel.
 */
export function cariLayout(id) {
  if (id === 'cinema') return LAYOUTS.find((layout) => layout.id === 'full-bleed');
  return LAYOUTS.find((layout) => layout.id === id) || LAYOUTS[0];
}
