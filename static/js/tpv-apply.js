(() => {
    "use strict";

    const form = document.getElementById("tpv-apply-form");
    if (!form) return;

    const formView = document.getElementById("apply-form-view");
    const successView = document.getElementById("apply-success-view");
    const theme = document.getElementById("theme");
    const submit = document.getElementById("apply-submit");
    const globalError = document.getElementById("apply-global-error");
    const number = document.getElementById("application-number");
    const themeCounter = document.getElementById("theme-counter");
    const applyAgain = document.getElementById("apply-again");

    const fieldErrors = {
        theme: document.getElementById("theme-error"),
        display_name: document.getElementById("display-name-error"),
    };

    function normalizeText(value) {
        return String(value || "").trim().replace(/\s+/g, " ");
    }

    function clearErrors() {
        Object.values(fieldErrors).forEach((element) => {
            if (element) element.textContent = "";
        });
        globalError.textContent = "";
        theme.removeAttribute("aria-invalid");
    }

    function showFieldError(field, message) {
        const element = fieldErrors[field];
        if (element) element.textContent = message;
        if (field === "theme") theme.setAttribute("aria-invalid", "true");
    }

    function validateClient() {
        clearErrors();
        const nameInput=document.getElementById("display-name");
        const values = {theme: normalizeText(theme.value)};
        if(nameInput) values.display_name=normalizeText(nameInput.value);

        if(nameInput && !values.display_name){
            showFieldError("display_name", "Введите имя или никнейм.");
            nameInput.setAttribute("aria-invalid", "true");
            return null;
        }

        if (!values.theme) {
            showFieldError("theme", "Введите тему.");
            return null;
        }
        if (values.theme.length > 300) {
            showFieldError("theme", "Не более 300 символов.");
            return null;
        }
        return values;
    }

    function setLoading(loading) {
        submit.disabled = loading;
        submit.classList.toggle("is-loading", loading);
        submit.querySelector("span").textContent = loading
            ? "Отправляем…"
            : "Подать заявку";
    }

    async function submitApplication(event) {
        event.preventDefault();
        const values = validateClient();
        if (!values) return;

        setLoading(true);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";

            const response = await fetch("/tpv-apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                credentials: "same-origin",
                // При включённой авторизации сервер игнорирует ручное имя и берёт его из Yandex-сессии.
                body: JSON.stringify(values),
            });

            const responseText = await response.text();
            let payload = {};
            if (responseText) {
                try { payload = JSON.parse(responseText); }
                catch { payload = {ok: false, error: responseText}; }
            }

            if (response.status === 401) {
                window.location.href = "/auth/yandex?next=/tpv-apply";
                return;
            }

            if (!response.ok || payload.ok === false) {
                const message = payload.error || payload.message
                    || `Сервер вернул ошибку ${response.status}.`;
                if (payload.field && fieldErrors[payload.field]) {
                    showFieldError(payload.field, message);
                } else {
                    globalError.textContent = message;
                }
                return;
            }

            number.textContent = String(payload.id ?? payload.application_id);
            formView.hidden = true;
            successView.hidden = false;
            successView.focus?.();
        } catch (error) {
            console.error("TPV application submit failed:", error);
            globalError.textContent = "Не удалось обработать ответ сервера.";
        } finally {
            setLoading(false);
        }
    }

    theme.addEventListener("input", () => {
        themeCounter.textContent = `${theme.value.length} / 300`;
        if (theme.value.length <= 300) fieldErrors.theme.textContent = "";
    });

    applyAgain?.addEventListener("click", () => {
        form.reset();
        themeCounter.textContent = "0 / 300";
        clearErrors();
        successView.hidden = true;
        formView.hidden = false;
        theme.focus();
    });

    form.addEventListener("submit", submitApplication);
})();
