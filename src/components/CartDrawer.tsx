import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Tag, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { CartItem, PromoCode } from '../types';
import { formatPrice, Currency } from '../utils/format';
import { PROMO_CODES } from '../data/initialProducts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: (appliedDiscount: number, discountCode: string) => void;
  currency: Currency;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  currency,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Delivery fee logic: Free delivery if subtotal > 2000 BDT
  const deliveryFee = subtotal >= 2000 || subtotal === 0 ? 0 : 60;

  // Calculate discount
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.minSpend && subtotal < appliedPromo.minSpend) {
      // minimum spend not met
      discountAmount = 0;
    } else {
      discountAmount = Math.round((subtotal * appliedPromo.discountPercent) / 100);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const matched = PROMO_CODES.find(p => p.code === code);
    if (!matched) {
      setPromoError('Invalid coupon code. Try WELCOME10');
      return;
    }

    if (matched.minSpend && subtotal < matched.minSpend) {
      setPromoError(`Code requires minimum spend of ${formatPrice(matched.minSpend, currency)}`);
      return;
    }

    setAppliedPromo(matched);
    setPromoSuccess(`Applied: ${matched.description}`);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoSuccess('');
    setPromoError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Your Shopping Cart</h2>
              <p className="text-xs text-slate-500">
                {items.length} {items.length === 1 ? 'unique item' : 'unique items'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Free Delivery Bar */}
        {subtotal > 0 && (
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-2 text-xs">
            {subtotal >= 2000 ? (
              <p className="text-emerald-800 font-medium flex items-center">
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Congratulations! You unlocked <strong className="ml-1">Free Delivery</strong>.
              </p>
            ) : (
              <p className="text-slate-600">
                Add <strong className="text-emerald-700">{formatPrice(2000 - subtotal, currency)}</strong> more for <strong>Free Delivery</strong>
              </p>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Looks like you haven't added any products yet. Browse our verified products with cash on delivery!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div 
                key={product.id}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center space-x-3 hover:border-slate-200 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 text-xs truncate">
                    {product.title}
                  </h4>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    {formatPrice(product.price, currency)}
                  </p>

                  {/* Quantity and Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                        title="Reduce quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        disabled={quantity >= product.stock}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title={quantity >= product.stock ? 'Max available stock reached' : 'Increase quantity'}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-4 shadow-lg">
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Coupon code (e.g. WELCOME10)"
                    disabled={Boolean(appliedPromo)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 uppercase font-mono placeholder:text-slate-400 placeholder:normal-case focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100"
                  />
                </div>
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Apply
                  </button>
                )}
              </div>
              {promoError && (
                <p className="text-[11px] text-rose-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {promoError}
                </p>
              )}
              {promoSuccess && (
                <p className="text-[11px] text-emerald-700 flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  {promoSuccess}
                </p>
              )}
            </form>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal, currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({appliedPromo?.code})</span>
                  <span className="font-bold">-{formatPrice(discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">Free</strong> : formatPrice(deliveryFee, currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Estimated Total</span>
                <span className="text-emerald-700 text-base">{formatPrice(grandTotal, currency)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => onProceedToCheckout(discountAmount, appliedPromo?.code || '')}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              🔒 Cash on delivery checkout • No advance payment required
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
