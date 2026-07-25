window.NumberVoice = (() => {
    let currentAudio1 = null;
    let playbackId = 0;
    let unlocked = false;

    function stop() {
        playbackId += 1;

        if (currentAudio1) {
            currentAudio1.pause();
            currentAudio1.currentTime = 0;
            currentAudio1 = null;
        }
    }

    async function unlock() {
        if (unlocked) {
            return;
        }

        const audio = new Audio();
        audio.volume = 0;

        try {
            await audio.play();
            audio.pause();
        } catch (error) {
            console.debug(
                "Аудио будет разблокировано после действия пользователя",
                error
            );
        }

        unlocked = true;
    }

    function playFile(url, currentPlaybackId) {
        return new Promise((resolve, reject) => {
            if (currentPlaybackId !== playbackId) {
                resolve();
                return;
            }

            const audio = new Audio(url);

            audio.preload = "auto";
            currentAudio1 = audio;

            audio.addEventListener(
                "ended",
                () => {
                    currentAudio1 = null;
                    resolve();
                },
                { once: true }
            );

            audio.addEventListener(
                "error",
                () => {
                    currentAudio1 = null;
                    reject(
                        new Error(
                            `Не удалось загрузить ${url}`
                        )
                    );
                },
                { once: true }
            );

            audio.play().catch(reject);
        });
    }

    async function playUrls(urls) {
        stop();

        const currentPlaybackId = playbackId;

        for (const url of urls) {
            if (currentPlaybackId !== playbackId) {
                return;
            }

            await playFile(
                url,
                currentPlaybackId
            );
        }
    }

    async function speak(
        number,
        options = {}
    ) {
        const response = await fetch(
            "/api/voice-number",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    number,
                    include_currency:
                        options.includeCurrency === true,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok || !data.ok) {
            throw new Error(
                data.error || "Ошибка озвучивания"
            );
        }

        await playUrls(data.urls);

        return data;
    }

    return {
        speak,
        stop,
        unlock,
        playUrls,
    };
})();