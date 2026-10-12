const DB_NAME = 'AlFahdComputersDB';
const DB_VERSION = 1;
const PRODUCTS_STORE = 'products';
const ORDERS_STORE = 'orders';
const cartKey = 'haseb-cart';
const adminPasswordKey = 'haseb-admin-password';
let serverMode = false;

const defaultProducts = [
  {
    id: 1,
    name: 'لابتوب Dell XPS 13',
    category: 'محمولة',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    badge: 'الأكثر طلبًا',
    specs: ['13.4 بوصة', 'Intel i7', '16GB RAM'],
    price: 7199,
    oldPrice: 8299,
    description: 'لابتوب أنيق وعالي الأداء مناسب للبرمجة والعمل اليومي مع شاشة واضحة وسريعة واستجابة ممتازة.',
    stock: 12,
  },
  {
    id: 2,
    name: 'حاسب مكتبي MSI Creator',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    badge: 'للـ Design',
    specs: ['RTX 4070', '32GB RAM', '1TB SSD'],
    price: 10999,
    oldPrice: 12299,
    description: 'حاسب تصميم قوي وبارع، مناسب لمحترفي الفنون الرقمية والمونتاج ومهام الرسومات الثقيلة.',
    stock: 7,
  },
  {
    id: 3,
    name: 'لابتوب ASUS ROG',
    category: 'Gamer',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=900&q=80',
    badge: 'Gamer',
    specs: ['15.6 بوصة', 'RTX 4060', '32GB RAM'],
    price: 8999,
    oldPrice: 10199,
    description: 'لابتوب ألعاب مصمم للأداء العالي مع شاشة سريعة وتجهيزات قوية للعب والبرمجة.',
    stock: 10,
  },
  {
    id: 4,
    name: 'حاسب مكتبي HP ProDesk',
    category: 'مكتبية',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
    badge: 'مكتب',
    specs: ['Intel i5', '8GB RAM', '512GB SSD'],
    price: 4299,
    oldPrice: 4999,
    description: 'حل عملي وموثوق للمكاتب المنزلية أو المهنية مع أداء ممتاز للمهام اليومية.',
    stock: 15,
  },
  {
    id: 5,
    name: 'MacBook Air M2',
    category: 'محمولة',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80',
    badge: 'Apple',
    specs: ['13.6 بوصة', 'M2', '8GB RAM'],
    price: 8799,
    oldPrice: 9599,
    description: 'حجم صغير، أداء فائق، وتصميم أنيق مناسب للطلاب والمحترفين والمهام المتعددة.',
    stock: 9,
  },
  {
    id: 6,
    name: 'حاسب Lenovo Legion',
    category: 'Gamer',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80',
    badge: 'الأداء',
    specs: ['16 بوصة', 'RTX 4050', '16GB RAM'],
    price: 7999,
    oldPrice: 8999,
    description: 'لابتوب ألعاب قوي ومريح مع شاشة واسعة وتصميم متين وأداء قوي في الألعاب.',
    stock: 8,
  },
  {
    id: 7,
    name: 'Dell Latitude 7430',
    category: 'مكتبية',
    image: 'https://images.unsplash.com/photo-1555618562-1b5d7efdbfbd?auto=format&fit=crop&w=900&q=80',
    badge: 'مكتب',
    specs: ['14 بوصة', 'i5-1235U', '16GB RAM'],
    price: 4599,
    oldPrice: 5299,
    description: 'آلة مكتب متينة وحساسة، مناسبة للشركات والمهام الإدارية والبرامج الثقيلة.',
    stock: 11,
  },
  {
    id: 8,
    name: 'Acer Predator Helios',
    category: 'Gamer',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80',
    badge: 'مميز',
    specs: ['17.3 بوصة', 'RTX 4070', '64GB RAM'],
    price: 11999,
    oldPrice: 13499,
    description: 'جهاز ألعاب متقدم بتصميم فاخر وأداء قتالي كامل للمهام الثقيلة والالعاب الحديثة.',
    stock: 5,
  },
];

