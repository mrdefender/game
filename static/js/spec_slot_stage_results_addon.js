(function () {
  const ids = Array.from({ length: 15 }, (_, i) => 'o' + (i + 1));
  const treeIds = ['c1','c2','c3','c4','c5','c6','c7','c8','c9'];
  let lastSignature = '';

  function normalizeColor(color) {
    return String(color || '').replace(/\s+/g, '').toLowerCase();
  }

  function isNavi(color) {
    return color === '#d905ec' || color === 'rgb(217,5,236)' || color === 'rgb(217, 5, 236)' || color === 'magenta';
  }

  function stateFromButton(el) {
    const color = normalizeColor(el.style.backgroundColor || getComputedStyle(el).backgroundColor);
    const classes = el.classList || { contains: () => false };
    if (color === 'orange' || color === 'rgb(255,165,0)' || color === 'rgb(255, 165, 0)') return 'player';
    if (color === 'red' || color === 'rgb(255,0,0)' || color === 'rgb(255, 0, 0)' || classes.contains('wrong')) return 'fatal';
    if (color === 'green' || color === 'rgb(0,128,0)' || color === 'rgb(0, 128, 0)' || classes.contains('right')) return 'right';
    if (isNavi(color)) return 'navi';
    return '';
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function updateTree() {
    treeIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('active-step','safe-step');
      const bg = normalizeColor(el.style.backgroundColor || getComputedStyle(el).backgroundColor);
      const color = normalizeColor(el.style.color || getComputedStyle(el).color);
      if (bg === 'orange' || bg === 'rgb(255,165,0)' || bg === 'rgb(255, 165, 0)') el.classList.add('active-step');
      if (color === 'white' || color === 'rgb(255,255,255)' || color === 'rgb(255, 255, 255)') el.classList.add('safe-step');
    });
  }

  function moveResultsIntoPanel() {
    const stack = document.getElementById('spec-results-stack');
    if (!stack) return;

    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.classList.contains('result_otbor') || node.classList.contains('timer')) {
        if (node.parentElement !== stack) stack.appendChild(node);
      }
    });
  }

  function updateStates() {
    const player = [];
    const right = [];
    const fatal = [];
    const navi = [];
    const sig = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const state = stateFromButton(el);
      const value = el.value || id.replace('o','');
      el.classList.remove('spec-player','spec-right','spec-fatal','spec-navi');

      if (state === 'player') {
        player.push(value);
        el.classList.add('spec-player');
      } else if (state === 'right') {
        right.push(value);
        el.classList.add('spec-right');
      } else if (state === 'fatal') {
        fatal.push(value);
        el.classList.add('spec-fatal');
      } else if (state === 'navi') {
        navi.push(value);
        el.classList.add('spec-navi');
      }

      sig.push(id + ':' + state + ':' + value + ':' + el.hidden + ':' + el.disabled);
    });

    updateTree();

    const pnavi = document.getElementById('pnavi');
    if (pnavi) {
      const active = navi.length > 0 || isNavi(normalizeColor(pnavi.style.backgroundColor || getComputedStyle(pnavi).backgroundColor));
      pnavi.classList.toggle('spec-navi-active', active);
    }

    const q = document.getElementById('question');
    if (q && q.textContent.trim()) q.hidden = false;

    const nextSig = sig.join('|') + '|q:' + (q?.textContent || '') + '|n:' + navi.join(',');
    if (nextSig === lastSignature) return;
    lastSignature = nextSig;

    setText('ui-spec-player', player.length ? player.join(', ') : '—');
    setText('ui-spec-right', right.length ? right.join(', ') : '—');
    setText('ui-spec-fatal', fatal.length ? fatal.join(', ') : '—');
    setText('ui-spec-navi', navi.length ? navi.join(', ') : '—');
  }

  function start() {
    const observer = new MutationObserver(() => {
      moveResultsIntoPanel();
      updateStates();
    });
    observer.observe(document.body, { childList: true, subtree: false });

    moveResultsIntoPanel();
    updateStates();
    setInterval(() => {
      moveResultsIntoPanel();
      updateStates();
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

(function () {
  function markTopPrizeSafe() {
    const el = document.getElementById('c9');
    if (!el) return;
    el.classList.add('always-safe-step');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markTopPrizeSafe);
  } else {
    markTopPrizeSafe();
  }

  setInterval(markTopPrizeSafe, 500);
})();
