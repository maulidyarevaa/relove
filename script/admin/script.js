const STORAGE_KEY = "prelovedProducts";
const VISUALS_KEY = "prelovedStoreVisuals";
const ORDER_STORAGE_KEY = "prelovedOrders";
const VISUALS_DB_NAME = "prelovedStoreDatabase";
const VISUALS_STORE_NAME = "storeSettings";
const VISUALS_RECORD_KEY = "guestVisuals";
const DEFAULT_PREVIEW = "https://placehold.co/600x420/f5e7db/7f5c50?text=Preview+Gambar";
const DEFAULT_PROFILE_PREVIEW = "https://placehold.co/600x420/f5e7db/7f5c50?text=Profile+Store";
const DEFAULT_GALLERY_ONE = "https://placehold.co/600x420/f5e7db/7f5c50?text=Galeri+1";
const DEFAULT_GALLERY_TWO = "https://placehold.co/600x420/f5e7db/7f5c50?text=Galeri+2";
const DEFAULT_GALLERY_THREE = "https://placehold.co/600x420/f5e7db/7f5c50?text=Galeri+3";
const DEFAULT_GALLERY_FOUR = "https://placehold.co/600x420/f5e7db/7f5c50?text=Galeri+4";
const DEFAULT_CONTACT_BACKGROUND = "https://placehold.co/1200x900/f5e7db/7f5c50?text=Background+Kontak";

const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");
const productIdInput = document.getElementById("productId");
const productNameInput = document.getElementById("productName");
const productCategoryInput = document.getElementById("productCategory");
const productPriceInput = document.getElementById("productPrice");
const productConditionInput = document.getElementById("productCondition");
const productDescriptionInput = document.getElementById("productDescription");
const productImageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");
const formMessage = document.getElementById("formMessage");
const modalTitle = document.getElementById("productModalTitle");
const modalKicker = document.getElementById("modalKicker");
const visualForm = document.getElementById("visualForm");
const visualMessage = document.getElementById("visualMessage");
const resetVisualsButton = document.getElementById("resetVisuals");
const storeProfileImageInput = document.getElementById("storeProfileImage");
const galleryImageOneInput = document.getElementById("galleryImageOne");
const galleryImageTwoInput = document.getElementById("galleryImageTwo");
const galleryImageThreeInput = document.getElementById("galleryImageThree");
const galleryImageFourInput = document.getElementById("galleryImageFour");
const storeProfilePreview = document.getElementById("storeProfilePreview");
const galleryPreviewOne = document.getElementById("galleryPreviewOne");
const galleryPreviewTwo = document.getElementById("galleryPreviewTwo");
const galleryPreviewThree = document.getElementById("galleryPreviewThree");
const galleryPreviewFour = document.getElementById("galleryPreviewFour");
const contactBackgroundImageInput = document.getElementById("contactBackgroundImage");
const contactBackgroundPreview = document.getElementById("contactBackgroundPreview");
let uploadedImageData = "";
let guestVisualsState = {
  profileImage: "",
  galleryOne: "",
  galleryTwo: "",
  galleryThree: "",
  galleryFour: "",
  contactBackground: ""
};

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

function saveGuestVisualsToDatabase(visuals) {
  return openVisualDatabase().then(function (database) {
    return new Promise(function (resolve, reject) {
      const transaction = database.transaction(VISUALS_STORE_NAME, "readwrite");
      const store = transaction.objectStore(VISUALS_STORE_NAME);
      const request = store.put(normalizeGuestVisuals(visuals), VISUALS_RECORD_KEY);

      request.onsuccess = function () {
        resolve(true);
      };

      request.onerror = function () {
        reject(request.error || new Error("Gagal menyimpan visual ke database."));
      };

      transaction.oncomplete = function () {
        database.close();
      };
    });
  });
}

