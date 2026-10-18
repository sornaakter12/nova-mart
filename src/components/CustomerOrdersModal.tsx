import React from 'react';
import { X, Package, Clock, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { formatPrice, formatDate, Currency } from '../utils/format';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currency: Currency;
  customerEmail?: string;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  currency,
  customerEmail,
}) => {
  if (!isOpen) return null;

  const userOrders = customerEmail
    ? orders.filter(o => o.customerEmail.toLowerCase() === customerEmail.toLowerCase())
    : orders;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">My Orders & Delivery Tracking</h3>
              <p className="text-[11px] text-slate-500">
                {customerEmail ? `Orders associated with ${customerEmail}` : 'Recent order history'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Orders */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {userOrders.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">No orders found yet</p>
              <p className="text-xs text-slate-400">Your placed orders will show up here with live status updates.</p>
            </div>
          ) : (
            userOrders.map((order) => (
              <div 
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {order.orderNumber}
                    </span>
                    <span className="text-slate-400 text-[11px]">{formatDate(order.createdAt)}</span>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize self-start sm:self-auto ${
                    order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                    order.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span className="truncate pr-2">{item.title} × {item.quantity}</span>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {formatPrice(item.price * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Total */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-500">
                    <span>Pay upon arrival: </span>
                    <strong className="text-slate-700 capitalize font-medium">{order.paymentMethod.replace(/_/g, ' ')}</strong>
                  </div>

                  <div className="flex items-baseline space-x-1.5 font-bold text-slate-900">
                    <span>Total:</span>
                    <span className="text-emerald-700 text-sm">{formatPrice(order.total, currency)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
