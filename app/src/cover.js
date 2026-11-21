// Draws the whole poster onto a canvas at the canvas's own size: photo panels
// with the chosen grade, then the big title, subtitle, seal and finish.
// Everything is drawn from `state`, so the preview and the PNG export share
// one code path and always match.

import { gradeById } from './grades.js';
import { layoutById } from './layouts.js';

/** Tiny seeded random, so the film grain is identical on every export. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let grainTile = null;
function getGrainTile() {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 160;
  tile.height = 160;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(160, 160);
  const rnd = mulberry32(20261121);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  grainTile = tile;
  return tile;
}

/** Cover-fits `photo` into a panel rect, honouring the panel's zoom and pan. */
function drawPanelPhoto(ctx, photo, rect, zoom, ox, oy) {
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
  const dw = photo.naturalWidth * base * zoom;
  const dh = photo.naturalHeight * base * zoom;
  const dx = rect.x + (rect.w - dw) / 2 + ox * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + oy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(photo, dx, dy, dw, dh);
  ctx.restore();
}

/** One translucent gradient wash over a rect, in the grade's blend mode. */
function drawWash(ctx, rect, wash) {
  const grad = wash.top
    ? ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h)
    : ctx.createLinearGradient(rect.x, rect.y + rect.h, rect.x, rect.y);
  grad.addColorStop(0, wash.from);
  grad.addColorStop(1, wash.to);
  ctx.save();
  ctx.globalCompositeOperation = wash.blend;
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function fitFont(ctx, text, fontFamily, maxWidth, startSize, weight = '') {
  let size = startSize;
  const set = () => { ctx.font = `${weight} ${size}px ${fontFamily}`; };
  set();
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 2;
    set();
  }
  return size;
}

/** The big slanted title in the layout's title zone. */
function drawTitle(ctx, state, zone, W, H) {
  const title = (state.title || '').trim().toUpperCase();
  const sub = (state.subtitle || '').trim().toUpperCase();
  const tag = (state.tagline || '').trim().toUpperCase();
  if (!title && !sub) return;

  // A soft dark foot so white letters read over any photo.
  const foot = ctx.createLinearGradient(0, zone.y - zone.h * 0.35, 0, zone.y + zone.h);
  foot.addColorStop(0, 'rgba(12, 5, 24, 0)');
  foot.addColorStop(1, 'rgba(12, 5, 24, 0.62)');
  ctx.fillStyle = foot;
  ctx.fillRect(zone.x - W * 0.04, zone.y - zone.h * 0.35, zone.w + W * 0.08, zone.h * 1.35);

  ctx.save();
  ctx.translate(zone.x, zone.y);
  // A slight forward lean, the poster slant.
  ctx.transform(1, 0, -0.045, 1, 0, 0);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  let cursorY = 0;
  if (title) {
    const size = fitFont(ctx, title, '"Anton", sans-serif', zone.w, zone.h * 0.5, '400');
    cursorY = size;
    const chrome = ctx.createLinearGradient(0, cursorY - size, 0, cursorY + size * 0.1);
    chrome.addColorStop(0, '#ffffff');
    chrome.addColorStop(0.35, '#ffe9a8');
    chrome.addColorStop(0.62, '#ff9a3d');
    chrome.addColorStop(0.85, '#ff5e8a');
    chrome.addColorStop(1, '#c44dff');
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = size * 0.08;
    ctx.shadowOffsetY = size * 0.03;
    if (state.titleStyle === 'outline') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 0.055;
      ctx.strokeText(title, 0, cursorY);
      ctx.fillStyle = 'rgba(20, 6, 32, 0.85)';
      ctx.fillText(title, 0, cursorY);
    } else if (state.titleStyle === 'solid') {
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = size * 0.04;
      ctx.strokeStyle = 'rgba(10, 4, 20, 0.9)';
      ctx.strokeText(title, 0, cursorY);
      ctx.fillText(title, 0, cursorY);
    } else {
      ctx.lineWidth = size * 0.05;
      ctx.strokeStyle = 'rgba(10, 4, 20, 0.95)';
      ctx.strokeText(title, 0, cursorY);
      ctx.fillStyle = chrome;
      ctx.fillText(title, 0, cursorY);
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    cursorY += size * 0.1;
  }
  if (sub) {
    const size = fitFont(ctx, sub, '"Bebas Neue", sans-serif', zone.w, zone.h * 0.2, '400');
    try { ctx.letterSpacing = `${Math.round(size * 0.18)}px`; } catch { /* older canvas */ }
    ctx.font = `400 ${size}px "Bebas Neue", sans-serif`;
    ctx.fillStyle = '#ffe9a8';
    ctx.lineWidth = size * 0.06;
    ctx.strokeStyle = 'rgba(10, 4, 20, 0.9)';
    ctx.strokeText(sub, 0, cursorY + size);
    ctx.fillText(sub, 0, cursorY + size);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
    cursorY += size * 1.12;
  }
  if (tag) {
    const size = Math.max(10, zone.h * 0.075);
    ctx.font = `400 ${size}px "Bebas Neue", sans-serif`;
    try { ctx.letterSpacing = `${Math.round(size * 0.3)}px`; } catch { /* older canvas */ }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(tag, 0, cursorY + size);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }
  ctx.restore();
}

