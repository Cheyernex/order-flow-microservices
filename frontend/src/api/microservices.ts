export const API_BASE = 'http://localhost:8080';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface OrderItem {
  productId: number;
  productName?: string;
  unitPrice?: number;
  quantity: number;
}

export interface Order {
  id: number;
  customerName: string;
  total: number;
  paidAmount: number;
  remainingBalance: number;
  status: string; // 'CREADO' | 'PAGO_PENDIENTE' | 'PAGO_PARCIAL' | 'PAGADO'
  paymentReference?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface PaymentTransaction {
  reference: string;
  status: string; // 'APPROVED' | 'REJECTED'
  success: boolean;
  message: string;
  orderId: number;
  amount: number;
  createdAt: string;
}

export interface PaymentProcessResponse {
  status: string;
  success: boolean;
  message: string;
  reference: string;
  transactionId?: number;
  orderId: number;
  amount: number;
  paidAmount?: number;
  remainingBalance?: number;
  orderStatus?: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  timestamp: string;
}

// ================= API Client =================

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
}

export async function createProduct(product: { name: string; price: number; stock: number }): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || 'Error al crear producto');
  }
  return res.json();
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/orders`);
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json();
}

export async function createOrder(order: { customerName: string; items: { productId: number; quantity: number }[] }): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || 'Error al emitir orden');
  }
  return res.json();
}

export async function fetchPayments(): Promise<PaymentTransaction[]> {
  const res = await fetch(`${API_BASE}/payments`);
  if (!res.ok) throw new Error('Error al obtener historial de pagos');
  return res.json();
}

export async function processPayment(payment: { orderId: number; amount: number }): Promise<PaymentProcessResponse> {
  const res = await fetch(`${API_BASE}/payments/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || `Error en el pago (${res.status})`);
  }
  return data;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${API_BASE}/notifications`);
  if (!res.ok) return [];
  return res.json();
}