function clearGuestVisualsFromDatabase() {
  return openVisualDatabase().then(function (database) {
    return new Promise(function (resolve, reject) {
      const transaction = database.transaction(VISUALS_STORE_NAME, "readwrite");
      const store = transaction.objectStore(VISUALS_STORE_NAME);
      const request = store.delete(VISUALS_RECORD_KEY);

      request.onsuccess = function () {
        resolve(true);
      };

      request.onerror = function () {
        reject(request.error || new Error("Gagal menghapus visual dari database."));
      };

      transaction.oncomplete = function () {
        database.close();
      };
    });
  });
}

function getProducts() {
  try {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return products.map((product) => ({
      ...product,
      status: product.status || "Tersedia",
      soldAt: product.soldAt || ""
    }));
  } catch (error) {
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function getGuestVisuals() {
  try {
    const visuals = JSON.parse(localStorage.getItem(VISUALS_KEY)) || {};
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
        localStorage.setItem(VISUALS_KEY, JSON.stringify(visualsFromDatabase));
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

async function saveGuestVisuals(visuals) {
  const normalizedVisuals = normalizeGuestVisuals(visuals);
  let localSaved = false;
  let databaseSaved = false;

  try {
    localStorage.setItem(VISUALS_KEY, JSON.stringify(normalizedVisuals));
    localSaved = true;
  } catch (error) {
    localSaved = false;
  }

  try {
    await saveGuestVisualsToDatabase(normalizedVisuals);
    databaseSaved = true;
  } catch (error) {
    databaseSaved = false;
  }

  return {
    success: localSaved || databaseSaved,
    localSaved,
    databaseSaved
  };
}

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(price) || 0);
}

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(dateString));
}

function formatDateTime(dateString) {
  if (!dateString) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateString));
}

function setFormMessage(message, type) {
  if (!formMessage) {
    return;
  }

  formMessage.textContent = message;
  formMessage.className = "form-message";
  if (type) {
    formMessage.classList.add(type);
  }
}

function setVisualMessage(message, type) {
  if (!visualMessage) {
    return;
  }

  visualMessage.textContent = message;
  visualMessage.className = "form-message";
  if (type) {
    visualMessage.classList.add(type);
  }
}

function updatePreview() {
  if (!imagePreview || !productImageInput) {
    return;
  }

  imagePreview.src = uploadedImageData || DEFAULT_PREVIEW;
}

function updateVisualPreviews() {
  if (storeProfilePreview) {
    storeProfilePreview.src = guestVisualsState.profileImage || DEFAULT_PROFILE_PREVIEW;
  }

  if (galleryPreviewOne) {
    galleryPreviewOne.src = guestVisualsState.galleryOne || DEFAULT_GALLERY_ONE;
  }

  if (galleryPreviewTwo) {
    galleryPreviewTwo.src = guestVisualsState.galleryTwo || DEFAULT_GALLERY_TWO;
  }

  if (galleryPreviewThree) {
    galleryPreviewThree.src = guestVisualsState.galleryThree || DEFAULT_GALLERY_THREE;
  }

  if (galleryPreviewFour) {
    galleryPreviewFour.src = guestVisualsState.galleryFour || DEFAULT_GALLERY_FOUR;
  }

  if (contactBackgroundPreview) {
    contactBackgroundPreview.src = guestVisualsState.contactBackground || DEFAULT_CONTACT_BACKGROUND;
  }
}

function resetVisualState(shouldClearStorage = false) {
  if (visualForm) {
    visualForm.reset();
  }

  guestVisualsState = createEmptyGuestVisuals();

  if (!shouldClearStorage) {
    guestVisualsState = getGuestVisuals();
  }

  updateVisualPreviews();
  setVisualMessage("", "");
}

function bindVisualUpload(input, key) {
  if (!input) {
    return;
  }

  input.addEventListener("change", function (event) {
    const target = event.target;

    if (!(target instanceof HTMLInputElement) || !target.files || !target.files[0]) {
      return;
    }

    const file = target.files[0];
    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      guestVisualsState[key] = String(loadEvent.target?.result || "");
      updateVisualPreviews();
      setVisualMessage("Preview visual berhasil diperbarui. Klik Simpan Visual untuk menerapkan ke halaman tamu.", "success");
    };

    reader.readAsDataURL(file);
  });
}