/** A small round seal, top right, with the studio name set around the rim. */
function drawSeal(ctx, W, H) {
  const cx = W * 0.885;
  const cy = H * 0.105;
  const r = Math.min(W, H) * 0.062;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.18);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 94, 138, 0.92)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = Math.max(1, r * 0.035);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${r * 0.52}px "Anton", sans-serif`;
  ctx.fillText('NB', 0, -r * 0.1);
  ctx.font = `${r * 0.2}px "Bebas Neue", sans-serif`;
  try { ctx.letterSpacing = `${Math.round(r * 0.06)}px`; } catch { /* older canvas */ }
  ctx.fillText('EST. 2026', 0, r * 0.42);
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  ctx.restore();
}

/** The tiny credits line along the very foot, movie-poster style. */
function drawBilling(ctx, W, H) {
  const size = Math.max(11, H * 0.0135);
  ctx.save();
  ctx.font = `400 ${size}px "Bebas Neue", sans-serif`;
  try { ctx.letterSpacing = `${Math.round(size * 0.22)}px`; } catch { /* older canvas */ }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('A NEON BAY COVER STUDIO ORIGINAL  ·  PHOTOS BY YOU  ·  MADE OFFLINE IN YOUR BROWSER', W / 2, H - H * 0.012);
  ctx.restore();
}

/**
 * Renders the poster described by `state` onto `canvas` (any size).
 * state: { layout, grade, title, subtitle, tagline, titleStyle, seal, grain,
 *   vignette, panels: [{ photo, zoom, ox, oy }] }.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);
  const gutter = Math.max(2, Math.round(W * 0.004));

  ctx.save();
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#f2ead9';
  ctx.fillRect(0, 0, W, H);

  layout.panels.forEach((panel, i) => {
    const rect = {
      x: panel.x * W + gutter,
      y: panel.y * H + gutter,
      w: panel.w * W - gutter * 2,
      h: panel.h * H - gutter * 2,
    };
    const slot = state.panels[i] ?? {};
    const photo = slot.photo;
    ctx.save();
    if (photo) {
      ctx.filter = grade.filter;
      drawPanelPhoto(ctx, photo, rect, slot.zoom ?? 1, slot.ox ?? 0, slot.oy ?? 0);
      ctx.filter = 'none';
      for (const wash of grade.washes) drawWash(ctx, rect, wash);
    } else {
      ctx.fillStyle = '#241533';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = `${Math.round(rect.h * 0.05)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add a photo', rect.x + rect.w / 2, rect.y + rect.h / 2);
    }
    ctx.restore();
  });

  // White seams between panels, drawn after the photos. Each seam runs only
  // across the span of the panel that meets the edge, never over a neighbour.
  ctx.fillStyle = '#f2ead9';
  for (const panel of layout.panels) {
    if (panel.x > 0) {
      ctx.fillRect(panel.x * W - gutter, panel.y * H - gutter, gutter * 2, panel.h * H + gutter * 2);
    }
    if (panel.y > 0) {
      ctx.fillRect(panel.x * W - gutter, panel.y * H - gutter, panel.w * W + gutter * 2, gutter * 2);
    }
  }

  const zone = {
    x: layout.titleZone.x * W,
    y: layout.titleZone.y * H,
    w: layout.titleZone.w * W,
    h: layout.titleZone.h * H,
  };
  drawTitle(ctx, state, zone, W, H);
  if (state.seal) drawSeal(ctx, W, H);
  drawBilling(ctx, W, H);

  if (state.grain) {
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(getGrainTile(), 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (state.vignette) {
    const vig = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.42,
      W / 2, H / 2, Math.max(W, H) * 0.75,
    );
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(10, 4, 20, 0.38)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
