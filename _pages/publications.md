---
layout: default
title: "Full Publications"
permalink: /publications/
years: [2025, 2024]
body_class: pubspage
hide_sidebar: true
hide_masthead: true
---

{% comment %}
Derive years from bibliography when available; fall back to the front matter list.
{% endcomment %}
{% assign derived_years = site.bibliography | map: 'year' | compact | uniq | sort | reverse %}
{% if derived_years and derived_years != empty %}
  {% assign years = derived_years %}
{% else %}
  {% assign years = page.years %}
{% endif %}

<div class="pubs-page">
  <div class="pubs-frame">
    <div class="pubs-hero">
      <div class="pubs-hero__text">
        <h1>Full Publications</h1>
        <p class="pubs-hero__lede">
          Browse every paper with quick PDF previews. Use the year strip to jump between cohorts. <em>Please use Menu to go back.</em>
        </p>
      </div>
      <div class="pubs-hero__badge">Updated {{ site.time | date: "%b %Y" }}</div>
      <button class="pubs-menu-toggle" aria-expanded="false" aria-controls="pubs-menu-panel" title="Toggle menu">
        ☰ Menu
      </button>
    </div>

    <aside class="pubs-menu" id="pubs-menu-panel" aria-hidden="true">
      <div class="pubs-menu__title">Menu</div>
      <a class="pubs-menu__link" href="/">Home</a>
      <a class="pubs-menu__link" href="#pubs-grid">Publications</a>
      <a class="pubs-menu__link" href="{{ site.author.googlescholar }}" target="_blank" rel="noopener">Google Scholar</a>
      <div class="pubs-menu__years">
        <div class="pubs-menu__years-title">Years</div>
        {% for y in years %}
          <a class="pubs-menu__link" href="#year-{{ y }}">{{ y }}</a>
        {% endfor %}
      </div>
    </aside>

    <div class="pubs-shell">
      <div class="pubs-main">
        <div class="pubs-filter" role="tablist" aria-label="Filter publications by year">
          <button class="year-chip is-active" data-year="all" role="tab" aria-selected="true">All</button>
          {% for y in years %}
            <button class="year-chip" data-year="{{ y }}" role="tab" aria-selected="false">{{ y }}</button>
          {% endfor %}
        </div>

        <div class="pubs-collection" id="pubs-grid">
          {% for y in years %}
            <section class="pubs-year-block" data-year="{{ y }}" id="year-{{ y }}">
              <header class="pubs-year-heading">
                <div class="pubs-year-heading__pill">{{ y }}</div>
                <div class="pubs-year-heading__line"></div>
              </header>
              <div class="pubs-grid">
                {% bibliography -f papers --query @*[year={{y}}] --template pub-card %}
              </div>
            </section>
          {% endfor %}
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  (function() {
    const chips = Array.from(document.querySelectorAll('.year-chip'));
    const yearBlocks = Array.from(document.querySelectorAll('.pubs-year-block'));
    const menu = document.querySelector('.pubs-menu');
    const toggle = document.querySelector('.pubs-menu-toggle');

    const placeMenu = () => {
      if (!menu || !toggle) return;
      const rect = toggle.getBoundingClientRect();
      const menuWidth = menu.offsetWidth || 260;
      const horizontalPadding = 12;
      const viewportWidth = window.innerWidth;

      // 在移动端，menu靠右对齐
      if (viewportWidth < 768) {
        const right = Math.min(horizontalPadding, viewportWidth - rect.right);
        menu.style.left = 'auto';
        menu.style.right = `${right}px`;
      } else {
        const left = Math.max(horizontalPadding, rect.right - menuWidth);
        menu.style.left = `${left}px`;
        menu.style.right = 'auto';
      }

      const top = rect.bottom + 12;
      menu.style.top = `${top}px`;
    };

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const year = chip.dataset.year;
        chips.forEach(c => {
          c.classList.toggle('is-active', c === chip);
          c.setAttribute('aria-selected', c === chip ? 'true' : 'false');
        });

        yearBlocks.forEach(block => {
          if (year === 'all' || block.dataset.year === year) {
            block.style.display = '';
          } else {
            block.style.display = 'none';
          }
        });

        if (year === 'all') {
          document.getElementById('pubs-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const target = document.getElementById(`year-${year}`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    if (toggle && menu) {
      let hoverTimeout;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      const openMenu = () => {
        clearTimeout(hoverTimeout);
        menu.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        placeMenu();
      };

      const closeMenu = () => {
        hoverTimeout = setTimeout(() => {
          menu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
        }, 150);
      };

      const toggleMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (menu.classList.contains('is-open')) {
          menu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
        } else {
          openMenu();
        }
      };

      if (isTouchDevice) {
        // 触屏设备：点击切换
        toggle.addEventListener('click', toggleMenu);

        // 点击外部关闭
        document.addEventListener('click', (e) => {
          if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            if (menu.classList.contains('is-open')) {
              menu.classList.remove('is-open');
              toggle.setAttribute('aria-expanded', 'false');
              menu.setAttribute('aria-hidden', 'true');
            }
          }
        });
      } else {
        // 桌面设备：hover打开
        toggle.addEventListener('mouseenter', openMenu);
        toggle.addEventListener('mouseleave', closeMenu);

        menu.addEventListener('mouseenter', () => {
          clearTimeout(hoverTimeout);
        });
        menu.addEventListener('mouseleave', closeMenu);
      }

      window.addEventListener('resize', () => {
        if (menu.classList.contains('is-open')) placeMenu();
      });
      window.addEventListener('scroll', () => {
        if (menu.classList.contains('is-open')) placeMenu();
      }, { passive: true });
    }
  })();
</script>