function resetFormState() {
  if (!productForm || !productIdInput) {
    return;
  }

  productForm.reset();
  productIdInput.value = "";
  uploadedImageData = "";
  updatePreview();
  setFormMessage("", "");

  if (modalTitle) {
    modalTitle.textContent = "Input barang preloved";
  }

  if (modalKicker) {
    modalKicker.textContent = "Tambah Barang";
  }
}

function openModal(mode, product = null) {
  if (!productModal || !productIdInput || !productNameInput || !productCategoryInput || !productPriceInput || !productConditionInput || !productDescriptionInput) {
    return;
  }

  productModal.classList.add("is-open");
  productModal.setAttribute("aria-hidden", "false");
  resetFormState();

  if (mode === "edit" && product) {
    productIdInput.value = product.id;
    productNameInput.value = product.name;
    productCategoryInput.value = product.category;
    productPriceInput.value = product.price;
    productConditionInput.value = product.condition;
    productDescriptionInput.value = product.description;
    uploadedImageData = product.image || "";
    updatePreview();
    modalTitle.textContent = "Edit data barang";
    modalKicker.textContent = "Edit Barang";
    setFormMessage("Perbarui data barang lalu simpan perubahan.", "success");
  }
}

function closeModal() {
  if (!productModal) {
    return;
  }

  productModal.classList.remove("is-open");
  productModal.setAttribute("aria-hidden", "true");
  resetFormState();
}

function createCardMarkup(product, includeActions, options = {}) {
  const allowStatusToggle = options.allowStatusToggle !== false;
  const allowDelete = options.allowDelete !== false;
  const soldMeta = product.status === "Sold Out"
    ? `<p class="meta-line">Terjual / sold out pada ${formatDate(product.soldAt)}</p>`
    : `<p class="meta-line">Masih tersedia untuk dijual</p>`;

  const actions = includeActions ? `
    <div class="card-actions">
      <button class="card-action edit" type="button" data-action="edit" data-id="${product.id}">Edit</button>
      ${allowDelete ? `<button class="card-action delete" type="button" data-action="delete" data-id="${product.id}">Hapus</button>` : ""}
      ${allowStatusToggle ? `<button class="status-button" type="button" data-action="toggle-status" data-id="${product.id}">
        Ubah ke ${product.status === "Tersedia" ? "Sold Out" : "Tersedia"}
      </button>` : ""}
    </div>
  ` : "";

  return `
    <article class="detail-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="detail-body">
        <div class="detail-top">
          <div>
            <h3>${product.name}</h3>
            <p class="price-text">${formatPrice(product.price)}</p>
          </div>
          <span class="badge ${product.status === "Tersedia" ? "available" : "sold"}">${product.status}</span>
        </div>
        <div class="badge-row">
          <span class="badge">${product.category}</span>
          <span class="badge">${product.condition}</span>
        </div>
        <p class="product-description">${product.description}</p>
        ${soldMeta}
        ${actions}
      </div>
    </article>
  `;
}

function createOrderMarkup(order) {
  return `
    <article class="order-card">
      <img src="${order.productImage}" alt="${order.productName}">
      <div class="order-body">
        <div class="detail-top">
          <div>
            <h3>${order.productName}</h3>
            <p class="price-text">${formatPrice(order.totalPrice)}</p>
          </div>
          <span class="badge sold">Pesanan Baru</span>
        </div>
        <div class="badge-row">
          <span class="badge">${order.category}</span>
          <span class="badge">${order.condition}</span>
          <span class="badge">${order.paymentMethod}</span>
        </div>
        <p class="meta-line"><strong>Pembeli:</strong> ${order.buyerName}</p>
        <p class="meta-line"><strong>Alamat:</strong> ${order.buyerAddress}</p>
        <p class="meta-line"><strong>Harga barang:</strong> ${formatPrice(order.productPrice)}</p>
        <p class="meta-line"><strong>Biaya kirim:</strong> ${formatPrice(order.shippingFee)}</p>
        <p class="meta-line"><strong>Waktu pesan:</strong> ${formatDateTime(order.orderedAt)}</p>
      </div>
    </article>
  `;
}

