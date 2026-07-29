(function (global) {
    "use strict";

    const DEFAULT_STATE = Object.freeze({
        timer: 240,
        circle: 1,
        round: 1,
        bank: 0,
        currentMoney: 0,
        question: 1,
        correct: 0,
        flips: 3,
        pass: 0,
        phase: "waiting",
        replacement: false,
        wrong: false
    });

    function toNumber(value, fallback = 0) {
        const result = Number(value);
        return Number.isFinite(result) ? result : fallback;
    }

    function normalizeState(source) {
        if (Array.isArray(source)) {
            return {
                timer: toNumber(source[0], 240),
                circle: toNumber(source[1], 1),
                round: toNumber(source[2], 1),
                bank: toNumber(source[3], 0),
                currentMoney: toNumber(source[4], 0),
                question: toNumber(source[5], 1),
                correct: toNumber(source[6], 0),
                flips: toNumber(source[7], 3),
                pass: toNumber(source[8], 0)
            };
        }

        if (!source || typeof source !== "object") {
            return {};
        }

        return {
            timer: toNumber(source.timer, 240),
            circle: toNumber(source.circle, 1),
            round: toNumber(source.round, 1),
            bank: toNumber(source.bank, 0),
            currentMoney: toNumber(source.currentMoney, 0),
            question: toNumber(source.question, 1),
            correct: toNumber(source.correct, 0),
            flips: toNumber(source.flips, 3),
            pass: toNumber(source.pass, 0),
            phase: source.phase,
            replacement: Boolean(source.replacement),
            wrong: Boolean(source.wrong)
        };
    }

    class TPVGameEngine {
        constructor(initialState = {}) {
            this.state = {...DEFAULT_STATE, ...normalizeState(initialState)};
            this.listeners = new Set();
        }

        subscribe(listener) {
            if (typeof listener !== "function") return () => {};
            this.listeners.add(listener);
            return () => this.listeners.delete(listener);
        }

        notify() {
            const snapshot = this.getState();
            this.listeners.forEach(listener => listener(snapshot));
        }

        getState() {
            return {...this.state};
        }

        setState(nextState, notify = true) {
            this.state = {...this.state, ...normalizeState(nextState)};
            if (notify) this.notify();
            return this.getState();
        }

        reset(overrides = {}) {
            this.state = {...DEFAULT_STATE, ...normalizeState(overrides)};
            this.notify();
            return this.getState();
        }

        startQuestion({replacement = false} = {}) {
            this.state.phase = replacement ? "replacement" : "question";
            this.state.replacement = replacement;
            this.state.wrong = false;
            this.notify();
            return this.getState();
        }

        revealAnswer() {
            this.state.phase = "answer";
            this.state.replacement = false;
            this.notify();
            return this.getState();
        }

        registerCorrect() {
            this.state.correct += 1;
            this.state.phase = "answer";
            this.state.replacement = false;
            this.state.wrong = false;
            this.notify();
            return this.getState();
        }

        registerPass() {
            this.state.pass += 1;
            this.state.question += 1;
            this.state.phase = "answer";
            this.state.replacement = false;
            this.notify();
            return this.getState();
        }

        requestReplacement() {
            if (this.state.flips <= 0) return false;
            this.state.flips -= 1;
            this.state.phase = "replacement";
            this.state.replacement = true;
            this.notify();
            return true;
        }

        registerWrong() {
            this.state.phase = "wrong";
            this.state.replacement = false;
            this.state.wrong = true;
            this.notify();
            return this.getState();
        }

        nextQuestion() {
            this.state.question += 1;
            this.state.phase = "question";
            this.state.replacement = false;
            this.state.wrong = false;
            this.notify();
            return this.getState();
        }

        getQuestionMarker() {
            if (this.state.phase === "replacement" || this.state.replacement) {
                return "↻";
            }
            const prefix = ["answer", "wrong"].includes(this.state.phase) ? "О." : "В.";
            return prefix + this.state.question;
        }

        toPayload() {
            return this.getState();
        }
    }

    global.TPVGameEngine = TPVGameEngine;
    global.TPVGame = global.TPVGame || new TPVGameEngine();
})(window);
