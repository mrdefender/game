
(function () {
  const ids = Array.from({ length: 15 }, (_, i) => 'o' + (i + 1));
  let lastSignature = '';

  function normalizeColor(color) {
    return String(color || '').replace(/\s+/g, '').toLowerCase();
  }

  function getStateFromColor(color) {
    const c = normalizeColor(color);
    if (c === 'orange' || c === 'rgb(255,165,0)') return 'player';
    if (c === 'red' || c === 'rgb(255,0,0)') return 'fatal';
    if (c === 'green' || c === 'rgb(0,128,0)') return 'right';
    if (c === 'lime' || c === 'rgb(0,255,0)' || c === 'rgb(50,205,50)') return 'action';
    return '';
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function updateStatePanels() {
    const player = [];
    const right = [];
    const fatal = [];
    const signatureParts = [];

    for (const id of ids) {
      const btn = document.getElementById(id);
      if (!btn) continue;

      const color = btn.style.backgroundColor || getComputedStyle(btn).backgroundColor;
      const state = getStateFromColor(color);
      const val = btn.value || id.replace('o', '');

      signatureParts.push(id + ':' + state + ':' + val + ':' + btn.hidden + ':' + btn.disabled);

      btn.classList.remove('is-player', 'is-right', 'is-fatal', 'is-action');

      if (state === 'player') {
        player.push(val);
        btn.classList.add('is-player');
      } else if (state === 'right') {
        right.push(val);
        btn.classList.add('is-right');
      } else if (state === 'fatal') {
        fatal.push(val);
        btn.classList.add('is-fatal');
      } else if (state === 'action') {
        btn.classList.add('is-action');
      }
    }

    const signature = signatureParts.join('|');
    if (signature === lastSignature) return;
    lastSignature = signature;

    setText('ui-player-answer', player.length ? player.join(', ') : '—');
    setText('ui-right-answer', right.length ? right.join(', ') : '—');
    setText('ui-fatal-answer', fatal.length ? fatal.join(', ') : '—');

    const q = document.getElementById('question');
    if (q && q.textContent.trim()) q.hidden = false;
  }

  function start() {
    updateStatePanels();
    setInterval(updateStatePanels, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
