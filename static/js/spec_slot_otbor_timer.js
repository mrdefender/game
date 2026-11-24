(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const panel = $('slot-otbor-timer');
  const auWrap = document.querySelector('.au-wrap');
  if (!panel || !auWrap || typeof update_list_user !== 'function') return;
  const original = update_list_user;
  let phase = 'idle', duration = 20, deadline = 0, interval = null;
  function stop() { clearInterval(interval); interval = null; }
  function render(seconds, fraction, label) {
    $('slot-otbor-time').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    $('slot-otbor-fill').style.width = `${Math.max(0, Math.min(1, fraction)) * 100}%`;
    $('slot-otbor-status').textContent = label;
    panel.classList.toggle('is-danger', phase === 'running' && seconds <= 5);
    panel.classList.toggle('is-complete', phase === 'finished');
    panel.hidden = false;
    auWrap.classList.add('slot-otbor-suppressed');
  }
  function hide() { stop(); phase = 'idle'; panel.hidden = true; auWrap.classList.remove('slot-otbor-suppressed'); }
  function finish() { stop(); phase = 'finished'; render(0, 0, 'Время вышло'); }
  function tick() {
    const left = Math.max(0, deadline - performance.now());
    if (!left) { finish(); return; }
    render(Math.ceil(left / 1000), left / (duration * 1000), 'Осталось времени');
  }
  // The existing socket callback resolves update_list_user at call time.
  // Preserve all other game phases and prevent the old au countdown from starting.
  update_list_user = function (data) {
    const action = Array.isArray(data) ? data[0] : data;
    if (action === 'warning otbor') {
      if (phase === 'idle') {
        phase = 'ready'; duration = 20;
        render(duration, 1, 'Приготовьтесь');
      }
      return;
    }
    if (action === 'start otbor') {
      if (phase === 'running' || phase === 'finished') return;
      $('ex2').value = 'start otbor';
      phase = 'running'; deadline = performance.now() + duration * 1000;
      tick(); interval = setInterval(tick, 100);
      return;
    }
    if (action === 'otbor end') finish();
    else if (['otbor', 'main', 'wait', 'fail', 'winner otbor'].includes(action) ||
      (Array.isArray(action) && ['show result', 'show total result'].includes(action[0]))) hide();
    return original.apply(this, arguments);
  };
  if (typeof socket !== 'undefined') {
    socket.on('show_winner_otbor', hide);
    socket.on('reset', hide);
    socket.on('wait_4min', hide);
    socket.on('wait_1min', hide);
  }
})();
