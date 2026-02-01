---
layout: default
permalink: /
title: ""
excerpt: ""
author_profile: false
hide_sidebar: true
hide_masthead: true
body_class: homepage
redirect_from: 
  - /about/
  - /about.html
years: [2026, 2025, 2024]
cards:
  - id: news
    eyebrow: News
    title: Recent highlights
    wide: true
    type: list
    list:
      - date: 2026.02
        text: '<a href="https://arxiv.org/pdf/2503.00031" target="_blank" rel="noopener">Self-Calibration</a> accepted by ICLR 2026.'
      - date: 2025.09
        text: 'Survey paper on <a href="https://openreview.net/pdf?id=nLJZh4M6S5" target="_blank" rel="noopener">Reliable and Responsible Foundation Models</a> accepted by TMLR.'
      - date: 2025.06
        text: '<a href="https://arxiv.org/abs/2504.00043" target="_blank" rel="noopener">CrossWordBench</a> accepted by COLM 2025.'
      - date: 2025.06
        text: 'New preprints on <a href="https://arxiv.org/abs/2505.24217" target="_blank" rel="noopener">semi-structured LLM auditing</a> and <a href="https://arxiv.org/abs/2506.03566" target="_blank" rel="noopener">speculative decoding</a>.'
      - date: 2025.05
        text: 'Joining Google Research as a Student Researcher for summer 2025.'
      - date: 2025.02
        text: '<a href="https://arxiv.org/abs/2410.09724" target="_blank" rel="noopener">Taming Overconfidence in LLMs</a> accepted by ICLR 2025 (poster).'
      - date: 2024.09
        text: '<a href="https://openreview.net/forum?id=lEUle8S4xQ" target="_blank" rel="noopener">S<sup>2</sup>FT</a> accepted by NeurIPS 2024 (poster).'
      - date: 2024.08
        text: 'Started M.S. in Machine Learning at Carnegie Mellon University.'
  - id: education
    eyebrow: Education
    title: Academic path
    type: list
    list:
      - date: 2024 - Now
        text: 'M.S. in Machine Learning, Carnegie Mellon University, USA.'
      - date: 2020 - 2024
        text: 'B.S. in Computer Science, University of Rochester, USA.'
  - id: research
    eyebrow: Research
    title: Experience
    type: list
    list:
      - date: 2025.06 - Now
        text: 'Student Researcher, Google Research (advisor: <a href="https://research.google/people/105487/" target="_blank" rel="noopener">Dr. Si Si</a>).'
      - date: 2025.01 - 2025.05
        text: 'Independent Study, Carnegie Mellon University (advisor: <a href="https://www.cs.cmu.edu/~wcohen/" target="_blank" rel="noopener">Prof. William W. Cohen</a>).'
      - date: 2024.06 - Now
        text: 'Visiting Researcher, Washington University in St. Louis (advisor: <a href="https://teapot123.github.io/" target="_blank" rel="noopener">Prof. Jiaxin Huang</a>).'
      - date: 2023.12 - 2024.05
        text: 'Honor Independent Study, VIStA Lab, University of Rochester (advisors: <a href="https://www.cs.rochester.edu/u/jluo/" target="_blank" rel="noopener">Prof. Jiebo Luo</a> and <a href="https://www.urmc.rochester.edu/people/112361798-rajat-k-jain" target="_blank" rel="noopener">Dr. Rajat K. Jain</a>).'
      - date: 2022.12 - 2024.05
        text: 'Research Intern, DREAM Lab (advisor: <a href="https://haohanwang.github.io/" target="_blank" rel="noopener">Prof. Haohan Wang</a>).'
  - id: service
    eyebrow: Service
    title: Community
    type: list
    list:
      - date: 2025 - Now
        text: 'Reviewer, ICLR.'
      - date: 2024 - Now
        text: 'Reviewer, TMLR.'
      - date: 2022 - 2023
        text: 'Teaching Assistant, CSC261/461: Database System, University of Rochester.'
contact:
  eyebrow: Get in touch
  title: Let's collaborate
  text: 'Feel free to reach out if you would like to chat about research or collaboration.'
---

{% assign author = site.author %}
{% include deadlines-modal.html %}
<link rel="stylesheet" href="{{ '/assets/css/contact-form.css' | relative_url }}">

