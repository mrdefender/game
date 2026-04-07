/**
 * Help icon state helpers
 * Recommended:
 *   disableHelpIcon("pnavi");
 *   markHelpUsed("pnavi");
 *   resetHelpIconState("pnavi");
 *
 * Comparison style:
 *   document.getElementById("pnavi")?.classList.add("compare-strike");
 */

function disableHelpIcon(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.disabled = true;
}

function markHelpUsed(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove("is-active");
  el.classList.add("used");
  el.setAttribute("data-spent","1");
  el.disabled = true;
}

function resetHelpIconState(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.disabled = false;
  el.classList.remove("used");
  el.classList.remove("is-active");
  el.classList.remove("compare-strike");
  el.removeAttribute("data-spent");
}
