var stop_timer = true;
var roundTimerId = null;
var roundTimerStartId = null;
var safe_bong = null;
var select_bong_game = null;
var stop_bong_game_now = false;
var sum_results = 0;
var previousGameRound = null;

const tpvGame = window.TPVGame || null;
let replacementQuestionPending = false;
let bongGameActive = false;
let bongStopRequested = false;

function normalizeIncomingState(data) {
    if (tpvGame) return tpvGame.setState(data, false);
    if (Array.isArray(data)) {
        return {timer:data[0], circle:data[1], round:data[2], bank:data[3], currentMoney:data[4], question:data[5], correct:data[6], flips:data[7], pass:data[8]};
    }
    return data || {};
}

function restartCssAnimation(element, className) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
}

function flashQuestionField() {
    restartCssAnimation(document.getElementById("num_question"), "tpv-field-flash");
    restartCssAnimation(document.querySelector(".question-text-shell"), "tpv-field-flash");
}

function setQuestionMarker(mode, questionNumber) {
    const output = document.getElementById("num_question");
    if (!output) return;

    const number = Number(
        questionNumber || document.getElementById("control-question-number")?.value
    ) || 1;
    const nextText = mode === "replacement"
        ? "↻"
        : (mode === "answer" ? "О." : "В.") + number;

    if (output.textContent !== nextText) {
        output.textContent = nextText;
        flashQuestionField();
    }
}

function getCsrfToken() {
    return document
        .querySelector('meta[name="csrf-token"]')
        ?.content || "";
}

const socket = io();
function setSocketStatus(isOnline) {
  const box = document.getElementById("socket-status");
  const text = document.getElementById("socket-status-text");

  if (!box || !text) return;

  box.classList.toggle("socket-online", isOnline);
  box.classList.toggle("socket-offline", !isOnline);

  text.innerText = isOnline ? "Сервер подключён" : "Сервер отключён";
}
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  socket.emit("ping:test", {
    page: window.location.pathname
  });
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
  setSocketStatus(false);
});

socket.on("pong:test", (data) => {
  console.log("Ответ от сервера:", data);
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
setSocketStatus(true);
  socket.emit("room:join_tpv", {
    room: null,
    role: "user",
    username: document.getElementById("user_name").value
  });
});

socket.on("room:joined", (data) => {
  console.log("Joined socket room:", data);
});

socket.on("connect_error", () => {
  setSocketStatus(false);
});

socket.on("reconnect_attempt", () => {
  setSocketStatus(false);
});

socket.on("reconnect", () => {
  setSocketStatus(true);
});



document.getElementById("control-timer-seconds").addEventListener('change', function(){

   calc_timer()

}
)

function calc_timer(){
     timer_min = parseInt(document.getElementById("control-timer-seconds").value / 60);
    timer_sec = document.getElementById("control-timer-seconds").value % 60;
    if (timer_sec>=10)
    {
   document.getElementById("display-time").textContent = timer_min.toString()+":"+timer_sec.toString();
    }
     if (timer_sec<10)
     {
        document.getElementById("display-time").textContent = timer_min.toString()+":"+"0"+timer_sec.toString();
     }
}

document.getElementById("control-circle").addEventListener('change', function(){
   calc_circle();
}
)

function stopRoundTimer(){
    stop_timer = true;

    if (roundTimerStartId !== null) {
        clearTimeout(roundTimerStartId);
        roundTimerStartId = null;
    }

    if (roundTimerId !== null) {
        clearTimeout(roundTimerId);
        roundTimerId = null;
    }
}

function startRoundTimer(delayMs = 0){
    stopRoundTimer();
    stop_timer = false;

    roundTimerStartId = setTimeout(() => {
        roundTimerStartId = null;
        timer_circle_start();
    }, delayMs);
}

function timer_circle_start(){
    if (stop_timer) return;

    const timerControl = document.getElementById("control-timer-seconds");
    const seconds = Math.max(0, Number(timerControl.value) || 0);

    if (seconds <= 0) {
        stopRoundTimer();
        return;
    }

    timerControl.value = seconds - 1;
    calc_timer();
    roundTimerId = setTimeout(timer_circle_start, 1000);
}

