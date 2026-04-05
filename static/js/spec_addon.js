(function () {
  const ids = Array.from({ length: 15 }, (_, i) => 'o' + (i + 1));
  const treeIds = ['c1','c2','c3','c4','c5','c6','c7','c8','c9'];

  function norm(color) {
    return String(color || '').replace(/\s+/g, '').toLowerCase();
  }
  function isNavi(color) {
    const c = norm(color);
    return c === '#d905ec' || c === 'rgb(217,5,236)' || c === 'rgb(217, 5, 236)' || c === 'magenta';
  }
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function moveResultsIntoPanel() {
    const stack = document.getElementById('spec-results-stack');
    if (!stack) return;
    Array.from(document.body.children).forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.classList.contains('result_otbor') || node.classList.contains('timer')) {
        if (node.parentElement !== stack) stack.appendChild(node);
      }
    });
  }

  function updateTree() {
    treeIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('active-step','safe-step');
      const bg = norm(el.style.backgroundColor || getComputedStyle(el).backgroundColor);
      const color = norm(el.style.color || getComputedStyle(el).color);
      if (bg === 'orange' || bg === 'rgb(255,165,0)' || bg === 'rgb(255, 165, 0)') el.classList.add('active-step');
      if (color === 'white' || color === 'rgb(255,255,255)' || color === 'rgb(255, 255, 255)' || id === 'c9') el.classList.add('safe-step');
    });
  }

  function parseButtonStates(el) {
    const c = norm(el.style.backgroundColor || getComputedStyle(el).backgroundColor);
    const cls = el.classList;
    return {
      player: c === 'orange' || c === 'rgb(255,165,0)' || c === 'rgb(255, 165, 0)',
      right: cls.contains('right') || c === 'green' || c === 'rgb(0,128,0)' || c === 'rgb(0, 128, 0)',
      fatal: cls.contains('wrong') || c === 'red' || c === 'rgb(255,0,0)' || c === 'rgb(255, 0, 0)',
      navi: isNavi(c),
    };
  }

  function updateHintState(buttons) {
    const ex2 = document.getElementById('ex2')?.value || '0';
    const p5050 = document.getElementById('p50_50');
    const palter = document.getElementById('palter');
    const help5050 = document.getElementById('help-result-5050');
    const helpAlter = document.getElementById('help-result-alter');

    const off = buttons.filter((b) => b.disabled && !b.hidden);
    const on = buttons.filter((b) => !b.disabled && !b.hidden);

    buttons.forEach((b) => {
      b.classList.remove('spec-5050-off', 'spec-alter-on');
    });

    p5050?.classList.toggle('spec-5050-active', ex2 === '50:50');
    palter?.classList.toggle('spec-alter-active', ex2 === 'alter');

    if (ex2 === '50:50') {
      off.forEach((b) => b.classList.add('spec-5050-off'));
      setText('ui-help-5050', off.length ? 'Исключены варианты: ' + off.map((b) => b.value).join(', ') : 'Подсказка применена');
      help5050?.classList.add('is-active-5050');
    } else {
      setText('ui-help-5050', 'Не применялась');
      help5050?.classList.remove('is-active-5050');
    }

    if (ex2 === 'alter') {
      on.forEach((b) => b.classList.add('spec-alter-on'));
      setText('ui-help-alter', on.length ? 'Оставлены варианты: ' + on.map((b) => b.value).join(', ') : 'Подсказка применена');
      helpAlter?.classList.add('is-active-alter');
    } else {
      setText('ui-help-alter', 'Не применялась');
      helpAlter?.classList.remove('is-active-alter');
    }

    return ex2;
  }

  function applyBlink(el, type) {
    el.classList.remove('spec-blink-right', 'spec-blink-fatal');
    el.style.animation = '';
    if (type === 'right') {
      el.classList.add('spec-blink-right');
      el.style.animation = 'specBlinkRightFinal 1s linear infinite';
    } else if (type === 'fatal') {
      el.classList.add('spec-blink-fatal');
      el.style.animation = 'specBlinkFatalFinal 1s linear infinite';
    }
  }

  function update() {
    const buttons = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const q = document.getElementById('question');
    if (q && q.textContent.trim()) q.hidden = false;

    moveResultsIntoPanel();
    updateTree();
    const ex2 = updateHintState(buttons);

    const player = [], right = [], fatal = [], navi = [];
    buttons.forEach((el) => {
      const state = parseButtonStates(el);
      el.classList.remove('spec-player', 'spec-right', 'spec-fatal', 'spec-navi');
      el.classList.remove('spec-blink-right', 'spec-blink-fatal');
      el.style.animation = '';

      if (state.player) {
        player.push(el.value);
        el.classList.add('spec-player');
      }
      if (state.navi) {
        navi.push(el.value);
        el.classList.add('spec-navi');
      }
      if (state.right) {
        right.push(el.value);
        el.classList.add('spec-right');
      }
      if (state.fatal) {
        fatal.push(el.value);
        el.classList.add('spec-fatal');
      }

      // priority after alternative
      if (state.right) applyBlink(el, 'right');
      else if (state.fatal) applyBlink(el, 'fatal');
    });

    document.getElementById('pnavi')?.classList.toggle('spec-navi-active', navi.length > 0);

    setText('ui-spec-player', player.length ? player.join(', ') : '—');
    setText('ui-spec-right', right.length ? right.join(', ') : '—');
    setText('ui-spec-fatal', fatal.length ? fatal.join(', ') : '—');
    setText('ui-spec-navi', navi.length ? navi.join(', ') : '—');
  }

  function start() {
    update();
    setInterval(update, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();