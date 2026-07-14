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
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("protects the private gallery manager", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/admin"), { ASSETS: assets });
  assert.equal(response.status, 302);
  assert.match(response.headers.get("location") || "", /signin-with-chatgpt/);
});
