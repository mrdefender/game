/**
 * FULL SHOW EFFECT helper
 * Safe utility: adds cinematic activation to existing help buttons.
 *
 * Usage:
 *   showHelpActivate("pnavi");
 *   showHelpDeactivate("pnavi");
 */
function showHelpActivate(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add("is-active");
  el.classList.add("show-flash-once");
  setTimeout(() => el.classList.remove("show-flash-once"), 550);
}

function showHelpDeactivate(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove("is-active");
  el.classList.remove("show-flash-once");
}
