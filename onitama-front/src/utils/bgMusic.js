let audio;
let listenersAttached = false;
let suppressed = false; // quando true, não deve tocar (ex.: gameplay)

function isGameplayRoute() {
  try {
    const p = (window.location?.pathname || "");
    return p.startsWith('/onitama');
  } catch (_) {
    return false;
  }
}

function getAudio() {
  if (!audio) {
    audio = new Audio('/sound/music/japanese_soundtrack.mp3');
    audio.loop = true;
    audio.volume = 0.2; // ajuste fino do volume padrão
  }
  return audio;
}

function tryPlay(a) {
  if (suppressed || isGameplayRoute()) return;
  a.play().catch(() => {
    // Navegadores podem bloquear autoplay; retomaremos no primeiro clique
  });
}

export function initBgMusic() {
  const a = getAudio();
  // Evita tocar imediatamente caso a página atual seja gameplay
  if (isGameplayRoute()) suppressed = true;
  if (!listenersAttached) {
    const resumeOnInteraction = () => {
      tryPlay(a);
      document.removeEventListener('click', resumeOnInteraction);
    };
    document.addEventListener('click', resumeOnInteraction, { once: true });

    const handleVisibility = () => {
      if (document.hidden) {
        a.pause();
      } else {
        tryPlay(a);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Marca que ouvintes foram anexados; não removemos em navegação para continuidade
    listenersAttached = true;
  }
}

export function playBgMusic() {
  const a = getAudio();
  initBgMusic();
  suppressed = false;
  a.muted = false;
  tryPlay(a);
}

export function pauseBgMusic() {
  const a = getAudio();
  suppressed = true;
  a.pause();
  a.muted = true;
}

export function stopBgMusic() {
  const a = getAudio();
  suppressed = true;
  a.pause();
  a.currentTime = 0;
  a.muted = true;
  try { a.src = ''; } catch (_) {}
}

export function setBgVolume(v) {
  const a = getAudio();
  a.volume = Math.max(0, Math.min(1, v));
}

export function setBgTrack(src, opts = {}) {
  const a = getAudio();
  const absolute = new URL(src, window.location.origin).href;
  if (a.src !== absolute) {
    a.src = src;
  }
  if (typeof opts.loop === 'boolean') a.loop = opts.loop;
  if (typeof opts.volume === 'number') a.volume = Math.max(0, Math.min(1, opts.volume));
  if (opts.restart) a.currentTime = 0;
}