import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

const assets = {
  fetch: async request => {
    const url = new URL(request.url);
    const file = url.pathname === "/admin.html" ? "admin.html" : "index.html";
    return new Response(await readFile(new URL(file, root)), { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  },
};

test("publishes a crawlable, branded travel homepage", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/"), { ASSETS: assets });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /King Mozy Tours and Travel \| Uganda Safaris/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /id="gallery"/);
  assert.match(html, /ZHEAD LABS/);
  assert.match(html, /id="siteNav"/);
  assert.match(html, /kingmozytoursandtravels@gmail\.com/);
  assert.match(html, /tel:\+256709599083/);
  assert.match(html, /wa\.me\/256709599083/);
  assert.doesNotMatch(html, /kingmozytoursandtravel@gmail\.com/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("protects the private gallery manager", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/admin"), { ASSETS: assets });
  assert.equal(response.status, 302);
  assert.match(response.headers.get("location") || "", /signin-with-chatgpt/);
});

test("build includes the dedicated public pages", async () => {
  for (const page of ["gallery.html", "journeys.html", "about.html", "booking.html", "contact.html"]) {
    const html = await readFile(new URL(`../dist/client/${page}`, import.meta.url), "utf8");
    assert.match(html, /King Mozy Tours and Travel/);
    assert.match(html, /rel="canonical"/);
    assert.doesNotMatch(html, /codex-preview/);
  }
});

test("Vercel fallback gallery and mobile-first collage are included", async () => {
  const galleryData = await readFile(new URL("../public/gallery-data.js", import.meta.url), "utf8");
  const galleryPage = await readFile(new URL("../gallery.html", import.meta.url), "utf8");
  const bookingPage = await readFile(new URL("../booking.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(galleryData, /1000593138\.jpg/);
  assert.match(galleryPage, /gallery-data\.js/);
  assert.match(bookingPage, /id="booking-form"/);
  assert.match(bookingPage, /data-send="email"/);
  assert.match(bookingPage, /data-send="whatsapp"/);
  assert.match(css, /\.hero-collage\{order:1/);
});
