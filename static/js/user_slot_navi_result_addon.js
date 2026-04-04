
(function () {
  const ids = Array.from({ length: 15 }, (_, i) => 'o' + (i + 1));
  let lastSignature = '';

  function normalizeColor(color) {
    return String(color || '').replace(/\s+/g, '').toLowerCase();
  }

  function isNavigatorColor(color) {
    const c = normalizeColor(color);
    return c === '#d905ec' || c === 'rgb(217,5,236)' || c === 'rgb(217, 5, 236)' || c === 'magenta';
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function update() {
    const values = [];
    const sigParts = [];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const color = el.style.backgroundColor || getComputedStyle(el).backgroundColor;
      const active = isNavigatorColor(color);
      el.classList.toggle('is-navi-result', active);
      sigParts.push(id + ':' + active + ':' + (el.value || ''));
      if (active) values.push(el.value || id.replace('o', ''));
    }
    const sig = sigParts.join('|');
    if (sig === lastSignature) return;
    lastSignature = sig;
    setText('ui-player-navi-result', values.length ? values.join(', ') : '—');

    const pnavi = document.getElementById('pnavi');
    if (pnavi) pnavi.classList.toggle('is-navi-result', values.length > 0);
  }

  function start() {
    update();
    setInterval(update, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