function calc_circle(){
    sum1 = 10000*document.getElementById("control-circle").value;
    sum2 = 25000*document.getElementById("control-circle").value;
    sum3 = 50000*document.getElementById("control-circle").value;
    sum4 = 150000*document.getElementById("control-circle").value;
    sum5 = 500000*document.getElementById("control-circle").value;
    document.getElementById("money-round-1").querySelector("strong").textContent = sum1.toLocaleString("ru-RU");
    document.getElementById("money-round-2").querySelector("strong").textContent = sum2.toLocaleString("ru-RU");
    document.getElementById("money-round-3").querySelector("strong").textContent = sum3.toLocaleString("ru-RU");
    document.getElementById("money-round-4").querySelector("strong").textContent = sum4.toLocaleString("ru-RU");
    document.getElementById("money-round-5").querySelector("strong").textContent = sum5.toLocaleString("ru-RU");
}

document.getElementById("control-round").addEventListener('change', function(){
    calc_round();
    
}
)

function calc_round(){
    const control = document.getElementById("control-round");
    const round = Math.max(1, Math.min(5, Number(control?.value) || 1));

    if (control) control.value = round;

    for (let index = 1; index <= 5; index += 1) {
        const row = document.getElementById(`money-round-${index}`);
        const indicator = document.getElementById(`correct-indicator-${index}`);

        if (row) {
            row.classList.toggle("passed", index < round);
            row.classList.toggle("is-active", index === round);
            row.setAttribute("aria-current", index === round ? "step" : "false");
        }

        if (indicator) {
            indicator.textContent = index <= round ? "В" : "";
        }
    }
}


document.getElementById("control-bank").addEventListener('change', function(){
    calc_bank();
}
)

function calc_bank()
{
    bank = parseInt(document.getElementById("control-bank").value);
    document.getElementById("display-bank").value = bank.toLocaleString("ru-RU");
}

document.getElementById("control-current-money").addEventListener('change', function(){
    calc_current_money();
}
)

function calc_current_money(){
    bank = parseInt(document.getElementById("control-current-money").value);
    document.getElementById("display-current-money").value = bank.toLocaleString("ru-RU");
}


document.getElementById("control-flips-count").addEventListener('change', function(){
  calc_flip();
}
)

function setIndicatorValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
}

function calc_flip() {
    const flips = Math.max(0, Math.min(3, Number(
        document.getElementById("control-flips-count").value
    ) || 0));

    const values = flips === 3
        ? ["→", "→", "→"]
        : flips === 2
            ? ["x", "→", "→"]
            : flips === 1
                ? ["x", "x", "→"]
                : ["x", "x", "x"];

    for (let index = 1; index <= 3; index += 1) {
        setIndicatorValue(`flip-indicator-${index}`, values[index - 1]);
        setIndicatorValue(`flip-indicator-${index}_stats`, values[index - 1]);
    }
}


function resetRoundIndicators() {
    for (let index = 1; index <= 5; index += 1) {
        const indicator =
            document.getElementById(`correct-indicator-${index}`);

        if (!indicator) continue;

        indicator.classList.remove(
            "status-orb-correct-answer",
            "status-orb-wrong-answer",
            "status-orb-pass",

            // Классы из tpv-animations.js
            "is-correct",
            "is-wrong",
            "tpv-orb-pop"
        );
    }
}

function clearAnswerResultState() {
    resetRoundIndicators();

    const questionPanel = document.getElementById("section-question");
    const textShell = document.querySelector(".question-text-shell");
    [questionPanel, textShell].forEach(element => {
        if (!element) return;
        element.classList.remove(
            "tpv-answer-wrong",
            "tpv-answer-correct",
            "tpv-wrong-flash",
            "tpv-correct-flash"
        );
    });
}

function markQuestionResult(kind) {
    const questionPanel = document.getElementById("section-question");
    const textShell = document.querySelector(".question-text-shell");
    [questionPanel, textShell].forEach(element => {
        if (!element) return;
        element.classList.remove("tpv-answer-wrong", "tpv-answer-correct");
        element.classList.add(kind === "wrong" ? "tpv-answer-wrong" : "tpv-answer-correct");
    });
}

