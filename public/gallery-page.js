const galleryGrid = document.getElementById("galleryGrid");
const lightbox = document.getElementById("mediaLightbox");
const lightboxMedia = document.getElementById("lightboxMedia");
const lightboxTitle = document.getElementById("lightboxTitle");
const bundledItems = Array.isArray(window.KING_MOZY_GALLERY_ITEMS) ? window.KING_MOZY_GALLERY_ITEMS : [];

function youtubeId(url) {
  try {
    const parsed = new URL(url, location.origin);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v") || parsed.pathname.split("/embed/")[1];
  } catch {}
  return null;
}

function openMedia(item) {
  lightboxMedia.replaceChildren();
  const videoId = youtubeId(item.url);
  let media;
  if (item.type === "video" && videoId) {
    media = document.createElement("iframe");
    media.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    media.allow = "autoplay; fullscreen";
    media.allowFullscreen = true;
  } else if (item.type === "video") {
    media = document.createElement("video");
    media.src = item.url;
    media.controls = true;
    media.autoplay = true;
  } else {
    media = document.createElement("img");
    media.src = item.url;
    media.alt = item.alt_text || item.title;
  }
  lightboxMedia.append(media);
  lightboxTitle.textContent = item.title;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeMedia() {
  lightbox.hidden = true;
  lightboxMedia.replaceChildren();
  document.body.style.overflow = "";
}

function applyFilter(filter) {
  galleryGrid.querySelectorAll(".gallery-item").forEach(item => {
    item.hidden = filter !== "all" && item.dataset.category !== filter;
  });
}

function mergeGallery(liveItems) {
  const seen = new Set();
  return [...(Array.isArray(liveItems) ? liveItems : []), ...bundledItems].filter(item => {
    const key = `${item.type || "image"}:${item.url}`;
    if (!item.url || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function render(items) {
  galleryGrid.replaceChildren();
  if (!items.length) {
    galleryGrid.innerHTML = "<p>New Uganda moments are on the way.</p>";
    return;
  }
  items.forEach(item => {
    const article = document.createElement("article");
    article.className = "gallery-item";
    article.dataset.category = item.type === "video" ? "video" : item.category;
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Open ${item.title}`);
    let media;
    const videoId = item.type === "video" && youtubeId(item.url);
    if (videoId) {
      media = document.createElement("img");
      media.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      media.alt = item.alt_text || item.title;
    } else if (item.type === "video") {
      media = document.createElement("video");
      media.src = item.url;
      media.muted = true;
      media.preload = "metadata";
    } else {
      media = document.createElement("img");
      media.src = item.url;
      media.alt = item.alt_text || item.title;
      media.loading = "lazy";
    }
    const caption = document.createElement("span");
    const title = document.createElement("b");
    const category = document.createElement("small");
    title.textContent = item.title;
    category.textContent = item.type === "video" ? "Video" : item.category;
    caption.append(title, category);
    button.append(media, caption);
    button.addEventListener("click", () => openMedia(item));
    article.append(button);
    galleryGrid.append(article);
  });
}

document.getElementById("lightboxClose").addEventListener("click", closeMedia);
lightbox.addEventListener("mousedown", event => { if (event.target === lightbox) closeMedia(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !lightbox.hidden) closeMedia(); });
document.querySelectorAll(".gallery-filters button").forEach(button => button.addEventListener("click", () => {
  document.querySelector(".gallery-filters .active")?.classList.remove("active");
  button.classList.add("active");
  applyFilter(button.dataset.filter);
}));

fetch("/api/gallery")
  .then(response => response.ok ? response.json() : Promise.reject(new Error("Gallery API unavailable")))
  .then(items => render(mergeGallery(items)))
  .catch(() => render(mergeGallery([])));
