const products = [
  { id: "c05", name: "Coca-Cola Classic 0.5 л", category: "Classic", volume: 0.5, sugar: "с сахаром", price: 70, stock: 12, pack: "бутылка" },
  { id: "c10", name: "Coca-Cola Classic 1 л", category: "Classic", volume: 1, sugar: "с сахаром", price: 110, stock: 20, pack: "бутылка" },
  { id: "c20", name: "Coca-Cola Classic 2 л", category: "Classic", volume: 2, sugar: "с сахаром", price: 170, stock: 8, pack: "бутылка" },
  { id: "c033", name: "Coca-Cola Classic 0.33 л", category: "Classic", volume: 0.33, sugar: "с сахаром", price: 55, stock: 30, pack: "банка" },
  { id: "z05", name: "Coca-Cola Zero 0.5 л", category: "Zero", volume: 0.5, sugar: "без сахара", price: 75, stock: 15, pack: "бутылка" },
  { id: "z10", name: "Coca-Cola Zero 1 л", category: "Zero", volume: 1, sugar: "без сахара", price: 120, stock: 10, pack: "бутылка" },
  { id: "z033", name: "Coca-Cola Zero 0.33 л", category: "Zero", volume: 0.33, sugar: "без сахара", price: 60, stock: 25, pack: "банка" },
  { id: "ch05", name: "Coca-Cola Cherry 0.5 л", category: "Cherry", volume: 0.5, sugar: "с сахаром", price: 85, stock: 6, pack: "бутылка" },
  { id: "en025", name: "Coca-Cola Energy 0.25 л", category: "Energy", volume: 0.25, sugar: "с сахаром", price: 90, stock: 9, pack: "банка" },
  { id: "mix6", name: "Набор микс 6 банок", category: "Наборы", volume: 2, sugar: "разное", price: 320, stock: 5, pack: "набор" },
  { id: "mix12", name: "Набор микс 12 банок", category: "Наборы", volume: 4, sugar: "разное", price: 590, stock: 3, pack: "набор" },
  { id: "cup", name: "Стакан Coca-Cola", category: "Аксессуары", volume: 0, sugar: "нет", price: 150, stock: 12, pack: "аксессуар" },
  { id: "cap", name: "Кепка Coca-Cola", category: "Аксессуары", volume: 0, sugar: "нет", price: 420, stock: 4, pack: "аксессуар" },
  { id: "mag", name: "Магнитик Coca-Cola", category: "Аксессуары", volume: 0, sugar: "нет", price: 60, stock: 40, pack: "аксессуар" }
];

const categories = Array.from(new Set(products.map(p => p.category)));
const sugarTypes = Array.from(new Set(products.map(p => p.sugar)));

const cart = JSON.parse(localStorage.getItem("cola_cart") || "{}");

const defaultDiscounts = {
  global: 0,
  cartThreshold: 1200,
  cartPercent: 5,
  categories: {}
};

function getDiscounts() {
  const stored = JSON.parse(localStorage.getItem("cola_discounts") || "null");
  const base = JSON.parse(JSON.stringify(defaultDiscounts));
  categories.forEach(c => base.categories[c] = 0);
  if (stored) {
    if (typeof stored.global === "number") base.global = stored.global;
    if (typeof stored.cartThreshold === "number") base.cartThreshold = stored.cartThreshold;
    if (typeof stored.cartPercent === "number") base.cartPercent = stored.cartPercent;
    if (stored.categories) {
      categories.forEach(c => {
        if (typeof stored.categories[c] === "number") base.categories[c] = stored.categories[c];
      });
    }
  }
  return base;
}

let discounts = getDiscounts();

const categoryListEl = document.getElementById("category-list");
const sugarListEl = document.getElementById("sugar-list");
const productListEl = document.getElementById("product-list");
const cartListEl = document.getElementById("cart-list");

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function itemDiscountPercent(product) {
  const base = (discounts.global || 0) + (discounts.categories[product.category] || 0);
  return clamp(base, 0, 60);
}

function itemPrice(product) {
  const disc = itemDiscountPercent(product);
  const price = Math.round(product.price * (1 - disc / 100));
  return { price, disc };
}

function buildFilters() {
  categoryListEl.innerHTML = categories.map(c => {
    return '<label class="check"><input type="checkbox" value="' + c + '" checked> ' + c + "</label>";
  }).join("");
  sugarListEl.innerHTML = sugarTypes.map(s => {
    return '<label class="check"><input type="checkbox" value="' + s + '" checked> ' + s + "</label>";
  }).join("");
}

