
(function () {
  const focusableSelector = [
    'input[type="text"]:not([disabled])',
    'select:not([disabled])',
    'input[type="submit"]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])'
  ].join(',');

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.visibility !== 'hidden' &&
           style.display !== 'none' &&
           rect.width > 0 &&
           rect.height > 0;
  }

  function getFocusable() {
    return Array.from(document.querySelectorAll(focusableSelector))
      .filter(isVisible);
  }

  function center(rect) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function scoreCandidate(currentRect, candidateRect, direction) {
    const c = center(currentRect);
    const t = center(candidateRect);

    const dx = t.x - c.x;
    const dy = t.y - c.y;

    if (direction === 'left' && dx >= -4) return Infinity;
    if (direction === 'right' && dx <= 4) return Infinity;
    if (direction === 'up' && dy >= -4) return Infinity;
    if (direction === 'down' && dy <= 4) return Infinity;

    const primary = (direction === 'left' || direction === 'right') ? Math.abs(dx) : Math.abs(dy);
    const secondary = (direction === 'left' || direction === 'right') ? Math.abs(dy) : Math.abs(dx);

    return primary * 10 + secondary;
  }

  function moveFocus(direction) {
    const items = getFocusable();
    if (!items.length) return;

    const active = document.activeElement;
    const current = items.includes(active) ? active : items[0];
    if (!current) {
      items[0].focus();
      return;
    }

    const currentRect = current.getBoundingClientRect();
    let best = null;
    let bestScore = Infinity;

    for (const item of items) {
      if (item === current) continue;
      const rect = item.getBoundingClientRect();
      const score = scoreCandidate(currentRect, rect, direction);
      if (score < bestScore) {
        bestScore = score;
        best = item;
      }
    }

    if (best) {
      best.focus({ preventScroll: true });
      best.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  function clickFocused() {
    const el = document.activeElement;
    if (!el || el.disabled) return;
    if (el.matches('input[type="submit"], button')) {
      el.click();
    } else if (el.matches('select')) {
      el.focus();
      el.size = el.size; // no-op to keep focus behavior stable
    }
  }

  document.addEventListener('keydown', function (e) {
    const tag = document.activeElement && document.activeElement.tagName;
    const isTyping = tag === 'INPUT' && document.activeElement.type === 'text' || tag === 'TEXTAREA';

    if (isTyping && !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveFocus('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveFocus('right');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveFocus('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveFocus('down');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      const el = document.activeElement;
      if (el && !el.matches('input[type="text"], textarea')) {
        e.preventDefault();
        clickFocused();
      }
    } else if (e.key === 'Escape') {
      const el = document.activeElement;
      if (el) el.blur();
    }
  });

  window.addEventListener('load', function () {
    const first = getFocusable()[0];
    if (first) first.focus({ preventScroll: true });
  });
})();