function formatPrice(value) {
  return `${new Intl.NumberFormat('ar-SA').format(value)} ر.س`;
}

function getCart() {
  const raw = localStorage.getItem(cartKey);
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function updateCartBadge() {
  const cartCount = document.getElementById('cartCount');
  if (!cartCount) return;
  const totalItems = getCart().reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  updateCartBadge();
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'تعذر الاتصال بالخادم');
  }

  return result;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
        const productsStore = db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
        productsStore.createIndex('category', 'category', { unique: false });
      }

      if (!db.objectStoreNames.contains(ORDERS_STORE)) {
        db.createObjectStore(ORDERS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('فشل فتح قاعدة البيانات'));
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('حدث خطأ في IndexedDB'));
  });
}

async function seedDefaultProducts() {
  const db = await openDatabase();
  const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
  const store = transaction.objectStore(PRODUCTS_STORE);

  defaultProducts.forEach((product) => store.put(product));

  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('تعذر تهيئة المنتجات الافتراضية'));
  });
}

async function getProductsFromDb() {
  if (serverMode) {
    return apiRequest('/api/products');
  }

  const db = await openDatabase();
  const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
  const store = transaction.objectStore(PRODUCTS_STORE);
  const products = await requestToPromise(store.getAll());

  if (!products || products.length === 0) {
    await seedDefaultProducts();
    return getProductsFromDb();
  }

  return products;
}

async function saveProductsToDb(products) {
  const db = await openDatabase();
  const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
  const store = transaction.objectStore(PRODUCTS_STORE);

  products.forEach((product) => store.put(product));

  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('تعذر حفظ المنتجات'));
  });
}

async function addProductToDb(product) {
  if (serverMode) {
    return apiRequest('/api/products', {
      method: 'POST',
      headers: { 'x-admin-password': sessionStorage.getItem(adminPasswordKey) || '' },
      body: JSON.stringify(product),
    });
  }

  const db = await openDatabase();
  const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
  const store = transaction.objectStore(PRODUCTS_STORE);
  await requestToPromise(store.put(product));

  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('تعذر إضافة المنتج'));
  });
}

async function deleteProductFromDb(productId) {
  if (serverMode) {
    return apiRequest(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': sessionStorage.getItem(adminPasswordKey) || '' },
    });
  }

  const db = await openDatabase();
  const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
  const store = transaction.objectStore(PRODUCTS_STORE);
  await requestToPromise(store.delete(productId));

  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('تعذر حذف المنتج'));
  });
}

async function createOrderInDb(orderPayload) {
  if (serverMode) {
    return apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  }

  const db = await openDatabase();
  const transaction = db.transaction(ORDERS_STORE, 'readwrite');
  const store = transaction.objectStore(ORDERS_STORE);
  const currentProducts = await getProductsFromDb();

  const nextProducts = [...currentProducts];
  orderPayload.items.forEach(({ id, quantity }) => {
    const product = nextProducts.find((item) => item.id === Number(id));
    if (!product) return;
    product.stock = Math.max(0, Number(product.stock) - Number(quantity));
  });

  await saveProductsToDb(nextProducts);
  const order = {
    id: Date.now(),
    customerName: orderPayload.customerName,
    phone: orderPayload.phone,
    address: orderPayload.address,
    city: orderPayload.city,
    payment: orderPayload.payment,
    total: Number(orderPayload.total),
    createdAt: new Date().toISOString(),
    items: orderPayload.items,
  };

  await requestToPromise(store.put(order));
  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('تعذر إنشاء الطلب'));
  });

  return order;
}