function renderDashboard() {
  const soldItemsCount = document.getElementById("soldItemsCount");
  const availableItemsCount = document.getElementById("availableItemsCount");
  const activeCategoryCount = document.getElementById("activeCategoryCount");
  const profitValue = document.getElementById("profitValue");
  const profitBars = [
    document.getElementById("profitBar1"),
    document.getElementById("profitBar2"),
    document.getElementById("profitBar3"),
    document.getElementById("profitBar4")
  ];
  const dashboardProductList = document.getElementById("dashboardProductList");
  const summaryGrid = document.getElementById("summaryGrid");
  const openAddModal = document.getElementById("openAddModal");
  const orderList = document.getElementById("orderList");
  const orderCount = document.getElementById("orderCount");
  const products = getProducts();
  const orders = getOrders();
  const availableProducts = products.filter((product) => product.status === "Tersedia");
  const soldProducts = products.filter((product) => product.status === "Sold Out");
  const activeCategories = new Set(products.map((product) => product.category).filter(Boolean));
  const totalProfit = soldProducts.reduce((total, product) => total + Number(product.price || 0), 0);
  const monthlyChunks = [0, 0, 0, 0];

  soldProducts.forEach((product, index) => {
    monthlyChunks[index % 4] += Number(product.price || 0);
  });

  const maxChunk = Math.max(...monthlyChunks, 1);

  if (!soldItemsCount || !availableItemsCount || !activeCategoryCount || !profitValue || !dashboardProductList || !summaryGrid || !openAddModal || !orderList || !orderCount) {
    return;
  }

  soldItemsCount.textContent = String(soldProducts.length);
  availableItemsCount.textContent = String(availableProducts.length);
  activeCategoryCount.textContent = String(activeCategories.size);
  profitValue.textContent = formatPrice(totalProfit);
  profitBars.forEach(function (bar, index) {
    if (!bar) {
      return;
    }

    const height = (monthlyChunks[index] / maxChunk) * 100;
    bar.style.height = `${Math.max(height, 20)}%`;
  });

  orderCount.textContent = `${orders.length} pesanan`;

  if (!availableProducts.length) {
    dashboardProductList.innerHTML = `
      <article class="empty-state">
        <h3>Belum ada barang</h3>
        <p>Tekan tanda + pada kartu barang tersedia untuk menambahkan produk pertama.</p>
      </article>
    `;
  } else {
    dashboardProductList.innerHTML = availableProducts
      .slice(0, 3)
      .map((product) => createCardMarkup(product, true, { allowStatusToggle: false }))
      .join("");
  }

  if (!orders.length) {
    orderList.innerHTML = `
      <article class="empty-state">
        <h3>Belum ada pesanan</h3>
        <p>Pesanan customer akan muncul di sini setelah ada pembelian.</p>
      </article>
    `;
  } else {
    orderList.innerHTML = orders.map(createOrderMarkup).join("");
  }

  dashboardProductList.onclick = function (event) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionButton = target.closest("[data-action]");
    if (!(actionButton instanceof HTMLElement)) {
      return;
    }

    const productId = actionButton.dataset.id;
    const action = actionButton.dataset.action;
    const currentProducts = getProducts();
    const product = currentProducts.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    if (action === "edit") {
      openModal("edit", product);
    }

    if (action === "delete") {
      const updatedProducts = currentProducts.filter((item) => item.id !== productId);
      saveProducts(updatedProducts);
      renderDashboard();
    }
  };

  summaryGrid.onclick = function (event) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest("#openAddModal")) {
      event.stopPropagation();
      openModal("create");
      return;
    }

    const card = target.closest(".summary-card");
    if (card instanceof HTMLElement && card.dataset.href) {
      window.location.href = card.dataset.href;
    }
  };

  openAddModal.onclick = function (event) {
    event.stopPropagation();
    openModal("create");
  };
}

