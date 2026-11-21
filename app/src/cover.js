// cover.js — the cover engine of Neon Bay Cover Studio.
// gambarCover draws one whole poster onto any canvas, at any size, from a
// state: layout, grade, words, title style, seal, grain, vignette and one
// photo state per panel (photo, zoom, ox, oy). Everything is drawn in
// code: no image is fetched, no network is touched.

/** A small seeded random source, so the grain tile is identical every run. */
function mulberry32(benih) {
  let a = benih >>> 0;
  return function acakBerikutnya() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The grain tile, built once and reused for every grain pass. */
let ubinGrain = null;
function ambilUbinGrain() {
  if (ubinGrain) return ubinGrain;
  const ubin = document.createElement('canvas');
  ubin.width = 160;
  ubin.height = 160;
  const k = ubin.getContext('2d');
  const data = k.createImageData(160, 160);
  const acak = mulberry32(20261121);
  for (let i = 0; i < data.data.length; i += 4) {
    const nilai = Math.floor(acak() * 255);
    data.data[i] = nilai;
    data.data[i + 1] = nilai;
    data.data[i + 2] = nilai;
    data.data[i + 3] = 255;
  }
  k.putImageData(data, 0, 0);
  ubinGrain = ubin;
  return ubin;
}

/** Clamp a panel shift so the photo never leaves its panel bare. */
function batasiGeser(nilai, sisa) {
  if (sisa <= 0) return 0;
  const geser = nilai * sisa * 0.5;
  return Math.max(-sisa / 2, Math.min(sisa / 2, geser));
}

/** One grade wash: a translucent gradient over a panel, in its blend mode. */
function gambarWashGrade(ctx, wash, px, py, pw, ph) {
  const gradien = wash.dir === 'bottom'
    ? ctx.createLinearGradient(0, py + ph, 0, py)
    : ctx.createLinearGradient(0, py, 0, py + ph);
  gradien.addColorStop(0, wash.from);
  gradien.addColorStop(1, wash.to);
  ctx.save();
  ctx.globalCompositeOperation = wash.blend;
  ctx.fillStyle = gradien;
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();
}

/** One photo panel: cover-fit photo with zoom and pan, grade, washes. */
function gambarPanelFoto(ctx, panel, keadaanPanel, grade, W, H) {
  const px = panel.x * W;
  const py = panel.y * H;
  const pw = panel.w * W;
  const ph = panel.h * H;
  const foto = keadaanPanel ? keadaanPanel.photo : null;
  if (!foto || !foto.naturalWidth) {
    ctx.fillStyle = '#2a1f38';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = 'rgba(244,238,247,0.7)';
    ctx.font = `${Math.max(12, 0.028 * H)}px "Bebas Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', px + pw / 2, py + ph / 2);
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  const zoom = keadaanPanel.zoom || 1;
  const skala = Math.max(pw / foto.naturalWidth, ph / foto.naturalHeight) * zoom;
  const dw = foto.naturalWidth * skala;
  const dh = foto.naturalHeight * skala;
  const geserX = batasiGeser(keadaanPanel.ox || 0, dw - pw);
  const geserY = batasiGeser(keadaanPanel.oy || 0, dh - ph);
  ctx.filter = grade.filter;
  ctx.drawImage(foto, px + (pw - dw) / 2 + geserX, py + (ph - dh) / 2 + geserY, dw, dh);
  ctx.filter = 'none';
  for (const wash of grade.washes) gambarWashGrade(ctx, wash, px, py, pw, ph);
  ctx.restore();
}

/**
 * The white gaps between panels, drawn only along the sides two panels
 * share, never as a full line across the canvas.
 */
function gambarCelahPanel(ctx, layout, W, H) {
  const celah = 6 * (W / 1080);
  const panel = layout.panels;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < panel.length; i++) {
    for (let j = i + 1; j < panel.length; j++) {
      const a = panel[i];
      const b = panel[j];
      const tepiTegakKiri = (a.x + a.w + b.x) / 2;
      const tepiTegakKanan = (b.x + b.w + a.x) / 2;
      if (Math.abs(a.x + a.w - b.x) < 0.008) {
        const atas = Math.max(a.y, b.y) * H;
        const bawah = Math.min(a.y + a.h, b.y + b.h) * H;
        if (bawah - atas > 4) ctx.fillRect(tepiTegakKiri * W - celah / 2, atas, celah, bawah - atas);
      } else if (Math.abs(b.x + b.w - a.x) < 0.008) {
        const atas = Math.max(a.y, b.y) * H;
        const bawah = Math.min(a.y + a.h, b.y + b.h) * H;
        if (bawah - atas > 4) ctx.fillRect(tepiTegakKanan * W - celah / 2, atas, celah, bawah - atas);
      }
      if (Math.abs(a.y + a.h - b.y) < 0.008) {
        const tepi = ((a.y + a.h) + b.y) / 2;
        const kiri = Math.max(a.x, b.x) * W;
        const kanan = Math.min(a.x + a.w, b.x + b.w) * W;
        if (kanan - kiri > 4) ctx.fillRect(kiri, tepi * H - celah / 2, kanan - kiri, celah);
      } else if (Math.abs(b.y + b.h - a.y) < 0.008) {
        const tepi = ((b.y + b.h) + a.y) / 2;
        const kiri = Math.max(a.x, b.x) * W;
        const kanan = Math.min(a.x + a.w, b.x + b.w) * W;
        if (kanan - kiri > 4) ctx.fillRect(kiri, tepi * H - celah / 2, kanan - kiri, celah);
      }
    }
  }
}

/** The title block: big sheared title, subtitle, small line, on a soft dark wash. */
function gambarJudul(ctx, zona, state, W, H) {
  const zx = zona.x * W;
  const zy = zona.y * H;
  const zw = zona.w * W;
  const zh = zona.h * H;

  const latar = ctx.createLinearGradient(0, zy, 0, zy + zh);
  latar.addColorStop(0, 'rgba(12,6,20,0)');
  latar.addColorStop(1, 'rgba(12,6,20,0.62)');
  ctx.fillStyle = latar;
  ctx.fillRect(zx, zy, zw, zh);

  const judul = (state.title || '').toUpperCase();
  let ukuranJudul = zh * 0.5;
  ctx.font = `${ukuranJudul}px Anton, sans-serif`;
  while (ukuranJudul > 24 && ctx.measureText(judul).width > zw * 0.98) {
    ukuranJudul *= 0.92;
    ctx.font = `${ukuranJudul}px Anton, sans-serif`;
  }
  ctx.save();
  ctx.translate(zx, zy + zh * 0.42);
  ctx.transform(1, 0, -0.045, 1, 0, 0);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  if (state.titleStyle === 'chrome') {
    const kilau = ctx.createLinearGradient(0, -ukuranJudul * 0.55, 0, ukuranJudul * 0.55);
    kilau.addColorStop(0, '#ffffff');
    kilau.addColorStop(0.35, '#ffe9a8');
    kilau.addColorStop(0.55, '#ff9a3d');
    kilau.addColorStop(0.75, '#ff5e8a');
    kilau.addColorStop(1, '#7b5cff');
    ctx.strokeStyle = '#160a20';
    ctx.lineWidth = ukuranJudul * 0.07;
    ctx.strokeText(judul, 0, 0);
    ctx.fillStyle = kilau;
    ctx.fillText(judul, 0, 0);
  } else if (state.titleStyle === 'outline') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = ukuranJudul * 0.055;
    ctx.strokeText(judul, 0, 0);
    ctx.fillStyle = '#1a0f24';
    ctx.fillText(judul, 0, 0);
  } else {
    ctx.strokeStyle = '#160a20';
    ctx.lineWidth = ukuranJudul * 0.03;
    ctx.strokeText(judul, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(judul, 0, 0);
  }
  ctx.restore();

  const sub = (state.subtitle || '').toUpperCase();
  let ukuranSub = zh * 0.17;
  ctx.font = `${ukuranSub}px "Bebas Neue", sans-serif`;
  ctx.letterSpacing = `${Math.round(ukuranSub * 0.22)}px`;
  while (ukuranSub > 12 && ctx.measureText(sub).width > zw * 0.98) {
    ukuranSub *= 0.9;
    ctx.font = `${ukuranSub}px "Bebas Neue", sans-serif`;
  }
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(sub, zx, zy + zh * 0.78);
  ctx.letterSpacing = '0px';

  const kecil = (state.tagline || '').toUpperCase();
  ctx.font = `${Math.max(10, zh * 0.085)}px "Bebas Neue", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.fillText(kecil, zx, zy + zh * 0.96);
}

/** The round pink seal in the top-right corner. */
function gambarSegel(ctx, W, H) {
  const cx = W * 0.905;
  const cy = H * 0.075;
  const r = W * 0.052;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.1);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ff5e8a';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${r * 0.6}px Anton, sans-serif`;
  ctx.fillText('NB', 0, -r * 0.14);
  ctx.font = `${r * 0.26}px "Bebas Neue", sans-serif`;
  ctx.fillText('EST. 2026', 0, r * 0.42);
  ctx.restore();
}

/** The small credits line along the bottom edge, centred, on its own dark band. */
function gambarKredit(ctx, W, H) {
  const ukuran = Math.max(9, 11 * (W / 1080));
  const tinggiPita = 26 * (H / 1080);
  ctx.save();
  ctx.fillStyle = 'rgba(10,5,18,0.55)';
  ctx.fillRect(0, H - tinggiPita, W, tinggiPita);
  ctx.font = `${ukuran}px system-ui, sans-serif`;
  ctx.letterSpacing = '2px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 4 * (W / 1080);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText(
    'A NEON BAY COVER STUDIO ORIGINAL · PHOTOS BY YOU · MADE OFFLINE IN YOUR BROWSER',
    W / 2,
    H - 10 * (H / 1080),
  );
  ctx.restore();
}

