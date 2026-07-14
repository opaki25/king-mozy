import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(new URL("app/", dist), { recursive: true });
await mkdir(new URL("client/app/", dist), { recursive: true });
await mkdir(new URL("client/assets/", dist), { recursive: true });
await mkdir(new URL("server/", dist), { recursive: true });
await mkdir(new URL(".openai/", dist), { recursive: true });

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
await writeFile(new URL("index.html", dist), html);
await writeFile(new URL("client/index.html", dist), html);
await writeFile(new URL("app/globals.css", dist), css);
await writeFile(new URL("client/app/globals.css", dist), css);
await cp(new URL("../public/assets/", import.meta.url), new URL("assets/", dist), { recursive: true });
await cp(new URL("../public/assets/", import.meta.url), new URL("client/assets/", dist), { recursive: true });
await cp(new URL("../.openai/hosting.json", import.meta.url), new URL(".openai/hosting.json", dist));
await writeFile(new URL("server/index.js", dist), "export default { async fetch(request, env) { return env.ASSETS.fetch(request); } };\n");
console.log("Static site built successfully in dist/");
