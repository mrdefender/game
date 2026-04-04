
(function () {
  const hostIds = Array.from({ length: 15 }, (_, i) => 'btn' + (i + 1));
  const playerIds = Array.from({ length: 15 }, (_, i) => 'o' + (i + 1));
  let lastSignature = '';

  function normalizeColor(color) {
    return String(color || '').replace(/\s+/g, '').toLowerCase();
  }

  function isNavigatorColor(color) {
    const c = normalizeColor(color);
    return c === '#d905ec' || c === 'rgb(217,5,236)' || c === 'rgb(217, 5, 236)' || c === 'magenta';
  }

  function collect(ids) {
    const arr = [];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const color = el.style.backgroundColor || getComputedStyle(el).backgroundColor;
      const isNavi = isNavigatorColor(color);
      el.classList.toggle('is-navi', isNavi);
      if (isNavi) arr.push(el.value || id.replace(/[^\d]/g, ''));
    }
    return arr;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function update() {
    const host = collect(hostIds);
    const player = collect(playerIds);
    const sig = host.join(',') + '|' + player.join(',');
    if (sig === lastSignature) return;
    lastSignature = sig;
    setText('ui-host-navi-result', host.length ? host.join(', ') : '—');
    setText('ui-host-player-navi-result', player.length ? player.join(', ') : '—');
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
