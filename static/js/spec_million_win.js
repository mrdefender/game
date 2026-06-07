(function () {
  const COLORS = [
    "#ffd35b",
    "#fff4b9",
    "#ff9f0a",
    "#70ffad",
    "#80e7ff",
    "#f26cff",
    "#ff3d57"
  ];

  let running = false;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function startCanvasFireworks(duration = 12000) {
    const canvas = document.getElementById("million-confetti-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    const endTime = Date.now() + duration;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    function createBurst(x, y) {
      for (let i = 0; i < 46; i++) {
        particles.push({
          x,
          y,
          vx: random(-5.5, 5.5),
          vy: random(-6.5, 4.5),
          life: random(48, 86),
          size: random(2, 5),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          gravity: random(.045, .085)
        });
      }
    }

    function createSideConfetti() {
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: Math.random() < .5 ? -20 : canvas.width + 20,
          y: random(0, canvas.height * .55),
          vx: Math.random() < .5 ? random(2, 6) : random(-6, -2),
          vy: random(-2, 3),
          life: random(70, 120),
          size: random(3, 7),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          gravity: random(.025, .055)
        });
      }
    }

    let lastBurst = 0;

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Date.now() < endTime) {
        createSideConfetti();

        if (Date.now() - lastBurst > 520) {
          createBurst(
            random(canvas.width * .18, canvas.width * .82),
            random(canvas.height * .12, canvas.height * .48)
          );

          lastBurst = Date.now();
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life--;

        ctx.globalAlpha = Math.max(p.life / 86, 0);
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;

      if (Date.now() < endTime || particles.length > 0) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.removeEventListener("resize", resize);
      }
    }

    frame();
  }

  function startMillionWinEffect() {
    if (running) return;

    running = true;

    const overlay = document.getElementById("million-win-overlay");
    if (!overlay) {
      running = false;
      return;
    }

    document.body.classList.add("million-win-mode");

    overlay.classList.remove("is-active");
    void overlay.offsetWidth;
    overlay.classList.add("is-active");

    startCanvasFireworks(12500);

    setTimeout(() => {
      overlay.classList.remove("is-active");
      document.body.classList.remove("million-win-mode");
      running = false;
    }, 13500);
  }

  window.startMillionWinEffect = startMillionWinEffect;

  if (window.socket) {
    socket.on("million_winner", () => {
      startMillionWinEffect();
    });
  }
})();
