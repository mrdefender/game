(() => {
  'use strict';

  const FIELD_IDS = [
    'question-text',
    'question-answer',
    'question-author',
    'question-comment'
  ];

  function initTpvTextFx() {
    const fields = FIELD_IDS.map(id => document.getElementById(id)).filter(Boolean);
    if (!fields.length) return;

    const previous = new Map(fields.map(el => [el, el.value || '']));
    const timers = new WeakMap();

    function replay(el, className) {
      el.classList.remove(className);
      void el.offsetWidth;
      el.classList.add(className);
    }

    function animate(el, before, after) {
      const box = el.closest('.ng-question');
      const oldTimer = timers.get(el);
      if (oldTimer) clearTimeout(oldTimer);

      el.classList.remove('tpv-text-enter', 'tpv-text-leave');
      if (box) box.classList.remove('tpv-field-pulse');
      void el.offsetWidth;

      replay(el, after ? 'tpv-text-enter' : 'tpv-text-leave');
      if (box) replay(box, 'tpv-field-pulse');

      timers.set(el, setTimeout(() => {
        el.classList.remove('tpv-text-enter', 'tpv-text-leave');
        if (box) box.classList.remove('tpv-field-pulse');
      }, 650));
    }

    // Direct assignment to textarea.value does not emit input/change events,
    // so watch the values used by the existing TPV host logic.
    setInterval(() => {
      for (const el of fields) {
        const before = previous.get(el) || '';
        const after = el.value || '';
        if (before !== after) {
          previous.set(el, after);
          animate(el, before, after);
        }
      }
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTpvTextFx, { once: true });
  } else {
    initTpvTextFx();
  }
})();