<svg style="position:absolute;width:0;height:0;overflow:hidden">
  <defs>
    <!-- Noise texture for glass displacement -->
    <filter id="glass-noise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="4" result="turbulence">
        <animate attributeName="baseFrequency" values="0.01;0.02;0.01" dur="8s" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="15" xChannelSelector="R" yChannelSelector="G"/>
    </filter>

    <!-- Main displacement filter -->
    <filter id="orb-displacement" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" seed="2">
        <animate attributeName="baseFrequency" values="0.02;0.04;0.02" dur="12s" repeatCount="indefinite"/>
      </feTurbulence>
      <feComponentTransfer in="noise" result="normalizedNoise">
        <feFuncR type="table" tableValues="0 1"/>
        <feFuncG type="table" tableValues="0 1"/>
      </feComponentTransfer>
      <feDisplacementMap in="SourceGraphic" in2="normalizedNoise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
      <feGaussianBlur stdDeviation="0.5"/>
    </filter>

    <!-- Animated gradient patterns -->
    <linearGradient id="orb-grad-1">
      <stop offset="0%" stop-color="#ffc9e5">
        <animate attributeName="stop-color" values="#ffc9e5;#c9d5ff;#ffe5c9;#ffc9e5" dur="6s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" stop-color="#d5c9ff">
        <animate attributeName="stop-color" values="#d5c9ff;#ffe5c9;#c9d5ff;#d5c9ff" dur="6s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="#c9fff0">
        <animate attributeName="stop-color" values="#c9fff0;#ffc9e5;#d5c9ff;#c9fff0" dur="6s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>

    <!-- Glow filter -->
    <filter id="orb-glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
</svg>

<style>
  body.homepage {
    background-color: #f7f8fb;
  }
  .home-page {
    min-height: 100vh;
    padding: 3rem 1.5rem 0;
    background-color: #f7f8fb;
    background-image:
      radial-gradient(circle at 20% -10%, rgba(253, 253, 253, 0.95), rgba(241, 241, 243, 0.9) 45%, rgba(226, 229, 234, 0.85) 100%),
      radial-gradient(circle, rgba(99, 102, 241, 0.3) 1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(139, 92, 246, 0.25) 1.5px, transparent 1.5px);
    background-size: 100% 100%, 24px 24px, 40px 40px;
    background-position: 0 0, 0 0, 12px 12px;
  }
  .home-shell {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 28px;
    padding: 3rem 2.5rem;
    box-shadow: 0 25px 45px rgba(15, 15, 40, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.8);
    max-width: 1260px;
    margin: 0 auto;
  }
  .home-grid {
    gap: 1.5rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 2rem;
  }
  @media (max-width: 1080px) {
    .home-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .home-card--wide {
      grid-column: span 2;
    }
  }
  @media (max-width: 900px) {
    .home-page {
      padding: 2rem 1rem 0 !important;
    }
    .home-shell {
      padding: 2rem 1.5rem !important;
    }
    .home-grid {
      display: grid !important;
      grid-template-columns: 1fr !important;
      grid-template-areas: none !important;
      gap: 1rem !important;
    }
    .home-card,
    .home-card--wide {
      grid-column: 1 / -1 !important;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
    }
  }
  @media (max-width: 600px) {
    .home-page {
      padding: 1.5rem 0.75rem 0 !important;
    }
    .home-shell {
      padding: 1.5rem 1rem !important;
      border-radius: 20px;
    }
    .home-grid {
      gap: 0.8rem !important;
    }
    .glass-btn {
      font-size: 0.85rem;
      padding: 0.55rem 1rem;
    }
    .glass-btn span {
      font-size: 0.85rem;
    }
  }
  .home-card {
    position: relative;
    overflow: hidden;
    border: none;
    padding: 0;
    background: linear-gradient(180deg, #ffffff 0%, #f7f5ff 60%, #f2f2ff 100%);
    border-radius: 20px;
    transition: transform 0.35s ease, box-shadow 0.35s ease;
    box-shadow: 0 18px 35px rgba(15, 15, 40, 0.07);
  }
  .home-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.5), transparent 60%);
    pointer-events: none;
    opacity: 0.85;
  }
  .home-card--wide {
    grid-column: span 3;
  }
  .home-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(10, 10, 30, 0.12);
  }
  .home-card__header {
    position: relative;
    z-index: 1;
    padding: 1.5rem;
  }
  .home-card__header h3 {
    margin-bottom: 0.4rem;
    font-size: 1.4rem;
  }
  .home-card__header a.home-chip {
    margin-top: 0.35rem;
  }
  .home-list {
    position: relative;
    z-index: 1;
    list-style: none;
    margin: 0;
    padding: 0 1.5rem 1.5rem;
  }
  .home-list li {
    padding-bottom: 0.6rem;
    border-bottom: 1px dashed rgba(15, 15, 40, 0.08);
    margin-bottom: 0.6rem;
  }
  .home-list li:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  .home-list__date {
    font-weight: 600;
    color: rgba(15, 15, 40, 0.7);
    margin-right: 0.35rem;
  }
  .home-pubs-list h3 {
    margin: 1.4rem 0 0.35rem 1.5rem;
    font-size: 1.4rem;
    letter-spacing: 0.04em;
    color: #343b52;
    font-weight: 600;
  }
  .home-hero__social {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 1.6rem;
  }
  @keyframes liquidPulse {
    0% {
      transform: translateY(0) scale(1);
      box-shadow: 0 18px 30px rgba(15, 15, 40, 0.12);
    }
    50% {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 25px 45px rgba(15, 15, 40, 0.2);
    }
    100% {
      transform: translateY(0) scale(1);
      box-shadow: 0 18px 30px rgba(15, 15, 40, 0.12);
    }
  }
  .home-hero__social {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    padding: 0.5rem 0;
    margin-top: 1rem;
  }

  /* Glass Button */
  .glass-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.65rem 1.2rem;
    border-radius: 20px;
    cursor: pointer;
    text-decoration: none;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border: none;
    background: transparent;
  }

  .glass-btn span {
    position: relative;
    z-index: 10;
    font-size: 0.95rem;
    font-weight: 600;
    color: #0f0f28;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    pointer-events: none;
  }

  .glass-btn:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  }

  .glass-btn:active {
    transform: translateY(-1px) scale(1.01);
  }
  .home-contact {
    margin-top: 2rem;
    border-radius: 20px;
    padding: 2rem;
    background: radial-gradient(circle at top right, rgba(194, 12, 12, 0.12), transparent 55%);
    border: 1px solid rgba(194, 12, 12, 0.2);
    box-shadow: 0 20px 40px rgba(15, 15, 40, 0.08);
  }
  .home-contact__header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  .home-contact__header h3 {
    margin: 0;
  }
  .home-contact__text {
    margin-bottom: 1.5rem;
  }
