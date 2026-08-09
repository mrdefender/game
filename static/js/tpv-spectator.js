(() => {
"use strict";

const $ = id => document.getElementById(id);
const fmt = value => (Number(value) || 0).toLocaleString("ru-RU");
const baseMoney = [10000, 25000, 50000, 150000, 500000];

let state = {
  timer: 240,
  circle: 1,
  round: 1,
  bank: 0,
  currentMoney: 0,
  question: 1,
  correct: 0,
  flips: 3,
  pass: 0
};

let replacementTopic = "—";
let previousRound = 1;
let scanTimer = null;
let scanIndex = 0;
let selectionPlayers = [];
let awardTimer = null;

function normalize(payload) {
  if (Array.isArray(payload)) {
    return {
      timer: payload[0],
      circle: payload[1],
      round: payload[2],
      bank: payload[3],
      currentMoney: payload[4],
      question: payload[5],
      correct: payload[6],
      flips: payload[7],
      pass: payload[8]
    };
  }
  return payload && typeof payload === "object" ? payload : {};
}

function formatTime(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}






function flash(element) {
  if (!element) return;
  element.classList.remove("flash");
  void element.offsetWidth;
  element.classList.add("flash");
}

function setOnline(online) {
  $("socket-status")?.classList.toggle("online", online);
  if ($("socket-status-text")) {
    $("socket-status-text").textContent = online ? "Подключено" : "Отключено";
  }
}

function showGame() {
  $("waiting-screen").hidden = true;
  $("selection-stage").hidden = true;
  $("game-layout").hidden = false;

  const roomCard = $("room-card");
  const header = document.querySelector(".game-header");
  if (roomCard && header && roomCard.parentElement !== header) {
    header.insertBefore(roomCard, $("socket-status"));
  }
}

function resetAnswerIndicators() {
  for (let index = 1; index <= 5; index += 1) {
    const indicator = $(`correct-indicator-${index}`);
    if (!indicator) continue;
    indicator.classList.remove("correct", "wrong", "pass");
    indicator.textContent = index <= state.round ? "В" : "";
  }
}

function renderIndicators() {
  resetAnswerIndicators();

  for (let index = 1; index <= Math.min(5, Number(state.correct) || 0); index += 1) {
    $(`correct-indicator-${index}`)?.classList.add("correct");
  }

  for (let offset = 0; offset < Math.min(4, Number(state.pass) || 0); offset += 1) {
    const index = 5 - offset;
    if (index > Number(state.correct || 0)) {
      const indicator = $(`correct-indicator-${index}`);
      if (indicator) {
        indicator.textContent = "—";
        indicator.classList.add("pass");
      }
    }
  }

  for (let index = 1; index <= 3; index += 1) {
    const indicator = $(`flip-indicator-${index}`);
    if (!indicator) continue;
    const used = index <= 3 - Math.max(0, Number(state.flips) || 0);
    indicator.classList.toggle("used", used);
    indicator.textContent = used ? "×" : "→";
  }

  const remainingFlips = Math.max(0, Math.min(3, Number(state.flips) || 0));
  for (let index = 1; index <= 3; index += 1) {
    const orb = $(`replacement-orb-${index}`);
    if (!orb) continue;
    const isUsed = index > remainingFlips;
    orb.classList.toggle("is-used", isUsed);
    orb.textContent = isUsed ? "×" : "→";
  }
}

function renderTree() {
  const circle = Math.max(1, Number(state.circle) || 1);
  const round = Math.max(1, Math.min(5, Number(state.round) || 1));

  for (let index = 1; index <= 5; index += 1) {
    const row = $(`money-round-${index}`);
    if (!row) continue;

    row.querySelector("strong").textContent = fmt(baseMoney[index - 1] * circle);
    row.classList.toggle("passed", index < round);
    row.classList.toggle("is-active", index === round);
    row.setAttribute("aria-current", index === round ? "step" : "false");
  }
}

function renderState(payload) {
  const incoming = normalize(payload);
  const incomingRound = Math.max(1, Number(incoming.round ?? state.round) || 1);

  if (incomingRound !== previousRound) {
    state.correct = 0;
    state.pass = 0;
  }

  state = {...state, ...incoming, round: incomingRound};
  previousRound = incomingRound;

  $("display-time").textContent = formatTime(state.timer);
  $("display-current-money").textContent = fmt(state.currentMoney);
  $("display-bank").textContent = fmt(state.bank);
  $("bank-stat").hidden = (Number(state.bank) || 0) <= 0;
  $("display-replacement-topic").textContent = replacementTopic || "-";

  renderTree();
  renderIndicators();
}

function showRoom(data) {
  const room = String(data?.room ?? "----");
  const url = String(`https://games.mokaque-t.ru`);

  $("room-code").textContent = room;
  $("room-url").textContent = url;

  const box = $("room-qr");
  if (box && !box.dataset.value || box?.dataset.value !== url) {
    box.innerHTML = "";
    box.dataset.value = url;

    if (typeof window.QRCode === "function") {
      new QRCode(box, {
        text: url,
        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }

  $("room-card").hidden = false;
}

function hideRoom() {
  $("room-card").hidden = true;
}

function versusReaction() {
  const logo = $("versus-logo");


  // Реакция должна быть видна даже если spectator уже находился
  // на другом экране.
  $("game-layout").hidden = true;
  $("selection-stage").hidden = true;
  $("waiting-screen").hidden = false;

  if (!logo) {
    showGame();
    return;
  }

  logo.classList.remove("is-reacting");
  void logo.offsetWidth;
  logo.classList.add("is-reacting");
  document.getElementById("vs-player").innerHTML = " "+document.getElementById("current-player").innerHTML
 //logo.innerHTML = logo.innerHTML + document.getElementById("vs-player").innerHTML;
  setTimeout(() => {
    logo.classList.remove("is-reacting");
    showGame();
  },4000);
}

function startSelection(data) {
  clearInterval(scanTimer);
  selectionPlayers = (data?.players || []).filter(Boolean);
  scanIndex = 0;

  $("players-list").innerHTML =
    selectionPlayers.map(name => `<span>${name}</span>`).join("");

  $("waiting-screen").hidden = true;
  $("game-layout").hidden = true;
  $("selection-stage").hidden = false;

  const roomCard = $("room-card");
  const root = $("tpv-spectator");
  if (roomCard && root && roomCard.parentElement !== root) {
    root.insertBefore(roomCard, root.firstChild);
  }

  const field = $("selection-name");
  field.className = "selection-name is-scanning";

  if (!selectionPlayers.length) {
    field.textContent = "НЕТ ИГРОКОВ";
    return;
  }

  field.textContent = selectionPlayers[0];
  scanTimer = setInterval(() => {
    scanIndex = (scanIndex + 1) % selectionPlayers.length;
    field.textContent = selectionPlayers[scanIndex];
  }, 130);
}

function finishSelection(data) {
  clearInterval(scanTimer);

  const name = data?.player || "—";
  replacementTopic = data?.topic || replacementTopic || "—";

  $("selection-name").textContent = name;
  $("selection-name").className = "selection-name is-selected";
  $("current-player").textContent = name;

  if (data?.currentMoney !== undefined) {
    state.currentMoney = Number(data.currentMoney) || 0;
  }

  renderState(state);
  setTimeout(showGame, 1700);
}

function showQuestion(payload) {
  const data = Array.isArray(payload)
    ? {question: payload[0], author: payload[3]}
    : (payload || {});

  if (data.replacementTopic) replacementTopic = data.replacementTopic;

  showGame();
  $("section-bong-game").hidden = true;
  $("section-metrics").hidden = false;
  $("section-timer").hidden = false;
  $("round-stage").hidden = false;
  $("money-tree").hidden = true;
  $("section-question").hidden = false;

  $("question-text").textContent = data.question || "";
  $("question-author").textContent = data.author || "— Автор вопроса —";
  $("num_question").textContent =
    data.replacement ? "↻" : `В.${Number(data.questionNumber) || Number(state.question) || 1}`;

  renderState(state);
  flash($("section-question"));
}

function showCorrect(payload) {
  const data = payload && typeof payload === "object"
    ? payload
    : {answer: payload};

  const index = Math.max(
    1,
    Math.min(5, Number(data.correctCount) || Number(state.correct) + 1)
  );

  state.correct = index;
  if (data.state) state = {...state, ...normalize(data.state)};

  $("question-text").textContent = data.answer || "";
  $("num_question").textContent =
    `О.${Number(data.questionNumber) || Number(state.question) || 1}`;

  renderIndicators();
  $(`correct-indicator-${index}`)?.classList.add("correct");
  flash($("section-question"));

  if (data.roundFinished === true) {
    setTimeout(() => {
      $("section-question").hidden = true;
      $("section-metrics").hidden = true;
      $("money-tree").hidden = true;
      $("section-timer").hidden = true;
    }, 3200);
  }
}

function showWrong(payload) {
  const data = payload && typeof payload === "object"
    ? payload
    : {answer: payload};

  if (data.state) state = {...state, ...normalize(data.state)};

  const index = Math.max(
    1,
    Math.min(5, Number(data.wrongIndex) || Number(state.correct) + 1)
  );

  $("question-text").textContent = data.answer || "";
  $("num_question").textContent =
    `О.${Number(data.questionNumber) || Number(state.question) || 1}`;

  renderIndicators();
  const indicator = $(`correct-indicator-${index}`);
  if (indicator) {
    indicator.textContent = "В";
    indicator.classList.remove("correct", "pass");
    indicator.classList.add("wrong");
  }

  flash($("section-question"));

  setTimeout(() => {
    $("section-question").hidden = true;
    $("section-timer").hidden = true;
  }, 2800);
}

function showPass(payload) {
  const data = payload && typeof payload === "object"
    ? payload
    : {answer: payload};

  if (data.state) {
    state = {...state, ...normalize(data.state)};
  } else {
    state.pass = Math.min(4, Number(data.passCount) || Number(state.pass) + 1);
  }

  $("question-text").textContent = data.answer || "";
  $("num_question").textContent =
    `О.${Number(data.questionNumber) || Number(state.question) || 1}`;

  renderIndicators();
  flash($("section-question"));
}

function showFlip(payload) {
  const data = payload && typeof payload === "object"
    ? payload
    : {answer: payload};

  if (data.state) {
    state = {...state, ...normalize(data.state)};
  } else {
    state.flips = Math.max(0, Number(state.flips) - 1);
  }

  $("question-text").textContent = data.answer || "";
  $("num_question").textContent = "↻";

  renderState(state);
  flash($("section-question"));
}

function bongPrepare(data) {
  showGame();
  $("section-metrics").hidden = true;
  $("round-stage").hidden = true;
  $("section-bong-game").hidden = false;
  $("section-bong-game").classList.remove("bong");

  $("bong-current-sum").textContent = fmt(data?.currentMoney);
  $("bong-question-author").textContent =
    data?.author || "— Автор вопроса —";
  $("bong-status").textContent = "ВЫБЕРИТЕ ВАРИАНТ";

  for (let index = 1; index <= 3; index += 1) {
    $(`bong-variable-${index}`)?.classList.remove("selected");
  }
}

function bongSelected(data) {
  for (let index = 1; index <= 3; index += 1) {
    $(`bong-variable-${index}`)?.classList.toggle(
      "selected",
      index === Number(data?.option)
    );
  }

  $("bong-current-sum").textContent = "0";
  $("bong-status").textContent = "ИГРА ИДЁТ";
}

function bongValue(data) {
  const value = data?.value ?? data;
  const isBong = ["BONG", "ГОНГ"].includes(String(value).toUpperCase());

  $("bong-current-sum").textContent = isBong ? "ГОНГ" : fmt(value);
  $("section-bong-game").classList.toggle("bong", isBong);
}

function bongResult(data) {
  bongValue(data);
  $("bong-status").textContent =
    data?.status === "bong" ? "ГОНГ" :
    data?.status === "winner" ? "ВЫИГРЫШ" :
    "ОСТАНОВЛЕНО";
}

function showAward(data, type) {
  clearTimeout(awardTimer);

  $("award-caption").textContent =
    type === "player" ? "ВЫИГРЫШ ИГРОКА" : "ВЫИГРЫШ АВТОРА";
  $("award-name").textContent =
    data?.player || data?.author || data?.name || "—";
  $("award-sum").textContent = fmt(data?.amount ?? data?.sum);
  $("award-overlay").hidden = false;

  awardTimer = setTimeout(() => {
    $("award-overlay").hidden = true;
  }, 6500);
}

function reset() {
    hide_credits();
const resultsOverlay =
    document.getElementById("results-overlay");

const resultsList =
    document.getElementById("results-list");

if (resultsOverlay) {
    resultsOverlay.hidden = true;
}

if (resultsList) {
    resultsList.replaceChildren();
}
  clearInterval(scanTimer);
  clearTimeout(awardTimer);

  replacementTopic = "—";
  previousRound = 1;
  state = {
    timer: 240,
    circle: 1,
    round: 1,
    bank: 0,
    currentMoney: 0,
    question: 1,
    correct: 0,
    flips: 3,
    pass: 0
  };

  const roomCard = $("room-card");
  const root = $("tpv-spectator");
  if (roomCard && root && roomCard.parentElement !== root) {
    root.insertBefore(roomCard, root.firstChild);
  }

  $("waiting-screen").hidden = true;
  $("selection-stage").hidden = true;
  $("game-layout").hidden = true;
  $("award-overlay").hidden = true;
  $("section-question").hidden = true;
  $("section-bong-game").hidden = true;
  $("section-metrics").hidden = true;
  $("round-stage").hidden = true;
  $("money-tree").hidden = true;

  renderState(state);
}

const socket = io();

socket.on("connect", () => {
  setOnline(true);
  socket.emit("room:join_tpv", {
    room: "99999999",
    role: "spectator",
    username: "tpv-screen"
  });
  socket.emit("tpv_spectator_ready");
});

socket.on("disconnect", () => setOnline(false));
socket.on("connect_error", () => setOnline(false));

function onBoth(specEvent, legacyEvent, handler) {
  socket.on(specEvent, handler);
  if (legacyEvent && legacyEvent !== specEvent) socket.on(legacyEvent, handler);
}

onBoth("room_code_show", null, showRoom);
onBoth("room_code_hide", null, hideRoom);
onBoth("tpv_versus_spec", "tpv_versus_user", versusReaction);
socket.on("tpv_versus", versusReaction);
onBoth("tpv_spectator_select_start", null, startSelection);
onBoth("tpv_spectator_player_selected", null, finishSelection);

onBoth("update_data_spec", "update_data_user", renderState);
onBoth("show_stats_spec", "show_stats_user", () => {
  showGame();
  $("section-metrics").hidden = false;
  $("section-timer").hidden = false;
});
onBoth("hide_stats_spec", "hide_stats_user", () => {
  $("section-metrics").hidden = true;
  $("section-timer").hidden = true;
});
onBoth("show_tree_spec", "show_tree_user", () => {
  showGame();
  $("round-stage").hidden = false;
  $("money-tree").hidden = false;
});
onBoth("hide_tree_spec", "hide_tree_user", () => {
  $("money-tree").hidden = true;
});

onBoth("question_selected_spec", "question_selected_user", showQuestion);
onBoth("tpv_correct_spec", "tpv_correct_user", showCorrect);
onBoth("tpv_wrong_spec", "tpv_wrong_user", showWrong);
onBoth("tpv_pass_spec", "tpv_pass_user", showPass);
onBoth("tpv_flip_spec", "tpv_flip_user", showFlip);

onBoth("tpv_bong_prepare_spec", "tpv_bong_prepare_user", bongPrepare);
onBoth("tpv_bong_selected_spec", "tpv_bong_selected_user", bongSelected);
onBoth("tpv_bong_value_spec", "tpv_bong_value_user", bongValue);
onBoth("tpv_bong_stop_ack_spec", "tpv_bong_stop_ack_user", () => {
  $("bong-status").textContent = "ОСТАНОВЛЕНО";
});
onBoth("tpv_bong_result_spec", "tpv_bong_result_user", bongResult);
onBoth("tpv_bong_hide_spec", "tpv_bong_hide_user", () => {
  $("section-bong-game").hidden = true;
  $("section-metrics").hidden = false;
  $("round-stage").hidden = false;
});

socket.on("tpv_author_win_user", data => showAward(data, "author"));
socket.on("tpv_player_win_user", data => showAward(data, "player"));

socket.on("show_results_tpv", data => {
    console.log("show_results_tpv:", data);

    const overlay = document.getElementById("results-overlay");
    const list = document.getElementById("results-list");

    if (!overlay || !list) {
        console.error("Не найден results-overlay или results-list");
        return;
    }

    // Удаляем результаты предыдущего вызова события.
    list.replaceChildren();

    const results = Array.isArray(data) ? data : [];

    results.forEach((item, index) => {
        const name = Array.isArray(item)
            ? item[0]
            : item?.name;

        const score = Array.isArray(item)
            ? item[1]
            : item?.score;

        const row = document.createElement("div");

        row.className = "result-row";
        row.style.animationDelay = `${index * 90}ms`;

        if (index === 0) {
            row.classList.add("result-top1");
        }

        const placeElement = document.createElement("span");
        placeElement.className = "result-place";
        placeElement.textContent = `${index + 1}.`;

        const nameElement = document.createElement("span");
        nameElement.className = "result-name";
        nameElement.textContent = String(name ?? "—");

        const scoreElement = document.createElement("span");
        scoreElement.className = "result-score";
        scoreElement.textContent =
            Number(score ?? 0).toLocaleString("ru-RU");

        row.append(
            placeElement,
            nameElement,
            scoreElement
        );

        list.appendChild(row);
    });

    // Прячем остальные полноэкранные режимы.
    document.getElementById("waiting-screen").hidden = true;
    document.getElementById("selection-stage").hidden = true;
    document.getElementById("game-layout").hidden = true;
    document.getElementById("award-overlay").hidden = true;

    overlay.hidden = false;
});

function show_credits_tpv(data){
    const overlay = document.getElementById("credits-overlay");
  const roll = overlay?.querySelector(".credits-roll");
  const title = document.getElementById("credits-title");
  const linesBox = document.getElementById("credits-lines");

  if (!overlay || !roll || !title || !linesBox) return;

  title.innerText = data.title || "Спасибо за игру!";

  const lines = Array.isArray(data.lines) ? data.lines : [];

  linesBox.innerHTML = lines
    .map(line => `<div class="credits-line">${line}</div>`)
    .join("");

  overlay.classList.remove("is-visible", "is-hiding");
  document.body.classList.remove("credits-mode");

  roll.style.animation = "none";
  roll.style.transform = "translateY(0)";

  void roll.offsetWidth;

  roll.style.animation = "";

  overlay.classList.add("is-visible");
  document.body.classList.add("credits-mode");
}
socket.on("show_credits_tpv", (data) => {

    setTimeout(() => {
    show_credits_tpv(data);
  }, 4000);
   

});
function hide_credits(){
  const overlay = document.getElementById("credits-overlay");
  const roll = overlay?.querySelector(".credits-roll");

  if (!overlay || !roll) return;

  overlay.classList.add("is-hiding");

  setTimeout(() => {
    overlay.classList.remove("is-visible", "is-hiding");
    document.body.classList.remove("credits-mode");

    roll.style.animation = "none";
    roll.style.transform = "translateY(0)";

    void roll.offsetWidth;

    roll.style.animation = "";
  }, 700);
}




socket.on("hide_credits", () => {
    hide_credits();
});

socket.on("reset", reset);
socket.on("start_intro", () => {
    console.log("intro");
    start_video();
});


const overlay =
    document.getElementById("videoOverlay");

const video =
    document.getElementById("gameVideo");


async function playVideo(file){

    overlay.classList.add("show");

    video.src="/sounds/tpv/"+file;

    video.currentTime=0;

    await video.play();

    if(document.fullscreenElement==null){

        overlay.requestFullscreen();

    }

}


video.onended=async ()=>{

    overlay.classList.remove("show");

    video.src="";

    if(document.fullscreenElement){

      await document.exitFullscreen();

    }

}


function start_video()
{
	playVideo("tpv.mp4");
}

reset();



})();
