let audioCtx;

function playHoverBeep() {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(700, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (_) {
    // Silently ignore audio errors (e.g., autoplay restrictions)
  }
}

export function enableHoverSound() {
  const handler = (e) => {
    const el = e.target;
    const isButtonTag = el instanceof HTMLButtonElement;
    const isRoleButton = el?.getAttribute?.('role') === 'button';
    const isDisabled = !!(el?.disabled || el?.getAttribute?.('aria-disabled') === 'true');
    if (isDisabled) return;
    if (isButtonTag || isRoleButton) {
      playHoverBeep();
    }
  };

  document.addEventListener('mouseenter', handler, true);
  return () => document.removeEventListener('mouseenter', handler, true);
}