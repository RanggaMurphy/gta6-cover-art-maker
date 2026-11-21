// Wires the page: photo tray, layout and grade choices, per-panel crop by
// dragging the preview, editable words, and PNG export in the three post
// sizes. A `?shot=` query sets up a fixed scene for a screenshot instead.

import { drawCover } from './cover.js';
import { GRADES } from './grades.js';
import { LAYOUTS, layoutById } from './layouts.js';
import { runShot } from './shots.js';

const SAMPLES = [
  { id: 'hero', src: 'samples/hero.jpg', label: 'Hero portrait' },
  { id: 'driver', src: 'samples/driver.jpg', label: 'Driver and convertible' },
  { id: 'street', src: 'samples/street.jpg', label: 'Neon boulevard' },
  { id: 'boulevard', src: 'samples/boulevard.jpg', label: 'Boulevard' },
  { id: 'pier', src: 'samples/pier.jpg', label: 'Pier' },
];

const TITLE_STYLES = [
  { id: 'chrome', name: 'Chrome' },
  { id: 'solid', name: 'Solid white' },
  { id: 'outline', name: 'Outline' },
];

const SIZES = {
  square: { w: 1080, h: 1080, name: 'cover-1080x1080.png' },
  portrait: { w: 1080, h: 1350, name: 'cover-1080x1350.png' },
  wide: { w: 1920, h: 1080, name: 'cover-1920x1080.png' },
};

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');

/** Loads the two display fonts shipped under app/fonts (SIL Open Font License). */
async function loadFonts() {
  const faces = [
    new FontFace('Anton', 'url(fonts/Anton-Regular.ttf)', { weight: '400' }),
    new FontFace('Bebas Neue', 'url(fonts/BebasNeue-Regular.ttf)', { weight: '400' }),
  ];
  for (const face of faces) {
    try {
      const loaded = await face.load();
      document.fonts.add(loaded);
    } catch { /* fall back to system fonts */ }
  }
  try {
    await Promise.all([
      document.fonts.load('40px Anton'),
      document.fonts.load('40px "Bebas Neue"'),
    ]);
  } catch { /* fall back to system fonts */ }
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function defaultPanels(layoutId) {
  const count = layoutById(layoutId).panels.length;
  const picks = ['hero', 'driver', 'street', 'boulevard', 'pier'];
  return Array.from({ length: count }, (_, i) => ({
    photoId: picks[i % picks.length],
    photo: null,
    zoom: 1,
    ox: 0,
    oy: 0,
  }));
}

const state = {
  layout: 'hero-split',
  grade: 'sunset',
  title: 'NEON BAY',
  subtitle: 'SUNSET HEIST',
  tagline: 'WELCOME TO THE BAY · EST. 2026',
  titleStyle: 'chrome',
  seal: true,
  grain: true,
  vignette: true,
  size: 'square',
  panels: defaultPanels('hero-split'),
  selectedPanel: 0,
};

const library = []; // { id, src, label, img }
let pickedId = 'hero';

function redraw() {
  drawCover(canvas, state);
}

function syncPanelControls() {
  const slot = state.panels[state.selectedPanel];
  document.getElementById('zoom').value = slot.zoom;
  document.getElementById('panX').value = slot.ox;
  document.getElementById('panY').value = slot.oy;
  document.getElementById('panelName').textContent =
    `${layoutById(state.layout).panels[state.selectedPanel].name} (panel ${state.selectedPanel + 1})`;
}

function buildChoices(el, items, current, onPick) {
  el.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.name;
    b.dataset.id = item.id;
    if (item.id === current) b.classList.add('on');
    b.addEventListener('click', () => {
      el.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      onPick(item.id);
    });
    el.appendChild(b);
  }
}

