(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('#mobileNav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = parseInt(dot.getAttribute('data-hero-dot'), 10);
                show(nextIndex);
                restart();
            });
        });
        start();
    }

    function normalizeText(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var year = scope.querySelector('[data-filter-year]');
            var region = scope.querySelector('[data-filter-region]');
            var category = scope.querySelector('[data-filter-category]');
            var reset = scope.querySelector('[data-filter-reset]');
            var empty = scope.querySelector('[data-filter-empty]');
            var container = scope.parentElement || document;
            var cards = Array.prototype.slice.call(container.querySelectorAll('.searchable-card'));

            function applyFilters() {
                var query = normalizeText(input ? input.value : '');
                var selectedYear = year ? year.value : '';
                var selectedRegion = region ? region.value : '';
                var selectedCategory = category ? category.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalizeText(card.getAttribute('data-search'));
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardRegion = card.getAttribute('data-region') || '';
                    var cardCategory = card.getAttribute('data-category') || '';
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    if (selectedRegion && cardRegion !== selectedRegion) {
                        matched = false;
                    }
                    if (selectedCategory && cardCategory !== selectedCategory) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            var params = new URLSearchParams(window.location.search);
            var queryFromUrl = params.get('q');
            if (input && queryFromUrl) {
                input.value = queryFromUrl;
            }

            [input, year, region, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilters);
                    control.addEventListener('change', applyFilters);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (region) {
                        region.value = '';
                    }
                    if (category) {
                        category.value = '';
                    }
                    applyFilters();
                });
            }

            applyFilters();
        });
    }

    function bindSource(video, source) {
        if (video.getAttribute('data-source-ready') === 'true') {
            return video.hlsInstance || null;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.setAttribute('data-source-ready', 'true');
            return null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            video.setAttribute('data-source-ready', 'true');
            return hls;
        }

        video.src = source;
        video.setAttribute('data-source-ready', 'true');
        return null;
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var source = player.getAttribute('data-src');
            var video = player.querySelector('video');
            var button = player.querySelector('.player-start');
            if (!source || !video || !button) {
                return;
            }

            function attemptPlay() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(function () {
                        button.classList.add('is-hidden');
                        button.classList.remove('is-loading');
                    }).catch(function () {
                        button.classList.remove('is-loading');
                    });
                } else {
                    button.classList.add('is-hidden');
                    button.classList.remove('is-loading');
                }
            }

            function startPlayback() {
                button.classList.add('is-loading');
                var hls = bindSource(video, source);
                if (hls && window.Hls && window.Hls.Events && video.readyState === 0) {
                    var manifestHandler = function () {
                        if (typeof hls.off === 'function') {
                            hls.off(window.Hls.Events.MANIFEST_PARSED, manifestHandler);
                        }
                        attemptPlay();
                    };
                    var errorHandler = function (event, data) {
                        if (data && data.fatal) {
                            button.classList.remove('is-loading');
                            if (typeof hls.off === 'function') {
                                hls.off(window.Hls.Events.ERROR, errorHandler);
                            }
                        }
                    };
                    if (typeof hls.on === 'function') {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, manifestHandler);
                        hls.on(window.Hls.Events.ERROR, errorHandler);
                    } else {
                        attemptPlay();
                    }
                } else {
                    attemptPlay();
                }
            }

            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayback();
            });

            player.addEventListener('click', function (event) {
                if (event.target === video || event.target === player) {
                    if (video.paused) {
                        startPlayback();
                    }
                }
            });

            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
                button.classList.remove('is-loading');
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
