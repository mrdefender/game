
/**
 * Показывает результат применения подсказки Навигатор на пульте игрока.
 * Ничего не меняет в основной логике: только считывает magenta-подсветку ответов.
 */
(function () {
  const ids = Array.from({ length: 15 }, (_, i) => 'o' + (i + 1));

  function normalizeColor(color) {
    return String(color || '').replace(/\s+/g, '').toLowerCase();
  }

  function isNavigatorColor(color) {
    const c = normalizeColor(color);
    return c === '#d905ec' || c === 'rgb(217,5,236)' || c === 'rgb(217, 5, 236)' || c === 'magenta';
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) { el.textContent = value; el.classList.toggle('has-result', value !== '—'); }
  }

  function update() {
    const values = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const color = el.style.backgroundColor || getComputedStyle(el).backgroundColor;
      const active = isNavigatorColor(color);
      el.classList.toggle('is-navi-result', active);
      if (active) values.push(el.value || id.replace('o', ''));
    });

    setText('ui-player-navi-result', values.length ? values.join(', ') : '—');
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
