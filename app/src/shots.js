// Fixed scenes for screenshots: ?shot=editor shows the full editor with a
// demo cover loaded; ?shot=cover shows the cover alone, edge to edge, at the
// export size the `size` query picks. window.__shotReady is set once painted.

function applyQuery(query, ctx) {
  const { state, library } = ctx;
  const layout = query.get('layout');
  if (layout) state.layout = layout;
  const grade = query.get('grade');
  if (grade) state.grade = grade;
  const title = query.get('title');
  if (title !== null) {
    state.title = title;
    const titleInput = document.getElementById('title');
    if (titleInput) titleInput.value = title;
  }
  const subtitle = query.get('subtitle');
  if (subtitle !== null) {
    state.subtitle = subtitle;
    const subInput = document.getElementById('subtitle');
    if (subInput) subInput.value = subtitle;
  }
  const photos = query.get('photos');
  const ids = photos ? photos.split(',') : null;
  state.panels.forEach((slot, i) => {
    const id = ids ? ids[i % ids.length] : slot.photoId;
    const photo = library.find((p) => p.id === id);
    if (photo) {
      slot.photoId = photo.id;
      slot.photo = photo.img;
    }
  });
  const zoom = Number(query.get('zoom'));
  if (Number.isFinite(zoom) && zoom >= 1) {
    state.panels.forEach((slot) => { slot.zoom = zoom; });
  }
  if (query.get('spread') === '1') {
    // One photo across every panel: each panel shows a different slice of it.
    const n = state.panels.length;
    state.panels.forEach((slot, i) => {
      slot.ox = n > 1 ? (i - (n - 1) / 2) * 0.3 : 0;
    });
  }
}

export async function runShot(shot, query, ctx) {
  const { setSize, redraw } = ctx;
  applyQuery(query, ctx);
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    setSize(query.get('size') ?? 'square');
  } else {
    setSize(query.get('size') ?? 'square');
  }
  redraw();
  await document.fonts.ready;
  redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  redraw();
  window.__shotReady = true;
}
