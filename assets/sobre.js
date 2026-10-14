'use strict';

// A página continua legível e navegável mesmo sem JavaScript.
const landscape = document.getElementById('about-landscape');
const motionButton = document.getElementById('petals-toggle');
if (landscape && motionButton && typeof window.matchMedia === 'function') {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let running = false;

  function renderMotion() {
    if (reducedMotion.matches) running = false;
    landscape.dataset.motion = running ? 'on' : 'off';
    motionButton.hidden = false;
    motionButton.disabled = reducedMotion.matches;
    motionButton.setAttribute('aria-pressed', String(running));
    motionButton.textContent = reducedMotion.matches
      ? 'Movimento reduzido'
      : running ? 'Pausar pétalas' : 'Animar pétalas';
    motionButton.title = reducedMotion.matches
      ? 'Animação desativada conforme sua preferência de acessibilidade.'
      : '';
  }

  motionButton.addEventListener('click', function () {
    if (reducedMotion.matches) return;
    running = !running;
    renderMotion();
  });
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', renderMotion);
  } else if (typeof reducedMotion.addListener === 'function') {
    reducedMotion.addListener(renderMotion);
  }
  renderMotion();
}

// Preserva os registros musicais e o aviso caso um vídeo não carregue.
document.querySelectorAll('.music-player').forEach(function (player) {
  const video = player.querySelector('video');
  if (!video) return;
  const showVideo = function () { player.classList.add('has-video'); };
  video.addEventListener('loadedmetadata', showVideo);
  video.addEventListener('error', function () {
    player.classList.remove('has-video');
  });
  if (video.readyState >= 1) showVideo();
});
