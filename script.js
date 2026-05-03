/**
 * Galeria de desenhos de infância
 * Cada item: { src, tipo, legenda? } — tipo = pasta em imagens/<tipo>/
 */

const desenhos = [
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return {
      src: `imagens/combat_story/${n}.jpg`,
      tipo: "combat_story",
      legenda: `Combat story — ${n}`,
    };
  }),
  ...Array.from({ length: 8 }, (_, i) => {
    const n = i + 1;
    return {
      src: `imagens/combat_story_2/${n}.jpg`,
      tipo: "combat_story_2",
      legenda: `Combat story 2 — ${n}`,
    };
  }),
  ...[1, 2, 3, 4].map((n) => ({
    src: `imagens/monsters/${n}.jpg`,
    tipo: "monsters",
    legenda: `Monsters — ${n}`,
  })),
  ...[5, 6, 7, 8, 9, 10, 11, 12].map((n) => ({
    src: `imagens/monsters/${n}.jpeg`,
    tipo: "monsters",
    legenda: `Monsters — ${n}`,
  })),
  ...Array.from({ length: 11 }, (_, i) => {
    const n = i + 1;
    return {
      src: `imagens/cars/${n}.jpg`,
      tipo: "cars",
      legenda: `Cars - ${n}`,
    };
  }),
];

/** Ordem e títulos na lista de álbuns */
const ORDEM_ALBUNS = ["combat_story", "combat_story_2", "monsters", "cars"];
const TITULO_ALBUM = {
  combat_story: "Combat story - 2005",
  combat_story_2: "Combat story 2 - 2006",
  monsters: "Monsters - 2006",
  cars: "Cars - 2005",
};

/** itens[] por tipo (id do álbum) */
function agruparPorAlbum() {
  const mapa = new Map();
  for (const item of desenhos) {
    if (!mapa.has(item.tipo)) mapa.set(item.tipo, []);
    mapa.get(item.tipo).push(item);
  }
  return mapa;
}

const itensPorAlbum = agruparPorAlbum();

// --- DOM
const viewAlbums = document.getElementById("view-albums");
const viewPhotos = document.getElementById("view-photos");
const albumsList = document.getElementById("albums");
const galleryEl = document.getElementById("gallery");
const albumTitleEl = document.getElementById("album-title");
const backBtn = document.getElementById("back-albums");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxCounter = document.getElementById("lightbox-counter");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxBackdrop = document.getElementById("lightbox-backdrop");

/** @type {string | null} */
let albumAberto = null;

/** Slides atuais no visualizador (fotos do álbum) */
let lightboxLista = [];
let lightboxIndex = 0;
/** Toque: início de gesto para deslizar (mobile) */
let touchStartX = 0;

/**
 * Lista de álbuns: capa = primeira imagem, título e contagem
 */
function renderListaAlbuns() {
  const fragment = document.createDocumentFragment();

  ORDEM_ALBUNS.forEach((id, index) => {
    const itens = itensPorAlbum.get(id);
    if (!itens || itens.length === 0) return;

    const capa = itens[0];
    const titulo = TITULO_ALBUM[id] || id;
    const n = itens.length;
    const fotoWord = n === 1 ? "foto" : "fotos";

    const li = document.createElement("li");
    li.className = "albums__item";
    li.style.animationDelay = `${Math.min(index * 0.05, 0.35)}s`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "album-card";
    btn.setAttribute("aria-label", `Abrir álbum ${titulo}, ${n} ${fotoWord}`);

    const coverWrap = document.createElement("span");
    coverWrap.className = "album-card__cover";
    const img = document.createElement("img");
    img.src = capa.src;
    img.alt = "";
    img.className = "album-card__img";
    img.loading = "lazy";
    img.decoding = "async";
    coverWrap.appendChild(img);

    const body = document.createElement("span");
    body.className = "album-card__body";
    const h3 = document.createElement("span");
    h3.className = "album-card__title";
    h3.textContent = titulo;
    const meta = document.createElement("span");
    meta.className = "album-card__meta";
    meta.textContent = `${n} ${fotoWord}`;

    body.appendChild(h3);
    body.appendChild(meta);
    btn.appendChild(coverWrap);
    btn.appendChild(body);
    btn.addEventListener("click", () => abrirAlbum(id));

    li.appendChild(btn);
    fragment.appendChild(li);
  });

  albumsList.appendChild(fragment);
}

/**
 * Grelha de fotos só do álbum selecionado
 * @param {string} idAlbum
 */