async function renderProducts() {
  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');

  if (!productsGrid || !searchInput || !categoryFilter) return;

  try {
    const catalog = await getProductsFromDb();
    const searchText = searchInput.value.trim().toLowerCase();
    const categoryValue = categoryFilter.value;

    const filteredProducts = catalog.filter((product) => {
      const matchesText = product.name.toLowerCase().includes(searchText);
      const matchesCategory = categoryValue === 'all' || product.category === categoryValue;
      return matchesText && matchesCategory;
    });

    if (!filteredProducts.length) {
      productsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>لا توجد نتائج</h3>
          <p>حاول البحث بكلمة أخرى أو قم بتغيير الفئة.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filteredProducts
      .map(
        (product) => `
          <article class="product-card">
            <div class="product-image" style="background-image: url('${product.image}')">
              <span class="product-badge">${product.badge}</span>
            </div>
            <div class="product-body">
              <div class="product-meta">
                <span>${product.category}</span>
                <span>4.9 ★</span>
              </div>
              <h3 class="product-name">${product.name}</h3>
              <ul class="product-specs">
                ${product.specs.map((spec) => `<li>${spec}</li>`).join('')}
              </ul>
              <div class="product-footer">
                <div class="price">${formatPrice(product.price)} <small>${formatPrice(product.oldPrice)}</small></div>
                <div style="display:grid; gap:8px;">
                  <a class="btn-secondary" href="product.html?id=${product.id}" style="padding:10px 14px;">تفاصيل</a>
                  <button type="button" data-id="${product.id}">أضف إلى السلة</button>
                </div>
              </div>
            </div>
          </article>
        `
      )
      .join('');

    const buttons = productsGrid.querySelectorAll('button[data-id]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        addToCart(Number(button.dataset.id));
        button.textContent = 'تمت الإضافة';
        button.disabled = true;
        setTimeout(() => {
          button.textContent = 'أضف إلى السلة';
          button.disabled = false;
        }, 800);
      });
    });
  } catch (error) {
    productsGrid.innerHTML = '<div class="empty-state"><h3>تعذر تحميل المنتجات</h3><p>يرجى المحاولة لاحقًا.</p></div>';
  }
}

async function renderProductDetailPage() {
  const detailRoot = document.getElementById('productDetail');
  if (!detailRoot) return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = Number(urlParams.get('id'));
    const products = await getProductsFromDb();
    const product = products.find((item) => item.id === productId);

    if (!product) {
      detailRoot.innerHTML = `
        <div class="empty-state">
          <h3>المنتج غير موجود</h3>
          <p>يرجى العودة إلى الصفحة الرئيسية واختيار منتج آخر.</p>
        </div>
      `;
      return;
    }

    detailRoot.innerHTML = `
      <div class="product-detail-grid">
        <div class="detail-image" style="background-image:url('${product.image}')"></div>
        <div class="detail-panel">
          <span class="eyebrow">${product.badge}</span>
          <h1>${product.name}</h1>
          <div class="detail-meta">
            <span>${product.category}</span>
            <span>موجود الآن</span>
            <span>تقييم 4.9</span>
          </div>
          <div class="detail-price">
            <strong>${formatPrice(product.price)}</strong>
            <small>${formatPrice(product.oldPrice)}</small>
          </div>
          <p>${product.description}</p>
          <ul class="product-specs">
            ${product.specs.map((spec) => `<li>${spec}</li>`).join('')}
          </ul>
          <div class="actions-row">
            <div class="qty-control">
              <button class="qty-btn" type="button" data-action="minus">−</button>
              <span id="qtyValue">1</span>
              <button class="qty-btn" type="button" data-action="plus">+</button>
            </div>
            <button class="btn-primary" id="buyButton" type="button">أضف إلى السلة</button>
          </div>
        </div>
      </div>
    `;

    let quantity = 1;
    const qtyValue = document.getElementById('qtyValue');

    document.querySelector('[data-action="minus"]').addEventListener('click', () => {
      quantity = Math.max(1, quantity - 1);
      qtyValue.textContent = quantity;
    });

    document.querySelector('[data-action="plus"]').addEventListener('click', () => {
      quantity += 1;
      qtyValue.textContent = quantity;
    });

    document.getElementById('buyButton').addEventListener('click', () => {
      const cart = getCart();
      const existing = cart.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ id: product.id, quantity });
      }
      saveCart(cart);
      updateCartBadge();
      window.location.href = 'cart.html';
    });
  } catch (error) {
    detailRoot.innerHTML = '<div class="empty-state"><h3>تعذر تحميل تفاصيل المنتج</h3></div>';
  }
}

