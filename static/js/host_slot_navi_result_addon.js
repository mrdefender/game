
/**
 * Показывает результат применения подсказки Навигатор на пульте ведущего.
 * Логика не трогает основной host_slot.js: только считывает текущую magenta-подсветку.
 */
(function () {
  const hostIds = Array.from({ length: 15 }, (_, i) => 'btn' + (i + 1));
  const playerIds = Array.from({ length: 15 }, (_, i) => 'o' + (i + 1));

  function normalizeColor(color) {
    return String(color || '').replace(/\s+/g, '').toLowerCase();
  }

  function isNavigatorColor(color) {
    const c = normalizeColor(color);
    return c === '#d905ec' || c === 'rgb(217,5,236)' || c === 'rgb(217, 5, 236)' || c === 'magenta';
  }

  function collect(ids) {
    const result = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const color = el.style.backgroundColor || getComputedStyle(el).backgroundColor;
      const active = isNavigatorColor(color);
      el.classList.toggle('is-navi-result', active);
      if (active) result.push(el.value || id.replace(/[^\d]/g, ''));
    });
    return result;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) { el.textContent = value; el.classList.toggle('has-result', value !== '—'); }
  }

  function update() {
    const hostValues = collect(hostIds);
    const playerValues = collect(playerIds);
    setText('ui-host-navi-result', hostValues.length ? hostValues.join(', ') : '—');
    setText('ui-host-player-navi-result', playerValues.length ? playerValues.join(', ') : '—');
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