function renderCategoryPage() {
  const categoryList = document.getElementById("categoryList");
  const categoryCount = document.getElementById("categoryCount");

  if (!categoryList || !categoryCount) {
    return;
  }

  const products = getProducts();
  const categoryMap = new Map();

  products.forEach((product) => {
    const categoryName = product.category || "Lainnya";
    const current = categoryMap.get(categoryName) || {
      name: categoryName,
      totalItems: 0,
      availableItems: 0,
      prices: []
    };

    current.totalItems += 1;
    if (product.status === "Tersedia") {
      current.availableItems += 1;
    }
    current.prices.push(Number(product.price || 0));
    categoryMap.set(categoryName, current);
  });

  const categories = Array.from(categoryMap.values()).sort((first, second) => second.totalItems - first.totalItems);
  categoryCount.textContent = `${categories.length} kategori`;

  if (!categories.length) {
    categoryList.innerHTML = `
      <article class="empty-state">
        <h3>Belum ada kategori</h3>
        <p>Kategori akan tampil di halaman ini setelah admin menambahkan produk.</p>
      </article>
    `;
    return;
  }

  categoryList.innerHTML = categories.map((category) => {
    const minimumPrice = Math.min(...category.prices);
    const maximumPrice = Math.max(...category.prices);

    return `
      <article class="summary-card category-card">
        <p>${category.name}</p>
        <strong>${category.totalItems} produk</strong>
        <small>${category.availableItems} masih tersedia</small>
        <div class="badge-row">
          <span class="badge">Mulai ${formatPrice(minimumPrice)}</span>
          <span class="badge">Sampai ${formatPrice(maximumPrice)}</span>
        </div>
      </article>
    `;
  }).join("");
}

function getFilterTitle(view) {
  if (view === "available") {
    return "Barang yang masih tersedia untuk dijual";
  }

  if (view === "soldout") {
    return "Barang dengan status sold out";
  }

  return "Rincian total barang yang sudah terjual";
}

function filterProducts(products, filter) {
  if (filter === "available") {
    return products.filter((product) => product.status === "Tersedia");
  }

  return products.filter((product) => product.status === "Sold Out");
}

function renderInventoryPage() {
  const filter = document.body.dataset.filter;
  const view = document.body.dataset.view;
  const detailList = document.getElementById("detailList");
  const detailCount = document.getElementById("detailCount");
  const detailDescription = document.getElementById("detailDescription");
  const products = getProducts();
  const filteredProducts = filterProducts(products, filter);

  if (!detailList || !detailCount || !detailDescription) {
    return;
  }

  detailCount.textContent = `${filteredProducts.length} barang`;
  detailDescription.textContent = getFilterTitle(view);

  if (!filteredProducts.length) {
    detailList.innerHTML = `
      <article class="empty-state">
        <h3>Belum ada data</h3>
        <p>Belum ada barang yang cocok dengan kategori halaman ini.</p>
      </article>
    `;
    return;
  }

  detailList.innerHTML = filteredProducts
    .map((product) => createCardMarkup(product, true, {
      allowStatusToggle: filter === "available" || view !== "terjual",
      allowDelete: true
    }))
    .join("");

  detailList.onclick = function (event) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionButton = target.closest("[data-action]");
    if (!(actionButton instanceof HTMLElement)) {
      return;
    }

    const productId = actionButton.dataset.id;
    const action = actionButton.dataset.action;
    const currentProducts = getProducts();
    const product = currentProducts.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    if (action === "edit") {
      openModal("edit", product);
    }

    if (action === "delete") {
      const updatedProducts = currentProducts.filter((item) => item.id !== productId);
      saveProducts(updatedProducts);
      renderInventoryPage();
    }

    if (action === "toggle-status") {
      const updatedProducts = currentProducts.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const nextStatus = item.status === "Tersedia" ? "Sold Out" : "Tersedia";
        return {
          ...item,
          status: nextStatus,
          soldAt: nextStatus === "Sold Out" ? new Date().toISOString() : ""
        };
      });

      saveProducts(updatedProducts);
      renderInventoryPage();
    }
  };
}