/** Film grain: the seeded noise tile, faint, in overlay blend. */
function gambarGrain(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(ambilUbinGrain(), 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** Vignette: a dark radial falloff toward the edges. */
function gambarVignette(ctx, W, H) {
  const gradien = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.75,
  );
  gradien.addColorStop(0, 'rgba(8,3,14,0)');
  gradien.addColorStop(1, 'rgba(8,3,14,0.42)');
  ctx.fillStyle = gradien;
  ctx.fillRect(0, 0, W, H);
}

/**
 * Draw one whole poster onto `kanvas` from `state`.
 * state: { layout, grade, title, subtitle, tagline, titleStyle, seal,
 * grain, vignette, panels: [{ photo, zoom, ox, oy }] }.
 */
export function gambarCover(kanvas, state) {
  const ctx = kanvas.getContext('2d');
  const W = kanvas.width;
  const H = kanvas.height;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#f2ead9';
  ctx.fillRect(0, 0, W, H);
  state.layout.panels.forEach((panel, i) => {
    gambarPanelFoto(ctx, panel, state.panels[i], state.grade, W, H);
  });
  gambarCelahPanel(ctx, state.layout, W, H);
  gambarJudul(ctx, state.layout.titleZone, state, W, H);
  if (state.seal) gambarSegel(ctx, W, H);
  gambarKredit(ctx, W, H);
  if (state.grain) gambarGrain(ctx, W, H);
  if (state.vignette) gambarVignette(ctx, W, H);
  ctx.restore();
}
