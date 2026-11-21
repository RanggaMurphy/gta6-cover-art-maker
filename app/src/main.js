// main.js — the editor of Neon Bay Cover Studio.
// Wires the page to the cover engine: option buttons, photo tray, upload,
// sliders, canvas click / drag / scroll, surprise, and PNG export.
// With a ?shot= query it hands the scene to shots.js first, so the
// screenshot driver and the editor always draw the same cover.

import { gambarCover } from './cover.js';
import { GRADES, cariGrade } from './grades.js';
import { LAYOUTS, cariLayout } from './layouts.js';
import { FOTO_SAMPEL, muatFont, muatFotoSampel, muatGambar, jalankanShot } from './shots.js';

const kanvas = document.getElementById('cover');
const tray = document.getElementById('tray');
const statusEl = document.getElementById('status');
const panelNameEl = document.getElementById('panelName');
const zoomSlider = document.getElementById('zoomSlider');
const panXSlider = document.getElementById('panXSlider');
const panYSlider = document.getElementById('panYSlider');
const titleInput = document.getElementById('titleInput');
const subtitleInput = document.getElementById('subtitleInput');
const taglineInput = document.getElementById('taglineInput');
const uploadInput = document.getElementById('upload');

const UKURAN_EXPORT = {
  square: { label: '1080x1080', w: 1080, h: 1080, file: 'cover-1080x1080.png' },
  portrait: { label: '1080x1350', w: 1080, h: 1350, file: 'cover-1080x1350.png' },
  wide: { label: '1920x1080', w: 1920, h: 1080, file: 'cover-1920x1080.png' },
};

const JUDUL_ACAK = [
  ['NEON BAY', 'SUNSET HEIST'],
  ['PALM CITY', 'MIDNIGHT RUN'],
  ['VICE NIGHTS', 'OCEAN DRIVE'],
  ['HOT PURSUIT', 'NEON HEAT'],
];

const GAYA_JUDUL = [
  { id: 'chrome', nama: 'Chrome' },
  { id: 'solid', nama: 'Solid' },
  { id: 'outline', nama: 'Outline' },
];

const state = {
  layoutId: 'hero-split',
  gradeId: 'sunset',
  title: 'NEON BAY',
  subtitle: 'SUNSET HEIST',
  tagline: 'WELCOME TO THE BAY · EST. 2026',
  titleStyle: 'chrome',
  seal: true,
  grain: true,
  vignette: true,
  skyline: true,
  panels: [],
  terpilih: 0,
};

const fotoTerdaftar = [];
let fotoTerpilihId = 'hero';
let mulaiSeret = null;

const batasi = (nilai, min, maks) => Math.max(min, Math.min(maks, nilai));
const acakDari = (daftar) => daftar[Math.floor(Math.random() * daftar.length)];

function layoutAktif() {
  return cariLayout(state.layoutId);
}

function gradeAktif() {
  return cariGrade(state.gradeId);
}

function panelTerpilih() {
  return state.panels[state.terpilih];
}

function statusKeCover() {
  return {
    layout: layoutAktif(),
    grade: gradeAktif(),
    title: state.title,
    subtitle: state.subtitle,
    tagline: state.tagline,
    titleStyle: state.titleStyle,
    seal: state.seal,
    grain: state.grain,
    vignette: state.vignette,
    skyline: state.skyline,
    panels: state.panels,
  };
}

function gambarUlang() {
  gambarCover(kanvas, statusKeCover());
}

function setStatus(teks) {
  statusEl.textContent = teks;
}

/** Resize the panel list to the active layout, keeping what fits. */
function sesuaikanPanelDenganLayout() {
  const jumlah = layoutAktif().panels.length;
  while (state.panels.length < jumlah) {
    state.panels.push({ photo: null, photoId: null, zoom: 1, ox: 0, oy: 0 });
  }
  state.panels.length = jumlah;
  state.terpilih = Math.min(state.terpilih, jumlah - 1);
}

/** Fill empty panels with demo photos in turn, so a layout never sits blank. */
function isiPanelKosongDenganSampel() {
  state.panels.forEach((panel, i) => {
    if (panel.photo) return;
    const id = FOTO_SAMPEL[i % FOTO_SAMPEL.length].id;
    muatFotoSampel(id).then((img) => {
      panel.photo = img;
      panel.photoId = id;
      gambarUlang();
    });
  });
}

