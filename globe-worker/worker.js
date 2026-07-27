/* visitor-globe — Cloudflare Worker
 *
 * POST /hit    — records one visit. Cloudflare provides city-level geo on
 *                every request (request.cf). Coordinates are rounded to
 *                0.5° so individual visitors can never be identified.
 * GET  /stats  — returns aggregated visit counts as
 *                { "markers": [{ "lat": ..., "lng": ..., "count": ... }] }
 *
 * Storage: Workers KV (namespace binding VISITS), one key per rounded
 * coordinate, value = visit count. Free tier is far above what a personal
 * homepage needs.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/hit" && request.method === "POST") {
      const cf = request.cf || {};
      const lat = parseFloat(cf.latitude);
      const lng = parseFloat(cf.longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return json({ ok: false, reason: "no geo" }, 202);
      }

      /* round to ~0.5° (~55 km) — aggregate only, never precise locations */
      const rLat = Math.round(lat * 2) / 2;
      const rLng = Math.round(lng * 2) / 2;
      const key = `${rLat},${rLng}`;

      const current = Number((await env.VISITS.get(key)) || "0");
      await env.VISITS.put(key, String(current + 1));

      return json({ ok: true });
    }

    if (url.pathname === "/stats" && request.method === "GET") {
      const markers = [];
      let cursor = undefined;

      /* paginate through all coordinate keys */
      do {
        const page = await env.VISITS.list({ cursor, limit: 1000 });
        for (const { name } of page.keys) {
          const [lat, lng] = name.split(",").map(Number);
          const count = Number((await env.VISITS.get(name)) || "0");
          if (Number.isFinite(lat) && Number.isFinite(lng) && count > 0) {
            markers.push({ lat, lng, count });
          }
        }
        cursor = page.list_complete ? undefined : page.cursor;
      } while (cursor);

      return json({ markers });
    }

    /* Meting-compatible NetEase proxy. When the NETEASE_MUSIC_U secret is
     * set (a VIP account cookie), /meting?type=url returns full-length
     * tracks instead of the anonymous 30-second previews. */
    if (url.pathname === "/meting" && request.method === "GET") {
      if (!allowedSite(request)) return json({ error: "forbidden" }, 403);
      return handleMeting(request, url, env);
    }

    return json({ ok: true, endpoints: ["POST /hit", "GET /stats", "GET /meting"] });
  }
};

const NETEASE = "https://music.163.com";

/* NetEase signs CDN urls for specific mirror hosts (m704 etc.) which reject
 * playback; the same object served from m701 over https always works and
 * avoids https pages blocking http audio as mixed content. */
