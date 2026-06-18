(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function text(value) {
    return (value || '').toString().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });
    slider.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });
    slider.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input], [data-filter-category], [data-filter-type], [data-filter-year]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!inputs.length || !cards.length) {
      return;
    }
    var searchInput = document.querySelector('[data-search-input]');
    var category = document.querySelector('[data-filter-category]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    function run() {
      var q = text(searchInput && searchInput.value);
      var cat = category ? category.value : '';
      var t = type ? type.value : '';
      var y = year ? year.value : '';
      cards.forEach(function (card) {
        var haystack = text(card.getAttribute('data-search'));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (cat && card.getAttribute('data-category') !== cat) {
          ok = false;
        }
        if (t && card.getAttribute('data-type') !== t) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }
    inputs.forEach(function (input) {
      input.addEventListener('input', run);
      input.addEventListener('change', run);
    });
  }

  window.initVideoPlayer = function (videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }
    var shell = video.closest('.player-shell');
    var cover = shell ? shell.querySelector('[data-player-cover]') : null;
    var direct = document.querySelector('[data-direct-play]');
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function start() {
      load();
      video.controls = true;
      if (shell) {
        shell.classList.add('is-playing');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    load();
    if (cover) {
      cover.addEventListener('click', start);
    }
    if (direct) {
      direct.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