function buildTray() {
  const tray = document.getElementById('tray');
  tray.innerHTML = '';
  for (const photo of library) {
    const thumb = document.createElement('img');
    thumb.src = photo.src;
    thumb.alt = photo.label;
    thumb.title = photo.label;
    if (photo.id === pickedId) thumb.classList.add('picked');
    thumb.addEventListener('click', () => {
      pickedId = photo.id;
      tray.querySelectorAll('img').forEach((x) => x.classList.remove('picked'));
      thumb.classList.add('picked');
    });
    thumb.addEventListener('dblclick', () => assignPickedToSelected());
    tray.appendChild(thumb);
  }
}

function photoById(id) {
  return library.find((p) => p.id === id) ?? null;
}

function assignPickedToSelected() {
  const photo = photoById(pickedId);
  if (!photo) return;
  const slot = state.panels[state.selectedPanel];
  slot.photoId = photo.id;
  slot.photo = photo.img;
  slot.zoom = 1;
  slot.ox = 0;
  slot.oy = 0;
  syncPanelControls();
  redraw();
}

function assignPickedToAll() {
  const photo = photoById(pickedId);
  if (!photo) return;
  const n = state.panels.length;
  state.panels.forEach((slot, i) => {
    slot.photoId = photo.id;
    slot.photo = photo.img;
    slot.zoom = n > 1 ? 1.35 : 1;
    // Spread one photo across the panels so each shows a different crop.
    slot.ox = n > 1 ? (i - (n - 1) / 2) * 0.22 : 0;
    slot.oy = 0;
  });
  syncPanelControls();
  redraw();
}

function setSize(key) {
  state.size = key;
  const size = SIZES[key];
  canvas.width = size.w;
  canvas.height = size.h;
  redraw();
}

function exportPng(key) {
  setSize(key);
  const size = SIZES[key];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) {
      statusEl.textContent = 'Export failed in this browser.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = size.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Saved ${size.name}`;
  }, 'image/png');
}

function shuffle() {
  const rnd = (n) => Math.floor(Math.random() * n);
  state.layout = LAYOUTS[rnd(LAYOUTS.length)].id;
  state.grade = GRADES[rnd(GRADES.length)].id;
  state.titleStyle = TITLE_STYLES[rnd(TITLE_STYLES.length)].id;
  state.panels = defaultPanels(state.layout);
  state.selectedPanel = 0;
  const titles = [
    ['NEON BAY', 'SUNSET HEIST'],
    ['PALM CITY', 'MIDNIGHT RUN'],
    ['VICE NIGHTS', 'OCEAN DRIVE'],
    ['HOT PURSUIT', 'NEON HEAT'],
  ];
  const [t, s] = titles[rnd(titles.length)];
  state.title = t;
  state.subtitle = s;
  document.getElementById('title').value = t;
  document.getElementById('subtitle').value = s;
  for (const slot of state.panels) {
    const photo = library[rnd(library.length)];
    slot.photoId = photo.id;
    slot.photo = photo.img;
    slot.zoom = 1 + Math.random() * 0.5;
    slot.ox = (Math.random() - 0.5) * 0.3;
    slot.oy = (Math.random() - 0.5) * 0.2;
  }
  buildChoices(document.getElementById('layoutChoices'), LAYOUTS, state.layout, pickLayout);
  buildChoices(document.getElementById('gradeChoices'), GRADES, state.grade, pickGrade);
  buildChoices(document.getElementById('titleStyles'), TITLE_STYLES, state.titleStyle, pickTitleStyle);
  syncPanelControls();
  redraw();
}

function pickLayout(id) {
  state.layout = id;
  state.panels = defaultPanels(id);
  state.selectedPanel = 0;
  for (const slot of state.panels) {
    const photo = photoById(slot.photoId);
    slot.photo = photo ? photo.img : null;
  }
  syncPanelControls();
  redraw();
}

function pickGrade(id) {
  state.grade = id;
  redraw();
}

function pickTitleStyle(id) {
  state.titleStyle = id;
  redraw();
}