function renderCart() {
  const cartRoot = document.getElementById('cartList');
  const summaryRoot = document.getElementById('cartSummary');
  if (!cartRoot || !summaryRoot) return;

  const cart = getCart();

  if (!cart.length) {
    cartRoot.innerHTML = `
      <div class="empty-state">
        <h3>سلة المشتريات فارغة</h3>
        <p>ابدأ في إضافة بعض المنتجات الرائعة إلى السلة.</p>
        <div class="actions-row" style="justify-content:center; margin-top:24px;">
          <a class="btn-primary" href="index.html">تسوق الآن</a>
        </div>
      </div>
    `;
    summaryRoot.innerHTML = `
      <div class="summary-card">
        <h3>ملخص الطلب</h3>
        <div class="summary-row"><span>المجموع</span><span>0 ر.س</span></div>
        <div class="summary-row"><span>الشحن</span><span>0 ر.س</span></div>
        <div class="summary-row total"><span>الإجمالي</span><span>0 ر.س</span></div>
      </div>
    `;
    return;
  }

  getProductsFromDb()
    .then((products) => {
      const items = cart
        .map((item) => {
          const product = products.find((p) => p.id === item.id);
          return product ? { ...product, quantity: item.quantity } : null;
        })
        .filter(Boolean);

      if (!items.length) {
        saveCart([]);
        renderCart();
        return;
      }

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal >= 3000 ? 0 : 49;
      const total = subtotal + shipping;

      cartRoot.innerHTML = items
        .map(
          (item) => `
            <div class="cart-item">
              <div class="cart-thumb" style="background-image:url('${item.image}')"></div>
              <div>
                <h3>${item.name}</h3>
                <p>${item.category}</p>
                <div class="qty-control" style="margin-top:12px;">
                  <button class="qty-btn" type="button" data-op="minus" data-id="${item.id}">−</button>
                  <span>${item.quantity}</span>
                  <button class="qty-btn" type="button" data-op="plus" data-id="${item.id}">+</button>
                </div>
              </div>
              <div class="cart-actions">
                <strong>${formatPrice(item.price * item.quantity)}</strong>
                <button class="remove-btn" data-remove="${item.id}" type="button">حذف</button>
              </div>
            </div>
          `
        )
        .join('');

      summaryRoot.innerHTML = `
        <div class="summary-card">
          <h3>ملخص الطلب</h3>
          <div class="summary-row"><span>المجموع</span><span>${formatPrice(subtotal)}</span></div>
          <div class="summary-row"><span>الشحن</span><span>${formatPrice(shipping)}</span></div>
          <div class="summary-row total"><span>الإجمالي</span><span>${formatPrice(total)}</span></div>
          <a class="checkout-btn" href="checkout.html" style="margin-top:18px; width:100%;">إتمام الطلب</a>
        </div>
      `;

      document.querySelectorAll('[data-remove]').forEach((button) => {
        button.addEventListener('click', () => {
          const updated = getCart().filter((item) => item.id !== Number(button.dataset.remove));
          saveCart(updated);
          renderCart();
          updateCartBadge();
        });
      });

      document.querySelectorAll('[data-op]').forEach((button) => {
        const productId = Number(button.dataset.id);
        const cartItems = getCart();
        const item = cartItems.find((entry) => entry.id === productId);

        if (!item) return;

        button.addEventListener('click', () => {
          if (button.dataset.op === 'plus') {
            item.quantity += 1;
          } else if (button.dataset.op === 'minus') {
            item.quantity = Math.max(1, item.quantity - 1);
          }
          saveCart(cartItems);
          renderCart();
          updateCartBadge();
        });
      });
    })
    .catch(() => {
      cartRoot.innerHTML = '<div class="empty-state"><h3>تعذر عرض السلة</h3></div>';
      summaryRoot.innerHTML = '<div class="summary-card"><h3>خطأ</h3><p>يرجى المحاولة مرة أخرى.</p></div>';
    });
}