/** Build one row of option buttons; returns a refresh for the active one. */
function bangunTombolPilihan(wadah, daftar, bacaAktif, saatPilih) {
  const tombol = daftar.map((item) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.textContent = item.nama;
    el.addEventListener('click', () => {
      saatPilih(item.id);
      segarkan();
    });
    wadah.appendChild(el);
    return { id: item.id, el };
  });
  function segarkan() {
    const aktif = bacaAktif();
    tombol.forEach(({ id, el }) => el.classList.toggle('active', id === aktif));
  }
  segarkan();
  return segarkan;
}

let segarkanLayout;
let segarkanGrade;
let segarkanGaya;

function bangunKontrol() {
  segarkanLayout = bangunTombolPilihan(
    document.getElementById('layoutOptions'),
    LAYOUTS,
    () => state.layoutId,
    (id) => {
      state.layoutId = id;
      sesuaikanPanelDenganLayout();
      isiPanelKosongDenganSampel();
      sinkronKontrol();
      gambarUlang();
    },
  );
  segarkanGrade = bangunTombolPilihan(
    document.getElementById('gradeOptions'),
    GRADES,
    () => state.gradeId,
    (id) => {
      state.gradeId = id;
      gambarUlang();
    },
  );
  segarkanGaya = bangunTombolPilihan(
    document.getElementById('styleOptions'),
    GAYA_JUDUL,
    () => state.titleStyle,
    (id) => {
      state.titleStyle = id;
      gambarUlang();
    },
  );

  zoomSlider.addEventListener('input', () => {
    panelTerpilih().zoom = Number(zoomSlider.value);
    gambarUlang();
  });
  panXSlider.addEventListener('input', () => {
    panelTerpilih().ox = Number(panXSlider.value);
    gambarUlang();
  });
  panYSlider.addEventListener('input', () => {
    panelTerpilih().oy = Number(panYSlider.value);
    gambarUlang();
  });

  document.getElementById('fillPanelBtn').addEventListener('click', () => {
    isiPanelTerpilih(fotoTerpilihId);
  });
  document.getElementById('fillAllBtn').addEventListener('click', () => {
    isiSemuaPanel(fotoTerpilihId);
  });

  titleInput.addEventListener('input', () => {
    state.title = titleInput.value;
    gambarUlang();
  });
  subtitleInput.addEventListener('input', () => {
    state.subtitle = subtitleInput.value;
    gambarUlang();
  });
  taglineInput.addEventListener('input', () => {
    state.tagline = taglineInput.value;
    gambarUlang();
  });
  document.getElementById('sealCheck').addEventListener('change', (e) => {
    state.seal = e.target.checked;
    gambarUlang();
  });
  document.getElementById('grainCheck').addEventListener('change', (e) => {
    state.grain = e.target.checked;
    gambarUlang();
  });
  document.getElementById('vignetteCheck').addEventListener('change', (e) => {
    state.vignette = e.target.checked;
    gambarUlang();
  });
  document.getElementById('skylineCheck').addEventListener('change', (e) => {
    state.skyline = e.target.checked;
    gambarUlang();
  });

  document.getElementById('exportSquare').addEventListener('click', () => exportPNG('square'));
  document.getElementById('exportPortrait').addEventListener('click', () => exportPNG('portrait'));
  document.getElementById('exportWide').addEventListener('click', () => exportPNG('wide'));
  document.getElementById('surpriseBtn').addEventListener('click', acakSemua);
  uploadInput.addEventListener('change', terimaUnggahan);
  pasangInteraksiKanvas();
}

/** Keep every control showing the state: sliders, inputs, active buttons. */
function sinkronKontrol() {
  const panel = panelTerpilih();
  panelNameEl.textContent = layoutAktif().panels[state.terpilih].nama;
  zoomSlider.value = String(panel.zoom);
  panXSlider.value = String(panel.ox);
  panYSlider.value = String(panel.oy);
  titleInput.value = state.title;
  subtitleInput.value = state.subtitle;
  taglineInput.value = state.tagline;
  document.getElementById('sealCheck').checked = state.seal;
  document.getElementById('grainCheck').checked = state.grain;
  document.getElementById('vignetteCheck').checked = state.vignette;
  document.getElementById('skylineCheck').checked = state.skyline;
  if (segarkanLayout) segarkanLayout();
  if (segarkanGrade) segarkanGrade();
  if (segarkanGaya) segarkanGaya();
  tray.querySelectorAll('.thumb').forEach((el) => {
    el.classList.toggle('selected', el.dataset.fotoId === fotoTerpilihId);
  });
}

