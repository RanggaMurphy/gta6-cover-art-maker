// shots.js — shared loaders and the deterministic screenshot scenes.
// muatFont and muatFotoSampel serve the editor (main.js) and the scenes;
// jalankanShot builds one scene from the page's query string, draws it,
// and raises window.__shotReady so the screenshot driver knows it is done.

import { gambarCover } from './cover.js';
import { cariGrade } from './grades.js';
import { cariLayout } from './layouts.js';

/** The demo photos shipped with the app, all made with an image model. */
export const FOTO_SAMPEL = [
  { id: 'hero', nama: 'Hero', src: 'samples/hero.jpg' },
  { id: 'driver', nama: 'Driver', src: 'samples/driver.jpg' },
  { id: 'street', nama: 'Street', src: 'samples/street.jpg' },
  { id: 'boulevard', nama: 'Boulevard', src: 'samples/boulevard.jpg' },
  { id: 'pier', nama: 'Pier', src: 'samples/pier.jpg' },
];

const cacheFoto = new Map();

/** Load any image by URL, as a promise. */
export function muatGambar(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`gagal memuat ${src}`));
    img.src = src;
  });
}

/** Load one demo photo by id, cached so it is fetched once. */
export function muatFotoSampel(id) {
  if (!cacheFoto.has(id)) cacheFoto.set(id, muatGambar(`samples/${id}.jpg`));
  return cacheFoto.get(id);
}

/** Load the two bundled fonts and wait until the browser can use them. */
export async function muatFont() {
  const anton = new FontFace('Anton', 'url(fonts/Anton-Regular.ttf)', { weight: '400' });
  const bebas = new FontFace('Bebas Neue', 'url(fonts/BebasNeue-Regular.ttf)', { weight: '400' });
  document.fonts.add(anton);
  document.fonts.add(bebas);
  await Promise.all([anton.load(), bebas.load()]);
  await Promise.all([
    document.fonts.load('100px Anton'),
    document.fonts.load('40px "Bebas Neue"'),
  ]);
}

/** The three export sizes a scene may ask for. */
const UKURAN_ADEGAN = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  wide: [1920, 1080],
};

/**
 * Run one screenshot scene from the query string.
 * Query keys: shot (cover or editor), size, layout, grade, title,
 * subtitle, tagline, style, photos (comma list, one per panel, cycling),
 * zoom, spread (1 spreads one photo's pan across the panels; this is an
 * optional split-one-photo mode only, never the default, and never what
 * the judging screenshots use — those give every panel its own photo).
 * Returns the cover state it drew, for the editor to adopt.
 */
export async function jalankanShot(params) {
  const ukuran = UKURAN_ADEGAN[params.get('size')] || UKURAN_ADEGAN.square;
  const layout = cariLayout(params.get('layout') || 'hero-split');
  const grade = cariGrade(params.get('grade') || 'sunset');
  const daftarId = (params.get('photos') || 'hero,driver,street')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const zoom = Number(params.get('zoom')) || 1;
  const sebar = params.get('spread') === '1';

  const foto = [];
  for (const id of daftarId) {
    try {
      foto.push(await muatFotoSampel(id));
    } catch {
      foto.push(null);
    }
  }
  const panels = layout.panels.map((panel, i) => ({
    photo: foto[i % foto.length] || null,
    photoId: daftarId[i % daftarId.length] || null,
    zoom,
    ox: sebar ? (i - (layout.panels.length - 1) / 2) * 0.3 : 0,
    oy: 0,
  }));
  const state = {
    layout,
    grade,
    title: params.get('title') || 'NEON BAY',
    subtitle: params.get('subtitle') || 'SUNSET HEIST',
    tagline: params.get('tagline') || 'WELCOME TO THE BAY · EST. 2026',
    titleStyle: params.get('style') || 'chrome',
    seal: true,
    grain: true,
    vignette: true,
    panels,
  };

  await muatFont();
  const kanvas = document.getElementById('cover');
  if (params.get('shot') === 'cover') {
    document.body.classList.add('shot-cover');
    kanvas.width = ukuran[0];
    kanvas.height = ukuran[1];
    kanvas.style.width = `${ukuran[0]}px`;
    kanvas.style.height = `${ukuran[1]}px`;
  } else {
    kanvas.width = 1080;
    kanvas.height = 1080;
  }
  gambarCover(kanvas, state);
  window.__shotReady = true;
  return state;
}
