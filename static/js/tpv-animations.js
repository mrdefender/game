(() => {
  "use strict";

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function byId(id) {
    return typeof id === "string" ? document.getElementById(id) : id;
  }

  function restartClass(element, className) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function onceAnimationEnd(element, fallbackMs = 700) {
    return new Promise((resolve) => {
      if (!element) return resolve();

      let completed = false;
      const finish = () => {
        if (completed) return;
        completed = true;
        element.removeEventListener("animationend", onEnd);
        resolve();
      };
      const onEnd = (event) => {
        if (event.target === element) finish();
      };

      element.addEventListener("animationend", onEnd, { once: true });
      window.setTimeout(finish, fallbackMs);
    });
  }

  async function showSection(target, animationClass = "tpv-enter") {
    const element = byId(target);
    if (!element) return;

    element.hidden = false;
    element.classList.add("tpv-animating");
    restartClass(element, animationClass);

    await onceAnimationEnd(element, 500);
    element.classList.remove(animationClass, "tpv-animating");
  }

  async function hideSection(target, animationClass = "tpv-leave") {
    const element = byId(target);
    if (!element || element.hidden) return;

    element.classList.add("tpv-animating");
    restartClass(element, animationClass);

    await onceAnimationEnd(element, 400);
    element.hidden = true;
    element.classList.remove(animationClass, "tpv-animating");
  }

  async function showQuestion() {
    const section = byId("section-question");
    if (!section) return;

    section.hidden = false;
    section.classList.remove("tpv-question-hide");
    section.classList.add("tpv-animating");
    restartClass(section, "tpv-question-show");

    await wait(650);
    section.classList.remove("tpv-question-show", "tpv-animating");
  }

  async function hideQuestion() {
    const section = byId("section-question");
    if (!section || section.hidden) return;

    section.classList.remove("tpv-question-show");
    section.classList.add("tpv-animating");
    restartClass(section, "tpv-question-hide");

    await wait(520);
    section.hidden = true;
    section.classList.remove("tpv-question-hide", "tpv-animating");
  }

  async function showTimer() {
    const timer = byId("section-timer");
    if (!timer) return;

    timer.hidden = false;
    restartClass(timer, "tpv-timer-show");
    await onceAnimationEnd(timer, 420);
    timer.classList.remove("tpv-timer-show");
  }

  async function hideTimer() {
    const timer = byId("section-timer");
    if (!timer || timer.hidden) return;

    restartClass(timer, "tpv-timer-hide");
    await onceAnimationEnd(timer, 320);
    timer.hidden = true;
    timer.classList.remove("tpv-timer-hide");
  }

  async function flipQuestion(updateCallback) {
    const main = document.querySelector("#section-question .question-main");
    if (!main) return;

    restartClass(main, "tpv-question-flip-out");
    await wait(220);

    if (typeof updateCallback === "function") await updateCallback();

    main.classList.remove("tpv-question-flip-out");
    restartClass(main, "tpv-question-flip-in");
    await wait(320);
    main.classList.remove("tpv-question-flip-in");
  }

  function correct(index = null) {
    const panel = byId("section-question");
    restartClass(panel, "tpv-correct-flash");

    if (index !== null) {
      const orb = byId(`correct-indicator-${index}`);
      if (orb) {
        orb.classList.add("is-correct");
        restartClass(orb, "tpv-orb-pop");
      }
    }
  }

function wrong(index = null) {
    const panel = byId("section-question");
    restartClass(panel, "tpv-wrong-flash");

    if (index !== null) {
        const orb = byId(`correct-indicator-${index}`);

        if (orb) {
            orb.classList.remove(
                "is-correct",
                "status-orb-correct-answer",
                "status-orb-pass"
            );

            orb.classList.add(
                "is-wrong",
                "status-orb-wrong-answer"
            );

            restartClass(orb, "tpv-orb-pop");
        }
    }
}

  function activateRound(round) {
    document.querySelectorAll(".money-row").forEach((row) => {
      row.classList.remove("is-active", "tpv-round-focus");
    });

    const row = byId(`money-round-${round}`);
    if (!row) return;

    row.classList.add("is-active");
    restartClass(row, "tpv-round-focus");
  }

  function useFlip(index) {
    const primary = byId(`flip-indicator-${index}`);
    const stats = byId(`flip-indicator-${index}_stats`);

    [primary, stats].forEach((orb) => {
      if (orb) restartClass(orb, "tpv-flip-used");
    });
  }

  function updateBank(value) {
    const output = byId("display-bank");
    if (!output) return;

    output.textContent = Number(value || 0).toLocaleString("ru-RU");
    restartClass(output, "tpv-bank-update");
  }

  function updateTimer(value) {
    const output = byId("display-time");
    if (!output) return;

    output.textContent = value;
    restartClass(output, "tpv-timer-tick");
  }

  function selectPlayer() {
    restartClass(document.querySelector(".tpv-player-header"), "tpv-player-selected");
  }

  async function showBong() {
    const section = byId("section-bong-game");
    if (!section) return;

    section.hidden = false;
    restartClass(section, "tpv-bong-show");
    await wait(500);
    section.classList.remove("tpv-bong-show");
  }

  function hitBong() {
    const section = byId("section-bong-game");
    if (!section) return;

    section.classList.add("is-bong");
    restartClass(section, "tpv-bong-hit");
  }

  async function stopBong() {
    const section = byId("section-bong-game");
    if (!section) return;

    section.classList.remove("is-bong", "tpv-bong-hit");
    restartClass(section, "tpv-bong-stop");
    await wait(350);
    section.classList.remove("tpv-bong-stop");
  }

  async function showMoneyTree() {
    const tree = byId("money-tree");
    if (!tree) {
      console.warn("Не найден элемент #money-tree");
      return;
    }

    tree.hidden = false;
    tree.classList.remove("tpv-tree-hide");
    restartClass(tree, "tpv-tree-show");

    const rows = [...tree.querySelectorAll(".money-row")];
    rows.forEach((row, index) => {
      row.style.animationDelay = `${120 + index * 85}ms`;
      restartClass(row, "tpv-tree-row-show");
    });

    await wait(120 + rows.length * 85 + 430);

    tree.classList.remove("tpv-tree-show");
    rows.forEach((row) => {
      row.classList.remove("tpv-tree-row-show");
      row.style.animationDelay = "";
    });
  }

  async function hideMoneyTree() {
    const tree = byId("money-tree");
    if (!tree || tree.hidden) return;

    const rows = [...tree.querySelectorAll(".money-row")].reverse();
    rows.forEach((row, index) => {
      row.style.animationDelay = `${index * 45}ms`;
      restartClass(row, "tpv-tree-row-hide");
    });

    await wait(rows.length * 45 + 230);
    restartClass(tree, "tpv-tree-hide");
    await wait(280);

    tree.hidden = true;
    tree.classList.remove("tpv-tree-hide");

    rows.forEach((row) => {
      row.classList.remove("tpv-tree-row-hide");
      row.style.animationDelay = "";
    });
  }

  window.TPVAnimation = Object.freeze({
    showSection,
    hideSection,
    showQuestion,
    hideQuestion,
    showTimer,
    hideTimer,
    flipQuestion,
    correct,
    wrong,
    activateRound,
    useFlip,
    updateBank,
    updateTimer,
    selectPlayer,
    showBong,
    hitBong,
    stopBong,
    showMoneyTree,
    hideMoneyTree
  });
})();
