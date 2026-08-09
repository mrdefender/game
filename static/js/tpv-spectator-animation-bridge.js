(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);

  function restart(element, className) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function removeLater(element, className, delay = 700) {
    if (!element) return;
    window.setTimeout(() => element.classList.remove(className), delay);
  }

  function watchVisibility(id, showClass, duration = 700) {
    const element = byId(id);
    if (!element) return;

    let wasHidden = element.hidden;

    new MutationObserver(() => {
      const isHidden = element.hidden;

      if (wasHidden && !isHidden) {
        restart(element, showClass);
        removeLater(element, showClass, duration);
      }

      wasHidden = isHidden;
    }).observe(element, {
      attributes: true,
      attributeFilter: ["hidden"]
    });
  }

  // Same entrance classes used by tpv-user / TPVAnimation.
  watchVisibility("section-question", "tpv-question-show", 680);
  watchVisibility("section-timer", "tpv-timer-show", 450);
  watchVisibility("section-bong-game", "tpv-bong-show", 550);
  watchVisibility("selection-stage", "tpv-enter", 500);
  watchVisibility("results-overlay", "tpv-enter", 500);
  watchVisibility("award-overlay", "tpv-enter", 500);
  watchVisibility("room-card", "tpv-enter", 500);

  // Money tree: same staggered row entrance as tpv-user.
  const tree = byId("money-tree");
  if (tree) {
    let treeWasHidden = tree.hidden;

    new MutationObserver(() => {
      const hidden = tree.hidden;

      if (treeWasHidden && !hidden) {
        restart(tree, "tpv-tree-show");
        const rows = [...tree.querySelectorAll(".money-row")];

        rows.forEach((row, index) => {
          row.style.animationDelay = `${120 + index * 85}ms`;
          restart(row, "tpv-tree-row-show");
        });

        window.setTimeout(() => {
          tree.classList.remove("tpv-tree-show");
          rows.forEach((row) => {
            row.classList.remove("tpv-tree-row-show");
            row.style.animationDelay = "";
          });
        }, 1050);
      }

      treeWasHidden = hidden;
    }).observe(tree, {
      attributes: true,
      attributeFilter: ["hidden"]
    });
  }

  // Timer tick — same class as TPVAnimation.updateTimer().
  const timer = byId("display-time");
  if (timer) {
    new MutationObserver(() => {
      restart(timer, "tpv-timer-tick");
      removeLater(timer, "tpv-timer-tick", 300);
    }).observe(timer, { childList: true, characterData: true, subtree: true });
  }

  // Bank update pulse.
  const bank = byId("display-bank");
  if (bank) {
    new MutationObserver(() => {
      restart(bank, "tpv-bank-update");
      removeLater(bank, "tpv-bank-update", 420);
    }).observe(bank, { childList: true, characterData: true, subtree: true });
  }

  // Round focus — detects spectator's existing .is-active assignment.
  document.querySelectorAll("#money-tree .money-row").forEach((row) => {
    let active = row.classList.contains("is-active");

    new MutationObserver(() => {
      const nextActive = row.classList.contains("is-active");
      if (!active && nextActive) {
        restart(row, "tpv-round-focus");
        removeLater(row, "tpv-round-focus", 600);
      }
      active = nextActive;
    }).observe(row, { attributes: true, attributeFilter: ["class"] });
  });

  // Correct / wrong / pass orbs — same pop + panel flash language as player.
  document.querySelectorAll(".answer-indicators i").forEach((orb) => {
    let oldState = "";

    new MutationObserver(() => {
      const state =
        orb.classList.contains("wrong") ? "wrong" :
        orb.classList.contains("correct") ? "correct" :
        orb.classList.contains("pass") ? "pass" : "";

      if (state && state !== oldState) {
        restart(orb, "tpv-orb-pop");
        removeLater(orb, "tpv-orb-pop", 380);

        const question = byId("section-question");
        if (state === "wrong") {
          restart(question, "tpv-wrong-flash");
          removeLater(question, "tpv-wrong-flash", 720);
        } else if (state === "correct") {
          restart(question, "tpv-correct-flash");
          removeLater(question, "tpv-correct-flash", 720);
        } else {
          restart(question, "tpv-correct-flash");
          removeLater(question, "tpv-correct-flash", 720);
        }
      }

      oldState = state;
    }).observe(orb, { attributes: true, attributeFilter: ["class"] });
  });

  // Flip use pulse: primary indicators and statistic indicators.
  document.querySelectorAll(".flip-indicators i, .replacement-orbs i").forEach((orb) => {
    let used =
      orb.classList.contains("used") ||
      orb.classList.contains("is-used");

    new MutationObserver(() => {
      const nextUsed =
        orb.classList.contains("used") ||
        orb.classList.contains("is-used");

      if (!used && nextUsed) {
        restart(orb, "tpv-flip-used");
        removeLater(orb, "tpv-flip-used", 500);
      }
      used = nextUsed;
    }).observe(orb, { attributes: true, attributeFilter: ["class"] });
  });

  // Replacement question transition. Current spectator JS writes ↻ to num_question.
  const questionNumber = byId("num_question");
  if (questionNumber) {
    new MutationObserver(() => {
      if (questionNumber.textContent.trim() !== "↻") return;

      const main = document.querySelector("#section-question .question-main");
      if (!main) return;

      restart(main, "tpv-question-flip-out");

      window.setTimeout(() => {
        main.classList.remove("tpv-question-flip-out");
        restart(main, "tpv-question-flip-in");
        removeLater(main, "tpv-question-flip-in", 380);
      }, 220);
    }).observe(questionNumber, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  // Bong: show/hit/stop animations mirror TPVAnimation methods.
  const bongSection = byId("section-bong-game");
  if (bongSection) {
    let wasBong = bongSection.classList.contains("bong");

    new MutationObserver(() => {
      const isBong = bongSection.classList.contains("bong");

      if (!wasBong && isBong) {
        bongSection.classList.add("is-bong");
        restart(bongSection, "tpv-bong-hit");
        removeLater(bongSection, "tpv-bong-hit", 600);
      }

      if (wasBong && !isBong) {
        bongSection.classList.remove("is-bong");
        restart(bongSection, "tpv-bong-stop");
        removeLater(bongSection, "tpv-bong-stop", 420);
      }

      wasBong = isBong;
    }).observe(bongSection, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }
})();
