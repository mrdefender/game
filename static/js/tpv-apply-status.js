(() => {
    "use strict";

    const form = document.getElementById("tpv-status-form");
    if (!form) return;

    const searchView = document.getElementById("status-search-view");
    const resultView = document.getElementById("status-result-view");
    const applicationId = document.getElementById("application-id");
    const fieldError = document.getElementById("application-id-error");
    const globalError = document.getElementById("status-global-error");
    const submit = document.getElementById("status-submit");
    const checkAnother = document.getElementById("status-check-another");

    const result = {
        id: document.getElementById("result-id"),
        displayName: document.getElementById("result-display-name"),
        theme: document.getElementById("result-theme"),
        status: document.getElementById("result-status"),
        themeStatus: document.getElementById("result-theme-status"),
        publicComment: document.getElementById("result-public-comment"),
    };

    function clearErrors() {
        fieldError.textContent = "";
        globalError.textContent = "";
        applicationId.removeAttribute("aria-invalid");
    }

    function validateId() {
        clearErrors();
        const raw = String(applicationId.value || "").trim();

        if (!raw) {
            fieldError.textContent = "Введите номер заявки.";
            applicationId.setAttribute("aria-invalid", "true");
            return null;
        }

        if (!/^\d+$/.test(raw) || Number(raw) < 1) {
            fieldError.textContent = "Номер заявки должен быть положительным целым числом.";
            applicationId.setAttribute("aria-invalid", "true");
            return null;
        }

        return Number(raw);
    }

    function setLoading(loading) {
        submit.disabled = loading;
        submit.classList.toggle("is-loading", loading);
        submit.querySelector("span").textContent = loading
            ? "Проверяем…"
            : "Проверить";
    }

    function setBadge(element, label, className) {
        element.textContent = label || "—";
        element.className = `status-badge ${className || ""}`.trim();
    }

    function showApplication(application) {
        result.id.textContent = String(application.id);
        result.displayName.textContent = application.display_name || "—";
        result.theme.textContent = application.theme || "—";

        setBadge(
            result.status,
            application.status_label,
            `status-${application.status || ""}`,
        );
        setBadge(
            result.themeStatus,
            application.theme_status_label,
            `theme-${application.theme_status || ""}`,
        );

        result.publicComment.textContent =
            String(application.public_comment || "").trim()
            || "Комментарий пока не добавлен.";

        searchView.hidden = true;
        resultView.hidden = false;
        resultView.focus?.();
    }

    async function lookup(event) {
        event.preventDefault();
        const id = validateId();
        if (!id) return;

        setLoading(true);

        try {
            const url = new URL(
                "/tpv/api/participation/application-status",
                window.location.origin,
            );
            url.searchParams.set("application_id", String(id));

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
                credentials: "same-origin",
                cache: "no-store",
            });

            const contentType =
                response.headers.get("content-type") || "";

            let payload = null;

            if (contentType.includes("application/json")) {
                try {
                    payload = await response.json();
                } catch {
                    payload = null;
                }
            }

            if (!response.ok || !payload || payload.ok === false) {
                let message =
                    payload?.error
                    || payload?.message
                    || "";

                if (!message) {
                    if (response.status === 404) {
                        message = "Заявка с указанным номером не найдена.";
                    } else if (response.status === 405) {
                        message =
                            "Сервер не разрешил этот способ проверки заявки.";
                    } else {
                        message =
                            `Не удалось проверить заявку. Код ответа: ${response.status}.`;
                    }
                }

                if (
                    payload?.field === "application_id"
                    || response.status === 404
                ) {
                    fieldError.textContent = message;
                    applicationId.setAttribute("aria-invalid", "true");
                } else {
                    globalError.textContent = message;
                }
                return;
            }

            showApplication(payload.application);
        } catch (error) {
            console.error("TPV status lookup failed:", error);
            globalError.textContent =
                "Нет соединения с сервером. Попробуйте ещё раз.";
        } finally {
            setLoading(false);
        }
    }

    applicationId.addEventListener("input", clearErrors);

    checkAnother.addEventListener("click", () => {
        resultView.hidden = true;
        searchView.hidden = false;
        clearErrors();
        applicationId.select();
        applicationId.focus();
    });

    form.addEventListener("submit", lookup);

    const queryId = new URLSearchParams(window.location.search).get("id");
    if (queryId && /^\d+$/.test(queryId)) {
        applicationId.value = queryId;
    }
})();