/** One tray thumbnail: click picks the photo, double-click fills the panel. */
function tambahThumb({ id, nama, src }) {
  const tombol = document.createElement('button');
  tombol.type = 'button';
  tombol.className = 'thumb';
  tombol.dataset.fotoId = id;
  tombol.title = nama;
  const img = document.createElement('img');
  img.src = src;
  img.alt = nama;
  tombol.appendChild(img);
  tombol.addEventListener('click', () => pilihFoto(id));
  tombol.addEventListener('dblclick', () => isiPanelTerpilih(id));
  tray.appendChild(tombol);
  return tombol;
}

function bangunTray() {
  for (const foto of FOTO_SAMPEL) tambahThumb(foto);
  sinkronKontrol();
}

function pilihFoto(id) {
  fotoTerpilihId = id;
  sinkronKontrol();
}

async function isiPanelTerpilih(id) {
  const img = await muatFotoDenganId(id);
  if (!img) return;
  const panel = panelTerpilih();
  panel.photo = img;
  panel.photoId = id;
  panel.zoom = 1;
  panel.ox = 0;
  panel.oy = 0;
  fotoTerpilihId = id;
  sinkronKontrol();
  gambarUlang();
  setStatus(`Panel ${layoutAktif().panels[state.terpilih].nama} diisi foto ${id}.`);
}

async function isiSemuaPanel(id) {
  const img = await muatFotoDenganId(id);
  if (!img) return;
  const jumlah = state.panels.length;
  state.panels.forEach((panel, i) => {
    panel.photo = img;
    panel.photoId = id;
    panel.zoom = 1.35;
    panel.ox = (i - (jumlah - 1) / 2) * 0.3;
    panel.oy = 0;
  });
  fotoTerpilihId = id;
  sinkronKontrol();
  gambarUlang();
  setStatus(`Satu foto untuk semua ${jumlah} panel, tiap panel potongan berbeda.`);
}

async function muatFotoDenganId(id) {
  const unggahan = fotoTerdaftar.find((f) => f.id === id);
  if (unggahan) return unggahan.img;
  try {
    return await muatFotoSampel(id);
  } catch {
    setStatus(`Foto ${id} gagal dimuat.`);
    return null;
  }
}

/** User uploads: read through object URLs, into the tray and the panel. */
async function terimaUnggahan() {
  const files = [...uploadInput.files].filter((f) => f.type.startsWith('image/'));
  if (!files.length) return;
  let pertama = null;
  for (const file of files) {
    const url = URL.createObjectURL(file);
    try {
      const img = await muatGambar(url);
      const id = `unggah-${fotoTerdaftar.length}`;
      fotoTerdaftar.push({ id, nama: file.name, img });
      tambahThumb({ id, nama: file.name, src: url });
      if (!pertama) pertama = id;
    } catch {
      setStatus(`File ${file.name} gagal dibaca.`);
    }
  }
  uploadInput.value = '';
  if (pertama) {
    pilihFoto(pertama);
    await isiPanelTerpilih(pertama);
  }
}

/** Random layout, grade, title style, title pair and one photo per panel. */
function acakSemua() {
  state.layoutId = acakDari(LAYOUTS).id;
  state.gradeId = acakDari(GRADES).id;
  state.titleStyle = acakDari(GAYA_JUDUL).id;
  const [judul, sub] = acakDari(JUDUL_ACAK);
  state.title = judul;
  state.subtitle = sub;
  sesuaikanPanelDenganLayout();
  // Give every panel a different photo: shuffle a copy of the samples
  // and take the first N for the N panels, so Surprise never repeats.
  const acakan = [...FOTO_SAMPEL];
  for (let i = acakan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [acakan[i], acakan[j]] = [acakan[j], acakan[i]];
  }
  state.panels.forEach((panel, i) => {
    const id = acakan[i % acakan.length].id;
    panel.zoom = 1;
    panel.ox = 0;
    panel.oy = 0;
    muatFotoSampel(id).then((img) => {
      panel.photo = img;
      panel.photoId = id;
      gambarUlang();
    });
  });
  sinkronKontrol();
  gambarUlang();
  setStatus('Surprise! Layout, grade, dan judul diacak.');
}