</style>

<div class="home-page">
  <div class="home-shell">
    <section class="home-hero">
      <div class="home-hero__text">
        <p class="home-hero__eyebrow">Jixuan Leng - MSML @ Carnegie Mellon University</p>
        <h1>Jixuan Leng</h1>
        <p class="home-hero__lede">
          I am a second-year MSML student at Carnegie Mellon University advised by <a href="https://www.cs.cmu.edu/~wcohen/" target="_blank" rel="noopener">Prof. William W. Cohen</a>. I completed my B.S. in Computer Science at University of Rochester with <a href="https://www.cs.rochester.edu/u/jluo/#Prospective" target="_blank" rel="noopener">Prof. Jiebo Luo</a> and collaborated with <a href="https://haohanwang.github.io/" target="_blank" rel="noopener">Prof. Haohan Wang</a> (UIUC DREAM Lab) and <a href="https://teapot123.github.io/" target="_blank" rel="noopener">Prof. Jiaxin Huang</a> (WashU).
        </p>
        <p class="home-hero__lede">
          My research interests focus on efficient training and inference, and model alignment for both LLMs and VLMs. I am currently a Student Researcher at Google Research advised by <a href="https://research.google/people/105487/" target="_blank" rel="noopener">Dr. Si Si</a>.
        </p>
        <div class="home-hero__cta">
          <a class="home-cta-link" href="mailto:{{ site.author.email }}">Email: {{ site.author.email }}</a>
        </div>
        <div class="home-hero__social">
          <a class="glass-btn" href="{{ site.author.googlescholar }}" target="_blank" rel="noopener"><span>Google Scholar</span></a>
          <a class="glass-btn" href="{{ site.author.dblp }}" target="_blank" rel="noopener"><span>DBLP</span></a>
          <a class="glass-btn" href="https://github.com/{{ site.author.github }}" target="_blank" rel="noopener"><span>GitHub</span></a>
          <a class="glass-btn" href="https://twitter.com/{{ site.author.twitter }}" target="_blank" rel="noopener"><span>X (Twitter)</span></a>
          <a class="glass-btn" href="javascript:void(0)" data-wechat-trigger><span>WeChat</span></a>
          <a class="glass-btn" href="/publications/"><span>Full Publication list</span></a>
        </div>
      </div>
      <div class="home-hero__card">
        <div class="home-hero__avatar">
          <img src="{{ site.author.avatar | relative_url }}" alt="{{ site.author.name }}">
        </div>
        <div class="home-hero__meta">
          <div class="home-hero__name">{{ site.author.name }}</div>
          <div class="home-hero__role">Carnegie Mellon University - Pittsburgh, USA</div>
          <div class="home-hero__chips">
            <span class="chip">LLMs</span>
            <span class="chip">VLMs</span>
            <span class="chip">Efficiency</span>
            <span class="chip">Reasoning</span>
          </div>
        </div>
      </div>
    </section>

    <section class="home-grid">
      {% for card in page.cards %}
        <article class="home-card{% if card.wide %} home-card--wide{% endif %}" {% if card.id %}id="{{ card.id }}"{% endif %}>
          <div class="home-card__header">
            <p class="home-card__eyebrow">{{ card.eyebrow }}</p>
            <h3>{{ card.title }}</h3>
            {% if card.cta %}
              <a class="{{ card.cta.classes }}" href="{{ card.cta.href }}">{{ card.cta.text }}</a>
            {% endif %}
          </div>
          {% if card.type == 'list' %}
            <ul class="home-list">
              {% for item in card.list %}
                <li>
                  <span class="home-list__date">{{ item.date }}</span>
                  <span class="home-list__text">{{ item.text | raw }}</span>
                </li>
              {% endfor %}
            </ul>
          {% endif %}
        </article>
      {% endfor %}

      <article class="home-card home-card--wide">
        <div class="home-card__header">
          <div>
            <p class="home-card__eyebrow">Papers</p>
            <h3>Selected publications</h3>
          </div>
          <a class="home-chip" href="/publications/">View all</a>
        </div>
        <div class="home-pubs-list">
          {% for y in page.years %}
            <h3 style="margin-bottom: 0.2em; margin-top: 0.8em;">{{ y }}</h3>
            {% bibliography -f papers --query @*[year={{y}}][selected=true] %}
          {% endfor %}
        </div>
      </article>

    </section>

    <section class="home-contact">
      <div class="home-contact__header">
        <p class="home-card__eyebrow">{{ page.contact.eyebrow }}</p>
        <h3>{{ page.contact.title }}</h3>
      </div>
      <p class="home-contact__text">{{ page.contact.text }}</p>
      {% include contact-form.html %}
    </section>
  </div>
