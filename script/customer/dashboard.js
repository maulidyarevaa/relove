const STORAGE_KEY = "prelovedProducts";
const ORDER_STORAGE_KEY = "prelovedOrders";

const catalogList = document.getElementById("catalogList");
const availableCount = document.getElementById("availableCount");
const categoryCount = document.getElementById("categoryCount");
const startingPrice = document.getElementById("startingPrice");
const buyerModal = document.getElementById("buyerModal");
const closeBuyerModal = document.getElementById("closeBuyerModal");
const buyerModalImage = document.getElementById("buyerModalImage");
const buyerModalTitle = document.getElementById("buyerModalTitle");
const buyerModalPrice = document.getElementById("buyerModalPrice");
const buyerModalCategory = document.getElementById("buyerModalCategory");
const buyerModalCondition = document.getElementById("buyerModalCondition");
const buyerModalDescription = document.getElementById("buyerModalDescription");
const buyerModalMessage = document.getElementById("buyerModalMessage");
const confirmBuyButton = document.getElementById("confirmBuyButton");
const cancelBuyButton = document.getElementById("cancelBuyButton");
const paymentMethod = document.getElementById("paymentMethod");
const buyerName = document.getElementById("buyerName");
const buyerAddress = document.getElementById("buyerAddress");
const checkoutProductPrice = document.getElementById("checkoutProductPrice");
const checkoutShipping = document.getElementById("checkoutShipping");
const checkoutTotal = document.getElementById("checkoutTotal");
const thankYouModal = document.getElementById("thankYouModal");
const SHIPPING_FEE = 15000;
let activeProductId = "";

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

function saveOrders(orders) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(price) || 0);
}

