(function () {
    "use strict";

    const originalFetch = window.fetch.bind(window);
    const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.content : "";
    }

    function isSameOrigin(input) {
        const rawUrl = input instanceof Request ? input.url : String(input);
        try {
            return new URL(rawUrl, window.location.href).origin === window.location.origin;
        } catch (_error) {
            return false;
        }
    }

    window.fetch = function csrfProtectedFetch(input, init) {
        const options = Object.assign({}, init || {});
        const requestMethod = input instanceof Request ? input.method : "GET";
        const method = String(options.method || requestMethod || "GET").toUpperCase();

        if (unsafeMethods.has(method) && isSameOrigin(input)) {
            const token = getCsrfToken();
            if (!token) {
                return Promise.reject(new Error("CSRF-токен отсутствует в HTML-странице"));
            }

            const sourceHeaders = options.headers || (input instanceof Request ? input.headers : undefined);
            const headers = new Headers(sourceHeaders || {});
            headers.set("X-CSRFToken", token);
            headers.set("X-Requested-With", "XMLHttpRequest");
            options.headers = headers;
            options.credentials = options.credentials || "same-origin";
        }

        return originalFetch(input, options).then(async function (response) {
            if (response.status === 400 && unsafeMethods.has(method)) {
                const clone = response.clone();
                try {
                    const payload = await clone.json();
                    if (payload && payload.error === "csrf_failed") {
                        console.error(payload.message);
                    }
                } catch (_error) {
                    // Ответ не JSON — оставляем обработку вызывающему коду.
                }
            }
            return response;
        });
    };
})();
