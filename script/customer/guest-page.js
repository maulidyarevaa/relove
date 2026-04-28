const topNavLinks = document.querySelectorAll(".topnav a");
const topbar = document.querySelector(".topbar");
const previewProductList = document.getElementById("previewProductList");
const contactPromptButton = document.getElementById("contactPromptButton");
const aboutAlertButton = document.getElementById("aboutAlertButton");
const brandMark = document.getElementById("brandMark");
const storeProfilePhoto = document.getElementById("storeProfilePhoto");
const galleryCardOne = document.getElementById("galleryCardOne");
const galleryCardTwo = document.getElementById("galleryCardTwo");
const galleryCardThree = document.getElementById("galleryCardThree");
const galleryVisualCards = document.querySelectorAll("[data-visual]");
const contactHero = document.getElementById("contactHero");
const GUEST_STORAGE_KEY = "prelovedProducts";
const GUEST_VISUALS_KEY = "prelovedStoreVisuals";
const VISUALS_DB_NAME = "prelovedStoreDatabase";
const VISUALS_STORE_NAME = "storeSettings";
const VISUALS_RECORD_KEY = "guestVisuals";

function getScrollOffset() {
  return (topbar ? topbar.offsetHeight : 0) + 24;
}

function getCurrentPage() {
  return window.location.pathname.split("/").pop() || "dashboard.html";
}

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(price) || 0);
}

function getPreviewProducts() {
  try {
    const products = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY)) || [];
    return products.filter((product) => (product.status || "Tersedia") === "Tersedia");
  } catch (error) {
    return [];
  }
}

function createEmptyGuestVisuals() {
  return {
    profileImage: "",
    galleryOne: "",
    galleryTwo: "",
    galleryThree: "",
    galleryFour: "",
    contactBackground: ""
  };
}

function normalizeGuestVisuals(visuals) {
  const savedVisuals = visuals && typeof visuals === "object" ? visuals : {};
  return {
    profileImage: savedVisuals.profileImage || "",
    galleryOne: savedVisuals.galleryOne || "",
    galleryTwo: savedVisuals.galleryTwo || "",
    galleryThree: savedVisuals.galleryThree || "",
    galleryFour: savedVisuals.galleryFour || "",
    contactBackground: savedVisuals.contactBackground || ""
  };
}

function hasSavedGuestVisuals(visuals) {
  return Object.values(normalizeGuestVisuals(visuals)).some(Boolean);
}

function openVisualDatabase() {
  return new Promise(function (resolve, reject) {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB tidak tersedia."));
      return;
    }

    const request = window.indexedDB.open(VISUALS_DB_NAME, 1);

    request.onupgradeneeded = function () {
      const database = request.result;

      if (!database.objectStoreNames.contains(VISUALS_STORE_NAME)) {
        database.createObjectStore(VISUALS_STORE_NAME);
      }
    };

    request.onsuccess = function () {
      resolve(request.result);
    };

    request.onerror = function () {
      reject(request.error || new Error("Gagal membuka database visual."));
    };
  });
}

function readGuestVisualsFromDatabase() {
  return openVisualDatabase().then(function (database) {
    return new Promise(function (resolve, reject) {
      const transaction = database.transaction(VISUALS_STORE_NAME, "readonly");
      const store = transaction.objectStore(VISUALS_STORE_NAME);
      const request = store.get(VISUALS_RECORD_KEY);

      request.onsuccess = function () {
        resolve(normalizeGuestVisuals(request.result));
      };

      request.onerror = function () {
        reject(request.error || new Error("Gagal membaca visual dari database."));
      };

      transaction.oncomplete = function () {
        database.close();
      };
    });
  });
}

function getGuestVisuals() {
  try {
    const visuals = JSON.parse(localStorage.getItem(GUEST_VISUALS_KEY)) || {};
    return normalizeGuestVisuals(visuals);
  } catch (error) {
    return createEmptyGuestVisuals();
  }
}

async function loadGuestVisualsFromStorage() {
  const visualsFromLocal = getGuestVisuals();

  if (hasSavedGuestVisuals(visualsFromLocal)) {
    return visualsFromLocal;
  }

  try {
    const visualsFromDatabase = await readGuestVisualsFromDatabase();

    if (hasSavedGuestVisuals(visualsFromDatabase)) {
      try {
        localStorage.setItem(GUEST_VISUALS_KEY, JSON.stringify(visualsFromDatabase));
      } catch (error) {
        // Database remains the fallback source if localStorage penuh.
      }
      return visualsFromDatabase;
    }
  } catch (error) {
    return visualsFromLocal;
  }

  return visualsFromLocal;
}

