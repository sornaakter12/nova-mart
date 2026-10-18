import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { INITIAL_PRODUCTS } from './src/data/initialProducts.ts';
import { Product, Order, OrderStatus } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory Server-side persistent storage with default seeding
let productsDB: Product[] = [...INITIAL_PRODUCTS];
let ordersDB: Order[] = [
  {
    id: 'ord-sample-101',
    orderNumber: 'ORD-2026-89412',
    customerName: 'Rahim Ahmed',
    customerEmail: 'rahim@example.com',
    customerPhone: '+880 1712-345678',
    shippingAddress: 'House 42, Road 11, Banani, Dhaka',
    city: 'Dhaka',
    postalCode: '1213',
    items: [
      {
        productId: 'prod-1',
        title: 'Wireless Active Noise-Cancelling Headphones Pro',
        price: 3499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
      }
    ],
    subtotal: 3499,
    discount: 350,
    deliveryFee: 60,
    total: 3209,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    orderStatus: 'delivered',
    userId: 'cust-101',
    notes: 'Please call before arrival',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'ord-sample-102',
    orderNumber: 'ORD-2026-92147',
    customerName: 'Tasnim Jahan',
    customerEmail: 'tasnim@example.com',
    customerPhone: '+880 1819-987654',
    shippingAddress: 'Flat 4B, Sector 7, Uttara, Dhaka',
    city: 'Dhaka',
    postalCode: '1230',
    items: [
      {
        productId: 'prod-2',
        title: 'Ultra-Thin Smart Watch Series 8 (Amoled Display)',
        price: 2799,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
      },
      {
        productId: 'prod-9',
        title: 'Organic Raw Sundarban Honey (500g)',
        price: 850,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80'
      }
    ],
    subtotal: 4499,
    discount: 0,
    deliveryFee: 60,
    total: 4559,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    orderStatus: 'processing',
    userId: 'cust-102',
    notes: 'Leave at front desk if not available',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Helper to generate unique order number
function generateOrderNumber(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${new Date().getFullYear()}-${randomSuffix}`;
}

// ================= API ENDPOINTS =================

// 1. Get all products
app.get('/api/products', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: productsDB,
    total: productsDB.length
  });
});

// 2. Add new product (Admin)
app.post('/api/products', (req: Request, res: Response) => {
  const { title, description, price, originalPrice, category, image, stock, tags } = req.body;

  if (!title || price === undefined || !category || stock === undefined) {
    res.status(400).json({ success: false, error: 'Title, price, category, and stock are required.' });
    return;
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    title: String(title).trim(),
    description: description ? String(description).trim() : '',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category: String(category).trim(),
    image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    stock: Math.max(0, Number(stock)),
    rating: 5.0,
    reviewsCount: 1,
    isFeatured: Boolean(req.body.isFeatured),
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  productsDB.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

// 3. Update product (Admin)
app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = productsDB.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, error: 'Product not found.' });
    return;
  }

  const existing = productsDB[index];
  const updated: Product = {
    ...existing,
    ...req.body,
    id: existing.id,
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
    stock: req.body.stock !== undefined ? Math.max(0, Number(req.body.stock)) : existing.stock,
    updatedAt: new Date().toISOString()
  };

  productsDB[index] = updated;
  res.json({ success: true, data: updated });
});

// 4. Delete product (Admin)
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = productsDB.length;
  productsDB = productsDB.filter(p => p.id !== id);

  if (productsDB.length === initialLength) {
    res.status(404).json({ success: false, error: 'Product not found.' });
    return;
  }

  res.json({ success: true, message: 'Product deleted successfully.' });
});

// 5. Place new order (Customer Checkout)
app.post('/api/orders', (req: Request, res: Response) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    city,
    postalCode,
    items,
    subtotal,
    discount,
    deliveryFee,
    total,
    paymentMethod,
    userId,
    notes
  } = req.body;

  // Validation
  if (!customerName || !customerPhone || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: 'Please provide full shipping details and at least one item.' });
    return;
  }

  // Stock inventory check & atomic reduction
  for (const item of items) {
    const product = productsDB.find(p => p.id === item.productId);
    if (!product) {
      res.status(400).json({ success: false, error: `Product ${item.title} does not exist.` });
      return;
    }
    if (product.stock < item.quantity) {
      res.status(400).json({
        success: false,
        error: `Insufficient stock for "${product.title}". Only ${product.stock} available.`
      });
      return;
    }
  }

  // Deduct inventory stock
  for (const item of items) {
    const product = productsDB.find(p => p.id === item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      product.updatedAt = new Date().toISOString();
    }
  }

  const orderNumber = generateOrderNumber();
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customerName: String(customerName).trim(),
    customerEmail: String(customerEmail || '').trim(),
    customerPhone: String(customerPhone).trim(),
    shippingAddress: String(shippingAddress).trim(),
    city: city ? String(city).trim() : 'Dhaka',
    postalCode: postalCode ? String(postalCode).trim() : '',
    items,
    subtotal: Number(subtotal),
    discount: Number(discount || 0),
    deliveryFee: Number(deliveryFee || 60),
    total: Number(total),
    paymentMethod: paymentMethod === 'online_payment' ? 'online_payment' : 'cash_on_delivery',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    userId: userId || undefined,
    notes: notes ? String(notes).trim() : '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  ordersDB.unshift(newOrder);

  res.status(201).json({
    success: true,
    data: newOrder,
    message: 'Order placed successfully!'
  });
});

// 6. Get orders (Admin gets all, Customer filters by userId or email)
app.get('/api/orders', (req: Request, res: Response) => {
  const { userId, email } = req.query;

  let results = [...ordersDB];
  if (userId) {
    results = results.filter(o => o.userId === userId);
  } else if (email) {
    results = results.filter(o => o.customerEmail.toLowerCase() === String(email).toLowerCase());
  }

  res.json({
    success: true,
    data: results,
    total: results.length
  });
});

// 7. Update order status (Admin)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const order = ordersDB.find(o => o.id === id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found.' });
    return;
  }

  const validStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid order status value.' });
    return;
  }

  // If order was cancelled, restore stock
  if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
    for (const item of order.items) {
      const prod = productsDB.find(p => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    }
  }

  if (status) order.orderStatus = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  order.updatedAt = new Date().toISOString();

  res.json({ success: true, data: order });
});

// 8. Server & Firebase status
app.get('/api/system-status', (_req: Request, res: Response) => {
  const hasFirebaseKeys = Boolean(
    process.env.VITE_FIREBASE_API_KEY &&
    process.env.VITE_FIREBASE_API_KEY !== 'your-api-key' &&
    process.env.VITE_FIREBASE_PROJECT_ID &&
    process.env.VITE_FIREBASE_PROJECT_ID !== 'your-project-id'
  );

  res.json({
    success: true,
    status: 'online',
    firebaseConfigured: hasFirebaseKeys,
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
    stats: {
      productsCount: productsDB.length,
      ordersCount: ordersDB.length,
      lowStockCount: productsDB.filter(p => p.stock <= 5).length
    }
  });
});

// Setup Vite or Static Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started successfully on port ${PORT}`);
  });
}

startServer();
