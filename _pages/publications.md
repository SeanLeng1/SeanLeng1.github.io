---
layout: default
title: "Publications"
description: "Publications by Jixuan Leng."
permalink: /publications/
body_class: "publications-page"
years: [2026, 2025, 2024]
---
{% assign years = page.years %}

<section class="section section--subhero">
  <div class="shell">
    <div class="section-heading section-heading--tight" data-reveal>
      <h1 class="display display--subpage">All&nbsp;&nbsp;Publications</h1>
    </div>

    <div class="filter-bar" data-reveal>
      <button class="filter-chip is-active" type="button" data-filter-year="all" aria-pressed="true">All</button>
      {% for year in years %}
        <button class="filter-chip" type="button" data-filter-year="{{ year }}" aria-pressed="false">{{ year }}</button>
      {% endfor %}
    </div>
  </div>
</section>

<section class="section section--tinted">
  <div class="shell publication-stack">
    {% for year in years %}
      <section class="publication-year" id="year-{{ year }}" data-publication-year="{{ year }}">
        <div class="publication-year__header" data-reveal>
          <span>{{ year }}</span>
        </div>
        <div class="paper-grid">
          {% bibliography --query @*[year={{ year }}] --template pub-card %}
        </div>
      </section>
    {% endfor %}
  </div>
</section>
