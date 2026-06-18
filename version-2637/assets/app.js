(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-redirect]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = './all-movies.html';
            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var searchInput = filterPanel.querySelector('[data-filter-search]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var genreSelect = filterPanel.querySelector('[data-filter-genre]');
        var status = filterPanel.querySelector('[data-filter-status]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var query = normalize(searchInput ? searchInput.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var genre = genreSelect ? genreSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' '));
                var yearMatch = !year || card.getAttribute('data-year') === year;
                var genreMatch = !genre || text.indexOf(normalize(genre)) !== -1;
                var queryMatch = !query || text.indexOf(query) !== -1;
                var show = yearMatch && genreMatch && queryMatch;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (status) {
                status.textContent = visible > 0 ? '已显示匹配影片' : '未找到匹配影片';
            }
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, yearSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var source = video ? video.getAttribute('data-src') : '';
        var hlsInstance = null;

        function bindSource() {
            if (!video || !source || video.getAttribute('data-bound') === 'true') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            video.setAttribute('data-bound', 'true');
        }

        function playVideo() {
            bindSource();
            if (button) {
                button.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (video) {
            bindSource();
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
        }

        if (button && video) {
            button.addEventListener('click', playVideo);
            player.addEventListener('click', function (event) {
                if (event.target === player) {
                    playVideo();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