function showCorrectIndicators(value) {
    const count = Math.max(
        0,
        Math.min(5, Number(value) || 0)
    );

    for (let index = 1; index <= 5; index += 1) {
        const indicator =
            document.getElementById(`correct-indicator-${index}`);

        if (!indicator) continue;

        // Сначала полностью очищаем состояние индикатора.
        indicator.classList.remove(
            "status-orb-correct-answer",
            "status-orb-wrong-answer",
            "status-orb-pass",
            "is-correct",
            "is-wrong",
            "tpv-orb-pop"
        );

        if (index <= count) {
            indicator.classList.add(
                "status-orb-correct-answer"
            );
        }
    }
}

function showWrongIndicator(index) {
    const wrongIndex = Math.max(
        1,
        Math.min(5, Number(index) || 1)
    );

    const indicator =
        document.getElementById(`correct-indicator-${wrongIndex}`);

    if (!indicator) return;

    indicator.classList.remove(
        "status-orb-correct-answer",
        "status-orb-pass",
        "is-correct"
    );

    indicator.classList.add(
        "status-orb-wrong-answer",
        "is-wrong"
    );
}

document.getElementById("control-pass-count").addEventListener('change', function(){
   calc_pass();
}
)

function calc_pass() {
    const passCount = Math.max(0, Math.min(4, Number(
        document.getElementById("control-pass-count").value
    ) || 0));

    const indicators = [2, 3, 4, 5].map(index =>
        document.getElementById(`correct-indicator-${index}`)
    );

    // Сначала всегда полностью сбрасываем старые отметки пасов.
    indicators.forEach(indicator => {
        if (indicator) indicator.classList.remove("status-orb-pass");
    });

    // Пасы заполняются справа налево: 5, 4, 3, 2.
    for (let offset = 0; offset < passCount; offset += 1) {
        const indicator = indicators[indicators.length - 1 - offset];
        if (indicator) indicator.classList.add("status-orb-pass");
    }
}

document.getElementById("control-correct-count").addEventListener('change', function(){
    calc_correct();
}
)
function calc_correct() {
    showCorrectIndicators(
        document.getElementById("control-correct-count").value
    );
}

function update_data(){
    calc_timer();
    calc_bank();
    calc_circle();
    calc_correct();
    calc_current_money();
    calc_flip();
    calc_pass();
    calc_round();

    const displayTime = document.getElementById("display-time");
    if (displayTime) displayTime.hidden = false;
}

socket.on("reset", (data) => {
    init_game_player();
}
)



function init_game_player(){
    stopRoundTimer();
    document.getElementById("tpv-player-win-overlay").hidden = true;
    document.getElementById("control-timer-seconds").value=240;
    document.getElementById("control-circle").value=1;
    document.getElementById("control-round").value=1;
    document.getElementById("control-bank").value=0;
    document.getElementById("control-current-money").value=0;
    document.getElementById("control-question-number").value=1;
    document.getElementById("control-correct-count").value=0;
    document.getElementById("control-flips-count").value=3;
    document.getElementById("control-pass-count").value=0;
    document.getElementById("display-current-flip").textContent = "--";
    document.getElementById("correct-indicator-1").classList.remove("status-orb-wrong-answer");
    document.getElementById("correct-indicator-2").classList.remove("status-orb-wrong-answer");
    document.getElementById("correct-indicator-3").classList.remove("status-orb-wrong-answer");
    document.getElementById("correct-indicator-4").classList.remove("status-orb-wrong-answer");
    document.getElementById("correct-indicator-5").classList.remove("status-orb-wrong-answer");
    document.getElementById("bong-variable-1").classList.remove("bong-option-select");
    document.getElementById("bong-variable-2").classList.remove("bong-option-select");
    document.getElementById("bong-variable-3").classList.remove("bong-option-select");
    document.getElementById("bong-current-sum").textContent = 0;
    document.getElementById("bong-current-sum").classList.remove("bong");
    document.getElementById("bong-game-status").textContent = "";
    document.getElementById("bong-question-author").textContent = "— Автор вопроса —";
    document.getElementById("question-text").textContent = "";
    document.getElementById("question-author").textContent = "";
    document.getElementById("section-metrics").hidden = true;
    document.getElementById("section-timer").hidden = true;
    document.getElementById("money-tree").hidden = true;
    document.getElementById("section-question").hidden = true;
    document.getElementById("section-bong-game").hidden = true;
    const bongStopButton = document.getElementById("action-bong-stop");
    if (bongStopButton) bongStopButton.disabled = true;
    stop_bong_game_now = false;
    sum_results = 0;
    document.getElementById("welcome3").textContent = "Вы находитесь в комнате ожидания. Дождитесь, когда компьютер выберет именно Вас!";
    update_data();

}


