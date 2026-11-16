/* Shared pre-game clock for TPV host and spectator. No scene change at 1:00. */
window.createTpvCountdown = function (socket) {
  "use strict";
  const $ = id => document.getElementById(id);
  const stage = $("tpv-countdown-stage");
  const hostTime = $("tpv-wait-host-time");
  let revision = -1;
  let deadline = 0;
  let running = false;
  let ticker = null;
  let finishTimer = null;
  let sequence = 0;
  let lastReply = 0;
  const pending = new Map();

  function clearTimers() {
    clearInterval(ticker);
    clearTimeout(finishTimer);
    ticker = finishTimer = null;
  }
  function hide() {
    running = false;
    clearTimers();
    if (stage) stage.hidden = true;
    if (hostTime) hostTime.textContent = "—";
  }
  function render() {
    const seconds = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
    const text = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    if (stage) stage.hidden = false;
    if ($("tpv-countdown-time")) $("tpv-countdown-time").textContent = text;
    if ($("tpv-countdown-status")) {
      $("tpv-countdown-status").textContent = seconds ? "ДО НАЧАЛА ИГРЫ" : "ИГРА НАЧИНАЕТСЯ!";
    }
    if (hostTime) hostTime.textContent = text;
    if (!seconds && running) {
      running = false;
      clearInterval(ticker);
      ticker = null;
      finishTimer = setTimeout(hide, 1700);
    }
  }
  function sync() {
    if (!socket.connected) return;
    const id = ++sequence;
    pending.set(id, performance.now());
    for (const key of pending.keys()) if (key < id - 5) pending.delete(key);
    socket.emit("tpv_wait_sync", {request_id: id});
  }
  socket.on("tpv_wait_state", data => {
    if (!data || !Number.isFinite(data.revision) || !Number.isFinite(data.remaining_ms)) return;
    const sent = pending.get(data.request_id);
    pending.delete(data.request_id);
    if (data.revision < revision) return;
    if (data.revision === revision && data.request_id && data.request_id < lastReply) return;
    const newer = data.revision > revision;
    if (newer) lastReply = 0;
    revision = data.revision;
    if (data.request_id) lastReply = data.request_id;
    if (!data.active) {
      // Keep the brief 0:00 finish if a sync reply arrives just after expiry.
      if (newer || !finishTimer) hide();
      return;
    }
    const latency = sent === undefined ? 0 : Math.max(0, (performance.now() - sent) / 2);
    clearTimers();
    deadline = performance.now() + Math.max(0, data.remaining_ms - latency);
    running = true;
    ticker = setInterval(render, 100);
    render();
  });
  socket.on("connect", () => { revision = -1; lastReply = 0; pending.clear(); sync(); });
  socket.on("room:joined", sync);
  // Page reload, reconnect, or returning from a suspended background tab.
  document.addEventListener("visibilitychange", () => { if (!document.hidden) sync(); });
  setInterval(sync, 15000);
  $("tpv-wait-long")?.addEventListener("click", () => {playAudio("tpv_4_20.ogg",false); socket.emit("tpv_wait_start", {seconds: 261})});
  $("tpv-wait-stop")?.addEventListener("click", () => {stop_current_sound();socket.emit("tpv_wait_stop")});
  return {hide};
};
