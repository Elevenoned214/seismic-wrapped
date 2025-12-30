const CACHE_TTL = 5 * 60 * 1000; 
const cache = global.cache || (global.cache = new Map());

// Daftar instance Nitter terbaru yang lebih stabil
const INSTANCES = [
  "https://nitter.poast.org",
  "https://nitter.privacydev.net",
  "https://nitter.perennialte.ch",
  "https://nitter.esmailelbob.xyz",
  "https://nitter.no-logs.com"
];

export default async function handler(req, res) {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "username required" });

  const cached = cache.get(username);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return res.json(cached.data);
  }

  for (const base of INSTANCES) {
    try {
      // Query mencari kata 'seismic' dari user spesifik di tahun 2025
      const q = `seismic from:${username} since:2025-01-01 until:2025-12-31`;
      const url = `${base}/search?f=tweets&q=${encodeURIComponent(q)}`;

      console.log(`Checking instance: ${base}`);

      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      
      if (!r.ok) continue;

      const html = await r.text();
      // Regex untuk memisahkan setiap tweet
      const items = [...html.matchAll(/timeline-item([\s\S]*?)timeline-item/g)];

      let best = null, bestScore = 0, total = 0;

      for (const m of items) {
        const block = m[0];
        // Validasi apakah tweet benar-benar mengandung kata 'seismic'
        if (!block.toLowerCase().includes("seismic")) continue;
        total++;

        const text = extract(block, /tweet-content[^>]*>([\s\S]*?)</);
        const likes = num(block, "icon-heart");
        const rts = num(block, "icon-retweet");
        const replies = num(block, "icon-comment");

        // Rumus skor untuk menentukan 'Best Post'
        const score = likes + rts * 2 + replies * 1.5;
        if (score > bestScore) {
          bestScore = score;
          best = { text, likes, rts, replies };
        }
      }

      const data = {
        total,
        tweet: best || {
          text: "Belum ada tweet dengan kata 'seismic' di 2025.",
          likes: 0,
          rts: 0,
          replies: 0
        }
      };

      cache.set(username, { time: Date.now(), data });
      return res.json(data);

    } catch (e) {
      console.error(`Error at ${base}:`, e.message);
    }
  }

  res.status(500).json({ error: "Semua server Nitter sedang sibuk. Coba lagi nanti." });
}

function extract(html, regex) {
  const m = html.match(regex);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
}

function num(html, cls) {
  const r = new RegExp(cls + "[\\s\\S]*?>([0-9\\.K]+)<");
  const m = html.match(r);
  if (!m) return 0;
  let val = m[1];
  if (val.includes("K")) return Math.round(parseFloat(val) * 1000);
  return parseInt(val);
}