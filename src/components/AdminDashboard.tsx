import React, { useState } from 'react';
import { 
  X, 
  Package, 
  ShoppingBag, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  Search, 
  ExternalLink,
  Flame,
  CheckCircle,
  Copy,
  Clock,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Product, Order, OrderStatus, PaymentStatus } from '../types';
import { formatPrice, formatDate, Currency } from '../utils/format';
import { CATEGORIES } from '../data/initialProducts';
import { api } from '../services/api';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onRefreshData: () => void;
  currency: Currency;
  isFirebaseConnected: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  onRefreshData,
  currency,
  isFirebaseConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'deployment'>('products');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  
  // Product modal state (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[1]);
  const [image, setImage] = useState('');
  const [stock, setStock] = useState('10');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState('New');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status updating state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  // Analytics
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;
  const lowStockProducts = products.filter(p => p.stock <= 5);

  // Filtered lists
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.orderStatus === orderFilter;
  });

  // Open modal for adding
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setCategory(CATEGORIES[1]);
    setImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80');
    setStock('20');
    setIsFeatured(false);
    setTags('Trending, Verified');
    setFormError('');
    setIsProductModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setDescription(p.description);
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
    setCategory(p.category);
    setImage(p.image);
    setStock(String(p.stock));
    setIsFeatured(Boolean(p.isFeatured));
    setTags(p.tags ? p.tags.join(', ') : '');
    setFormError('');
    setIsProductModalOpen(true);
  };

  // Submit product create/update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !price || !category || stock === '') {
      setFormError('Please fill in title, price, category, and inventory stock.');
      return;
    }

    try {
      setIsSubmitting(true);
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          category,
          image: image.trim(),
          stock: Number(stock),
          isFeatured,
          tags: parsedTags,
        });
      } else {
        await api.createProduct({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          category,
          image: image.trim(),
          stock: Number(stock),
          isFeatured,
          tags: parsedTags,
        });
      }

      setIsProductModalOpen(false);
      onRefreshData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.deleteProduct(id);
        onRefreshData();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Could not delete product');
      }
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await api.updateOrderStatus(orderId, newStatus);
      onRefreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Update payment status
  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const currentOrder = orders.find(o => o.id === orderId);
      if (currentOrder) {
        await api.updateOrderStatus(orderId, currentOrder.orderStatus, newPaymentStatus);
        onRefreshData();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update payment status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const copyEnvSnippet = () => {
    const snippet = `VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:...`;
    navigator.clipboard.writeText(snippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-6xl h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black tracking-tight">NovaMart Admin Control Center</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Authenticated Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">Inventory management, order fulfillment, and cloud deployment</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onRefreshData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Refresh Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Analytics stats banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-semibold flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Total Sales Volume
            </span>
            <p className="text-xl font-black text-slate-900 mt-1">
              {formatPrice(totalRevenue, currency)}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-semibold flex items-center">
              <ShoppingBag className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Total Orders
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-xl font-black text-slate-900">{totalOrdersCount}</p>
              {pendingOrdersCount > 0 && (
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  {pendingOrdersCount} pending
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-semibold flex items-center">
              <Package className="w-3.5 h-3.5 mr-1 text-purple-600" />
              Total Catalog Products
            </span>
            <p className="text-xl font-black text-slate-900 mt-1">{products.length} Items</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-semibold flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-500" />
              Low Stock Warnings
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-xl font-black text-slate-900">{lowStockProducts.length}</p>
              {lowStockProducts.length > 0 && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                  Action required
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center space-x-1.5 ${
              activeTab === 'products'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog & Stock ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('deployment')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center space-x-1.5 ${
              activeTab === 'deployment'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Firebase & Vercel Guide</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* TAB 1: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Product toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative max-w-sm w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search product inventory..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Selling Price</th>
                        <th className="px-4 py-3">Stock Units</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p) => {
                        const isLow = p.stock > 0 && p.stock <= 5;
                        const isOut = p.stock <= 0;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3 max-w-md">
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">{p.title}</p>
                                  <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                {p.category}
                              </span>
                            </td>

                            <td className="px-4 py-3 font-bold text-slate-900">
                              {formatPrice(p.price, currency)}
                            </td>

                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {p.stock} units
                            </td>

                            <td className="px-4 py-3">
                              {isOut ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                  Sold Out
                                </span>
                              ) : isLow ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                  Low Stock ({p.stock})
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  In Stock
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 cursor-pointer transition-colors"
                                  title="Edit Product Details & Stock"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.title)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 cursor-pointer transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order filter toolbar */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition-all ${
                      orderFilter === st
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st} ({st === 'all' ? orders.length : orders.filter(o => o.orderStatus === st).length})
                  </button>
                ))}
              </div>

              {/* Order Cards */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                    <p className="font-semibold text-sm">No orders matching this filter.</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-900">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400">
                            Placed {formatDate(order.createdAt)}
                          </span>
                        </div>

                        {/* Order status controls */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500">Status:</span>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            disabled={updatingOrderId === order.id}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer outline-hidden ${
                              order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                              order.orderStatus === 'processing' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                              order.orderStatus === 'shipped' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                              order.orderStatus === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                              'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          {/* Payment status badge */}
                          <button
                            onClick={() => handleUpdatePaymentStatus(order.id, order.paymentStatus === 'paid' ? 'pending' : 'paid')}
                            disabled={updatingOrderId === order.id}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-500 text-white border-emerald-600'
                                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            }`}
                            title="Click to toggle Payment status"
                          >
                            {order.paymentStatus === 'paid' ? '✓ Paid' : 'Cash on Delivery (Pending)'}
                          </button>
                        </div>
                      </div>

                      {/* Recipient & items row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{order.customerName}</p>
                          <p className="text-slate-600">{order.customerPhone}</p>
                          {order.customerEmail && <p className="text-slate-400">{order.customerEmail}</p>}
                          <p className="text-slate-500 mt-1">{order.shippingAddress}, {order.city}</p>
                          {order.notes && (
                            <p className="text-amber-700 bg-amber-50 p-1.5 rounded mt-1.5">
                              <strong>Note:</strong> {order.notes}
                            </p>
                          )}
                        </div>

                        {/* Items thumbnail list */}
                        <div className="md:col-span-2 space-y-1.5 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Items Ordered:</p>
                          <div className="divide-y divide-slate-100">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="py-1 flex items-center justify-between">
                                <span className="text-slate-700 truncate max-w-xs">
                                  {item.title} <strong className="text-slate-900">×{item.quantity}</strong>
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {formatPrice(item.price * item.quantity, currency)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex justify-between font-bold text-slate-900 border-t border-slate-200">
                            <span>Order Total Payable:</span>
                            <span className="text-emerald-700 text-sm">{formatPrice(order.total, currency)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FIREBASE & VERCEL GUIDE */}
          {activeTab === 'deployment' && (
            <div className="space-y-6 max-w-4xl mx-auto text-xs">
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Deployment & Firebase Status</h3>
                  <p className="text-slate-500">
                    Current backend mode: {isFirebaseConnected ? (
                      <span className="text-emerald-600 font-bold">Live Cloud Firestore & Auth Active</span>
                    ) : (
                      <span className="text-blue-600 font-bold">Integrated Full-Stack Server (Ready for Cloud Connection)</span>
                    )}
                  </p>
                </div>

                <div className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                  isFirebaseConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isFirebaseConnected ? 'Firebase Active' : 'Self-Contained Full-Stack'}
                </div>
              </div>

              {/* Step 1: Firebase setup instructions */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">How to Connect Your Firebase Project (Bengali & English)</h4>
                </div>

                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                  <p className="font-semibold">বাংলা নির্দেশিকা:</p>
                  <p>
                    আপনি পরে যখন এই ওয়েবসাইটটি আপনার নিজের Firebase অ্যাকাউন্টে হোস্ট বা কানেক্ট করতে চান:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li><a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-700 underline font-semibold">Firebase Console</a> এ যান এবং একটি নতুন প্রজেক্ট তৈরি করুন।</li>
                    <li><strong>Authentication</strong> ট্যাবে গিয়ে Email/Password এবং Google Sign-In চালু করুন।</li>
                    <li><strong>Cloud Firestore</strong> ডাটাবেস তৈরি করুন (Production মোডে)।</li>
                    <li>প্রজেক্টে উপস্থিত <code>firestore.rules</code> ফাইলের কোডটি Firebase Console Rules ট্যাবে পেস্ট করে Deploy দিন।</li>
                    <li>Project Settings থেকে Web App তৈরি করে নিচের এনভায়রনমেন্ট ভ্যারিয়েবলগুলো কপি করে আপনার <code>.env</code> ফাইলে বসিয়ে দিন।</li>
                  </ol>
                </div>

                {/* Env variables copy box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Environment Variables Template (.env / Vercel):</span>
                    <button
                      onClick={copyEnvSnippet}
                      className="text-purple-700 hover:text-purple-800 font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedEnv ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEnv ? 'Copied!' : 'Copy Template'}</span>
                    </button>
                  </div>

                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
ADMIN_EMAIL="admin@store.com"`}
                  </pre>
                </div>
              </div>

              {/* Step 2: Vercel deployment with GitHub */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Deploying to Vercel via GitHub</h4>
                </div>

                <div className="space-y-2 text-slate-600">
                  <p>To deploy this single-page app to Vercel with automatic continuous deployments:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1">
                    <li>Create a new repository on your GitHub account (e.g. <code>my-ecommerce-store</code>).</li>
                    <li>Push the project codebase to your GitHub repository:
                      <code className="block bg-slate-100 p-2 rounded-lg text-slate-800 mt-1 font-mono text-[11px]">
                        git init && git add . && git commit -m "Initial commit" <br />
                        git branch -M main && git remote add origin &lt;YOUR_GITHUB_REPO_URL&gt; <br />
                        git push -u origin main
                      </code>
                    </li>
                    <li>Log into <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">Vercel.com</a>, click <strong>"Add New Project"</strong>, and import your repository.</li>
                    <li>Under <strong>Environment Variables</strong> on Vercel, paste your <code>VITE_FIREBASE_*</code> values.</li>
                    <li>Click <strong>Deploy</strong>. Vercel will automatically build the site with <code>npm run build</code> and issue you a free live <code>.vercel.app</code> domain with SSL!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Add or Edit Product */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">
                  {editingProduct ? 'Edit Product Details' : 'Add New Catalog Product'}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Wireless Smart Earbuds Pro"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-purple-500"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Inventory Stock Units *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Selling Price (BDT / Base) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Original Price (for discount tag)</label>
                    <input
                      type="number"
                      min="0"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="e.g. 2000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                  />
                  {image && (
                    <div className="mt-2 flex items-center space-x-2">
                      <img
                        src={image}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="text-[11px] text-slate-400">Live Image Preview</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Highlight features, materials, warranty, battery life..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Wireless, Gaming, Premium"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="isFeatured" className="font-semibold text-slate-700 cursor-pointer">
                    Promote on Homepage as "Hot / Featured"
                  </label>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