function getFilterState() {
  const selectedCategories = Array.from(categoryListEl.querySelectorAll("input:checked")).map(i => i.value);
  const selectedSugar = Array.from(sugarListEl.querySelectorAll("input:checked")).map(i => i.value);
  return {
    search: document.getElementById("search").value.trim().toLowerCase(),
    categories: selectedCategories,
    sugar: selectedSugar,
    minPrice: parseFloat(document.getElementById("min-price").value) || 0,
    maxPrice: parseFloat(document.getElementById("max-price").value) || 0,
    minVolume: parseFloat(document.getElementById("min-volume").value) || 0,
    maxVolume: parseFloat(document.getElementById("max-volume").value) || 0,
    inStock: document.getElementById("in-stock").checked,
    sort: document.getElementById("sort").value
  };
}

function applyFilters(list, f) {
  let res = list.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(f.search);
    const matchCategory = f.categories.length ? f.categories.includes(p.category) : true;
    const matchSugar = f.sugar.length ? f.sugar.includes(p.sugar) : true;
    const matchPriceMin = f.minPrice ? p.price >= f.minPrice : true;
    const matchPriceMax = f.maxPrice ? p.price <= f.maxPrice : true;
    const matchVolumeMin = f.minVolume ? p.volume >= f.minVolume : true;
    const matchVolumeMax = f.maxVolume ? p.volume <= f.maxVolume : true;
    const matchStock = f.inStock ? p.stock > 0 : true;
    return matchSearch && matchCategory && matchSugar && matchPriceMin && matchPriceMax && matchVolumeMin && matchVolumeMax && matchStock;
  });

  if (f.sort === "price-asc") res.sort((a, b) => a.price - b.price);
  if (f.sort === "price-desc") res.sort((a, b) => b.price - a.price);
  if (f.sort === "volume-asc") res.sort((a, b) => a.volume - b.volume);
  if (f.sort === "volume-desc") res.sort((a, b) => b.volume - a.volume);
  if (f.sort === "name-asc") res.sort((a, b) => a.name.localeCompare(b.name, "ru"));

  return res;
}

function renderProducts() {
  const f = getFilterState();
  const filtered = applyFilters(products, f);

  document.getElementById("count-info").textContent = "Показано " + filtered.length + " из " + products.length;

  productListEl.innerHTML = filtered.map(p => {
    const priceInfo = itemPrice(p);
    const hasDiscount = priceInfo.disc > 0;
    const out = p.stock <= 0;
    return `
      <div class="card">
        <div class="badge">${p.category}</div>
        <div class="name">${p.name}</div>
        <div class="meta">
          <span>${p.pack}</span>
          <span>${p.volume ? p.volume + " л" : "без объема"}</span>
          <span>${p.sugar}</span>
        </div>
        <div class="price">
          ${hasDiscount ? '<span class="old">' + formatPrice(p.price) + '</span>' : ''}
          <span>${formatPrice(priceInfo.price)}</span>
        </div>
        <div class="stock ${out ? "out" : ""}">${out ? "нет в наличии" : "в наличии: " + p.stock}</div>
        <div class="actions">
          <button class="btn" data-add="${p.id}" ${out ? "disabled" : ""}>В корзину</button>
        </div>
      </div>
    `;
  }).join("");
}

function saveCart() {
  localStorage.setItem("cola_cart", JSON.stringify(cart));
}

function updateMiniCart(totals) {
  document.getElementById("mini-count").textContent = totals.count;
  document.getElementById("mini-total").textContent = formatPrice(totals.total);
}

function calcTotals() {
  let baseTotal = 0;
  let discountedTotal = 0;
  let count = 0;

  Object.keys(cart).forEach(id => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const qty = cart[id];
    const priceInfo = itemPrice(product);
    baseTotal += product.price * qty;
    discountedTotal += priceInfo.price * qty;
    count += qty;
  });

  const itemDiscount = Math.max(0, baseTotal - discountedTotal);
  let cartDiscount = 0;

  if (discounts.cartThreshold > 0 && discountedTotal >= discounts.cartThreshold && discounts.cartPercent > 0) {
    cartDiscount = Math.round(discountedTotal * discounts.cartPercent / 100);
  }

  const total = Math.max(0, discountedTotal - cartDiscount);

  return { baseTotal, discountedTotal, itemDiscount, cartDiscount, total, count };
}

