document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            const expanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", String(!expanded));
            mobileNav.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let active = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }

        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(active - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(active + 1);
            startHero();
        });
    }

    showSlide(0);
    startHero();

    const input = document.querySelector(".filter-input");
    const select = document.querySelector(".filter-select");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const empty = document.querySelector(".no-results");
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (input && query) {
        input.value = query;
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        const keyword = normalize(input ? input.value : "");
        const category = normalize(select ? select.value : "");
        let visible = 0;

        cards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.category,
                card.dataset.tags
            ].join(" "));
            const matchesKeyword = !keyword || haystack.includes(keyword);
            const matchesCategory = !category || normalize(card.dataset.category) === category;
            const show = matchesKeyword && matchesCategory;

            card.classList.toggle("is-hidden", !show);
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    if (input) {
        input.addEventListener("input", filterCards);
    }

    if (select) {
        select.addEventListener("change", filterCards);
    }

    filterCards();
});
