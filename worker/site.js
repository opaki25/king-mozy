const OWNER_EMAIL = "jonathanopaki@gmail.com";
const SCHEMA = `CREATE TABLE IF NOT EXISTS gallery_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'landscapes',
  type TEXT NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  storage_key TEXT,
  alt_text TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const STARTER_ITEMS = [
  ["Giraffes of the savannah","wildlife","image","/assets/1000593116.jpg","A family of giraffes in Uganda",10],
  ["Morning above the clouds","landscapes","image","/assets/1000593138.jpg","Mist over Uganda's green highlands",20],
  ["Bwindi encounter","wildlife","image","/assets/1000593133.jpg","Mountain gorilla in Bwindi forest",30],
  ["The power of Murchison","landscapes","image","/assets/1000593130.jpg","Boat approaching Murchison Falls",40],
  ["Kampala, our home","culture","image","/assets/1000593119.jpg","I love Kampala city landmark",50],
  ["Crater lake country","landscapes","image","/assets/1000593131.jpg","A green crater lake in Uganda",60],
  ["Elephant country","wildlife","image","/assets/1000593107.jpg","Elephant herd on a Uganda safari",70],
  ["Across the Equator","culture","image","/assets/1000593105.jpg","Uganda Equator landmark",80],
  ["Source of the Nile","culture","image","/assets/1000593127.jpg","Source of the River Nile in Jinja",90],
  ["Sipi's silver ribbon","landscapes","image","/assets/1000593134.jpg","Sipi Falls in eastern Uganda",100]
];

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const currentEmail = request => (request.headers.get("oai-authenticated-user-email") || "").trim().toLowerCase();
const isOwner = request => currentEmail(request) === OWNER_EMAIL;

async function ensureGallery(env) {
  await env.DB.prepare(SCHEMA).run();
  const row = await env.DB.prepare("SELECT COUNT(*) AS total FROM gallery_items").first();
  if (Number(row?.total || 0) === 0) {
    await env.DB.batch(STARTER_ITEMS.map(item => env.DB.prepare("INSERT INTO gallery_items (title, category, type, url, alt_text, position) VALUES (?, ?, ?, ?, ?, ?)").bind(...item)));
  }
}

async function listGallery(env) {
  await ensureGallery(env);
  const result = await env.DB.prepare("SELECT id, title, category, type, url, alt_text, position, created_at FROM gallery_items ORDER BY position ASC, created_at DESC").all();
  return result.results || [];
}

async function handleApi(request, env, url) {
  if (request.method === "GET" && url.pathname === "/api/gallery") return json(await listGallery(env));
  if (!isOwner(request)) return json({ error: currentEmail(request) ? "This account is not authorised to manage the gallery." : "Please sign in as the site owner." }, currentEmail(request) ? 403 : 401);
  await ensureGallery(env);

  if (request.method === "POST" && url.pathname === "/api/gallery") {
    const form = await request.formData();
    const file = form.get("file");
    const externalUrl = String(form.get("external_url") || "").trim();
    const title = String(form.get("title") || "Untitled moment").trim().slice(0, 120);
    const category = String(form.get("category") || "landscapes").trim().slice(0, 40);
    const altText = String(form.get("alt_text") || title).trim().slice(0, 240);
    const position = Math.max(0, Number.parseInt(String(form.get("position") || "0"), 10) || 0);
    let mediaUrl = externalUrl, storageKey = null, type = "video";
    if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
      if (file.size > 75 * 1024 * 1024) return json({ error: "Please keep each upload below 75 MB." }, 413);
      const safeName = String(file.name || "media").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-90);
      storageKey = `gallery/${crypto.randomUUID()}-${safeName}`;
      type = String(file.type || "").startsWith("video/") ? "video" : "image";
      await env.MEDIA.put(storageKey, file.stream(), { httpMetadata: { contentType: file.type || (type === "video" ? "video/mp4" : "image/jpeg") } });
      mediaUrl = `/media/${storageKey}`;
    } else {
      try { const parsed = new URL(externalUrl); if (!/^https?:$/.test(parsed.protocol)) throw new Error(); } catch { return json({ error: "Add a valid video URL or choose a file." }, 400); }
    }
    const inserted = await env.DB.prepare("INSERT INTO gallery_items (title, category, type, url, storage_key, alt_text, position) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(title, category, type, mediaUrl, storageKey, altText, position).run();
    return json({ id: inserted.meta?.last_row_id, title, category, type, url: mediaUrl, alt_text: altText, position }, 201);
  }

  const match = url.pathname.match(/^\/api\/gallery\/(\d+)$/);
  if (!match) return json({ error: "Not found" }, 404);
  const id = Number(match[1]);
  if (request.method === "PATCH") {
    const body = await request.json();
    const title = String(body.title || "Untitled moment").trim().slice(0, 120);
    const category = String(body.category || "landscapes").trim().slice(0, 40);
    const altText = String(body.alt_text || title).trim().slice(0, 240);
    const position = Math.max(0, Number.parseInt(String(body.position || "0"), 10) || 0);
    await env.DB.prepare("UPDATE gallery_items SET title = ?, category = ?, alt_text = ?, position = ? WHERE id = ?").bind(title, category, altText, position, id).run();
    return json({ ok: true });
  }
  if (request.method === "DELETE") {
    const item = await env.DB.prepare("SELECT storage_key FROM gallery_items WHERE id = ?").bind(id).first();
    if (item?.storage_key) await env.MEDIA.delete(item.storage_key);
    await env.DB.prepare("DELETE FROM gallery_items WHERE id = ?").bind(id).run();
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/gallery")) return handleApi(request, env, url);
    if (url.pathname.startsWith("/media/")) {
      const key = decodeURIComponent(url.pathname.slice(7));
      const object = await env.MEDIA.get(key);
      if (!object) return new Response("Not found", { status: 404 });
      const headers = new Headers({ "cache-control": "public, max-age=31536000, immutable", etag: object.httpEtag });
      object.writeHttpMetadata(headers);
      return new Response(object.body, { headers });
    }
    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      if (!currentEmail(request)) return Response.redirect(new URL("/signin-with-chatgpt?return_to=%2Fadmin", request.url), 302);
      if (!isOwner(request)) return new Response("This account is not authorised to manage the King Mozy gallery.", { status: 403, headers: { "content-type": "text/plain; charset=utf-8" } });
      const response = await env.ASSETS.fetch(new Request(new URL("/admin.html", request.url), request));
      const headers = new Headers(response.headers); headers.set("cache-control", "no-store"); headers.set("x-robots-tag", "noindex, nofollow");
      return new Response(response.body, { status: response.status, headers });
    }
    return env.ASSETS.fetch(request);
  }
};