function createCatalogCardMarkup(product) {
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
        <button class="card-button" type="button" data-product-id="${product.id}">Lihat Detail & Beli</button>
      </div>
    </article>
  `;
}

function openModal(product) {
  if (!buyerModal || !buyerModalImage || !buyerModalTitle || !buyerModalPrice || !buyerModalCategory || !buyerModalCondition || !buyerModalDescription || !buyerModalMessage) {
    return;
  }

  activeProductId = product.id;
  buyerModalImage.src = product.image;
  buyerModalImage.alt = product.name;
  buyerModalTitle.textContent = product.name;
  buyerModalPrice.textContent = formatPrice(product.price);
  buyerModalCategory.textContent = product.category;
  buyerModalCondition.textContent = product.condition;
  buyerModalDescription.textContent = product.description;
  buyerModalMessage.textContent = "";
  if (paymentMethod) {
    paymentMethod.value = "";
  }
  if (buyerName) {
    buyerName.value = "";
  }
  if (buyerAddress) {
    buyerAddress.value = "";
  }
  if (checkoutProductPrice) {
    checkoutProductPrice.textContent = formatPrice(product.price);
  }
  if (checkoutShipping) {
    checkoutShipping.textContent = formatPrice(SHIPPING_FEE);
  }
  if (checkoutTotal) {
    checkoutTotal.textContent = formatPrice(Number(product.price || 0) + SHIPPING_FEE);
  }
  buyerModal.classList.add("is-open");
  buyerModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal() {
  if (!buyerModal || !buyerModalMessage) {
    return;
  }

  activeProductId = "";
  buyerModal.classList.remove("is-open");
  buyerModal.setAttribute("aria-hidden", "true");
  buyerModalMessage.textContent = "";
  document.body.classList.remove("modal-open");
}

function openThankYouModal() {
  if (!thankYouModal) {
    return;
  }

  thankYouModal.classList.add("is-open");
  thankYouModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeThankYouModal() {
  if (!thankYouModal) {
    return;
  }

  thankYouModal.classList.remove("is-open");
  thankYouModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function renderStats(products) {
  if (!availableCount || !categoryCount || !startingPrice) {
    return;
  }

  const categories = new Set(products.map((product) => product.category).filter(Boolean));
  const minimumPrice = products.length
    ? Math.min(...products.map((product) => Number(product.price || 0)))
    : 0;

  availableCount.textContent = String(products.length);
  categoryCount.textContent = String(categories.size);
  startingPrice.textContent = formatPrice(minimumPrice);
}

function renderCatalog() {
  if (!catalogList) {
    return;
  }

  const products = getProducts().filter((product) => product.status === "Tersedia");
  renderStats(products);

  if (!products.length) {
    catalogList.innerHTML = `
      <article class="empty-state">
        <h3>Belum ada barang tersedia</h3>
        <p>Silakan kembali lagi setelah admin menambahkan produk baru.</p>
      </article>
    `;
    return;
  }

  const categoryOrder = ["Baju", "Celana", "Sepatu", "Tas", "Aksesoris", "Lainnya"];
  const categoryMap = new Map();

  products.forEach(function (product) {
    const categoryName = product.category || "Lainnya";
    const currentGroup = categoryMap.get(categoryName) || [];
    currentGroup.push(product);
    categoryMap.set(categoryName, currentGroup);
  });

  const sortedCategories = Array.from(categoryMap.keys()).sort(function (first, second) {
    const firstIndex = categoryOrder.indexOf(first);
    const secondIndex = categoryOrder.indexOf(second);
    const normalizedFirstIndex = firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex;
    const normalizedSecondIndex = secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex;

    if (normalizedFirstIndex !== normalizedSecondIndex) {
      return normalizedFirstIndex - normalizedSecondIndex;
    }

    return first.localeCompare(second, "id-ID");
  });

  catalogList.innerHTML = sortedCategories.map(function (categoryName) {
    const categoryProducts = categoryMap.get(categoryName) || [];

    return `
      <section class="catalog-category">
        <div class="catalog-category-head">
          <div>
            <p class="section-kicker">Kategori</p>
            <h3>${categoryName}</h3>
          </div>
          <span class="catalog-category-count">${categoryProducts.length} produk</span>
        </div>
        <div class="catalog-grid">
          ${categoryProducts.map(createCatalogCardMarkup).join("")}
        </div>
      </section>
    `;
  }).join("");
}

renderStats(getProducts().filter((product) => product.status === "Tersedia"));

if (catalogList) {
  catalogList.addEventListener("click", function (event) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest("[data-product-id]");
    if (!(button instanceof HTMLElement)) {
      return;
    }

    const productId = button.dataset.productId;
    const product = getProducts().find((item) => item.id === productId && item.status === "Tersedia");

    if (!product) {
      renderCatalog();
      return;
    }

    openModal(product);
  });
}

if (confirmBuyButton) {
  confirmBuyButton.addEventListener("click", function () {
    if (!activeProductId) {
      return;
    }

    const products = getProducts();
    const selectedProduct = products.find((product) => product.id === activeProductId);

    if (!selectedProduct || selectedProduct.status !== "Tersedia") {
      if (buyerModalMessage) {
        buyerModalMessage.textContent = "Produk ini sudah tidak tersedia.";
      }
      renderCatalog();
      return;
    }

    if (!paymentMethod || !buyerName || !buyerAddress || !paymentMethod.value || !buyerName.value.trim() || !buyerAddress.value.trim()) {
      if (buyerModalMessage) {
        buyerModalMessage.textContent = "Lengkapi pembayaran, nama, dan alamat pengiriman terlebih dahulu.";
      }
      return;
    }

    const updatedProducts = products.map((product) => {
      if (product.id !== activeProductId) {
        return product;
      }

      return {
        ...product,
        status: "Sold Out",
        soldAt: new Date().toISOString()
      };
    });

    const orders = getOrders();
    orders.unshift({
      id: crypto.randomUUID(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: selectedProduct.image,
      category: selectedProduct.category,
      condition: selectedProduct.condition,
      productPrice: Number(selectedProduct.price || 0),
      shippingFee: SHIPPING_FEE,
      totalPrice: Number(selectedProduct.price || 0) + SHIPPING_FEE,
      paymentMethod: paymentMethod.value,
      buyerName: buyerName.value.trim(),
      buyerAddress: buyerAddress.value.trim(),
      orderedAt: new Date().toISOString()
    });

    saveProducts(updatedProducts);
    saveOrders(orders);
    closeModal();
    openThankYouModal();
    setTimeout(function () {
      closeThankYouModal();
      renderCatalog();
    }, 1500);
  });
}

if (closeBuyerModal) {
  closeBuyerModal.addEventListener("click", closeModal);
}

if (cancelBuyButton) {
  cancelBuyButton.addEventListener("click", closeModal);
}

if (buyerModal) {
  buyerModal.addEventListener("click", function (event) {
    if (event.target === buyerModal) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", function (event) {
  if (buyerModal && event.key === "Escape" && buyerModal.classList.contains("is-open")) {
    closeModal();
  }
});

renderCatalog();
