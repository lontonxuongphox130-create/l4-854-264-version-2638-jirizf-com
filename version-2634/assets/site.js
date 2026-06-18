document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav-links]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var backgrounds = Array.prototype.slice.call(hero.querySelectorAll('.hero-bg img'));
    var posters = Array.prototype.slice.call(hero.querySelectorAll('.hero-feature-poster img'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('.hero-thumb'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (item, itemIndex) {
        item.classList.toggle('is-active', itemIndex === index);
      });
      backgrounds.forEach(function (item, itemIndex) {
        item.classList.toggle('is-active', itemIndex === index);
      });
      posters.forEach(function (item, itemIndex) {
        item.classList.toggle('is-active', itemIndex === index);
      });
      thumbs.forEach(function (item, itemIndex) {
        item.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    thumbs.forEach(function (thumb, itemIndex) {
      thumb.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });

    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var target = document.querySelector(panel.getAttribute('data-target'));
    if (!target) {
      return;
    }

    var cards = Array.prototype.slice.call(target.querySelectorAll('[data-title]'));
    var empty = document.querySelector('[data-empty-state]');
    var controls = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));

    function read(name) {
      var control = panel.querySelector('[data-filter="' + name + '"]');
      return control ? control.value.trim().toLowerCase() : '';
    }

    function filterCards() {
      var q = read('q');
      var region = read('region');
      var type = read('type');
      var year = read('year');
      var shown = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matched = true;

        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (region && (card.getAttribute('data-region') || '').toLowerCase() !== region) {
          matched = false;
        }
        if (type && (card.getAttribute('data-type') || '').toLowerCase() !== type) {
          matched = false;
        }
        if (year && (card.getAttribute('data-year') || '').toLowerCase() !== year) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    controls.forEach(function (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    });
  });
});