function applyGuestVisuals(visuals) {
  const galleryVisualMap = {
    galleryOne: visuals.galleryOne,
    galleryTwo: visuals.galleryTwo,
    galleryThree: visuals.galleryThree,
    galleryFour: visuals.galleryFour
  };

  if (brandMark && visuals.profileImage) {
    brandMark.style.backgroundImage = `url("${visuals.profileImage}")`;
    brandMark.classList.add("has-image");
    brandMark.textContent = "";
  }

  if (storeProfilePhoto && visuals.profileImage) {
    storeProfilePhoto.src = visuals.profileImage;
  }

  if (galleryCardOne && visuals.galleryOne) {
    galleryCardOne.style.backgroundImage = `linear-gradient(180deg, rgba(45, 31, 26, 0.08), rgba(45, 31, 26, 0.4)), url("${visuals.galleryOne}")`;
    galleryCardOne.classList.add("has-image");
  }

  if (galleryCardTwo && visuals.galleryTwo) {
    galleryCardTwo.style.backgroundImage = `linear-gradient(180deg, rgba(45, 31, 26, 0.08), rgba(45, 31, 26, 0.4)), url("${visuals.galleryTwo}")`;
    galleryCardTwo.classList.add("has-image");
  }

  if (galleryCardThree && visuals.galleryThree) {
    galleryCardThree.style.backgroundImage = `linear-gradient(180deg, rgba(45, 31, 26, 0.08), rgba(45, 31, 26, 0.4)), url("${visuals.galleryThree}")`;
    galleryCardThree.classList.add("has-image");
  }

  galleryVisualCards.forEach(function (card) {
    if (!(card instanceof HTMLElement)) {
      return;
    }

    const visualKey = card.dataset.visual;
    if (!visualKey) {
      return;
    }

    const imageUrl = galleryVisualMap[visualKey];
    if (!imageUrl) {
      return;
    }

    card.style.backgroundImage = `linear-gradient(180deg, rgba(45, 31, 26, 0.08), rgba(45, 31, 26, 0.4)), url("${imageUrl}")`;
    card.classList.add("has-image");
  });

  if (contactHero && visuals.contactBackground) {
    contactHero.style.backgroundImage = `linear-gradient(180deg, rgba(31, 20, 16, 0.78) 0%, rgba(31, 20, 16, 0.52) 42%, rgba(31, 20, 16, 0.12) 100%), url("${visuals.contactBackground}")`;
    contactHero.classList.add("has-image");
  }
}

async function refreshGuestPage() {
  const visuals = await loadGuestVisualsFromStorage();
  renderPreviewProducts();
  applyGuestVisuals(visuals);
  markActiveNav();
}

function markActiveNav() {
  const currentPage = getCurrentPage();
  const currentHash = window.location.hash;

  topNavLinks.forEach(function (link) {
    const href = link.getAttribute("href") || "";
    let isActive = false;

    if (href === "dashboard.html" && currentPage === "dashboard.html" && (!currentHash || currentHash === "#hero")) {
      isActive = true;
    }

    if (href === "tentangKami.html" && currentPage === "tentangKami.html") {
      isActive = true;
    }

    if (href === "produk.html" && currentPage === "produk.html") {
      isActive = true;
    }

    if (href === "galeri.html" && currentPage === "galeri.html") {
      isActive = true;
    }

    if (href === "kontak.html" && currentPage === "kontak.html") {
      isActive = true;
    }

    link.classList.toggle("is-active", isActive);
  });
}

function scrollToSection(targetId) {
  const targetSection = document.querySelector(targetId);

  if (!targetSection) {
    return;
  }

  const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - getScrollOffset();
  window.scrollTo({
    top: Math.max(0, targetPosition),
    behavior: "smooth"
  });
}

function renderPreviewProducts() {
  if (!previewProductList) {
    return;
  }

  const products = getPreviewProducts();

  if (!products.length) {
    previewProductList.innerHTML = `
      <article class="empty-state">
        <h3>Belum ada preview produk</h3>
        <p>Preview akan tampil di sini setelah admin menambahkan barang tersedia.</p>
      </article>
    `;
    return;
  }

  previewProductList.innerHTML = products.map(function (product) {
    return `
      <article class="catalog-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="catalog-body">
          <h3>${product.name}</h3>
          <p class="product-price">${formatPrice(product.price)}</p>
          <div class="badge-row">
            <span class="badge">${product.category}</span>
            <span class="badge">${product.condition}</span>
          </div>
          <p>${product.description}</p>
          <a class="card-button" href="produk.html">Lihat Detail</a>
        </div>
      </article>
    `;
  }).join("");
}

topNavLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    const href = link.getAttribute("href") || "";

    if (!href.startsWith("#")) {
      return;
    }

    event.preventDefault();
    window.history.replaceState(null, "", href);
    scrollToSection(href);
    markActiveNav();
  });
});

if (contactPromptButton) {
  contactPromptButton.addEventListener("click", function () {
    window.location.href = "kontak.html";
  });
}

if (aboutAlertButton) {
  aboutAlertButton.addEventListener("click", function () {
    alert("Relove.id hadir sebagai personal preloved store dengan nuansa hangat, pilihan visual yang lembut, dan katalog yang mudah dijelajahi.");
  });
}

window.addEventListener("load", function () {
  if (window.location.hash && document.querySelector(window.location.hash)) {
    setTimeout(function () {
      scrollToSection(window.location.hash);
      markActiveNav();
    }, 60);
  } else {
    markActiveNav();
  }

  refreshGuestPage();
});

window.addEventListener("hashchange", markActiveNav);
window.addEventListener("pageshow", refreshGuestPage);
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    refreshGuestPage();
  }
});
window.addEventListener("storage", function (event) {
  if (event.key === GUEST_STORAGE_KEY || event.key === GUEST_VISUALS_KEY) {
    refreshGuestPage();
  }
});