/** Maps a pointer event on the displayed canvas to canvas pixels. */
function eventToCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function panelAt(x, y) {
  const layout = layoutById(state.layout);
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    if (x >= p.x * canvas.width && x <= (p.x + p.w) * canvas.width
      && y >= p.y * canvas.height && y <= (p.y + p.h) * canvas.height) return i;
  }
  return -1;
}

function wireDragging() {
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const pos = eventToCanvas(e);
    const i = panelAt(pos.x, pos.y);
    if (i < 0) return;
    state.selectedPanel = i;
    syncPanelControls();
    canvas.setPointerCapture(e.pointerId);
    drag = { x: pos.x, y: pos.y, ox: state.panels[i].ox, oy: state.panels[i].oy };
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const pos = eventToCanvas(e);
    const panel = layoutById(state.layout).panels[state.selectedPanel];
    const slot = state.panels[state.selectedPanel];
    slot.ox = Math.max(-0.5, Math.min(0.5, drag.ox + (pos.x - drag.x) / (panel.w * canvas.width)));
    slot.oy = Math.max(-0.5, Math.min(0.5, drag.oy + (pos.y - drag.y) / (panel.h * canvas.height)));
    syncPanelControls();
    redraw();
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const pos = eventToCanvas(e);
    const i = panelAt(pos.x, pos.y);
    if (i < 0) return;
    state.selectedPanel = i;
    const slot = state.panels[i];
    slot.zoom = Math.max(1, Math.min(3, slot.zoom * (e.deltaY < 0 ? 1.08 : 0.92)));
    syncPanelControls();
    redraw();
  }, { passive: false });
}

function wireControls() {
  document.getElementById('zoom').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].zoom = Number(e.target.value);
    redraw();
  });
  document.getElementById('panX').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].ox = Number(e.target.value);
    redraw();
  });
  document.getElementById('panY').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].oy = Number(e.target.value);
    redraw();
  });
  document.getElementById('fillPanel').addEventListener('click', assignPickedToSelected);
  document.getElementById('fillAll').addEventListener('click', assignPickedToAll);
  document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
  document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
  document.getElementById('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
  document.getElementById('seal').addEventListener('change', (e) => { state.seal = e.target.checked; redraw(); });
  document.getElementById('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
  document.getElementById('vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; redraw(); });
  document.getElementById('exportSquare').addEventListener('click', () => exportPng('square'));
  document.getElementById('exportPortrait').addEventListener('click', () => exportPng('portrait'));
  document.getElementById('exportWide').addEventListener('click', () => exportPng('wide'));
  document.getElementById('shuffle').addEventListener('click', shuffle);
  document.getElementById('upload').addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      const url = URL.createObjectURL(file);
      try {
        const img = await loadImage(url);
        const id = `user-${library.length}`;
        library.push({ id, src: url, label: file.name, img });
        pickedId = id;
      } catch { /* skip unreadable files */ }
    }
    buildTray();
    assignPickedToSelected();
  });
}

async function init() {
  await loadFonts();
  for (const sample of SAMPLES) {
    try {
      const img = await loadImage(sample.src);
      library.push({ ...sample, img });
    } catch { /* a missing sample just stays out of the tray */ }
  }
  for (const slot of state.panels) {
    const photo = photoById(slot.photoId);
    slot.photo = photo ? photo.img : null;
  }
  buildTray();
  buildChoices(document.getElementById('layoutChoices'), LAYOUTS, state.layout, pickLayout);
  buildChoices(document.getElementById('gradeChoices'), GRADES, state.grade, pickGrade);
  buildChoices(document.getElementById('titleStyles'), TITLE_STYLES, state.titleStyle, pickTitleStyle);
  wireControls();
  wireDragging();
  syncPanelControls();
  setSize('square');

  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot) {
    await runShot(shot, query, { state, library, loadImage, setSize, redraw, exportPng });
  }
}

init();
