/**
 * USER SLOT SCRIPT
 *
 * DEEP SAFE REFACTOR
 * ------------------
 * Этот файл переписан структурно, но поведение сохраняется максимально близко
 * к исходному user_slot.js:
 *
 * - сохранены те же id элементов;
 * - сохранены те же backend routes;
 * - сохранены те же глобальные функции a1..a15, p50_50, palter, pnavi, px2, pauden, pfact;
 * - сохранён polling через get_status();
 * - сохранены основные значения цветов:
 *   orange = ответ игрока / активированная подсказка,
 *   green  = правильный ответ,
 *   red    = фатал,
 *   #d905ec = навигатор.
 *
 * Рекомендация:
 * Не менять id, цветовую семантику и названия публичных функций без синхронного
 * изменения backend и HTML.
 */

// === БАЗОВЫЕ DOM HELPERS ===
const ANSWER_IDS = Array.from({ length: 15 }, (_, i) => `o${i + 1}`);
const HELP_IDS = ['p50_50', 'palter', 'pnavi', 'px2', 'pauden', 'pfact'];
const DARK_BUTTON_COLOR = '#000c11';

const $ = (id) => document.getElementById(id);

function setText(id, value) {
    const el = $(id);
    if (el) el.innerText = value;
}

function setHtml(id, value) {
    const el = $(id);
    if (el) el.innerHTML = value;
}

function setValue(id, value) {
    const el = $(id);
    if (el) el.value = value;
}

function setHidden(id, hidden) {
    const el = $(id);
    if (el) el.hidden = hidden;
}

function setDisabled(id, disabled) {
    const el = $(id);
    if (el) el.disabled = disabled;
}

function setBg(id, color) {
    const el = $(id);
    if (el) el.style.backgroundColor = color;
}

function currentUserName() {
    return $('user_name')?.value || '';
}

function fetchJson(url, payload) {
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
    }).then(response => response.json());
}

// === ИНИЦИАЛИЗАЦИЯ ===
setText("welcome", "Добро пожаловать на игру");
setText("welcome2", "Свободный слот!");

/**
 * Главный polling статуса игрока.
 * Именно backend говорит, в каком состоянии сейчас должен быть UI игрока.
 */
var timerStatus = setInterval(() => get_status(), 5000);

/** Таймер periodic polling доступных подсказок. */
var timerHelps;

/** Таймер проверки, зафиксирован ли ответ игрока в активной задаче. */
var timeWainAnswerFromMain;

// === УТИЛИТЫ ДЛЯ UI ===

/** Возвращает 15 кнопок ответов к значениям 1..15. */
function btn_default() {
    ANSWER_IDS.forEach((id, idx) => setValue(id, String(idx + 1)));
}

/** Окрашивает все 15 кнопок в базовый тёмный цвет. */
function reset_answer_colors() {
    ANSWER_IDS.forEach((id) => setBg(id, DARK_BUTTON_COLOR));
}

/** Прячет все 15 ответов. */
function hide_answers() {
    ANSWER_IDS.forEach((id) => setHidden(id, true));
}

/** Показывает все 15 ответов. */
function show_answers() {
    ANSWER_IDS.forEach((id) => setHidden(id, false));
}

/** Массово включает/выключает все 15 кнопок ответов. */
function status_btn(it_disable) {
    ANSWER_IDS.forEach((id) => setDisabled(id, it_disable));
}

/** Прячет и выключает все подсказки. */
function hide_all_helps() {
    HELP_IDS.forEach((id) => {
        setHidden(id, true);
        setDisabled(id, true);
        setBg(id, DARK_BUTTON_COLOR);
    });
}

/** Сбрасывает интервалы, связанные с активной игрой. */
function clear_game_intervals() {
    clearInterval(timerHelps);
    clearInterval(timeWainAnswerFromMain);
    timeWainAnswerFromMain = undefined;
}

/** Возвращает id кнопки ответа по номеру 1..15. */
function get_o(answer) {
    return `o${answer}`;
}

/** Показывает/скрывает элементы отборочного тура. */
function set_otbor_controls(visible) {
    setHidden('otbor_input', !visible);
    setHidden('otbor_submit', !visible);
    if (visible) setDisabled('otbor_submit', false);
}

/**
 * Полный перевод player UI в режим ожидания.
 * Это самый жёсткий reset, который вызывается при статусе "wait".
 */
function reset_to_wait_mode() {
    setHtml('welcome', "");
    setHtml('welcome2', "");
    setHtml('welcome3', "Ожидайте дальнейших указаний!");

    setHidden('question', true);
    setValue('question', "");
    setText('question', " ");
    setValue('ex2', "0");
    setValue('time-start', "0");
    setValue('ans', "");
    setValue('otbor_input', " ");

    set_otbor_controls(false);
    hide_answers();
    hide_all_helps();

    btn_default();
    reset_answer_colors();

    setHidden('au', true);

    clear_game_intervals();
}

