import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  ArrowUpDown, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  PackageSearch,
  ShieldCheck,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Product, CartItem, Order, UserProfile } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { Currency } from './utils/format';
import { api } from './services/api';
import { isFirebaseConfigured } from './firebase/config';

import { Navbar } from './components/Navbar';
import { Banner } from './components/Banner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';
import { Footer } from './components/Footer';

export default function App() {
  // Products & Orders State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');

  // Filtering & Sorting
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [currency, setCurrency] = useState<Currency>('BDT');

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Optional stored user session
    try {
      const stored = localStorage.getItem('novamart_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Modal Visibility States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'customer_login' | 'customer_register' | 'admin_login'>('customer_login');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Fetch products and orders on mount
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedProducts, fetchedOrders] = await Promise.all([
        api.getProducts().catch(() => INITIAL_PRODUCTS),
        api.getOrders().catch(() => [])
      ]);
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
      setFetchError('');
    } catch (err: unknown) {
      console.warn('Backend load error, using initial data:', err);
      setFetchError('Connected in local mode. All changes remain saved.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save auth user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('novamart_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('novamart_user');
    }
  }, [currentUser]);

  // Derived properties
  const isAdmin = currentUser?.role === 'admin';
  const totalCartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Filtered & Sorted Product List
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // popular
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`Sorry, "${product.title}" is currently out of stock.`);
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].quantity;
        const newQty = Math.min(product.stock, currentQty + quantity);
        if (newQty === currentQty) {
          showToast(`Maximum available stock (${product.stock}) already added to cart.`);
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        showToast(`Updated "${product.title}" in cart (Total: ${newQty})`);
        return updated;
      } else {
        const addQty = Math.min(product.stock, quantity);
        showToast(`Added "${product.title}" to cart`);
        return [...prevCart, { product, quantity: addQty }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.product.stock) {
              showToast(`Only ${item.product.stock} units available in stock.`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter(item => item.product.id !== productId));
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    setCart([]);
    setAppliedDiscount(0);
    setAppliedPromoCode('');
  };

  const handleProceedToCheckout = (discount: number, promoCode: string) => {
    setAppliedDiscount(discount);
    setAppliedPromoCode(promoCode);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (placedOrder: Order) => {
    setLastOrder(placedOrder);
    setOrders((prev) => [placedOrder, ...prev]);
    // Refresh products to reflect reduced inventory stock
    loadData();
    handleClearCart();
    setIsOrderSuccessOpen(true);
  };

  const handleOpenAdminTrigger = () => {
    if (isAdmin) {
      setIsAdminOpen(true);
    } else {
      setAuthMode('admin_login');
      setIsAuthOpen(true);
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    showToast(`Signed in as ${user.name}`);
    if (user.role === 'admin') {
      setIsAdminOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out successfully');
  };

  const toggleCurrency = () => {
    setCurrency(curr => curr === 'BDT' ? 'USD' : 'BDT');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onOpenAuth={() => { setAuthMode('customer_login'); setIsAuthOpen(true); }}
        onLogout={handleLogout}
        onOpenAdmin={handleOpenAdminTrigger}
        onOpenCustomerOrders={() => setIsCustomerOrdersOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        currency={currency}
        onToggleCurrency={toggleCurrency}
        isAdmin={isAdmin}
      />

      {/* Main Storefront Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 w-full">
        {/* Banner with Hero & Category filters */}
        <Banner
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onExploreClick={() => {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Catalog Section */}
        <section id="catalog-section" className="space-y-6 pt-4">
          {/* Section Header & Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedCategory === 'All' ? 'All Verified Products' : selectedCategory}
                </h2>
                <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {filteredProducts.length} items
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Eligible for Cash on Delivery with 7-day guarantee
              </p>
            </div>

            {/* Sort & Quick Filter */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="popular">Popular / Hot</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-12">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                  <div className="aspect-square bg-slate-200 rounded-xl w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3 pt-2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <PackageSearch className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">No matching products found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search terms or picking another category from the top bar.
                </p>
              </div>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onViewDetails={setSelectedProduct}
                  currency={currency}
                  isInCart={cart.some(i => i.product.id === product.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Promotion / Deployment strip */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-700/20">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-white/20 text-white text-xs font-bold px-3 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Developer & Owner Friendly</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Ready to Upload to Firebase & Host on Vercel?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              This app is completely ready. You can test orders now, and easily upload to Firebase later with zero friction.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-5 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>View Setup Guide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenAdminTrigger}
              className="px-5 py-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAdmin={handleOpenAdminTrigger}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
        currency={currency}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discountAmount={appliedDiscount}
        promoCode={appliedPromoCode}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
        currency={currency}
      />

      {/* Order Success Confirmation Modal */}
      <OrderSuccessModal
        order={lastOrder}
        onClose={() => setIsOrderSuccessOpen(false)}
        currency={currency}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        currency={currency}
      />

      {/* Auth Modal (Customer & Admin) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        onRefreshData={loadData}
        currency={currency}
        isFirebaseConnected={isFirebaseConfigured}
      />

      {/* Customer Orders Modal */}
      <CustomerOrdersModal
        isOpen={isCustomerOrdersOpen}
        onClose={() => setIsCustomerOrdersOpen(false)}
        orders={orders}
        currency={currency}
        customerEmail={currentUser?.email}
      />

      {/* Firebase & Vercel Setup Guide Modal */}
      <FirebaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