socket.on("reset", (data) => {
    init_game_player();   
}

)


socket.on("player_selected", (data) => {
    document.getElementById("welcome3").textContent = "Основная игра";
    document.getElementById("display-current-flip").textContent = data[2];

    update_data();
}

)



socket.on("update_data_user", (data) => {
    const state = normalizeIncomingState(data);
    const incomingRound = Number(state.round) || 1;
    const currentCorrect = Number(
        document.getElementById("control-correct-count").value
    ) || 0;
    const currentPass = Number(
        document.getElementById("control-pass-count").value
    ) || 0;
    const incomingCorrect = Number(state.correct) || 0;
    const incomingPass = Number(state.pass) || 0;

    // Сброс распознаётся не только по номеру раунда.
    // Если сервер прислал меньшие счётчики, значит начался новый раунд
    // или выполнен принудительный сброс состояния.
    const roundChanged =
        (previousGameRound !== null && previousGameRound !== incomingRound) ||
        incomingCorrect < currentCorrect ||
        incomingPass < currentPass;

    document.getElementById("control-timer-seconds").value = Number(state.timer);
    document.getElementById("control-circle").value = Number(state.circle);
    document.getElementById("control-round").value = incomingRound;
    document.getElementById("control-bank").value = Number(state.bank);
    document.getElementById("control-current-money").value = Number(state.currentMoney);
    document.getElementById("control-question-number").value = Number(state.question);

    // При смене раунда локально гарантированно очищаем старые отметки,
    // даже если по сети случайно пришло предыдущее значение correct/pass.
    if (roundChanged) {
        resetRoundIndicators();
    }

    document.getElementById("control-correct-count").value = incomingCorrect;
    document.getElementById("control-pass-count").value = incomingPass;
    if (incomingCorrect === 0) {
    resetRoundIndicators();
}
    document.getElementById("control-flips-count").value = Number(state.flips);
    replacementQuestionPending = Boolean(state.replacement) || state.phase === "replacement";
    previousGameRound = incomingRound;
    update_data();
});


socket.on("show_tree_user", (data) => {
    //document.getElementById("money-tree").hidden = false;
    TPVAnimation.showMoneyTree();
    
}

)

socket.on("hide_tree_user", (data) => {
    //document.getElementById("money-tree").hidden = true;
    TPVAnimation.hideMoneyTree();
}

)

socket.on("show_stats_user", (data) => {
    const metrics = document.getElementById("section-metrics");
    const bankValue = Number(document.getElementById("control-bank")?.value) || 0;
    const bankCard = document.getElementById("metric-bank");

    if (bankCard) bankCard.hidden = bankValue <= 0;
    if (metrics) metrics.hidden = false;
    showPlayerTimer({showMetrics: true});
})

socket.on("hide_stats_user", (data) => {
    const metrics = document.getElementById("section-metrics");
    if (metrics) metrics.hidden = true;
    hidePlayerTimer();
})

function getTimerSection() {
    return document.getElementById("section-timer");
}

function showPlayerTimer({showMetrics = true} = {}) {
    const metrics = document.getElementById("section-metrics");
    const timerSection = getTimerSection();
    const displayTime = document.getElementById("display-time");

    if (showMetrics && metrics) metrics.hidden = false;
    if (timerSection) timerSection.hidden = false;
    if (displayTime) displayTime.hidden = false;

    calc_timer();
}