</div>

<script src="{{ '/assets/js/contact-form.js' | relative_url }}"></script>
<script>
  // Global function to initialize glass buttons
  window.initGlassButtons = function() {
    const colors = [
      ['#ffc9e5', '#d5c9ff', '#c9fff0'],
      ['#c9d5ff', '#ffe5c9', '#ffc9e5'],
      ['#ffe5c9', '#c9fff0', '#d5c9ff'],
      ['#c9fff0', '#ffc9e5', '#ffe5c9'],
      ['#d5c9ff', '#c9fff0', '#ffc9e5'],
      ['#ffc9e5', '#ffe5c9', '#c9d5ff']
    ];

    document.querySelectorAll('.glass-btn').forEach((btn, index) => {
      // Remove existing SVG if any
      const existingSvg = btn.querySelector('svg');
      if (existingSvg) {
        existingSvg.remove();
      }

      const colorSet = colors[index % colors.length];
      const svg = createGlassBtnSVG(colorSet, index);
      btn.insertBefore(svg, btn.firstChild);
    });
  };

  function createGlassBtnSVG(colors, seed) {
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.style.position = 'absolute';
      svg.style.inset = '-1px';
      svg.style.width = 'calc(100% + 2px)';
      svg.style.height = 'calc(100% + 2px)';
      svg.style.pointerEvents = 'none';
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('preserveAspectRatio', 'none');

      const gradId = `btn-grad-${seed}`;
      const defs = document.createElementNS(svgNS, 'defs');

      // Animated gradient
      const grad = document.createElementNS(svgNS, 'linearGradient');
      grad.setAttribute('id', gradId);
      grad.setAttribute('x1', '0%');
      grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '100%');
      grad.setAttribute('y2', '100%');

      colors.forEach((color, i) => {
        const stop = document.createElementNS(svgNS, 'stop');
        stop.setAttribute('offset', `${(i / (colors.length - 1)) * 100}%`);
        stop.setAttribute('stop-color', color);
        stop.setAttribute('stop-opacity', '0.6');

        const anim = document.createElementNS(svgNS, 'animate');
        anim.setAttribute('attributeName', 'stop-color');
        anim.setAttribute('values', colors.join(';') + ';' + colors[0]);
        anim.setAttribute('dur', `${5 + seed * 0.5}s`);
        anim.setAttribute('repeatCount', 'indefinite');

        stop.appendChild(anim);
        grad.appendChild(stop);
      });

      // Rotate animation
      const gradTransform = document.createElementNS(svgNS, 'animateTransform');
      gradTransform.setAttribute('attributeName', 'gradientTransform');
      gradTransform.setAttribute('type', 'rotate');
      gradTransform.setAttribute('from', '0 0.5 0.5');
      gradTransform.setAttribute('to', '360 0.5 0.5');
      gradTransform.setAttribute('dur', '10s');
      gradTransform.setAttribute('repeatCount', 'indefinite');
      grad.appendChild(gradTransform);

      defs.appendChild(grad);
      svg.appendChild(defs);

      // Background rect
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', '0');
      rect.setAttribute('y', '0');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '100');
      rect.setAttribute('fill', `url(#${gradId})`);
      rect.setAttribute('rx', '20');
      rect.style.filter = 'url(#orb-displacement)';
      svg.appendChild(rect);

      // Top highlight
      const highlight = document.createElementNS(svgNS, 'ellipse');
      highlight.setAttribute('cx', '50%');
      highlight.setAttribute('cy', '30%');
      highlight.setAttribute('rx', '40%');
      highlight.setAttribute('ry', '25%');
      highlight.setAttribute('fill', 'white');
      highlight.setAttribute('opacity', '0.4');
      highlight.style.filter = 'blur(8px)';
      svg.appendChild(highlight);

      return svg;
  }

  // Global initialization function for homepage elements
  window.initHomePageElements = function() {
    console.log('🏠 Initializing homepage elements...');

    // Initialize WeChat trigger
    var trigger = document.querySelector('[data-wechat-trigger]');
    if (trigger && typeof handleWeChatClick === 'function') {
      console.log('   ✓ Binding WeChat trigger');
      // Remove any existing listener to avoid duplicates
      trigger.replaceWith(trigger.cloneNode(true));
      trigger = document.querySelector('[data-wechat-trigger]');
      trigger.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        handleWeChatClick(event);
      });
    }

    // Initialize glass buttons
    var buttons = document.querySelectorAll('.glass-btn');
    if (buttons.length > 0) {
      console.log('   ✓ Initializing glass buttons');
      initGlassButtons();
    }

    console.log('✅ Homepage elements initialized');
  };

  // Initialize on first page load
  window.addEventListener('load', function() {
    initHomePageElements();
  });

  // Also try on DOMContentLoaded as fallback for first load
  document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.glass-btn') && !document.querySelector('.glass-btn svg')) {
      console.log('Initializing from DOMContentLoaded (first load)');
      initHomePageElements();
    }
  });

  // Make all publication links open in new tab (except preview buttons)
  function makePublicationLinksExternal() {
    var pubsSection = document.querySelector('.home-pubs-list');
    if (pubsSection) {
      var links = pubsSection.querySelectorAll('a:not(.preview-button)');
      links.forEach(function(link) {
        // Skip if it's a relative link (internal navigation)
        if (!link.href.startsWith('http://') && !link.href.startsWith('https://') && !link.href.startsWith('#')) {
          return;
        }
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
      console.log('✓ Made', links.length, 'publication links open in new tab');
    }
  }

  // Run on load
  window.addEventListener('load', makePublicationLinksExternal);

  // Also run after SPA navigation
  window.addEventListener('spa:navigate', function() {
    setTimeout(makePublicationLinksExternal, 100);
  });
</script>
