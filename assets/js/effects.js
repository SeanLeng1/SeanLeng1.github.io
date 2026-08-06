/* effects.js — WebGL aurora background, magnetic controls,
   3D card tilt, and character-level title reveals.
   Loaded after site.js. Everything degrades gracefully:
   reduced motion / touch / missing WebGL all fall back to static CSS. */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const canAnimate = () => !reduceMotion.matches;
  const canHover = () => finePointer.matches && !reduceMotion.matches;

  /* ------------------------------------------------------------------ *
   * 1. WebGL aurora background
   * ------------------------------------------------------------------ */
  const initAurora = () => {
    const canvas = document.querySelector("[data-gl-bg]");
    if (!canvas) return;

    if (!canAnimate()) {
      canvas.remove();
      return;
    }

    const gl =
      canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" }) ||
      canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });

    if (!gl) {
      canvas.remove();
      return;
    }

    const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

    const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x, uRes.y);

  float t = uTime * 0.055;
  vec2 p = uv * 0.95 + uMouse * 0.22 + vec2(0.0, uScroll * 0.35);

  float q = fbm(p + vec2(t, -t * 0.6));
  float r = fbm(p + q * 1.7 + vec2(t * 0.7, t * 0.4));
  float f = fbm(p + r * 1.9);

  /* light aurora — pastel washes over near-white */
  vec3 base   = vec3(0.984, 0.984, 0.992);
  vec3 blue   = vec3(0.760, 0.845, 0.985);
  vec3 violet = vec3(0.860, 0.815, 0.985);
  vec3 mint   = vec3(0.780, 0.945, 0.910);
  vec3 peach  = vec3(0.995, 0.870, 0.840);

  vec3 col = base;
  col = mix(col, blue,   smoothstep(0.25, 0.78, f) * 0.60);
  col = mix(col, violet, smoothstep(0.35, 0.88, q) * 0.50);
  col = mix(col, mint,   smoothstep(0.50, 0.98, r) * 0.42);
  col = mix(col, peach,  smoothstep(0.62, 1.05, f * r * 2.0) * 0.30);

  /* soft light bloom drifting near the top */
  float glow = exp(-2.4 * length(uv - vec2(uMouse.x * 0.5, 0.85)));
  col += vec3(0.05, 0.045, 0.06) * glow;

  /* gentle edge falloff */
  col *= 1.0 - dot(uv * 0.38, uv * 0.38) * 0.10;

  /* dithering to kill banding */
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, VERT);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vertexShader || !fragmentShader) {
      canvas.remove();
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.remove();
      return;
    }
    gl.useProgram(program);

    /* fullscreen triangle */
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uScroll = gl.getUniformLocation(program, "uScroll");

    let width = 0;
    let height = 0;
    let running = true;
    let rafId = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const start = performance.now();

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.66;
      width = Math.max(1, Math.floor(canvas.clientWidth * scale));
      height = Math.max(1, Math.floor(canvas.clientHeight * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const onPointerMove = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      mouse.tx = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    const frame = (now) => {
      if (!running) return;
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;
      const scrollDepth = Math.min(
        (window.scrollY || 0) / Math.max(window.innerHeight * 1.15, 1),
        1
      );
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, scrollDepth);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = window.requestAnimationFrame(frame);
    };

    const setRunning = (next) => {
      if (next === running) return;
      running = next;
      if (running) {
        rafId = window.requestAnimationFrame(frame);
      } else {
        window.cancelAnimationFrame(rafId);
      }
    };

    document.addEventListener("visibilitychange", () => setRunning(!document.hidden));
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    root.classList.add("has-gl");
    rafId = window.requestAnimationFrame(frame);
  };

  /* ------------------------------------------------------------------ *
   * 3. Magnetic controls — buttons lean toward the pointer
   * ------------------------------------------------------------------ */
  const MAGNETIC_SELECTOR = ".button, .site-header__control, .filter-chip";

  const bindMagnetic = (scope) => {
    if (!canHover()) return;

    scope.querySelectorAll(MAGNETIC_SELECTOR).forEach((element) => {
      if (element.dataset.magneticBound) return;
      element.dataset.magneticBound = "true";

      let rafId = 0;
      const current = { x: 0, y: 0 };
      const target = { x: 0, y: 0 };

      const tick = () => {
        current.x += (target.x - current.x) * 0.18;
        current.y += (target.y - current.y) * 0.18;
        element.style.setProperty("--magnet-x", `${current.x.toFixed(2)}px`);
        element.style.setProperty("--magnet-y", `${current.y.toFixed(2)}px`);
        if (Math.abs(target.x - current.x) > 0.05 || Math.abs(target.y - current.y) > 0.05) {
          rafId = window.requestAnimationFrame(tick);
        } else {
          rafId = 0;
        }
      };

      const kick = () => {
        if (!rafId) rafId = window.requestAnimationFrame(tick);
      };

      element.addEventListener("pointermove", (event) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        const rect = element.getBoundingClientRect();
        target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
        kick();
      });

      element.addEventListener("pointerleave", () => {
        target.x = 0;
        target.y = 0;
        kick();
      });
    });
  };

  /* ------------------------------------------------------------------ *
   * 4. 3D tilt on paper cards + profile panel
   * ------------------------------------------------------------------ */
  const TILT_SELECTOR = ".paper-card";

  const bindTilt = (scope) => {
    if (!canHover()) return;

    scope.querySelectorAll(TILT_SELECTOR).forEach((element) => {
      if (element.dataset.tiltBound) return;
      element.dataset.tiltBound = "true";

      element.addEventListener("pointermove", (event) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        const rect = element.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        element.style.setProperty("--tilt-x", `${(-py * 5).toFixed(2)}deg`);
        element.style.setProperty("--tilt-y", `${(px * 6).toFixed(2)}deg`);
        element.style.setProperty("--glare-x", `${((px + 0.5) * 100).toFixed(1)}%`);
        element.style.setProperty("--glare-y", `${((py + 0.5) * 100).toFixed(1)}%`);
        element.classList.add("is-tilting");
      });

      element.addEventListener("pointerleave", () => {
        element.classList.remove("is-tilting");
        element.style.setProperty("--tilt-x", "0deg");
        element.style.setProperty("--tilt-y", "0deg");
      });
    });
  };

  /* ------------------------------------------------------------------ *
   * 5. Character-split hero title reveal
   * ------------------------------------------------------------------ */
  const splitTitle = (scope) => {
    const title = scope.querySelector(".display--hero");
    if (!title || title.dataset.splitBound) return;
    title.dataset.splitBound = "true";

    if (!canAnimate()) return;

    const text = title.textContent || "";
    title.textContent = "";
    title.setAttribute("aria-label", text);

    let index = 0;
    text.split(" ").forEach((word, wordIndex, words) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "split-word";
      wordSpan.setAttribute("aria-hidden", "true");

      Array.from(word).forEach((char) => {
        const charSpan = document.createElement("span");
        charSpan.className = "split-char";
        charSpan.style.setProperty("--char-index", index);
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
        index += 1;
      });

      title.appendChild(wordSpan);
      if (wordIndex < words.length - 1) {
        title.appendChild(document.createTextNode(" "));
      }
    });

    title.classList.add("is-split");
  };

  /* restore the plain title so the char animation can replay on re-entry */
  const resetTitle = (title) => {
    const label = title.getAttribute("aria-label");
    if (!label) return;
    title.textContent = label;
    title.classList.remove("is-split");
    delete title.dataset.splitBound;
  };

  /* replay the hero title animation every time it re-enters the viewport */
  const initHeroReplay = (scope) => {
    if (!canAnimate()) return;
    const title = scope.querySelector(".display--hero");
    if (!title || title.dataset.replayBound) return;
    title.dataset.replayBound = "true";

    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            splitTitle(scope);
          } else {
            resetTitle(title);
          }
        });
      },
      { threshold: 0.15 }
    ).observe(title);
  };

  /* ------------------------------------------------------------------ *
   * 6. Card spotlight — a soft glow that trails the pointer over glass
   * ------------------------------------------------------------------ */
  const initCardSpotlight = () => {
    if (!canHover()) return;

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        const card =
          event.target instanceof Element &&
          event.target.closest(".detail-card, .paper-inline, .paper-card, .timeline__item");
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
      },
      { passive: true }
    );
  };

  /* ------------------------------------------------------------------ *
   * 7. Scramble-decode entrance for section headings
   * ------------------------------------------------------------------ */
  const SCRAMBLE_CHARS = "ABCDEFGHKMNPRSTUVWXYZabcdefghkmnpqrstuvwxyz#%&/";

  const scrambleHeading = (heading) => {
    if (heading.dataset.scrambled) return;
    heading.dataset.scrambled = "true";

    const original = heading.textContent || "";
    const duration = 620;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const settled = Math.floor(progress * original.length);
      let out = original.slice(0, settled);

      for (let i = settled; i < original.length; i++) {
        const ch = original[i];
        out += ch.trim() === "" ? ch : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
      }

      heading.textContent = out;

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        heading.textContent = original;
      }
    };

    window.requestAnimationFrame(tick);
  };

  const initScramble = (scope) => {
    if (!canAnimate()) return;

    const headings = Array.from(scope.querySelectorAll(".section-heading h2, .section-heading h1"));
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            scrambleHeading(entry.target);
          } else {
            /* allow the decode to replay on the next visit */
            delete entry.target.dataset.scrambled;
          }
        });
      },
      { threshold: 0.4 }
    );

    headings.forEach((heading) => {
      if (heading.dataset.scrambleBound) return;
      heading.dataset.scrambleBound = "true";
      observer.observe(heading);
    });
  };

  /* ------------------------------------------------------------------ *
   * 8. Collaboration globe — rotating dotted sphere with location pulses
   * ------------------------------------------------------------------ */
  const initGlobe = (scope) => {
    const canvas = scope.querySelector("[data-globe]");
    if (!canvas || canvas.dataset.globeBound) return;
    canvas.dataset.globeBound = "true";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let markers = [];
    try {
      markers = JSON.parse(canvas.dataset.markers || "[]");
    } catch (error) {
      markers = [];
    }

    const toXYZ = (lat, lng) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      return [
        -Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ];
    };

    /* markers are swappable: static fallback first, live API data when set */
    let markerData = [];
    let hoveredMarker = null;
    let arcMarkers = [];
    const setMarkers = (list) => {
      hoveredMarker = null;
      markerData = list.map((m) => ({
        xyz: toXYZ(m.lat, m.lng),
        name: m.name || m.city || "",
        count: m.count || 0,
        weight: Math.min(Math.log2((m.count || 1) + 1), 5)
      }));
      /* flight arcs are the priciest layer — cap them at the busiest 24 */
      arcMarkers = [...markerData].sort((a, b) => b.count - a.count).slice(0, 24);
    };
    setMarkers(markers);

    const globeApi = document.querySelector('meta[name="visitor-globe-api"]')?.content?.trim();
    if (globeApi) {
      fetch(`${globeApi}/stats`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.markers) && data.markers.length) {
            setMarkers(data.markers);
          }
        })
        .catch(() => {});
    }

    /* graticule: parallels every 30° and meridians every 30° */
    const graticule = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      const line = [];
      for (let lng = -180; lng <= 180; lng += 6) line.push(toXYZ(lat, lng));
      graticule.push(line);
    }
    for (let lng = -180; lng < 180; lng += 30) {
      const line = [];
      for (let lat = -90; lat <= 90; lat += 6) line.push(toXYZ(lat, lng));
      graticule.push(line);
    }

    /* real coastline (Natural Earth 110m, loaded from world-coast.js).
       Every second point is plenty at a ~430px canvas — halves the work. */
    const coastLines = (window.WORLD_COAST || []).map((line) =>
      line.filter((_, idx) => idx % 2 === 0).map(([lat, lng]) => toXYZ(lat, lng))
    );

    /* continent labels at their geographic label-points */
    const CONTINENT_LABELS = [
      ["NORTH AMERICA", 46, -102],
      ["SOUTH AMERICA", -16, -60],
      ["EUROPE", 52, 18],
      ["AFRICA", 5, 20],
      ["ASIA", 44, 92],
      ["OCEANIA", -25, 134]
    ].map(([name, lat, lng]) => ({ name, xyz: toXYZ(lat, lng) }));

    const TILT = -0.35;
    let rotY = 0.9;
    let rotX = 0;
    let velY = 0;
    let velX = 0;
    let autoRotate = !reduceMotion.matches;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let resumeTimer = 0;

    /* frame-constant trig — hoisted out of project(), which is called
       ~8k times per frame (coastlines + graticule + arcs) */
    let pCosR = 1;
    let pSinR = 0;
    let pCosT = 1;
    let pSinT = 0;

    const project = ([x, y, z]) => {
      const rx = x * pCosR + z * pSinR;
      const rz = -x * pSinR + z * pCosR;
      const ry = y * pCosT - rz * pSinT;
      const rz2 = y * pSinT + rz * pCosT;
      return [rx, ry, rz2];
    };

    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      velY = 0;
      velX = 0;
      autoRotate = false;
      window.clearTimeout(resumeTimer);
      if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) {
        /* hover hit-test against the last frame's marker screen positions */
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0) return;
        const scale = canvas.width / rect.width;
        const px = (event.clientX - rect.left) * scale;
        const py = (event.clientY - rect.top) * scale;
        let best = null;
        let bestD = 18 * scale;
        for (const m of markerData) {
          if (m.sz === undefined || m.sz <= 0.02) continue;
          const d = Math.hypot(m.sx - px, m.sy - py);
          if (d < bestD) {
            bestD = d;
            best = m;
          }
        }
        hoveredMarker = best;
        return;
      }
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      /* past a 90° tumble the surface faces away, so yaw looks reversed —
         flip the drag sign and left/right always tracks the surface */
      const flip = Math.cos(TILT + rotX) >= 0 ? 1 : -1;
      rotY += flip * dx * 0.01; /* ~314px stroke per half-turn — no dead-stop feel */
      rotX += dy * 0.009; /* free 360° tumble on both axes */
      velY = flip * dx * 0.01;
      velX = dy * 0.009;
      lastX = event.clientX;
      lastY = event.clientY;
    });

    canvas.addEventListener("pointerleave", () => {
      hoveredMarker = null;
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      resumeTimer = window.setTimeout(() => {
        autoRotate = !reduceMotion.matches;
      }, 2400);
    };

    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    const frame = (now) => {
      if (!canvas.isConnected) return; /* page swapped away — stop the loop */

      const size = canvas.clientWidth;
      if (size === 0) {
        window.requestAnimationFrame(frame);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
        canvas.width = size * dpr;
        canvas.height = size * dpr;
      }

      if (!dragging) {
        rotY += velY;
        rotX += velX;
        velY *= 0.94;
        velX *= 0.94;
        if (autoRotate) rotY += 0.0028;
      }

      /* refresh the frame-constant rotation basis once, not per point */
      pCosR = Math.cos(rotY);
      pSinR = Math.sin(rotY);
      pCosT = Math.cos(TILT + rotX);
      pSinT = Math.sin(TILT + rotX);

      const R = (size / 2) * 0.86 * dpr;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* soft halo */
      const halo = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.3);
      halo.addColorStop(0, "rgba(94, 92, 230, 0.10)");
      halo.addColorStop(1, "rgba(94, 92, 230, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      /* sphere body — lit from the upper-left, cool indigo shade at the rim */
      const body = ctx.createRadialGradient(
        cx - R * 0.38, cy - R * 0.42, R * 0.08,
        cx, cy, R * 1.02
      );
      body.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      body.addColorStop(0.45, "rgba(240, 243, 252, 0.75)");
      body.addColorStop(0.8, "rgba(186, 194, 238, 0.35)");
      body.addColorStop(1, "rgba(120, 128, 210, 0.30)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();

      /* specular glint */
      const glint = ctx.createRadialGradient(
        cx - R * 0.42, cy - R * 0.46, 0,
        cx - R * 0.42, cy - R * 0.46, R * 0.55
      );
      glint.addColorStop(0, "rgba(255, 255, 255, 0.65)");
      glint.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = glint;
      ctx.fill();

      /* graticule — front-facing segments; the equator gets a touch more ink */
      for (let li = 0; li < graticule.length; li++) {
        ctx.strokeStyle = li === 2 ? "rgba(94, 92, 230, 0.20)" : "rgba(60, 62, 120, 0.13)";
        ctx.lineWidth = dpr * (li === 2 ? 0.9 : 0.7);
        ctx.beginPath();
        let drawing = false;
        for (const p of graticule[li]) {
          const [px, py, pz] = project(p);
          if (pz > 0.02) {
            const sx = cx + px * R;
            const sy = cy - py * R;
            if (drawing) ctx.lineTo(sx, sy);
            else ctx.moveTo(sx, sy);
            drawing = true;
          } else {
            drawing = false;
          }
        }
        ctx.stroke();
      }

      /* coastline — real continent outlines, front-facing segments only */
      ctx.strokeStyle = "rgba(43, 45, 92, 0.5)";
      ctx.lineWidth = dpr * 1.1;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (const line of coastLines) {
        ctx.beginPath();
        let drawing = false;
        for (const p of line) {
          const [px, py, pz] = project(p);
          if (pz > 0.015) {
            const sx = cx + px * R;
            const sy = cy - py * R;
            if (drawing) ctx.lineTo(sx, sy);
            else ctx.moveTo(sx, sy);
            drawing = true;
          } else {
            drawing = false;
          }
        }
        ctx.stroke();
      }

      /* continent labels — fade in as their hemisphere faces the viewer */
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${dpr * 9}px -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = `${dpr * 1.5}px`;
      for (const label of CONTINENT_LABELS) {
        const [px, py, pz] = project(label.xyz);
        if (pz <= 0.15) continue;
        const alpha = Math.min(1, (pz - 0.15) / 0.5) * 0.45;
        ctx.fillStyle = `rgba(43, 45, 92, ${alpha.toFixed(3)})`;
        ctx.fillText(label.name, cx + px * R, cy - py * R);
      }
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

      /* limb outline */
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(50, 52, 110, 0.22)";
      ctx.lineWidth = dpr;
      ctx.stroke();

      /* atmosphere — soft violet glow spilling past the limb */
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.14);
      atmo.addColorStop(0, "rgba(94, 92, 230, 0.22)");
      atmo.addColorStop(1, "rgba(94, 92, 230, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.14, 0, Math.PI * 2);
      ctx.fillStyle = atmo;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, R + dpr * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(94, 92, 230, 0.28)";
      ctx.lineWidth = dpr;
      ctx.stroke();

      /* flight arcs — animated dashes from every marker back to the hub */
      const hub = toXYZ(40.44, -79.99); /* Pittsburgh */
      ctx.save();
      ctx.setLineDash([dpr * 4, dpr * 9]);
      ctx.lineDashOffset = -((now / 24) % (dpr * 13));
      ctx.lineWidth = dpr * 1.1;
      for (const m of arcMarkers) {
        const a = hub;
        const b = m.xyz;
        let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        dot = Math.min(1, Math.max(-1, dot));
        const omega = Math.acos(dot);
        if (omega < 0.05) continue;
        const sinO = Math.sin(omega);
        const SEG = 40;
        ctx.beginPath();
        let drawing = false;
        for (let i = 0; i <= SEG; i++) {
          const t = i / SEG;
          const k0 = Math.sin((1 - t) * omega) / sinO;
          const k1 = Math.sin(t * omega) / sinO;
          const lift = 1 + Math.sin(t * Math.PI) * 0.16;
          const [px, py, pz] = project([
            (k0 * a[0] + k1 * b[0]) * lift,
            (k0 * a[1] + k1 * b[1]) * lift,
            (k0 * a[2] + k1 * b[2]) * lift
          ]);
          if (pz > -0.06) {
            const sx = cx + px * R;
            const sy = cy - py * R;
            if (drawing) ctx.lineTo(sx, sy);
            else ctx.moveTo(sx, sy);
            drawing = true;
          } else {
            drawing = false;
          }
        }
        ctx.strokeStyle = "rgba(94, 92, 230, 0.40)";
        ctx.stroke();
      }
      ctx.restore();

      /* markers with expanding pulse rings — size scales with visit count */
      const t = now / 1000;
      markerData.forEach((m, i) => {
        const [px, py, pz] = project(m.xyz);
        m.sz = pz;
        if (pz <= 0.02) return;
        const mx = cx + px * R;
        const my = cy - py * R;
        m.sx = mx;
        m.sy = my;
        const w = m.weight;

        const pulse = (t * 0.7 + i * 0.25) % 1;
        ctx.beginPath();
        ctx.arc(mx, my, dpr * (5 + w + pulse * 14), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(94, 92, 230, ${(0.45 * (1 - pulse) * pz).toFixed(3)})`;
        ctx.lineWidth = dpr * 1.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mx, my, dpr * (2.4 + w * 0.9 + (m === hoveredMarker ? 1.8 : 0)), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94, 92, 230, ${(0.55 + pz * 0.45).toFixed(3)})`;
        ctx.fill();
      });

      /* city tooltip for the hovered marker */
      if (hoveredMarker && hoveredMarker.sz > 0.02 && hoveredMarker.sx !== undefined) {
        const m = hoveredMarker;
        let label;
        if (m.name && m.count > 1) label = `${m.name} · ${m.count} visits`;
        else if (m.name) label = m.name;
        else if (m.count > 1) label = `${m.count} visits`;
        else label = "1 visit";

        ctx.font = `600 ${dpr * 10}px -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif`;
        const textW = ctx.measureText(label).width;
        const padX = dpr * 10;
        const bw = textW + padX * 2;
        const bh = dpr * 22;
        let bx = m.sx - bw / 2;
        let by = m.sy - dpr * 16 - bh;
        bx = Math.max(dpr * 6, Math.min(bx, canvas.width - bw - dpr * 6));
        if (by < dpr * 6) by = m.sy + dpr * 16; /* flip below when clipped at the top */

        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, bh / 2);
        else ctx.rect(bx, by, bw, bh);
        ctx.fillStyle = "rgba(28, 28, 58, 0.88)";
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(label, bx + padX, by + bh / 2 + dpr * 0.5);
      }

      window.requestAnimationFrame(frame);
    };

    window.requestAnimationFrame(frame);
  };

  /* count this visit once per browser session when the API is configured */
  const initVisitBeacon = () => {
    const api = document.querySelector('meta[name="visitor-globe-api"]')?.content?.trim();
    if (!api) return;

    try {
      if (window.sessionStorage.getItem("vg_counted")) return;
      window.sessionStorage.setItem("vg_counted", "1");
    } catch (error) {
      /* storage blocked — count the visit anyway */
    }

    fetch(`${api}/hit`, { method: "POST", keepalive: true }).catch(() => {});
  };

  /* ------------------------------------------------------------------ *
   * Wiring: run once, then re-bind after SPA-style content swaps
   * ------------------------------------------------------------------ */
  const bindDynamic = (scope) => {
    bindMagnetic(scope);
    bindTilt(scope);
    splitTitle(scope);
    initScramble(scope);
    initHeroReplay(scope);
    initGlobe(scope);
  };

  const initSwapObserver = () => {
    const content = document.getElementById("content");
    if (!content) return;

    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        bindDynamic(content);
      });
    }).observe(content, { childList: true });
  };

  initAurora();
  initCardSpotlight();
  initVisitBeacon();
  bindDynamic(document);
  initSwapObserver();
})();