function hidePlayerTimer() {
    const timerSection = getTimerSection();
    if (timerSection) timerSection.hidden = true;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

socket.on("question_selected_user", async (payload) => {
    const data = Array.isArray(payload)
        ? {question: payload[0], author: payload[3], replacement: replacementQuestionPending}
        : payload;

    replacementQuestionPending = Boolean(data.replacement);

    const incomingQuestionNumber = Number(data.questionNumber) || Number(
        document.getElementById("control-question-number").value
    ) || 1;

    // Первый вопрос нового раунда должен всегда начинаться с чистой панели,
    // даже если update_data_user пришёл позже события question_selected_user.
    if (incomingQuestionNumber === 1) {
        document.getElementById("control-correct-count").value = 0;
        document.getElementById("control-pass-count").value = 0;
        resetRoundIndicators();
    }

    if (tpvGame) tpvGame.startQuestion({replacement: replacementQuestionPending});

    clearAnswerResultState();
    document.getElementById("question-text").textContent = data.question || "";
    document.getElementById("question-author").textContent = data.author || "";
    setQuestionMarker(replacementQuestionPending ? "replacement" : "question", data.questionNumber);

    showPlayerTimer({showMetrics: true});

    await Promise.all([
        TPVAnimation.showQuestion(),
        TPVAnimation.showTimer(),
    ]);

    TPVAnimation.activateRound(
        Number(document.getElementById("control-round").value)
    );

    startRoundTimer(500);
});


socket.on("tpv_correct_user", async (payload) => {
    const data = (payload && typeof payload === "object")
        ? payload
        : {answer: payload};

    clearAnswerResultState();
    document.getElementById("question-text").textContent = data.answer || "";
    markQuestionResult("correct");
    replacementQuestionPending = false;
    if (tpvGame) tpvGame.revealAnswer();
    setQuestionMarker("answer", data.questionNumber);

    const correctIndex = Number(data.correctCount) ||
        (Number(document.getElementById("control-correct-count").value) + 1);

    // Сначала показываем зелёную анимацию, а не после скрытия вопроса.
    await TPVAnimation.correct(correctIndex);

    if (data.roundFinished === true) {
        stopRoundTimer();
        await delay(3500);
        await Promise.all([
            TPVAnimation.hideQuestion(),
            TPVAnimation.hideTimer(),
            hidePlayerTimer(),
            document.getElementById("section-metrics").hidden = true,

        ]);
    }
});

socket.on("tpv_wrong_user", async (payload) => {
    const data = (payload && typeof payload === "object") ? payload : {answer: payload};
    stopRoundTimer();
    replacementQuestionPending = false;
    if (tpvGame) tpvGame.registerWrong();

    clearAnswerResultState();
    document.getElementById("question-text").textContent = data.answer || "";
    markQuestionResult("wrong");
    setQuestionMarker("answer", data.questionNumber);

    const wrongIndex = Number(data.wrongIndex) ||
        (Number(document.getElementById("control-correct-count").value) + 1);

    // Сначала запускаем анимацию. После её завершения ещё раз принудительно
    // применяем красный класс, чтобы внутренняя логика TPVAnimation не могла
    // вернуть зелёное или нейтральное состояние.
    showWrongIndicator(wrongIndex);

    try {
        await TPVAnimation.wrong(wrongIndex);
    } finally {
        showWrongIndicator(wrongIndex);
        markQuestionResult("wrong");
        document.getElementById("section-question")?.classList.remove("tpv-wrong-flash");
    }

    await delay(2100);
    await Promise.all([
        TPVAnimation.hideQuestion(),
        TPVAnimation.hideTimer(),
        document.getElementById("section-metrics").hidden = true,
    ]);
});

socket.on("tpv_pass_user", (data) => {
    clearAnswerResultState();
    document.getElementById("question-text").textContent = data["answer"];
    replacementQuestionPending = false;
    if (tpvGame) tpvGame.revealAnswer();
    setQuestionMarker("answer");
    update_data();
    
}

)
socket.on("tpv_flip_user", async(payload) => {
    const data = (payload && typeof payload === "object") ? payload : {answer: payload};
    replacementQuestionPending = true;
    if (tpvGame) {
        if (data.state) tpvGame.setState({...data.state, phase: "replacement", replacement: true}, false);
        else tpvGame.startQuestion({replacement: true});
    }

    clearAnswerResultState();
    document.getElementById("question-text").textContent = data.answer || "";
    setQuestionMarker("replacement", data.questionNumber);
    await TPVAnimation.useFlip(4 - parseInt(document.getElementById("control-flips-count").value));
});

function showPlayerWinOverlay(amount) {
    const overlay = document.getElementById("tpv-player-win-overlay");
    const value = document.getElementById("tpv-player-win-amount");
    if (!overlay || !value) return;

    const numericAmount = Math.max(0, Number(amount) || 0);
    value.textContent = numericAmount.toLocaleString("ru-RU");
    overlay.hidden = false;
    restartCssAnimation(overlay.querySelector(".tpv-player-win-card"), "tpv-player-win-card--show");
}

socket.on("tpv_player_win_user", (payload) => {
    const amount = payload && typeof payload === "object"
        ? payload.amount
        : payload;
    showPlayerWinOverlay(amount);
});

/* =========================================================
 * BONG-GAME: ведущий управляет игрой, игрок может только STOP
 * ========================================================= */

function getBongStopButton() {
    return document.getElementById("bong-stop");
}

function bindBongStopButton() {
    const stopButton = getBongStopButton();
    console.log(stopButton);
   if (!stopButton || stopButton.dataset.bongStopBound === "true") return;
    console.log(stopButton.dataset.bongStopBound)
   // stopButton.dataset.bongStopBound = "true";
    stopButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
      console.log(stopButton.dataset.bongStopBound)
        stop_bong_game_user();
    });
}

