import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Printer, 
  ShoppingBag, 
  Package, 
  Truck, 
  PhoneCall, 
  MapPin, 
  Check 
} from 'lucide-react';
import { Order } from '../types';
import { formatPrice, formatDate, Currency } from '../utils/format';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  currency: Currency;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  currency,
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Celebration Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-black tracking-tight">Order Confirmed!</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-sm mx-auto">
            Thank you for shopping with NovaMart. Your order has been placed successfully and dispatched for packaging.
          </p>

          <div className="inline-flex items-center space-x-2 bg-emerald-950/40 border border-white/20 rounded-full px-4 py-1.5 mt-4 text-xs font-mono">
            <span className="text-emerald-300">Order ID:</span>
            <strong className="text-white font-bold">{order.orderNumber}</strong>
            <button
              onClick={handleCopy}
              className="text-white hover:text-emerald-200 ml-1 p-0.5 rounded cursor-pointer"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Invoice / Receipt Body */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Estimated Delivery Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start space-x-3 text-xs text-amber-900">
            <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Estimated Delivery: 2-3 Business Days</p>
              <p className="text-amber-700 mt-0.5">
                Our delivery partner will call you at <strong className="font-semibold">{order.customerPhone}</strong> before delivery.
              </p>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Recipient Details</span>
              <p className="font-bold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600 flex items-center">
                <PhoneCall className="w-3 h-3 mr-1 text-slate-400" />
                {order.customerPhone}
              </p>
              {order.customerEmail && (
                <p className="text-slate-500 truncate">{order.customerEmail}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Delivery Address</span>
              <p className="text-slate-700 flex items-start">
                <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0 mt-0.5" />
                <span>{order.shippingAddress}, {order.city}</span>
              </p>
              <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded mt-1">
                Cash on Delivery (Pending)
              </span>
            </div>
          </div>

          {/* Itemized summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
              <Package className="w-3.5 h-3.5 mr-1" />
              <span>Purchased Items ({order.items.length})</span>
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {order.items.map((item, index) => (
                <div key={index} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-slate-400 text-[11px]">
                        Qty: {item.quantity} × {formatPrice(item.price, currency)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatPrice(item.price * item.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.subtotal, currency)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Deduction</span>
                <span className="font-bold">-{formatPrice(order.discount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>{order.deliveryFee === 0 ? <strong className="text-emerald-700">Free</strong> : formatPrice(order.deliveryFee, currency)}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total to Pay upon Delivery</span>
              <span className="text-emerald-700 text-base">{formatPrice(order.total, currency)}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