/** Export the cover at one post size: redraw offscreen, download the PNG. */
function exportPNG(kunci) {
  const ukuran = UKURAN_EXPORT[kunci];
  const lepas = document.createElement('canvas');
  lepas.width = ukuran.w;
  lepas.height = ukuran.h;
  gambarCover(lepas, statusKeCover());
  setStatus(`Mengekspor ${ukuran.label}…`);
  lepas.toBlob((blob) => {
    if (!blob) {
      setStatus('Export gagal — coba lagi.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ukuran.file;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setStatus(`Cover ${ukuran.label} tersimpan sebagai ${ukuran.file}.`);
  }, 'image/png');
}

/** Which panel holds this point on the canvas, in fractions. */
function panelPadaTitik(clientX, clientY) {
  const rect = kanvas.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;
  return layoutAktif().panels.findIndex(
    (p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h,
  );
}

function pasangInteraksiKanvas() {
  kanvas.addEventListener('pointerdown', (e) => {
    const i = panelPadaTitik(e.clientX, e.clientY);
    if (i < 0) return;
    state.terpilih = i;
    sinkronKontrol();
    const panel = panelTerpilih();
    mulaiSeret = { x: e.clientX, y: e.clientY, ox: panel.ox, oy: panel.oy };
    kanvas.setPointerCapture(e.pointerId);
  });
  kanvas.addEventListener('pointermove', (e) => {
    if (!mulaiSeret) return;
    const rect = kanvas.getBoundingClientRect();
    const panel = layoutAktif().panels[state.terpilih];
    const dxKan = ((e.clientX - mulaiSeret.x) * kanvas.width) / rect.width;
    const dyKan = ((e.clientY - mulaiSeret.y) * kanvas.height) / rect.height;
    const keadaan = panelTerpilih();
    keadaan.ox = batasi(mulaiSeret.ox + dxKan / (panel.w * kanvas.width), -0.5, 0.5);
    keadaan.oy = batasi(mulaiSeret.oy + dyKan / (panel.h * kanvas.height), -0.5, 0.5);
    gambarUlang();
    zoomSlider.value = String(keadaan.zoom);
    panXSlider.value = String(keadaan.ox);
    panYSlider.value = String(keadaan.oy);
  });
  const akhiriSeret = () => {
    mulaiSeret = null;
  };
  kanvas.addEventListener('pointerup', akhiriSeret);
  kanvas.addEventListener('pointercancel', akhiriSeret);
  kanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = panelTerpilih();
    panel.zoom = batasi(panel.zoom * (e.deltaY < 0 ? 1.08 : 0.925), 1, 3);
    gambarUlang();
    zoomSlider.value = String(panel.zoom);
  }, { passive: false });
}

/** Start the editor: a scene from the query, or the default cover. */
async function mulai() {
  const params = new URLSearchParams(location.search);
  if (params.get('shot')) {
    const adegan = await jalankanShot(params);
    state.layoutId = adegan.layout.id;
    state.gradeId = adegan.grade.id;
    state.title = adegan.title;
    state.subtitle = adegan.subtitle;
    state.tagline = adegan.tagline;
    state.titleStyle = adegan.titleStyle;
    state.seal = adegan.seal;
    state.grain = adegan.grain;
    state.vignette = adegan.vignette;
    state.skyline = adegan.skyline !== false;
    state.panels = adegan.panels.map((p) => ({
      photo: p.photo,
      photoId: p.photoId,
      zoom: p.zoom,
      ox: p.ox,
      oy: p.oy,
    }));
    fotoTerpilihId = adegan.panels[0] && adegan.panels[0].photoId ? adegan.panels[0].photoId : 'hero';
  } else {
    await muatFont();
    const fotoAwal = ['hero', 'driver', 'street'];
    const layout = cariLayout('hero-split');
    state.panels = [];
    for (let i = 0; i < layout.panels.length; i++) {
      const id = fotoAwal[i % fotoAwal.length];
      state.panels.push({
        photo: await muatFotoSampel(id),
        photoId: id,
        zoom: 1,
        ox: 0,
        oy: 0,
      });
    }
  }
  bangunKontrol();
  bangunTray();
  sinkronKontrol();
  gambarUlang();
  window.__shotReady = true;
}

mulai().catch((err) => {
  console.error(err);
  setStatus(`Gagal memuat: ${err.message}`);
});