// Оставляем функцию доступной и для onclick в HTML.
window.stop_bong_game_user = stop_bong_game_user;

function resetUserBongView() {
    bongGameActive = false;
    bongStopRequested = false;

    document.getElementById("section-bong-game")?.setAttribute("hidden", "");
    document.getElementById("bong-current-sum")?.classList.remove("bong");
    const bongSum = document.getElementById("bong-current-sum");
    if (bongSum) {
        bongSum.style.color = "";
        bongSum.style.textShadow = "";
    }

    const sum = document.getElementById("bong-current-sum");
    if (sum) sum.textContent = "0";

    for (let option = 1; option <= 3; option += 1) {
        document
            .getElementById(`bong-variable-${option}`)
            ?.classList.remove("bong-option-select", "is-selected");
    }

    const stopButton = getBongStopButton();
    if (stopButton) stopButton.disabled = true;
}

function stop_bong_game_user() {
    if (!bongGameActive || bongStopRequested) return;

    bongStopRequested = true;
    console.log(bongStopRequested);
    const stopButton = getBongStopButton();
    if (stopButton) stopButton.disabled = true;

    socket.emit("tpv_bong_stop_request", {
        player: document.getElementById("user_name")?.value || ""
    });
}

socket.on("tpv_bong_prepare_user", async (data) => {
    bongGameActive = true;
    bongStopRequested = false;

    const section = document.getElementById("section-bong-game");
    if (section) section.hidden = false;

    for (let option = 1; option <= 3; option += 1) {
        document
            .getElementById(`bong-variable-${option}`)
            ?.classList.remove("bong-option-select", "is-selected");
    }

    const currentSum = document.getElementById("bong-current-sum");
    if (currentSum) {
        currentSum.classList.remove("bong");
        currentSum.textContent = Number(data?.currentMoney || 0)
            .toLocaleString("ru-RU");
    }

    const status = document.getElementById("bong-game-status");
    if (status) status.textContent = "Ведущий выбирает вариант";

    const author = document.getElementById("bong-question-author");
    if (author) {
        author.textContent = data?.author || "— Автор вопроса —";
    }

    const stopButton = getBongStopButton();
    if (stopButton) stopButton.disabled = true;

    if (window.TPVAnimation?.showBong) {
        await window.TPVAnimation.showBong();
    }
});

