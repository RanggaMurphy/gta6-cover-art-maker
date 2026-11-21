// Poster layouts. Every panel is a rectangle in unit space (fractions of the
// cover), and the title band is a rectangle too, so the same layout renders
// at any export size. Gutters are thin white seams, the poster look.

export const LAYOUTS = [
  {
    id: 'hero-split',
    name: 'Hero Split',
    titleZone: { x: 0.04, y: 0.74, w: 0.92, h: 0.22 },
    panels: [
      { id: 'hero', name: 'Hero', x: 0.0, y: 0.0, w: 0.56, h: 1.0 },
      { id: 'top', name: 'Top right', x: 0.565, y: 0.0, w: 0.435, h: 0.49 },
      { id: 'low', name: 'Bottom right', x: 0.565, y: 0.495, w: 0.435, h: 0.505 },
    ],
  },
  {
    id: 'triptych',
    name: 'Triptych',
    titleZone: { x: 0.04, y: 0.72, w: 0.92, h: 0.24 },
    panels: [
      { id: 'left', name: 'Left', x: 0.0, y: 0.0, w: 0.33, h: 1.0 },
      { id: 'mid', name: 'Middle', x: 0.335, y: 0.0, w: 0.33, h: 1.0 },
      { id: 'right', name: 'Right', x: 0.67, y: 0.0, w: 0.33, h: 1.0 },
    ],
  },
  {
    id: 'quad',
    name: 'Four Corners',
    titleZone: { x: 0.04, y: 0.40, w: 0.92, h: 0.2 },
    panels: [
      { id: 'tl', name: 'Top left', x: 0.0, y: 0.0, w: 0.4975, h: 0.4975 },
      { id: 'tr', name: 'Top right', x: 0.5025, y: 0.0, w: 0.4975, h: 0.4975 },
      { id: 'bl', name: 'Bottom left', x: 0.0, y: 0.5025, w: 0.4975, h: 0.4975 },
      { id: 'br', name: 'Bottom right', x: 0.5025, y: 0.5025, w: 0.4975, h: 0.4975 },
    ],
  },
  {
    id: 'cinema',
    name: 'Full Bleed',
    titleZone: { x: 0.04, y: 0.70, w: 0.92, h: 0.26 },
    panels: [
      { id: 'full', name: 'Full photo', x: 0.0, y: 0.0, w: 1.0, h: 1.0 },
    ],
  },
  {
    id: 'strip',
    name: 'Sunset Strip',
    titleZone: { x: 0.04, y: 0.06, w: 0.92, h: 0.2 },
    panels: [
      { id: 'band', name: 'Top band', x: 0.0, y: 0.0, w: 1.0, h: 0.34 },
      { id: 'main', name: 'Main', x: 0.0, y: 0.345, w: 0.62, h: 0.655 },
      { id: 'side', name: 'Side', x: 0.625, y: 0.345, w: 0.375, h: 0.655 },
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}