if (productImageInput) {
  productImageInput.addEventListener("change", function (event) {
    const target = event.target;

    if (!(target instanceof HTMLInputElement) || !target.files || !target.files[0]) {
      return;
    }

    const file = target.files[0];
    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      uploadedImageData = String(loadEvent.target?.result || "");
      updatePreview();
    };

    reader.readAsDataURL(file);
  });
}

if (productForm) {
  productForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!productNameInput || !productCategoryInput || !productPriceInput || !productConditionInput || !productDescriptionInput || !productIdInput) {
      return;
    }

    const name = productNameInput.value.trim();
    const category = productCategoryInput.value.trim();
    const price = productPriceInput.value.trim();
    const condition = productConditionInput.value.trim();
    const description = productDescriptionInput.value.trim();
    const image = uploadedImageData.trim();

    if (!name || !category || !price || !condition || !description || !image) {
      setFormMessage("Semua field wajib diisi dan gambar harus diupload sebelum disimpan.", "error");
      return;
    }

    const products = getProducts();
    const existingId = productIdInput.value;

    if (existingId) {
      saveProducts(products.map((product) => {
        if (product.id !== existingId) {
          return product;
        }

        return {
          ...product,
          name,
          category,
          price,
          condition,
          description,
          image
        };
      }));
      setFormMessage("Barang berhasil diperbarui.", "success");
    } else {
      products.unshift({
        id: crypto.randomUUID(),
        name,
        category,
        price,
        condition,
        description,
        image,
        status: "Tersedia",
        soldAt: ""
      });
      saveProducts(products);
      setFormMessage("Barang berhasil ditambahkan.", "success");
    }

    if (document.body.dataset.page === "dashboard") {
      renderDashboard();
    } else {
      renderInventoryPage();
    }

    setTimeout(function () {
      closeModal();
    }, 500);
  });
}

const resetButton = document.getElementById("resetButton");
if (resetButton) {
  resetButton.addEventListener("click", function () {
    resetFormState();
  });
}

const closeProductModal = document.getElementById("closeProductModal");
if (closeProductModal) {
  closeProductModal.addEventListener("click", closeModal);
}

if (productModal) {
  productModal.addEventListener("click", function (event) {
    if (event.target === productModal) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && productModal && productModal.classList.contains("is-open")) {
    closeModal();
  }
});

if (document.body.dataset.page === "dashboard") {
  renderDashboard();
}

if (document.body.dataset.page === "inventory") {
  renderInventoryPage();
}

if (document.body.dataset.page === "categories") {
  renderCategoryPage();
}

if (visualForm) {
  guestVisualsState = getGuestVisuals();
  updateVisualPreviews();
  loadGuestVisualsFromStorage().then(function (savedVisuals) {
    guestVisualsState = savedVisuals;
    updateVisualPreviews();
  });

  bindVisualUpload(storeProfileImageInput, "profileImage");
  bindVisualUpload(galleryImageOneInput, "galleryOne");
  bindVisualUpload(galleryImageTwoInput, "galleryTwo");
  bindVisualUpload(galleryImageThreeInput, "galleryThree");
  bindVisualUpload(galleryImageFourInput, "galleryFour");
  bindVisualUpload(contactBackgroundImageInput, "contactBackground");

  visualForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const saveResult = await saveGuestVisuals(guestVisualsState);

    if (!saveResult.success) {
      setVisualMessage("Visual belum berhasil disimpan. Coba gunakan ukuran gambar yang lebih kecil lalu simpan lagi.", "error");
      return;
    }

    if (saveResult.databaseSaved && !saveResult.localSaved) {
      setVisualMessage("Visual berhasil disimpan. Kalau customer page belum berubah, refresh sekali dengan Ctrl + F5.", "success");
      return;
    }

    setVisualMessage("Visual halaman tamu berhasil disimpan.", "success");
  });
}

if (resetVisualsButton) {
  resetVisualsButton.addEventListener("click", function () {
    localStorage.removeItem(VISUALS_KEY);
    clearGuestVisualsFromDatabase()
      .catch(function () {
        return null;
      })
      .finally(function () {
        resetVisualState(true);
        setVisualMessage("Visual halaman tamu berhasil direset ke default.", "success");
      });
  });
}