const normalizeCdnUrl = (u) =>
  u
    .replace(/^http:\/\//, "https://")
    .replace(/^https:\/\/m\d+\.music\.126\.net/, "https://m701.music.126.net");

/* only serve the proxy to the homepage itself (media elements send no
 * Origin/Referer at all, so empty headers are allowed through) */
const allowedSite = (request) => {
  const check = (value) => {
    if (!value) return null;
    try {
      const h = new URL(value).hostname;
      return (
        h === "jixuanleng.com" ||
        h.endsWith(".jixuanleng.com") ||
        h === "seanleng1.github.io" ||
        h === "localhost" ||
        h === "127.0.0.1"
      );
    } catch {
      return false;
    }
  };
  const origin = check(request.headers.get("Origin"));
  if (origin !== null) return origin;
  const referer = check(request.headers.get("Referer"));
  if (referer !== null) return referer;
  return true;
};

const neteaseHeaders = (env) => ({
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Referer: "https://music.163.com/",
  ...(env.NETEASE_MUSIC_U ? { Cookie: `MUSIC_U=${env.NETEASE_MUSIC_U}` } : {})
});

const handleMeting = async (request, url, env) => {
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");
  const headers = neteaseHeaders(env);

  if (!id) return json({ error: "missing id" }, 400);

  /* No VIP cookie configured: pass the public Meting API through untouched
   * (its per-song auth tokens stay valid), so the site keeps the same
   * 30s-preview behaviour it had before. */
  if (!env.NETEASE_MUSIC_U) {
    if (type !== "playlist") return json({ error: "unsupported without cookie" }, 400);
    const res = await fetch(
      `https://api.i-meto.com/meting/api?server=netease&type=playlist&id=${encodeURIComponent(id)}`
    );
    return new Response(res.body, {
      status: res.status,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  if (type === "playlist") {
    const limit = Math.min(parseInt(url.searchParams.get("limit")) || 12, 200);
    const offset = Math.max(parseInt(url.searchParams.get("offset")) || 0, 0);
    const res = await fetch(`${NETEASE}/api/v6/playlist/detail?id=${encodeURIComponent(id)}`, {
      headers
    });
    const data = await res.json();
    const playlist = data?.playlist;
    let tracks = [];

    /* playlist/detail caps `tracks` at 10 and liked-playlists hold thousands
     * of songs — fetch details only for the ids we actually display */
    const trackIds = (playlist?.trackIds || []).slice(offset, offset + limit).map((t) => t.id);
    if (trackIds.length) {
      try {
        const c = JSON.stringify(trackIds.map((id) => ({ id })));
        const detailRes = await fetch(`${NETEASE}/api/v3/song/detail`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
          body: `c=${encodeURIComponent(c)}`
        });
        const detailData = await detailRes.json();
        if (Array.isArray(detailData?.songs) && detailData.songs.length) {
          const byId = new Map(detailData.songs.map((s) => [s.id, s]));
          tracks = trackIds.map((id) => byId.get(id)).filter(Boolean);
        }
      } catch (error) {
        /* fall back to whatever playlist/detail returned */
      }
    }
    if (!tracks.length && offset === 0) tracks = playlist?.tracks || [];

    const origin = url.origin;
    const songs = tracks.slice(0, limit).map((t) => ({
      title: t.name,
      author: (t.ar || []).map((a) => a.name).join(" / "),
      url: `${origin}/meting?type=url&id=${t.id}`,
      pic: t.al?.picUrl ? `${t.al.picUrl.replace(/^http:\/\//, "https://")}?param=300y300` : "",
      lrc: `${origin}/meting?type=lrc&id=${t.id}`
    }));
    return json(songs);
  }

  if (type === "url") {
    /* VIP endpoint first — highest quality tier. FLAC can't be decoded by
     * Safari or any iOS browser (all WebKit), so those clients get 320k
     * MP3 instead of the lossless stream. */
    const ua = request.headers.get("User-Agent") || "";
    const noFlac =
      /iPhone|iPad|iPod/.test(ua) ||
      (/Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS|Android/.test(ua));
    const br = url.searchParams.get("br") || (noFlac ? "320000" : "999000");
    const res = await fetch(`${NETEASE}/api/song/enhance/player/url`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
      body: `ids=[${encodeURIComponent(id)}]&br=${encodeURIComponent(br)}`
    });
    const data = await res.json();
    const songUrl = data?.data?.[0]?.url;
    if (songUrl) return Response.redirect(normalizeCdnUrl(songUrl), 302);

    /* free songs are still reachable through the outer-url gateway */
    const outer = await fetch(`${NETEASE}/song/media/outer/url?id=${encodeURIComponent(id)}.mp3`, {
      headers,
      redirect: "manual"
    });
    const location = outer.headers.get("location") || "";
    if (location && !location.includes("404")) {
      return Response.redirect(normalizeCdnUrl(location), 302);
    }

    return json({ error: "no playable url" }, 404);
  }

  if (type === "lrc") {
    const res = await fetch(
      `${NETEASE}/api/song/lyric?id=${encodeURIComponent(id)}&lv=1&kv=1&tv=-1`,
      { headers }
    );
    const data = await res.json();
    return new Response(data?.lrc?.lyric || "", {
      headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders }
    });
  }

  return json({ error: "unknown type" }, 400);
};
