export type ProductCategory = 
  | 'All'
  | 'Electronics'
  | 'Fashion & Apparel'
  | 'Home & Living'
  | 'Health & Beauty'
  | 'Groceries & Foods'
  | 'Gadgets & Accessories';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory | string;
  image: string;
  stock: number;
  rating: number;
  reviewsCount?: number;
  isFeatured?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'online_payment';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city?: string;
  postalCode?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  userId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  minSpend?: number;
  description: string;
}
