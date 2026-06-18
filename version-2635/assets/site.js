(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var button = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function setupSearch() {
        var items = window.__MOVIES__ || [];
        document.querySelectorAll("[data-site-search]").forEach(function (input) {
            var box = input.closest(".search-box");
            var results = box ? box.querySelector(".search-results") : null;
            if (!results) {
                return;
            }

            function close() {
                results.classList.remove("is-open");
                results.innerHTML = "";
            }

            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                if (!query) {
                    close();
                    return;
                }
                var matched = items.filter(function (item) {
                    return item.search.toLowerCase().indexOf(query) !== -1;
                }).slice(0, 10);

                if (!matched.length) {
                    results.innerHTML = "<div class=\"search-empty\">未找到相关影片</div>";
                    results.classList.add("is-open");
                    return;
                }

                results.innerHTML = matched.map(function (item) {
                    return "<a href=\"" + item.url + "\"><img src=\"" + item.cover + "\" alt=\"" + item.title.replace(/\"/g, "&quot;") + "\"><span><strong>" + item.title + "</strong><small>" + item.year + " · " + item.region + " · " + item.category + "</small></span></a>";
                }).join("");
                results.classList.add("is-open");
            });

            document.addEventListener("click", function (event) {
                if (!box.contains(event.target)) {
                    close();
                }
            });
        });
    }

    function setupCardFilters() {
        document.querySelectorAll("[data-filter-cards]").forEach(function (input) {
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || "").toLowerCase();
                    card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
                });
            });
        });
    }

    window.initMoviePlayer = function (videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var loaded = false;
        var hlsInstance = null;

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function attachSource() {
            if (!video || loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                video.__hls = hlsInstance;
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function startPlayback() {
            attachSource();
            hideOverlay();
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!loaded) {
                    startPlayback();
                }
            });
            video.addEventListener("play", hideOverlay);
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    };

    ready(function () {
        setupMobileNav();
        setupHeroSlider();
        setupSearch();
        setupCardFilters();
    });
})();