async function renderCheckout() {
  const summaryRoot = document.getElementById('checkoutSummary');
  if (!summaryRoot) return;

  const cart = getCart();
  if (!cart.length) {
    summaryRoot.innerHTML = `
      <div class="summary-card">
        <h3>السلة فارغة</h3>
        <p>يجب إضافة منتجات قبل إتمام الطلب.</p>
      </div>
    `;
    return;
  }

  try {
    const products = await getProductsFromDb();
    const items = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.id);
        return product ? { ...product, quantity: item.quantity } : null;
      })
      .filter(Boolean);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 3000 ? 0 : 49;
    const total = subtotal + shipping;

    summaryRoot.innerHTML = `
      <div class="summary-card">
        <h3>ملخص الطلب</h3>
        ${items
          .map(
            (item) => `
              <div class="summary-row">
                <span>${item.name} × ${item.quantity}</span>
                <span>${formatPrice(item.price * item.quantity)}</span>
              </div>
            `
          )
          .join('')}
        <div class="summary-row"><span>المجموع</span><span>${formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>الشحن</span><span>${formatPrice(shipping)}</span></div>
        <div class="summary-row total"><span>الإجمالي</span><span>${formatPrice(total)}</span></div>
      </div>
    `;

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(checkoutForm);
        const payload = {
          customerName: formData.get('fullName')?.toString().trim(),
          phone: formData.get('phone')?.toString().trim(),
          address: formData.get('address')?.toString().trim(),
          city: formData.get('city')?.toString().trim(),
          payment: formData.get('payment')?.toString().trim(),
          total: total,
          items: cart.map((item) => ({
            id: Number(item.id),
            quantity: Number(item.quantity),
          })),
        };

        try {
          await createOrderInDb(payload);
          localStorage.removeItem(cartKey);
          updateCartBadge();
          alert('تم تسجيل طلبك بنجاح! سيتم التواصل معك لتأكيد الطلب.');
          window.location.href = 'index.html';
        } catch (error) {
          alert(error.message || 'حدث خطأ أثناء تأكيد الطلب');
        }
      });
    }
  } catch (error) {
    summaryRoot.innerHTML = '<div class="summary-card"><h3>تعذر تحميل ملخص الطلب</h3></div>';
  }
}

function initHomePage() {
  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');

  if (!productsGrid) return;
  updateCartBadge();
  renderProducts();

  searchInput?.addEventListener('input', renderProducts);
  categoryFilter?.addEventListener('change', renderProducts);
}

async function renderAdminProducts() {
  const listRoot = document.getElementById('adminProductList');
  if (!listRoot) return;

  try {
    const items = await getProductsFromDb();
    listRoot.innerHTML = items
      .map(
        (item) => `
          <div class="admin-item">
            <div class="admin-thumb" style="background-image:url('${item.image}')"></div>
            <div class="admin-info">
              <strong>${item.name}</strong>
              <span>${item.category} • ${formatPrice(item.price)}</span>
            </div>
            <button type="button" class="danger-btn" data-delete-id="${item.id}">حذف</button>
          </div>
        `
      )
      .join('');

    listRoot.querySelectorAll('[data-delete-id]').forEach((button) => {
      button.addEventListener('click', async () => {
        const productId = Number(button.dataset.deleteId);

        try {
          await deleteProductFromDb(productId);
          await renderAdminProducts();
          await renderProducts();
          updateCartBadge();
        } catch (error) {
          alert(error.message || 'حدث خطأ أثناء حذف المنتج');
        }
      });
    });
  } catch (error) {
    listRoot.innerHTML = '<p>تعذر تحميل المنتجات من قاعدة البيانات.</p>';
  }
}

