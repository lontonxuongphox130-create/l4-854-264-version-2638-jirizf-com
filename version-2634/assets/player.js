document.addEventListener('DOMContentLoaded', function () {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var button = player.querySelector('.play-overlay');
  var stream = player.getAttribute('data-stream');
  var loaded = false;
  var hls = null;

  function attach() {
    if (loaded || !video || !stream) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function start(event) {
    if (event) {
      event.preventDefault();
    }

    attach();
    player.classList.add('is-playing');
    video.setAttribute('controls', 'controls');

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        player.classList.remove('is-playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
});
