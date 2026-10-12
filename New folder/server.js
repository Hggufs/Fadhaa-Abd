const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const dbDir = path.join(__dirname, 'data');
const dbPath = process.env.DB_PATH || path.join(dbDir, 'shop.sqlite');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

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

const db = new sqlite3.Database(dbPath);
let databaseQueue = Promise.resolve();

function enqueueDatabaseOperation(operation) {
  const result = databaseQueue.then(operation);
  databaseQueue = result.then(() => undefined, () => undefined);
  return result;
}

function runDirect(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function allDirect(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function getDirect(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function run(sql, params = []) {
  return enqueueDatabaseOperation(() => runDirect(sql, params));
}

function all(sql, params = []) {
  return enqueueDatabaseOperation(() => allDirect(sql, params));
}

function get(sql, params = []) {
  return enqueueDatabaseOperation(() => getDirect(sql, params));
}

function withTransaction(callback) {
  return enqueueDatabaseOperation(async () => {
    await runDirect('BEGIN IMMEDIATE');
    try {
      const result = await callback({ run: runDirect, get: getDirect, all: allDirect });
      await runDirect('COMMIT');
      return result;
    } catch (error) {
      try {
        await runDirect('ROLLBACK');
      } catch (rollbackError) {
        console.error('Failed to roll back database transaction:', rollbackError);
      }
      throw error;
    }
  });
}

function normalizeProduct(row) {
  const specs = Array.isArray(row.specs)
    ? row.specs
    : (() => {
        try {
          const parsed = JSON.parse(row.specs || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return [];
        }
      })();

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    image: row.image,
    badge: row.badge,
    specs,
    price: Number(row.price),
    oldPrice: Number(row.oldPrice),
    description: row.description,
    stock: Number(row.stock),
  };
}

async function initDatabase() {
  await run('PRAGMA foreign_keys = ON');
  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      badge TEXT,
      specs TEXT,
      price REAL NOT NULL,
      oldPrice REAL,
      description TEXT,
      stock INTEGER DEFAULT 0
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      payment TEXT NOT NULL,
      total_price REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  const countRow = await get('SELECT COUNT(*) as count FROM products');
  if (!countRow || Number(countRow.count) === 0) {
    for (const product of defaultProducts) {
      await run(
        `INSERT INTO products (name, category, image, badge, specs, price, oldPrice, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.category,
          product.image,
          product.badge,
          JSON.stringify(product.specs),
          product.price,
          product.oldPrice,
          product.description,
          product.stock,
        ]
      );
    }
  }
}

app.use(express.json({ limit: '1mb' }));

function passwordMatches(candidate) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (typeof candidate !== 'string' || !configuredPassword) return false;

  const candidateBuffer = Buffer.from(candidate);
  const configuredBuffer = Buffer.from(configuredPassword);
  return candidateBuffer.length === configuredBuffer.length
    && crypto.timingSafeEqual(candidateBuffer, configuredBuffer);
}

function requireAdmin(req, res, next) {
  if (!passwordMatches(req.get('x-admin-password'))) {
    return res.status(401).json({ error: 'كلمة مرور الإدارة غير صحيحة' });
  }
  return next();
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'online' });
});

app.post('/api/admin/auth', (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'لم يتم إعداد كلمة مرور الإدارة على الخادم' });
  }
  if (!passwordMatches(req.body && req.body.password)) {
    return res.status(401).json({ error: 'كلمة مرور الإدارة غير صحيحة' });
  }
  return res.json({ success: true });
});

app.get('/api/products', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM products ORDER BY id DESC');
    const products = rows.map(normalizeProduct);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'فشل في جلب المنتجات' });
  }
});

app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const { name, category, badge, image, description, specs = [], price, oldPrice, stock } = req.body || {};

    if (!name || !category) {
      return res.status(400).json({ error: 'اسم المنتج والفئة مطلوبان' });
    }

    const product = {
      name: String(name).trim(),
      category: String(category).trim(),
      badge: String(badge || 'جديد').trim(),
      image: String(image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80').trim(),
      description: String(description || 'منتج جديد من الفهد للحاسبات.').trim(),
      specs: Array.isArray(specs) ? specs : String(specs).split(',').map((item) => item.trim()).filter(Boolean),
      price: Number(price) || 0,
      oldPrice: Number(oldPrice) || 0,
      stock: Number(stock) || 1,
    };

    const result = await run(
      `INSERT INTO products (name, category, image, badge, specs, price, oldPrice, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product.name, product.category, product.image, product.badge, JSON.stringify(product.specs), product.price, product.oldPrice, product.description, product.stock]
    );

    const created = await get('SELECT * FROM products WHERE id = ?', [result.id]);
    res.status(201).json(normalizeProduct(created));
  } catch (error) {
    res.status(500).json({ error: 'تعذر إضافة المنتج' });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'معرّف المنتج غير صحيح' });
    }

    const result = await run('DELETE FROM products WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حذف المنتج' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, address, city, payment, items = [] } = req.body || {};

    if (
      typeof customerName !== 'string'
      || !customerName.trim()
      || typeof phone !== 'string'
      || !phone.trim()
      || typeof address !== 'string'
      || !address.trim()
      || typeof city !== 'string'
      || !city.trim()
      || typeof payment !== 'string'
      || !payment.trim()
      || !Array.isArray(items)
      || items.length === 0
    ) {
      return res.status(400).json({ error: 'يرجى تعبئة بيانات الطلب كاملة' });
    }

    const quantities = new Map();
    for (const item of items) {
      const id = Number(item && item.id);
      const quantity = Number(item && item.quantity);
      if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'محتوى السلة غير صحيح' });
      }
      const combinedQuantity = (quantities.get(id) || 0) + quantity;
      if (!Number.isSafeInteger(combinedQuantity)) {
        return res.status(400).json({ error: 'الكمية المطلوبة غير صحيحة' });
      }
      quantities.set(id, combinedQuantity);
    }

    const order = await withTransaction(async ({ run: transactionRun, get: transactionGet }) => {
      const orderItems = [];
      let subtotal = 0;

      for (const [id, quantity] of quantities) {
        const productRow = await transactionGet('SELECT * FROM products WHERE id = ?', [id]);
        if (!productRow) {
          const error = new Error(`المنتج رقم ${id} غير موجود`);
          error.statusCode = 404;
          throw error;
        }

        if (Number(productRow.stock) < quantity) {
          const error = new Error(`الكمية المطلوبة غير متوفرة في المنتج ${productRow.name}`);
          error.statusCode = 400;
          throw error;
        }

        const price = Number(productRow.price);
        subtotal += price * quantity;
        orderItems.push({ productId: id, quantity, price });
      }

      const shipping = subtotal >= 3000 ? 0 : 49;
      const total = subtotal + shipping;
      const orderResult = await transactionRun(
        `INSERT INTO orders (customer_name, phone, address, city, payment, total_price) VALUES (?, ?, ?, ?, ?, ?)`,
        [customerName.trim(), phone.trim(), address.trim(), city.trim(), payment.trim(), total]
      );

      for (const item of orderItems) {
        await transactionRun(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderResult.id, item.productId, item.quantity, item.price]
        );
        await transactionRun(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      return { orderId: orderResult.id, total };
    });

    res.status(201).json({
      success: true,
      message: 'تم تسجيل الطلب بنجاح',
      ...order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'تعذر إنشاء الطلب' });
  }
});

app.use('/data', (req, res) => {
  res.sendStatus(404);
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  return res.sendFile(path.join(__dirname, 'index.html'));
});

async function startServer() {
  await initDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