/** Переводит UI в режим интерактивной игры. */
function set_interactive_mode() {
    setValue('ans', "");
    btn_default();
    setHtml('welcome', "");
    setHtml('welcome2', "");
    setHtml('welcome3', "Интерактивная игра");
    setHidden('question', false);
    setValue('question', "");
    setText('question', " ");
    setValue('time-start', "0");

    show_answers();
    set_otbor_controls(false);
    setHidden('au', true);
    status_btn(true);
}

/** Переводит UI в режим основной игры. */
function set_main_mode() {
    setValue('ans', "");
    setHtml('welcome', " ");
    setHtml('welcome2', " ");
    setHtml('welcome3', "Основная игра");
    setHidden('question', false);
    setValue('question', "");
    setText('question', " ");
    setValue('time-start', "0");

    btn_default();
    show_answers();
    set_otbor_controls(false);
    setHidden('au', true);

    timerHelps = setInterval(() => get_helps(), 5000);
    status_btn(true);
}

/** Переводит UI в режим отборочного тура. */
function set_otbor_mode() {
    setHtml('welcome', "");
    setHtml('welcome2', "");
    setHtml('welcome3', "Отборочный тур!");
    setHidden('question', false);
    set_otbor_controls(true);
    setHidden('au', false);

    setValue('question', "");
    setValue('ex2', "0");
    setValue('ans', "");
    setText('question', " ");
    setValue('otbor_input', "");

    hide_answers();
    hide_all_helps();

    reset_answer_colors();
    clear_game_intervals();

    get_task_otbor();
}

/** Проверяет, выбрал ли игрок уже ответ / подсказку, чтобы не перетирать состояние новым polling. */
function has_active_selection() {
    const selectedIds = [...ANSWER_IDS, 'p50_50', 'palter', 'pnavi', 'pfact', 'pauden'];
    return selectedIds.some((id) => $(id)?.style.backgroundColor === 'orange');
}

/** Выключает все подсказки — используется после ответа игрока. */
function disable_all_helps() {
    HELP_IDS.forEach((id) => setDisabled(id, true));
}

// === ОСНОВНОЙ POLLING СТАТУСА ===