socket.on("tpv_bong_selected_user", (data) => {
    const selectedOption = Number(data?.option) || 0;

    for (let option = 1; option <= 3; option += 1) {
        const optionElement = document.getElementById(`bong-variable-${option}`);
        if (!optionElement) continue;

        const isSelected = option === selectedOption;
        optionElement.classList.toggle("bong-option-select", isSelected);
        optionElement.classList.toggle("is-selected", isSelected);
        optionElement.setAttribute("aria-pressed", String(isSelected));
        optionElement.style.outline = isSelected ? "3px solid #ffd34d" : "";
        optionElement.style.boxShadow = isSelected
            ? "0 0 22px rgba(255, 211, 77, 0.95)"
            : "";
    }

    const currentSum = document.getElementById("bong-current-sum");
    if (currentSum) {
        currentSum.classList.remove("bong");
        currentSum.textContent = "0";
    }

    const status = document.getElementById("bong-game-status");
    if (status) status.textContent = `Выбран вариант ${selectedOption}`;

    const author = document.getElementById("bong-question-author");
    if (author && data?.author) author.textContent = data.author;

    bongGameActive = true;
    bongStopRequested = false;

    const stopButton = getBongStopButton();
    if (stopButton) stopButton.disabled = false;
});

socket.on("tpv_bong_value_user", (data) => {
    const currentSum = document.getElementById("bong-current-sum");
    if (!currentSum) return;

    if (data?.value === "BONG") {
        currentSum.textContent = "ГОНГ";
        currentSum.classList.add("bong");
        currentSum.style.color = "#ff2b2b";
        currentSum.style.textShadow = "0 0 12px rgba(255, 43, 43, 0.95)";
        return;
    }

    currentSum.classList.remove("bong");
    currentSum.style.color = "";
    currentSum.style.textShadow = "";
    currentSum.textContent = Number(data?.value || 0).toLocaleString("ru-RU");
});

socket.on("tpv_bong_stop_ack_user", () => {
    bongStopRequested = true;

    const stopButton = getBongStopButton();
    if (stopButton) stopButton.disabled = true;

    const status = document.getElementById("bong-game-status");
    if (status) status.textContent = "Остановка принята";
});

socket.on("tpv_bong_result_user", (data) => {
    bongGameActive = false;
    bongStopRequested = true;

    const stopButton = getBongStopButton();
    if (stopButton) stopButton.disabled = true;

    const currentSum = document.getElementById("bong-current-sum");
    const status = document.getElementById("bong-game-status");

    if (data?.status === "bong") {
        if (currentSum) {
            currentSum.textContent = "ГОНГ";
            currentSum.classList.add("bong");
            currentSum.style.color = "#ff2b2b";
            currentSum.style.textShadow = "0 0 12px rgba(255, 43, 43, 0.95)";
        }
        if (status) status.textContent = "ГОНГ";
        return;
    }

    const value = Number(data?.value || 0);
    if (currentSum) {
        currentSum.classList.remove("bong");
        currentSum.style.color = "";
        currentSum.style.textShadow = "";
        currentSum.textContent = value.toLocaleString("ru-RU");
    }

    if (status) {
        status.textContent = data?.status === "winner"
            ? "Максимальная сумма"
            : "Игра остановлена";
    }
});

socket.on("tpv_bong_hide_user", () => {
    resetUserBongView();
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        bindBongStopButton();
        const stopButton = getBongStopButton();
        if (stopButton) stopButton.disabled = true;
    }, {once: true});
} else {
    bindBongStopButton();
    const stopButton = getBongStopButton();
    if (stopButton) stopButton.disabled = true;
}

// Запасной делегированный обработчик на случай динамической перерисовки кнопки.
document.addEventListener("click", (event) => {
    const button = event.target.closest?.("#action-bong-stop");
    if (!button || button.dataset.bongStopBound === "true") return;
    event.preventDefault();
    stop_bong_game_user();
});