async function initAdminPage() {
  const adminForm = document.getElementById('adminProductForm');
  if (!adminForm) return;

  const loginPanel = document.getElementById('adminLoginPanel');
  const adminContent = document.getElementById('adminContent');
  const loginForm = document.getElementById('adminLoginForm');

  if (serverMode) {
    const showLogin = () => {
      loginPanel.hidden = false;
      adminContent.hidden = true;
    };
    const showAdmin = async () => {
      loginPanel.hidden = true;
      adminContent.hidden = false;
      await renderAdminProducts();
    };
    const savedPassword = sessionStorage.getItem(adminPasswordKey);

    if (savedPassword) {
      try {
        await apiRequest('/api/admin/auth', {
          method: 'POST',
          body: JSON.stringify({ password: savedPassword }),
        });
        await showAdmin();
      } catch (error) {
        sessionStorage.removeItem(adminPasswordKey);
        showLogin();
      }
    } else {
      showLogin();
    }

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const passwordInput = document.getElementById('adminPassword');
      const errorRoot = document.getElementById('adminLoginError');
      const password = passwordInput.value;
      errorRoot.hidden = true;

      try {
        await apiRequest('/api/admin/auth', {
          method: 'POST',
          body: JSON.stringify({ password }),
        });
        sessionStorage.setItem(adminPasswordKey, password);
        passwordInput.value = '';
        await showAdmin();
      } catch (error) {
        errorRoot.textContent = error.message;
        errorRoot.hidden = false;
      }
    });
  } else {
    await renderAdminProducts();
  }

  adminForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(adminForm);
    const payload = {
      id: Date.now(),
      name: formData.get('name')?.toString().trim(),
      category: formData.get('category')?.toString().trim(),
      badge: formData.get('badge')?.toString().trim() || 'جديد',
      price: Number(formData.get('price')) || 0,
      oldPrice: Number(formData.get('oldPrice')) || 0,
      image: formData.get('image')?.toString().trim() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      description: formData.get('description')?.toString().trim() || 'منتج جديد من الفهد للحاسبات.',
      specs: formData
        .get('specs')
        ?.toString()
        .split(',')
        .map((spec) => spec.trim())
        .filter(Boolean) || [],
      stock: Number(formData.get('stock')) || 1,
    };

    if (!payload.name || !payload.category) {
      alert('يرجى إدخال اسم المنتج والفئة.');
      return;
    }

    try {
      await addProductToDb(payload);
      adminForm.reset();
      await renderAdminProducts();
      await renderProducts();
      alert('تمت إضافة المنتج بنجاح.');
    } catch (error) {
      alert(error.message || 'حدث خطأ أثناء إضافة المنتج');
    }
  });
}

async function initPage() {
  updateCartBadge();
  const localHostnames = ['localhost', '127.0.0.1'];
  const isPublicHost = window.location.protocol === 'https:'
    || (!localHostnames.includes(window.location.hostname) && window.location.port !== '8000');

  try {
    const health = await fetch('/api/health', { cache: 'no-store' });
    if (!health.ok && isPublicHost) {
      throw new Error('تعذر الاتصال بخادم المتجر');
    }
    serverMode = health.ok;
  } catch (error) {
    if (isPublicHost) {
      const main = document.querySelector('main');
      if (main) {
        main.innerHTML = '<div class="container empty-state"><h3>تعذر الاتصال بخادم المتجر</h3><p>يرجى تحديث الصفحة بعد عودة الخدمة.</p></div>';
      }
      return;
    }
  }

  const currentPage = window.location.pathname.split('/').pop();

  if (currentPage === 'index.html' || currentPage === '') {
    initHomePage();
  }

  if (currentPage === 'product.html') {
    await renderProductDetailPage();
  }

  if (currentPage === 'cart.html') {
    renderCart();
  }

  if (currentPage === 'checkout.html') {
    await renderCheckout();
  }

  if (currentPage === 'admin.html') {
    await initAdminPage();
  }
}

document.addEventListener('DOMContentLoaded', initPage);