function renderCart() {
  const items = Object.keys(cart).map(id => {
    const product = products.find(p => p.id === id);
    if (!product) return null;
    const qty = cart[id];
    const priceInfo = itemPrice(product);
    return { product, qty, priceInfo };
  }).filter(Boolean);

  if (!items.length) {
    cartListEl.innerHTML = "<div class='note'>Корзина пустая</div>";
  } else {
    cartListEl.innerHTML = items.map(item => {
      const p = item.product;
      const qty = item.qty;
      const linePrice = item.priceInfo.price * qty;
      return `
        <div class="cart-item">
          <div class="ci-name">${p.name}</div>
          <div class="ci-meta">${p.pack} • ${p.volume ? p.volume + " л" : "без объема"} • ${formatPrice(item.priceInfo.price)} / шт</div>
          <div class="ci-controls">
            <button data-action="dec" data-id="${p.id}">-</button>
            <span>${qty}</span>
            <button data-action="inc" data-id="${p.id}">+</button>
            <button data-action="remove" data-id="${p.id}">убрать</button>
            <span style="margin-left: auto; font-weight: 700;">${formatPrice(linePrice)}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  const totals = calcTotals();
  document.getElementById("cart-subtotal").textContent = formatPrice(totals.baseTotal);
  document.getElementById("cart-item-discount").textContent = "-" + formatPrice(totals.itemDiscount);
  document.getElementById("cart-cart-discount").textContent = "-" + formatPrice(totals.cartDiscount);
  document.getElementById("cart-total").textContent = formatPrice(totals.total);
  updateMiniCart(totals);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function initAdminPanel() {
  document.getElementById("global-discount").value = discounts.global;
  document.getElementById("cart-threshold").value = discounts.cartThreshold;
  document.getElementById("cart-percent").value = discounts.cartPercent;

  const container = document.getElementById("category-discounts");
  container.innerHTML = categories.map(c => {
    return `
      <div class="cat-line">
        <span>${c}</span>
        <input type="number" min="0" max="60" data-cat="${c}" value="${discounts.categories[c] || 0}">
      </div>
    `;
  }).join("");
}

function saveDiscounts() {
  discounts.global = clamp(parseFloat(document.getElementById("global-discount").value) || 0, 0, 60);
  discounts.cartThreshold = Math.max(0, parseFloat(document.getElementById("cart-threshold").value) || 0);
  discounts.cartPercent = clamp(parseFloat(document.getElementById("cart-percent").value) || 0, 0, 30);

  document.querySelectorAll("#category-discounts input").forEach(input => {
    const cat = input.dataset.cat;
    discounts.categories[cat] = clamp(parseFloat(input.value) || 0, 0, 60);
  });

  localStorage.setItem("cola_discounts", JSON.stringify(discounts));
  renderProducts();
  renderCart();
}

function resetDiscounts() {
  localStorage.removeItem("cola_discounts");
  discounts = getDiscounts();
  initAdminPanel();
  renderProducts();
  renderCart();
}

function renderHomeCategories() {
  const el = document.getElementById("home-categories");
  if (!el) return;
  el.innerHTML = categories.map(c => `<div class="category-card">${c}</div>`).join("");
}

function setPage(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(b => b.classList.remove("active"));
  const activePage = document.getElementById("page-" + page);
  const activeBtn = document.querySelector('.nav-link[data-page="' + page + '"]');
  if (activePage) activePage.classList.add("active");
  if (activeBtn) activeBtn.classList.add("active");
}

buildFilters();
renderProducts();
renderCart();
initAdminPanel();
renderHomeCategories();

document.getElementById("product-list").addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if (btn) addToCart(btn.dataset.add);
});

cartListEl.addEventListener("click", e => {
  const action = e.target.dataset.action;
  const id = e.target.dataset.id;
  if (!action || !id) return;
  if (action === "inc") changeQty(id, 1);
  if (action === "dec") changeQty(id, -1);
  if (action === "remove") removeItem(id);
});

document.querySelectorAll(".filters input, .filters select").forEach(el => {
  el.addEventListener("input", renderProducts);
  el.addEventListener("change", renderProducts);
});

document.getElementById("reset-filters").addEventListener("click", () => {
  document.getElementById("search").value = "";
  document.getElementById("min-price").value = "";
  document.getElementById("max-price").value = "";
  document.getElementById("min-volume").value = "";
  document.getElementById("max-volume").value = "";
  document.getElementById("in-stock").checked = false;
  document.getElementById("sort").value = "default";
  categoryListEl.querySelectorAll("input").forEach(i => i.checked = true);
  sugarListEl.querySelectorAll("input").forEach(i => i.checked = true);
  renderProducts();
});

document.getElementById("clear-cart").addEventListener("click", () => {
  Object.keys(cart).forEach(k => delete cart[k]);
  saveCart();
  renderCart();
});

document.getElementById("save-discounts").addEventListener("click", saveDiscounts);
document.getElementById("reset-discounts").addEventListener("click", resetDiscounts);

document.querySelectorAll(".nav-link").forEach(btn => {
  btn.addEventListener("click", () => setPage(btn.dataset.page));
});

document.querySelectorAll("[data-jump]").forEach(btn => {
  btn.addEventListener("click", () => setPage(btn.dataset.jump));
});
