import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(new URL("app/", dist), { recursive: true });
await mkdir(new URL("client/app/", dist), { recursive: true });
await mkdir(new URL("client/", dist), { recursive: true });
await mkdir(new URL("server/", dist), { recursive: true });
await mkdir(new URL(".openai/", dist), { recursive: true });

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const admin = await readFile(new URL("../admin.html", import.meta.url), "utf8");
const adminCss = await readFile(new URL("../app/admin.css", import.meta.url), "utf8");
const worker = await readFile(new URL("../worker/site.js", import.meta.url), "utf8");
await writeFile(new URL("index.html", dist), html);
await writeFile(new URL("client/index.html", dist), html);
await writeFile(new URL("admin.html", dist), admin);
await writeFile(new URL("client/admin.html", dist), admin);
for (const page of ["gallery.html", "journeys.html", "about.html", "booking.html", "contact.html"]) {
  const content = await readFile(new URL(`../${page}`, import.meta.url), "utf8");
  await writeFile(new URL(page, dist), content);
  await writeFile(new URL(`client/${page}`, dist), content);
}
await writeFile(new URL("app/globals.css", dist), css);
await writeFile(new URL("client/app/globals.css", dist), css);
await writeFile(new URL("app/admin.css", dist), adminCss);
await writeFile(new URL("client/app/admin.css", dist), adminCss);
await cp(new URL("../public/", import.meta.url), dist, { recursive: true });
await cp(new URL("../public/", import.meta.url), new URL("client/", dist), { recursive: true });
await cp(new URL("../.openai/hosting.json", import.meta.url), new URL(".openai/hosting.json", dist));
await writeFile(new URL("server/index.js", dist), worker);
console.log("Static site built successfully in dist/");
