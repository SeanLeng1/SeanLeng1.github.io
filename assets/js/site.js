(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector("[data-site-header]");
  const content = document.getElementById("content");
  const navMenu = document.querySelector("[data-nav-menu]");
  const pageLoader = document.querySelector("[data-page-loader]");
  const pageLoaderProgress = pageLoader?.querySelector("[data-page-loader-progress]");
  const musicRoot = document.querySelector("[data-music-root]");
  const musicToggle = musicRoot?.querySelector("[data-music-toggle]");
  const musicClose = musicRoot?.querySelector("[data-music-close]");
  const musicPanel = musicRoot?.querySelector("[data-music-panel]");
  const musicPlayerMount = musicRoot?.querySelector("[data-music-player]");
  const musicTrack = musicRoot?.querySelector("[data-music-track]");
  const musicArtist = musicRoot?.querySelector("[data-music-artist]");
  const musicFallback = musicRoot?.querySelector("[data-music-fallback]");
  const musicVolumeRow = musicRoot?.querySelector("[data-music-volume-row]");
  const musicVolumeRange = musicRoot?.querySelector("[data-music-volume]");
  const musicMute = musicRoot?.querySelector("[data-music-mute]");
  const musicSearch = musicRoot?.querySelector("[data-music-search]");
  const musicSearchCount = musicRoot?.querySelector("[data-music-search-count]");
  const lyricsRoot = document.querySelector("[data-lyrics]");
  const lyricsLine = document.querySelector("[data-lyrics-line]");
  const lyricsNext = document.querySelector("[data-lyrics-next]");
  const lyricsClose = document.querySelector("[data-lyrics-close]");
  const lyricsToggle = musicRoot?.querySelector("[data-lyrics-toggle]");
  const musicQuality = musicRoot?.querySelector("[data-music-quality]");
  const previewModal = document.getElementById("publication-preview-modal");
  const previewModalTitle = previewModal?.querySelector("[data-preview-modal-title]");
  const previewModalImage = previewModal?.querySelector("[data-preview-modal-image]");
  const modalTimers = new WeakMap();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
  const narrowViewport = window.matchMedia("(max-width: 820px)");
  const LOADER_FADE_MS = 520;
  const MODAL_ANIMATION_MS = 360;
  const INTERNAL_ROUTES = new Set(["/", "/publications/"]);
  const PERSISTENT_BODY_CLASSES = new Set(["has-modal"]);
  const PUBLICATION_EQUALIZE_MIN_WIDTH = 960;
  const PUBLICATION_SECTION_GROUPS = [
    {
      cardSelector: ".paper-inline",
      sections: [
        ".paper-inline__meta",
        ".paper-inline__title",
        ".paper-inline__authors",
        ".paper-inline__venue",
        ".paper-inline__actions"
      ]
    },
    {
      cardSelector: ".paper-card",
      sections: [
        ".paper-card__meta",
        ".paper-card__title",
        ".paper-card__authors",
        ".paper-card__venue",
        ".paper-card__actions"
      ]
    }
  ];
  const musicDefaults = {
    track: musicTrack?.textContent?.trim() || "Curated Listening",
    artist: musicArtist?.textContent?.trim() || "Open the player to keep listening across pages."
  };

  let revealObserver = null;
  let paperPreviewObserver = null;
  let isNavigating = false;
  let publicationEqualizeTimer = 0;
  const routeCache = new Map();

  const musicState = (window.__siteMusicState =
    window.__siteMusicState || {
      librariesPromise: null,
      initPromise: null,
      metingMounted: false,
      playerReady: false,
      eventsBound: false,
      panelOpen: false,
      aplayer: null,
      lyricsDismissed: false,
      lyricsVisible: false,
      lyricIndex: -1,
      swapTimer: 0,
      lastVolume: 10,
      lazySongsStarted: false
    });

  const normalizePath = (value) => {
    const url = new URL(value, window.location.origin);
    let path = url.pathname.replace(/index\.html$/, "");
    if (!path.endsWith("/")) path += "/";
    return path || "/";
  };

  const closeNav = () => {
    if (!navMenu) return;
    navMenu.classList.remove("is-open");
  };

  const shouldSimplifyPageWork = () =>
    reduceMotion.matches || coarsePointer.matches || narrowViewport.matches;

  const shouldPrefetchInternalRoutes = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return true;
    if (connection.saveData) return false;
    return !/(^|-)2g$/.test(connection.effectiveType || "");
  };

  const cloneChildNodes = (element) =>
    Array.from(element.childNodes, (node) => node.cloneNode(true));

  const syncHeader = () => {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(scrollTop / maxScroll, 1);
    const depth = Math.min(scrollTop / Math.max(window.innerHeight * 1.15, 1), 1);

    root.style.setProperty("--scroll-progress", progress.toFixed(4));
    root.style.setProperty("--scroll-depth", depth.toFixed(4));

    if (!header) return;
    header.classList.toggle("is-scrolled", scrollTop > 12);
  };

  const initPageLoader = () => {
    if (!pageLoader) return;

    let progressValue = 0;
    let loaderFinished = false;

    const syncLoader = (value) => {
      progressValue = value;
      pageLoader.style.setProperty("--loader-progress", (progressValue / 100).toFixed(4));
      if (pageLoaderProgress) pageLoaderProgress.textContent = `${Math.round(progressValue)}%`;
    };

    syncLoader(4);

    const progressTimer = window.setInterval(() => {
      if (loaderFinished) return;
      const delta = progressValue < 40 ? 10 + Math.random() * 8 : 4 + Math.random() * 7;
      syncLoader(Math.min(progressValue + delta, 88));
    }, 140);

    const finishLoader = () => {
      if (loaderFinished) return;
      loaderFinished = true;
      window.clearInterval(progressTimer);
      syncLoader(100);
      pageLoader.classList.add("is-complete");
      window.setTimeout(() => {
        pageLoader.remove();
      }, LOADER_FADE_MS);
    };

    const scheduleFinish = () => {
      window.setTimeout(finishLoader, 160);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", scheduleFinish, { once: true });
    } else {
      scheduleFinish();
    }

    window.addEventListener("pageshow", scheduleFinish, { once: true });
    window.setTimeout(finishLoader, 1800);
  };

  const initPointerAura = () => {
    const enablePointerAura =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !reduceMotion.matches;

    if (!enablePointerAura) return;

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
      },
      { passive: true }
    );
  };

  const initNav = () => {
    if (!navMenu) return;

    navMenu.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      closeNav();
    });
  };

  const initReveal = (scope = document) => {
    const revealItems = Array.from(scope.querySelectorAll("[data-reveal]"));

    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    if (!revealItems.length) return;

    if (shouldSimplifyPageWork()) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver?.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );

    revealItems.forEach((item) => {
      item.classList.remove("is-visible");
      revealObserver?.observe(item);
    });
  };

  const initYearFilters = (scope = document) => {
    const yearChips = Array.from(scope.querySelectorAll("[data-filter-year]"));
    const yearSections = Array.from(scope.querySelectorAll("[data-publication-year]"));

    if (!yearChips.length || !yearSections.length) return;

    yearChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const year = chip.dataset.filterYear;

        yearChips.forEach((button) => {
          const active = button === chip;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", active ? "true" : "false");
        });

        yearSections.forEach((section) => {
          const visible = year === "all" || section.dataset.publicationYear === year;
          section.hidden = !visible;
        });

        schedulePublicationEqualization(document);
      });
    });
  };

  const groupCardsByRow = (cards) => {
    const rows = [];

    cards.forEach((card) => {
      if (!card.getClientRects().length) return;

      const top = Math.round(card.getBoundingClientRect().top);
      let row = rows.find((candidate) => Math.abs(candidate.top - top) <= 4);

      if (!row) {
        row = { top, cards: [] };
        rows.push(row);
      }

      row.cards.push(card);
    });

    return rows;
  };

  const resetPublicationEqualization = (scope = document) => {
    scope
      .querySelectorAll(
        ".paper-inline__meta, .paper-inline__title, .paper-inline__authors, .paper-inline__venue, .paper-inline__actions, .paper-card__meta, .paper-card__title, .paper-card__authors, .paper-card__venue, .paper-card__actions"
      )
      .forEach((element) => {
        element.style.minHeight = "";
      });
  };

  const equalizePublicationSections = (scope = document) => {
    if (window.innerWidth < PUBLICATION_EQUALIZE_MIN_WIDTH) {
      resetPublicationEqualization(scope);
      return;
    }

    const grids = Array.from(scope.querySelectorAll(".paper-grid"));

    grids.forEach((grid) => {
      PUBLICATION_SECTION_GROUPS.forEach(({ cardSelector, sections }) => {
        const cards = Array.from(grid.querySelectorAll(cardSelector)).filter((card) => card.getClientRects().length);
        if (!cards.length) return;

        cards.forEach((card) => {
          sections.forEach((selector) => {
            const element = card.querySelector(selector);
            if (element) element.style.minHeight = "";
          });
        });

        const rows = groupCardsByRow(cards);

        rows.forEach(({ cards: rowCards }) => {
          sections.forEach((selector) => {
            const elements = rowCards
              .map((card) => card.querySelector(selector))
              .filter(Boolean);

            const maxHeight = elements.reduce((height, element) => {
              return Math.max(height, Math.ceil(element.getBoundingClientRect().height));
            }, 0);

            elements.forEach((element) => {
              element.style.minHeight = maxHeight ? `${maxHeight}px` : "";
            });
          });
        });
      });
    });
  };

  const schedulePublicationEqualization = (scope = document) => {
    if (publicationEqualizeTimer) {
      window.clearTimeout(publicationEqualizeTimer);
    }

    publicationEqualizeTimer = window.setTimeout(() => {
      publicationEqualizeTimer = 0;
      equalizePublicationSections(scope);
    }, 80);
  };

  const fetchRouteHtml = async (url) => {
    const path = normalizePath(url);
    const cached = routeCache.get(path);
    if (cached) return cached;

    const request = fetch(url, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .catch((error) => {
        routeCache.delete(path);
        throw error;
      });

    routeCache.set(path, request);
    return request;
  };

  const prefetchInternalRoutes = () => {
    if (!shouldPrefetchInternalRoutes()) return;

    const currentPath = normalizePath(window.location.href);

    INTERNAL_ROUTES.forEach((path) => {
      if (path === currentPath) return;
      const url = new URL(path, window.location.origin).href;
      fetchRouteHtml(url).catch(() => {});
    });
  };

  const scheduleInternalRoutePrefetch = () => {
    const run = () => prefetchInternalRoutes();

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 1500 });
      return;
    }

    window.setTimeout(run, 900);
  };

  /* PDF previews: attach the real src only when a card nears the viewport.
     Chrome's lazy-iframes fetch from several viewports away, so without this
     every multi-MB PDF parses at once and scrolling stutters. Once loaded,
     an iframe keeps its document — scrolling back never reloads it. */
  const initPaperPreviews = (scope = document) => {
    const iframes = scope.querySelectorAll(".paper-card__document[data-src]");
    if (!iframes.length) return;

    if (!("IntersectionObserver" in window)) {
      iframes.forEach((iframe) => {
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute("data-src");
      });
      return;
    }

    if (!paperPreviewObserver) {
      paperPreviewObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const iframe = entry.target;
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute("data-src");
            paperPreviewObserver.unobserve(iframe);
          });
        },
        { rootMargin: "400px 0px" }
      );
    }

    iframes.forEach((iframe) => paperPreviewObserver.observe(iframe));
  };

  const initDynamicContent = (scope = document) => {
    initYearFilters(scope);
    initReveal(scope);
    initPaperPreviews(scope);
    syncHeader();
    schedulePublicationEqualization(scope);
  };

  const setModalState = (modal, open) => {
    const timer = modalTimers.get(modal);

    if (timer) {
      window.clearTimeout(timer);
      modalTimers.delete(modal);
    }

    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      modal.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.classList.add("has-modal");
      body.classList.add("has-modal");
      void modal.offsetWidth;
      modal.classList.add("is-active");
      modal.querySelector(".modal__dialog")?.focus();
      return;
    }

    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");

    const closeTimer = window.setTimeout(() => {
      modal.hidden = true;
      document.documentElement.classList.remove("has-modal");
      body.classList.remove("has-modal");
      body.style.paddingRight = "";
      modalTimers.delete(modal);
    }, MODAL_ANIMATION_MS);

    modalTimers.set(modal, closeTimer);
  };

  const ensureStylesheet = (id, href) =>
    new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        resolve(existing);
        return;
      }

      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve(link);
      link.onerror = reject;
      document.head.appendChild(link);
    });

  const ensureScript = (src) =>
    new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts).find((script) => script.src === src);
      if (existing) {
        if (existing.dataset.loaded === "true") {
          resolve(existing);
          return;
        }

        existing.addEventListener("load", () => resolve(existing), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.loaded = "false";
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve(script);
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });

  const loadMusicLibraries = () => {
    if (musicState.librariesPromise) return musicState.librariesPromise;

    musicState.librariesPromise = ensureStylesheet(
      "site-music-aplayer-css",
      "https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css"
    )
      .then(() => ensureScript("https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js"))
      .then(() => ensureScript("https://cdnjs.cloudflare.com/ajax/libs/meting/2.0.1/Meting.min.js"));

    return musicState.librariesPromise;
  };

  const openPreviewModal = (src, title) => {
    if (!previewModal || !previewModalImage || !src) return;

    previewModalImage.src = src;
    previewModalImage.alt = title ? `${title} preview image` : "Publication preview image";
    if (previewModalTitle) previewModalTitle.textContent = title || "Publication Preview";
    setModalState(previewModal, true);
  };

  const updateMusicMeta = () => {
    if (!musicRoot || !musicTrack || !musicArtist) return;

    const player = musicState.aplayer;
    let nextTrack = musicDefaults.track;
    let nextArtist = musicDefaults.artist;
    let isPlaying = false;

    if (player && player.list?.audios?.length) {
      const currentAudio = player.list.audios[player.list.index];
      if (currentAudio) {
        nextTrack = currentAudio.name || currentAudio.title || nextTrack;
        nextArtist = currentAudio.artist || nextArtist;
      }
      isPlaying = Boolean(player.audio && !player.audio.paused);
    }

    musicTrack.textContent = nextTrack;
    musicArtist.textContent = nextArtist;
    musicRoot.classList.toggle("is-playing", isPlaying);
  };

  /* floating lyrics — synced from APlayer's parsed LRC */
  const syncLyricsToggle = () => {
    if (!lyricsToggle) return;
    const on = !musicState.lyricsDismissed;
    lyricsToggle.classList.toggle("is-on", on);
    lyricsToggle.setAttribute("aria-pressed", String(on));
  };

  const setLyricsVisible = (visible) => {
    if (!lyricsRoot) return;
    if (musicState.lyricsVisible === visible) return;
    musicState.lyricsVisible = visible;
    if (visible) {
      lyricsRoot.hidden = false;
      window.requestAnimationFrame(() => lyricsRoot.classList.add("is-active"));
    } else {
      lyricsRoot.classList.remove("is-active");
      window.setTimeout(() => {
        if (!musicState.lyricsVisible) lyricsRoot.hidden = true;
      }, 380);
    }
  };

  const updateLyrics = () => {
    const player = musicState.aplayer;
    if (!player || !lyricsRoot || !lyricsLine) return;

    const listIndex = player.list?.index ?? 0;
    const parsed = player.lrc?.parsed?.[listIndex];
    const hasLyrics =
      Array.isArray(parsed) && parsed.some((entry) => (entry?.[1] || "").trim().length > 0);

    if (!hasLyrics) {
      /* LRC still loading, or the song has none — never flash an empty bar */
      if (musicState.lyricsVisible) setLyricsVisible(false);
      return;
    }

    const index = Math.min(player.lrc?.index ?? 0, parsed.length - 1);
    const text = (parsed[index]?.[1] || "").trim();
    if (index !== musicState.lyricIndex && text) {
      musicState.lyricIndex = index;
      window.clearTimeout(musicState.swapTimer);

      const commitSwap = () => {
        musicState.swapTimer = 0;
        lyricsLine.classList.remove("is-leaving");
        lyricsNext?.classList.remove("is-fading");
        lyricsLine.textContent = text;
        lyricsLine.classList.remove("is-swapping");
        void lyricsLine.offsetWidth; /* restart the line-change animation */
        lyricsLine.classList.add("is-swapping");
        lyricsRoot.classList.remove("is-pulsing");
        void lyricsRoot.offsetWidth;
        lyricsRoot.classList.add("is-pulsing");

        /* next non-empty line, dimmed underneath */
        if (lyricsNext) {
          let nextText = "";
          for (let i = index + 1; i < parsed.length; i++) {
            const candidate = (parsed[i]?.[1] || "").trim();
            if (candidate) {
              nextText = candidate;
              break;
            }
          }
          lyricsNext.textContent = nextText;
          lyricsNext.hidden = !nextText;
        }
      };

      const hadText = lyricsLine.textContent.trim().length > 0;
      if (hadText && musicState.lyricsVisible && !reduceMotion.matches) {
        /* let the old line float out before the new one floats in */
        lyricsLine.classList.add("is-leaving");
        lyricsNext?.classList.add("is-fading");
        musicState.swapTimer = window.setTimeout(commitSwap, 170);
      } else {
        commitSwap();
      }
    }

    const isPlaying = Boolean(player.audio && !player.audio.paused);
    if (isPlaying && !musicState.lyricsDismissed && !musicState.lyricsVisible && text) {
      setLyricsVisible(true);
    }
  };

  /* custom volume slider — APlayer's hover popup is too fiddly to drag */
  const updateVolumeUI = (value) => {
    if (!musicVolumeRow || !musicVolumeRange) return;
    const percent = Math.max(0, Math.min(100, value));
    musicVolumeRange.style.setProperty("--vol", `${percent}%`);
    musicVolumeRow.classList.toggle("is-muted", percent === 0);
  };

  const setVolume = (value, glide = false) => {
    const clamped = Math.max(0, Math.min(100, value));
    if (!musicVolumeRange) return;
    if (glide && !reduceMotion.matches) {
      /* let the fill flow to the new level instead of jumping */
      musicVolumeRange.classList.add("is-gliding");
      window.clearTimeout(musicState.volumeGlideTimer);
      musicState.volumeGlideTimer = window.setTimeout(
        () => musicVolumeRange.classList.remove("is-gliding"),
        420
      );
    }
    musicVolumeRange.value = String(clamped);
    musicState.aplayer?.volume(clamped / 100);
    if (clamped > 0) musicState.lastVolume = clamped;
    updateVolumeUI(clamped);
  };

  const initVolumeControl = () => {
    if (!musicVolumeRange || !musicMute || musicVolumeRange.dataset.bound) return;
    musicVolumeRange.dataset.bound = "true";
    musicVolumeRange.addEventListener("input", () => {
      /* a real drag must track the cursor instantly — cancel any glide */
      musicVolumeRange.classList.remove("is-gliding");
      setVolume(Number(musicVolumeRange.value));
    });
    musicMute.addEventListener("click", (event) => {
      event.preventDefault();
      const current = Number(musicVolumeRange.value);
      setVolume(current > 0 ? 0 : musicState.lastVolume || 10, true);
    });
    updateVolumeUI(Number(musicVolumeRange.value));
  };

  /* playlist search — filters the loaded songs in place */
  const applyMusicFilter = () => {
    if (!musicSearch) return;
    const query = musicSearch.value.trim().toLowerCase();
    const items = musicPlayerMount?.querySelectorAll(".aplayer .aplayer-list ol li") || [];
    let shown = 0;
    items.forEach((li) => {
      const hit = !query || li.textContent.toLowerCase().includes(query);
      li.classList.toggle("is-filtered-out", !hit);
      if (hit) shown += 1;
    });
    musicRoot.classList.toggle("is-searching", Boolean(query));
    if (musicSearchCount) {
      musicSearchCount.hidden = !query;
      musicSearchCount.textContent = query ? `${shown} / ${items.length}` : "";
    }
  };

  const initMusicSearch = () => {
    if (!musicSearch || musicSearch.dataset.bound) return;
    musicSearch.dataset.bound = "true";
    musicSearch.addEventListener("input", applyMusicFilter);
    /* native × of type=search fires input too, so clearing restores the list */
    applyMusicFilter();
  };

  /* append more songs in the background after the first page is ready */
  const lazyLoadSongs = () => {
    const config = musicRoot?.dataset || {};
    if (!config.api || !config.id || musicState.lazySongsStarted) return;
    musicState.lazySongsStarted = true;

    const PAGE = 48;
    /* the playlist holds ~3.2k songs; loading stops on its own at the first
       short page, MAX is only a runaway guard */
    const MAX = 4000;
    let offset = Number(config.limit) || 12;

    const buildUrl = (off, lim) =>
      config.api
        .replace(":server", config.server || "netease")
        .replace(":type", config.type || "playlist")
        .replace(":id", config.id)
        .replace(":auth", "")
        .replace(":r", Math.random().toString())
        .replace(/([?&])limit=\d+/, `$1limit=${lim}`) + `&offset=${off}`;

    const loadNext = async () => {
      const player = musicState.aplayer;
      if (!player || offset >= MAX) return;
      try {
        const res = await fetch(buildUrl(offset, PAGE));
        if (!res.ok) return;
        const songs = await res.json();
        if (!Array.isArray(songs) || !songs.length) return;
        player.list.add(
          songs.map((s) => ({
            name: s.title,
            artist: s.author,
            url: s.url,
            cover: s.pic,
            lrc: s.lrc
          }))
        );
        offset += songs.length;
        applyMusicFilter(); /* keep the active query applied to new arrivals */
        if (songs.length === PAGE) {
          /* while the user is searching, pull the remaining pages faster */
          const delay = musicRoot.classList.contains("is-searching") ? 350 : 1500;
          window.setTimeout(loadNext, delay);
        }
      } catch (error) {
        /* stop quietly — the first page still works */
      }
    };

    window.setTimeout(loadNext, 1500);
  };

  const bindMusicPlayerEvents = () => {
    if (!musicState.aplayer || musicState.eventsBound) return;

    const sync = () => window.requestAnimationFrame(updateMusicMeta);
    ["play", "pause", "ended", "loadeddata", "listswitch"].forEach((eventName) => {
      musicState.aplayer.on(eventName, sync);
    });

    musicState.aplayer.on("timeupdate", updateLyrics);
    musicState.aplayer.on("lrcshow", updateLyrics);
    musicState.aplayer.on("play", () => {
      musicState.lyricIndex = -1;
      updateLyrics(); /* shows itself once real lyric text is available */
    });
    musicState.aplayer.on("pause", () => setLyricsVisible(false));
    musicState.aplayer.on("listswitch", () => {
      musicState.lyricsDismissed = false; /* a new song re-enables auto-show */
      syncLyricsToggle();
      window.clearTimeout(musicState.swapTimer);
      musicState.swapTimer = 0;
      lyricsLine?.classList.remove("is-leaving");
      lyricsNext?.classList.remove("is-fading");
      musicState.lyricIndex = -1;
      setLyricsVisible(false); /* drop the previous song's line immediately */
      window.setTimeout(updateLyrics, 800); /* give the LRC fetch a beat */
    });

    musicState.eventsBound = true;
    sync();
    applyMusicFilter(); /* initial page of songs may already be listed */
  };

  const resolveMusicPlayerInstance = () => {
    const globalPlayer = window.aplayer || musicState.aplayer;
    if (globalPlayer?.audio) return globalPlayer;

    const metingElement = musicPlayerMount?.querySelector("meting-js");
    if (metingElement?.aplayer?.audio) return metingElement.aplayer;

    if (metingElement?.aplayer && musicPlayerMount?.querySelector(".aplayer")) {
      return metingElement.aplayer;
    }

    return null;
  };

  const waitForMusicPlayer = () =>
    new Promise((resolve, reject) => {
      const deadline = Date.now() + 15000;

      const poll = () => {
        const candidate = resolveMusicPlayerInstance();

        if (candidate) {
          resolve(candidate);
          return;
        }

        if (Date.now() > deadline) {
          reject(new Error("Music player timed out while initializing."));
          return;
        }

        window.setTimeout(poll, 120);
      };

      poll();
    });

  const initializeMusicPlayer = () => {
    if (!musicRoot || !musicPlayerMount) return Promise.resolve();
    if (musicState.initPromise) return musicState.initPromise;

    musicRoot.classList.add("is-loading");

    musicState.initPromise = loadMusicLibraries()
      .then(() => {
        if (!musicState.metingMounted) {
          const config = musicRoot.dataset;
          const metingElement = document.createElement("meting-js");
          metingElement.setAttribute("server", config.server || "netease");
          metingElement.setAttribute("type", config.type || "playlist");
          metingElement.setAttribute("id", config.id || "");
          if (config.api) metingElement.setAttribute("api", config.api);
          metingElement.setAttribute("autoplay", config.autoplay || "false");
          metingElement.setAttribute("theme", config.theme || "#7f99c4");
          metingElement.setAttribute("volume", config.volume || "0.10");
          metingElement.setAttribute("limit", config.limit || "12");
          metingElement.setAttribute("list-folded", "false");
          metingElement.setAttribute("list-max-height", "220px");
          metingElement.setAttribute("mutex", "true");
          const playerSlot = document.createElement("div");
          playerSlot.className = "site-music__aplayer-slot";
          playerSlot.appendChild(metingElement);
          musicPlayerMount.replaceChildren(playerSlot);
          musicState.metingMounted = true;
        }

        return waitForMusicPlayer();
      })
      .then((player) => {
        musicState.aplayer = player;
        musicState.playerReady = true;
        musicRoot.classList.remove("is-loading", "is-error");
        musicRoot.classList.add("is-ready");
        if (musicFallback) musicFallback.hidden = true;
        bindMusicPlayerEvents();
        updateMusicMeta();
        initVolumeControl();
        initMusicSearch();
        if (musicVolumeRange && player.audio) {
          setVolume(Math.round((player.audio.volume || 0) * 100));
        }
        lazyLoadSongs();
        return player;
      })
      .catch((error) => {
        console.error(error);
        musicState.initPromise = null;
        musicState.librariesPromise = null;
        musicState.metingMounted = false;
        musicRoot.classList.remove("is-loading");
        musicRoot.classList.add("is-error");
        musicPlayerMount.replaceChildren();
        if (musicTrack) musicTrack.textContent = "Playlist unavailable";
        if (musicArtist) musicArtist.textContent = "Open the playlist directly.";
        if (musicFallback) musicFallback.hidden = false;
      });

    return musicState.initPromise;
  };

  const setMusicPanelOpen = (open) => {
    if (!musicRoot || !musicPanel || !musicToggle) return;

    musicState.panelOpen = open;
    musicRoot.classList.toggle("is-open", open);
    musicToggle.setAttribute("aria-expanded", open ? "true" : "false");
    musicPanel.setAttribute("aria-hidden", open ? "false" : "true");
    if ("inert" in musicPanel) musicPanel.inert = !open;

    if (open) {
      musicPanel.hidden = false;
      window.requestAnimationFrame(() => musicPanel.classList.add("is-active"));
      initializeMusicPlayer();
      return;
    }

    musicPanel.classList.remove("is-active");
  };

  const initMusic = () => {
    if (!musicRoot || !musicToggle || !musicPanel) return;

    musicPanel.hidden = false;
    musicPanel.setAttribute("aria-hidden", "true");
    if ("inert" in musicPanel) musicPanel.inert = true;

    musicToggle.addEventListener("click", (event) => {
      event.preventDefault();
      closeNav();
      setMusicPanelOpen(!musicState.panelOpen);
    });

    musicClose?.addEventListener("click", (event) => {
      event.preventDefault();
      setMusicPanelOpen(false);
    });

    lyricsClose?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      musicState.lyricsDismissed = true;
      syncLyricsToggle();
      setLyricsVisible(false);
    });

    /* manual lyrics switch next to the volume bar — re-open after × */
    lyricsToggle?.addEventListener("click", (event) => {
      event.preventDefault();
      musicState.lyricsDismissed = !musicState.lyricsDismissed;
      syncLyricsToggle();
      if (musicState.lyricsDismissed) {
        setLyricsVisible(false);
      } else {
        updateLyrics(); /* re-shows itself if the current song has lyrics */
      }
    });
    syncLyricsToggle();

    /* quality badge — mirrors the worker's UA-based tier logic */
    if (musicQuality) {
      const ua = navigator.userAgent;
      const noFlac =
        /iPhone|iPad|iPod/.test(ua) ||
        (/Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS|Android/.test(ua));
      musicQuality.textContent = noFlac ? "320K · HIGH" : "FLAC · LOSSLESS";
      musicQuality.hidden = false;
    }

    /* draggable lyrics bar — position persists per browser */
    if (lyricsRoot) {
      const POS_KEY = "site-lyrics-pos";
      try {
        const saved = JSON.parse(window.localStorage.getItem(POS_KEY) || "null");
        if (saved && typeof saved.left === "number" && typeof saved.top === "number") {
          lyricsRoot.style.left = `${saved.left}px`;
          lyricsRoot.style.top = `${saved.top}px`;
          lyricsRoot.style.bottom = "auto";
          lyricsRoot.style.transform = "none";
        }
      } catch (error) {
        /* storage blocked — keep the default dock */
      }

      lyricsRoot.addEventListener("pointerdown", (event) => {
        if (event.target.closest("[data-lyrics-close]")) return;
        if (event.button !== undefined && event.button !== 0) return;
        event.preventDefault();
        const rect = lyricsRoot.getBoundingClientRect();
        const grabX = event.clientX - rect.left;
        const grabY = event.clientY - rect.top;

        lyricsRoot.style.left = `${rect.left}px`;
        lyricsRoot.style.top = `${rect.top}px`;
        lyricsRoot.style.bottom = "auto";
        lyricsRoot.style.transform = "none";
        lyricsRoot.classList.add("is-dragging");
        try {
          lyricsRoot.setPointerCapture(event.pointerId);
        } catch (error) {
          /* older browsers fall back to same-element listeners below */
        }

        /* rAF-throttled writes keep the drag glued to the cursor */
        let pendingX = rect.left;
        let pendingY = rect.top;
        let rafId = 0;
        const apply = () => {
          rafId = 0;
          lyricsRoot.style.left = `${pendingX}px`;
          lyricsRoot.style.top = `${pendingY}px`;
        };
        const move = (ev) => {
          pendingX = Math.min(Math.max(ev.clientX - grabX, 8), window.innerWidth - rect.width - 8);
          pendingY = Math.min(Math.max(ev.clientY - grabY, 8), window.innerHeight - rect.height - 8);
          if (!rafId) rafId = window.requestAnimationFrame(apply);
        };
        const up = () => {
          lyricsRoot.removeEventListener("pointermove", move);
          lyricsRoot.removeEventListener("pointerup", up);
          lyricsRoot.removeEventListener("pointercancel", up);
          if (rafId) {
            window.cancelAnimationFrame(rafId);
            apply();
          }
          lyricsRoot.classList.remove("is-dragging");
          try {
            window.localStorage.setItem(
              POS_KEY,
              JSON.stringify({ left: parseFloat(lyricsRoot.style.left), top: parseFloat(lyricsRoot.style.top) })
            );
          } catch (error) {
            /* ignore */
          }
        };
        lyricsRoot.addEventListener("pointermove", move);
        lyricsRoot.addEventListener("pointerup", up);
        lyricsRoot.addEventListener("pointercancel", up);
      });
    }
  };

  const shouldHandleInternalNavigation = (link, event) => {
    if (!link || !content) return false;
    if (event.defaultPrevented) return false;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target === "_blank" || link.hasAttribute("download")) return false;
    if (link.closest("[data-music-root]") || link.closest(".aplayer") || link.closest(".modal")) return false;

    const url = new URL(link.href, window.location.href);
    const targetPath = normalizePath(url.href);
    const currentPath = normalizePath(window.location.href);

    if (url.origin !== window.location.origin) return false;
    if (!INTERNAL_ROUTES.has(targetPath)) return false;
    if (url.hash && targetPath === currentPath) return false;
    if (targetPath === currentPath && !url.hash) return false;

    return true;
  };

  const updateHeadFromDocument = (doc, url) => {
    if (doc.title) document.title = doc.title;

    const selectors = [
      ["meta[name='description']", "content"],
      ["meta[property='og:title']", "content"],
      ["meta[property='og:description']", "content"],
      ["meta[property='og:url']", "content"],
      ["link[rel='canonical']", "href"]
    ];

    selectors.forEach(([selector, attribute]) => {
      const next = doc.querySelector(selector);
      const current = document.querySelector(selector);
      if (!next || !current) return;

      if (selector === "meta[property='og:url']") {
        current.setAttribute(attribute, new URL(url, window.location.origin).href);
        return;
      }

      current.setAttribute(attribute, next.getAttribute(attribute) || "");
    });
  };

  const syncBodyClass = (doc) => {
    const nextClasses = (doc.body?.getAttribute("class") || "site-page")
      .split(/\s+/)
      .filter(Boolean);
    const preserved = Array.from(body.classList).filter((className) =>
      PERSISTENT_BODY_CLASSES.has(className)
    );

    body.className = "";
    nextClasses.forEach((className) => body.classList.add(className));
    preserved.forEach((className) => body.classList.add(className));
  };

  const applyRouteDocument = async (doc, url, pushState) => {
    const nextContent = doc.querySelector("#content");
    const nextNav = doc.querySelector("[data-nav-menu]");

    if (!nextContent) throw new Error("Unable to locate #content in fetched page.");

    const swap = () => {
      if (nextNav && navMenu) navMenu.replaceChildren(...cloneChildNodes(nextNav));
      content.replaceChildren(...cloneChildNodes(nextContent));
      syncBodyClass(doc);
      updateHeadFromDocument(doc, url);
      closeNav();
      initDynamicContent(content);
      if (pushState) history.pushState({ path: url }, "", url);
    };

    if (shouldSimplifyPageWork()) {
      swap();
      return;
    }

    content.classList.add("is-swapping");
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    swap();

    await new Promise((resolve) => {
      window.requestAnimationFrame(() => {
        content.classList.remove("is-swapping");
        resolve();
      });
    });
  };

  const navigate = async (url, options = {}) => {
    const { pushState = true } = options;
    if (isNavigating) return;

    isNavigating = true;
    setMusicPanelOpen(false);

    try {
      const html = await fetchRouteHtml(url);
      const doc = new DOMParser().parseFromString(html, "text/html");

      await applyRouteDocument(doc, url, pushState);

      window.scrollTo(0, 0);

      syncHeader();
      scheduleInternalRoutePrefetch();
    } catch (error) {
      console.error(error);
      window.location.href = url;
    } finally {
      isNavigating = false;
    }
  };

  initPageLoader();
  syncHeader();
  initPointerAura();
  initNav();
  initDynamicContent(document);
  initMusic();
  scheduleInternalRoutePrefetch();

  document.fonts?.ready?.then(() => {
    schedulePublicationEqualization(document);
  });

  window.addEventListener("scroll", syncHeader, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      syncHeader();
      schedulePublicationEqualization(document);
    },
    { passive: true }
  );

  document.addEventListener("click", (event) => {
    const previewTrigger = event.target.closest("[data-preview-src]");
    if (previewTrigger) {
      event.preventDefault();
      openPreviewModal(
        previewTrigger.getAttribute("data-preview-src"),
        previewTrigger.getAttribute("data-preview-title")
      );
      return;
    }

    const modalTrigger = event.target.closest("[data-modal-target]");
    if (modalTrigger) {
      const targetId = modalTrigger.getAttribute("data-modal-target");
      const modal = targetId ? document.getElementById(targetId) : null;
      if (modal) {
        event.preventDefault();
        setModalState(modal, true);
      }
      return;
    }

    const modalClose = event.target.closest("[data-modal-close]");
    if (modalClose) {
      const modal = modalClose.closest(".modal");
      if (!modal) return;
      event.preventDefault();
      setModalState(modal, false);
      return;
    }

    const link = event.target.closest("a[href]");
    if (link && shouldHandleInternalNavigation(link, event)) {
      event.preventDefault();
      navigate(link.href, { pushState: true });
      return;
    }

    if (
      musicState.panelOpen &&
      musicRoot &&
      event.target instanceof Element &&
      event.target.isConnected &&
      !event.target.closest("[data-music-root]")
    ) {
      setMusicPanelOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const activeModal = document.querySelector(".modal:not([hidden])");
    if (activeModal) {
      setModalState(activeModal, false);
      return;
    }

    if (musicState.panelOpen) {
      setMusicPanelOpen(false);
      return;
    }

    closeNav();
  });

  window.addEventListener("popstate", () => {
    const nextPath = normalizePath(window.location.href);
    if (!INTERNAL_ROUTES.has(nextPath)) return;
    navigate(window.location.href, { pushState: false });
  });
})();