function renderGaleriaDoAlbum(idAlbum) {
  galleryEl.replaceChildren();
  const itens = itensPorAlbum.get(idAlbum) || [];

  itens.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "gallery__item";
    li.style.animationDelay = `${Math.min(index * 0.04, 0.4)}s`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery__link";
    const titulo = item.legenda || `Desenho — ${idAlbum}`;
    button.setAttribute("aria-label", `Ampliar: ${titulo}`);

    const img = document.createElement("img");
    img.className = "gallery__img";
    img.src = item.src;
    img.alt = titulo;
    img.loading = index < 6 ? "eager" : "lazy";
    img.decoding = "async";

    button.appendChild(img);
    button.addEventListener("click", () => abrirLightboxNoIndice(index));

    li.appendChild(button);
    galleryEl.appendChild(li);
  });
}

/**
 * @param {string} idAlbum
 */
function abrirAlbum(idAlbum) {
  if (!itensPorAlbum.get(idAlbum)?.length) return;
  albumAberto = idAlbum;
  albumTitleEl.textContent = TITULO_ALBUM[idAlbum] || idAlbum;

  viewAlbums.hidden = true;
  viewPhotos.hidden = false;

  renderGaleriaDoAlbum(idAlbum);
  backBtn.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function voltarAosAlbuns() {
  albumAberto = null;
  galleryEl.replaceChildren();
  viewPhotos.hidden = true;
  viewAlbums.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Abre o visualizador no índice dado (álbum atual)
 * @param {number} indice
 */
function abrirLightboxNoIndice(indice) {
  if (albumAberto == null) return;
  const itens = itensPorAlbum.get(albumAberto);
  if (!itens || itens.length === 0) return;
  if (indice < 0 || indice >= itens.length) return;
  lightboxLista = itens;
  lightboxIndex = indice;
  mostrarSlideNoIndice({ animar: false });
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightboxClose.focus();
}

/**
 * Atualiza imagem, legenda, contador e estado dos botões
 * @param {{ animar?: boolean }} [opts]
 */
function mostrarSlideNoIndice(opts = {}) {
  const animar = opts.animar === true;
  const item = lightboxLista[lightboxIndex];
  if (!item) return;
  const titulo = item.legenda || "Desenho ampliado";
  const total = lightboxLista.length;
  const atual = lightboxIndex + 1;

  const refreshUI = () => {
    lightboxImg.alt = titulo;
    lightboxCaption.textContent = titulo;
    if (lightboxCounter) {
      lightboxCounter.textContent = total > 0 ? `${atual} de ${total}` : "";
    }
    lightboxPrev.disabled = lightboxIndex <= 0;
    lightboxNext.disabled = lightboxIndex >= total - 1;
  };

  const fimCarga = () => {
    lightboxImg.classList.remove("is-fading");
  };

  if (animar) {
    lightboxImg.classList.add("is-fading");
    const onLoad = () => fimCarga();
    lightboxImg.addEventListener("load", onLoad, { once: true });
    lightboxImg.src = item.src;
    refreshUI();
    if (lightboxImg.complete) fimCarga();
  } else {
    lightboxImg.classList.remove("is-fading");
    lightboxImg.src = item.src;
    refreshUI();
  }
}

function lightboxFotoAnterior() {
  if (lightboxIndex > 0) {
    lightboxIndex -= 1;
    mostrarSlideNoIndice({ animar: true });
  }
}

function lightboxFotoSeguinte() {
  if (lightboxIndex < lightboxLista.length - 1) {
    lightboxIndex += 1;
    mostrarSlideNoIndice({ animar: true });
  }
}

function fecharLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = "";
  lightboxCaption.textContent = "";
  if (lightboxCounter) lightboxCounter.textContent = "";
  lightboxLista = [];
  lightboxIndex = 0;
  document.body.classList.remove("lightbox-open");
}

backBtn.addEventListener("click", voltarAosAlbuns);

lightboxClose.addEventListener("click", fecharLightbox);
lightboxBackdrop.addEventListener("click", fecharLightbox);

lightboxPrev.addEventListener("click", (e) => {
  e.stopPropagation();
  lightboxFotoAnterior();
});
lightboxNext.addEventListener("click", (e) => {
  e.stopPropagation();
  lightboxFotoSeguinte();
});

// Deslizar no ecrã (anterior = direita, seguinte = esquerda)
lightbox.addEventListener(
  "touchstart",
  (e) => {
    if (e.changedTouches[0]) touchStartX = e.changedTouches[0].clientX;
  },
  { passive: true }
);
lightbox.addEventListener(
  "touchend",
  (e) => {
    if (lightbox.hidden || !e.changedTouches[0]) return;
    const x = e.changedTouches[0].clientX;
    const delta = x - touchStartX;
    const min = 48;
    if (delta > min) lightboxFotoAnterior();
    else if (delta < -min) lightboxFotoSeguinte();
  },
  { passive: true }
);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!lightbox.hidden) {
      fecharLightbox();
      return;
    }
    if (albumAberto) {
      voltarAosAlbuns();
    }
    return;
  }
  if (!lightbox.hidden) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      lightboxFotoAnterior();
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      lightboxFotoSeguinte();
    }
  }
});

renderListaAlbuns();
