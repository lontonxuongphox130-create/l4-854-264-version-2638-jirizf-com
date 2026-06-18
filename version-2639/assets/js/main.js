(() => {
  const body = document.body;
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      body.classList.toggle('nav-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === current);
      });
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => show(current + 1), 5600);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  const filters = Array.from(document.querySelectorAll('.movie-filter'));

  filters.forEach((filter) => {
    const scope = filter.parentElement || document;
    const input = filter.querySelector('[data-filter-input]');
    const clear = filter.querySelector('[data-filter-clear]');
    const buttons = Array.from(filter.querySelectorAll('[data-filter-category]'));
    const cards = Array.from(scope.querySelectorAll('[data-filter-list] .movie-card'));
    const empty = scope.querySelector('[data-empty-state]');
    let activeCategory = 'all';

    const apply = () => {
      const query = input ? input.value.trim().toLowerCase() : '';
      let shown = 0;

      cards.forEach((card) => {
        const haystack = (card.dataset.search || '').toLowerCase();
        const cardCategory = card.dataset.category || '';
        const categoryMatch = activeCategory === 'all' || cardCategory === activeCategory;
        const queryMatch = !query || haystack.includes(query);
        const visible = categoryMatch && queryMatch;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    };

    if (input) {
      input.addEventListener('input', apply);
      const params = new URLSearchParams(window.location.search);
      const initial = params.get('q');
      if (initial) {
        input.value = initial;
      }
    }

    if (clear) {
      clear.addEventListener('click', () => {
        if (input) {
          input.value = '';
          input.focus();
        }
        activeCategory = 'all';
        buttons.forEach((button) => {
          button.classList.toggle('active', button.dataset.filterCategory === 'all');
        });
        apply();
      });
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        activeCategory = button.dataset.filterCategory || 'all';
        buttons.forEach((item) => item.classList.toggle('active', item === button));
        apply();
      });
    });

    apply();
  });

  const video = document.querySelector('[data-player-video]');
  const startButton = document.querySelector('[data-player-start]');

  if (video) {
    const shell = video.closest('.player-shell');
    const source = video.getAttribute('data-video') || '';

    const attach = () => {
      if (!source || video.dataset.ready === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = source;
      }

      video.dataset.ready = '1';
    };

    const play = () => {
      attach();
      if (shell) {
        shell.classList.add('is-playing');
      }
      const playback = video.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(() => {});
      }
    };

    if (startButton) {
      startButton.addEventListener('click', play);
    }

    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });
  }
})();