function get_status() {
    const user_name = currentUserName();

    fetchJson('/get_user_status', { user: user_name })
        .then(data => {
            if (data === "fail") return;

            if (data === "wait") {
                reset_to_wait_mode();
            }

            if (data === "interactive") {
                set_interactive_mode();
            }

            if (data === "main") {
                set_main_mode();
            }

            if (data === "take money" || data === "end interactive") {
                status_btn(true);
            }

            if (data === "wait task interactive" || data === "wait task main") {
                setValue("ans", "");
                setValue("question", " ");
                setText("question", " ");
                setValue("time-start", "0");
                btn_default();
                reset_answer_colors();
                get_task();
            }

            if (data === "given task interactive") {
                get_task();
                p50_50();
                palter();
                pnavi();
                timeWainAnswerFromMain = setInterval(() => check_answered_main(), 5000);
            }

            if (data === "given task main") {
                get_task();
                p50_50();
                palter();
                pnavi();
            }

            if (data === "check main" || data === "check main x2" || data === "check interactive") {
                show_right_user();
            }

            if (data === "otbor") {
                set_otbor_mode();
            }

            if (data === "warning otbor") {
                setValue("au", "10");
            }

            if (data === "start otbor") {
                if ($("ex2")?.value === "start otbor") return;
                setValue("ex2", "start otbor");
                setDisabled("otbor_submit", false);
                setValue("time-start", Date.now().toString());
                setTimeout(() => { timer_otbor(); }, 2000);
            }

            if (data === "otbor end") {
                setHidden("otbor_input", true);
                setHidden("otbor_submit", true);
                setHidden("au", true);
                setValue("ex2", "0");
                get_answer_otbor();
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

// === ОТБОРОЧНЫЙ ТУР ===

function timer_otbor() {
    if ($("au")?.value === "0") {
        setDisabled("otbor_submit", true);
        return;
    }
    setValue("au", (parseInt($("au").value) - 1).toString());
    setTimeout(() => { timer_otbor(); }, 1000);
}

function get_task_otbor() {
    const user_name = currentUserName();
    fetchJson('/get_task_otbor', { user: user_name })
        .then(data => {
            if (data === "fail") return;
            setText('question', "Отборочный тур\nДиапазон: " + data[1] + " - " + data[2] + "\nmd5: " + data[4]);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function get_answer_otbor() {
    const user_name = currentUserName();
    fetchJson('/get_task_otbor', { user: user_name })
        .then(data => {
            if (data === "fail") return;
            setText('question', "Правильный ответ: " + data[3]);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function send_answer_otbor() {
    const user_name = currentUserName();
    let ans_otbor = $("otbor_input")?.value || "";
    try {
        parseInt(ans_otbor);
    } catch (error) {
        ans_otbor = "0";
        setValue("otbor_input", "0");
    }

    const time_answer = (Date.now() - parseInt($("time-start")?.value || "0")) / 1000;

    fetchJson('/send_answer_otbor', {
        user: user_name,
        ans_otbor: ans_otbor,
        time_answer: time_answer
    })
        .then(data => {
            if (data === "fail") return;
            setDisabled("otbor_submit", true);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

// === ПОДСКАЗКИ ===

function get_helps() {
    const user_name = currentUserName();

    fetchJson('/get_helps', { user: user_name })
        .then(data => {
            if (data === "fail") {
                disable_all_helps();
                return;
            }

            if ($("ex2")?.value === "alter" || $("ex2")?.value === "x2") {
                disable_all_helps();
                return;
            }

            hide_all_helps();

            for (let i = 0; i < data.length; i++) {
                if (data[i] === "50:50") setHidden("p50_50", false);
                if (data[i] === "alter") setHidden("palter", false);
                if (data[i] === "navi") setHidden("pnavi", false);
                if (data[i] === "x2") setHidden("px2", false);
                if (data[i] === "help_auden") setHidden("pauden", false);
                if (data[i] === "fact") setHidden("pfact", false);
            }

            HELP_IDS.forEach((id) => setBg(id, DARK_BUTTON_COLOR));
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

// === ПОЛУЧЕНИЕ ЗАДАНИЯ ===

function get_task() {
    const user_name = currentUserName();

    fetchJson('/get_task_user', { user: user_name })
        .then(data => {
            if (data === "fail") return;
            if ($("ex2")?.value !== "0") return;

            if ($("time-start")?.value === "0") {
                setValue("time-start", Date.now().toString());
            }

            setText('question', "Раунд " + data[0] + "\nmd5: " + data[2] + "\nКоличество фаталов: " + data[3]);

            status_btn(false);

            if (data[0] <= 3) {
                HELP_IDS.forEach((id) => {
                    if (!$(id)?.hidden) setDisabled(id, true);
                });
            }

            if (data[0] > 3) {
                HELP_IDS.forEach((id) => {
                    if (!$(id)?.hidden) setDisabled(id, false);
                });
            }

            if (has_active_selection()) return;

            status_btn(false);
            setValue("count_fatal", data[3].toString());
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

// === ПРОВЕРКА, ЗАФИКСИРОВАН ЛИ ОТВЕТ ===

function check_answered_main() {
    const user_name = currentUserName();
    let inter = false;

    clearInterval(timeWainAnswerFromMain);
    if (timeWainAnswerFromMain === undefined) return;
    if ($("welcome3")?.innerHTML === "Интерактивная игра") inter = true;

    fetchJson('/check_answered_main', { user: user_name, inter: inter })
        .then(data => {
            if (data === "fail") return;
            if (data === "ok") {
                status_btn(true);
                clearInterval(timeWainAnswerFromMain);
                timeWainAnswerFromMain = undefined;
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

// === ОТПРАВКА ОТВЕТА ИГРОКА ===

function send_answer_main(answerNumber, answerId) {
    if ($("ex2")?.value === "x2-2") setValue("ex2", "");

    const user_name = currentUserName();
    setValue("ans", answerId);
    setBg(answerId, "orange");

    const time_answer = (Date.now() - parseFloat($("time-start")?.value || "0")) / 1000;

    fetchJson('/send_answer', {
        user: user_name,
        answer_user: String(answerNumber),
        time_answer: time_answer
    })
        .then(data => {
            if (data === "fail") return;
            disable_all_helps();
            status_btn(true);
            clearInterval(timeWainAnswerFromMain);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

/**
 * Ниже сохраняем глобальные функции a1..a15,
 * потому что текущий HTML вызывает их напрямую через onclick.
 */
function a1(){ send_answer_main(1, "o1"); }
function a2(){ send_answer_main(2, "o2"); }
function a3(){ send_answer_main(3, "o3"); }
function a4(){ send_answer_main(4, "o4"); }
function a5(){ send_answer_main(5, "o5"); }
function a6(){ send_answer_main(6, "o6"); }
function a7(){ send_answer_main(7, "o7"); }
function a8(){ send_answer_main(8, "o8"); }
function a9(){ send_answer_main(9, "o9"); }
function a10(){ send_answer_main(10, "o10"); }
function a11(){ send_answer_main(11, "o11"); }
function a12(){ send_answer_main(12, "o12"); }
function a13(){ send_answer_main(13, "o13"); }
function a14(){ send_answer_main(14, "o14"); }
function a15(){ send_answer_main(15, "o15"); }

// === ПРОВЕРКА РЕЗУЛЬТАТА ОТВЕТА ===

function show_right_user() {
    const user_name = currentUserName();

    fetchJson('/check_answer', { user: user_name, double: "0" })
        .then(data => {
            if (data === "fail") return;

            // Один фатал.
            if (data[0] === 1) {
                const fatalId = get_o(data[1].toString());
                setBg(fatalId, "red");

                for (let i = 1; i < 16; i++) {
                    const answerId = get_o(i.toString());
                    if ($(answerId)?.style.backgroundColor === 'orange') {
                        setBg(answerId, 'green');
                        break;
                    }
                }
            }

            // Несколько фаталов / x2 / бомбы.
            if (data[0] > 1) {
                if ($("ex2")?.value === "x2-2") return;

                const blackBomb = data[4];
                const redBomb = data[5];

                if ($("ex2")?.value === "x2") {
                    setValue("ex2", "x2-2");

                    if (data[0] < 4) return;

                    const fatals = data[1];
                    const fatalCount = data[3];
                    const currentAnswer = $("ans")?.value || "";

                    for (let i = 0; i < fatalCount; i++) {
                        if (currentAnswer === get_o(fatals[i].toString())) {
                            setBg(get_o(fatals[i].toString()), "red");

                            if (blackBomb !== "false" && redBomb !== "false") {
                                if (fatals[i] === blackBomb) setValue(get_o(fatals[i].toString()), "💣");
                                if (fatals[i] === redBomb) setValue(get_o(fatals[i].toString()), "🧨");
                            }
                            break;
                        }
                    }

                    if ($(currentAnswer)?.style.backgroundColor === "red") {
                        for (let i = 1; i < 16; i++) {
                            const id = get_o(i.toString());
                            if (id !== currentAnswer) setDisabled(id, false);
                        }
                        return;
                    }
                }

                const fatals = data[1];
                for (let i = 0; i < data[3]; i++) {
                    const answerId = get_o(fatals[i]);
                    setBg(answerId, "red");

                    if (blackBomb !== "false" && redBomb !== "false") {
                        if (fatals[i] === blackBomb) setValue(answerId, "💣");
                        if (fatals[i] === redBomb) setValue(answerId, "🧨");
                    }
                }

                for (let i = 1; i < 16; i++) {
                    const answerId = get_o(i.toString());
                    if ($(answerId)?.style.backgroundColor === 'orange') {
                        setBg(answerId, 'green');
                        break;
                    }
                }

                setValue("ex2", "0");
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

// === ПРИМЕНЕНИЕ ПОДСКАЗОК ===

function p50_50() {
    const user_name = currentUserName();

    fetchJson('/get_50_50', { user: user_name })
        .then(data => {
            if (data === "fail") return;

            for (let i = 0; i < data.length; i++) {
                setDisabled(get_o(data[i].toString()), true);
            }

            setBg("p50_50", "orange");
            setValue("ex2", "50:50");
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function palter() {
    const user_name = currentUserName();

    fetchJson('/get_alter', { user: user_name })
        .then(data => {
            if (data === "fail") return;

            status_btn(true);

            const b1 = data[0].toString();
            const b2 = data[1].toString();

            setDisabled(get_o(b1), false);
            setDisabled(get_o(b2), false);
            setBg("palter", "orange");
            setValue("ex2", "alter");
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function pnavi() {
    const user_name = currentUserName();

    fetchJson('/get_navi', { user: user_name })
        .then(data => {
            if (data === "fail") return;

            for (let i = 0; i < data.length; i++) {
                setBg(get_o(data[i]), "#d905ec");
            }

            setBg("pnavi", "orange");
            setValue("ex2", "navi");
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function px2() {
    const user_name = currentUserName();
    setBg("px2", "orange");
    setValue("ex2", "x2");

    fetchJson('/get_x2', { user: user_name })
        .then(data => {
            if (data === "fail") return;
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function pauden() {
    const user_name = currentUserName();
    setBg("pauden", "orange");

    fetchJson('/get_auden', { user: user_name })
        .then(data => {
            if (data === "fail") return;
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function pfact() {
    const user_name = currentUserName();
    setBg("pfact", "orange");

    fetchJson('/get_fact', { user: user_name })
        .then(data => {
            if (data === "fail") return;
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}
