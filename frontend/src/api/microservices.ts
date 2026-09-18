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

// ================= Auth & User Management API =================

export interface UserAccount {
  id: number;
  username: string;
  fullName: string;
  email: string;
  department?: string;
  role: 'ADMIN' | 'OPERATOR' | 'DEVELOPER' | 'MANAGER';
  active: boolean;
  createdAt: string;
}

export interface AuthLoginResponse {
  token: string;
  tokenType: string;
  user: UserAccount;
}

export const KEYCLOAK_BASE = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8088';
export const KEYCLOAK_REALM = 'orderflow-realm';
export const KEYCLOAK_CLIENT_ID = 'orderflow-frontend';

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  id_token?: string;
}

export function parseJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function loginKeycloakApi(credentials: { username: string; password: string }): Promise<KeycloakTokenResponse> {
  const params = new URLSearchParams();
  params.append('client_id', KEYCLOAK_CLIENT_ID);
  params.append('grant_type', 'password');
  params.append('username', credentials.username);
  params.append('password', credentials.password);
  params.append('scope', 'openid profile email');

  const res = await fetch(`${KEYCLOAK_BASE}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'Credenciales inválidas en Keycloak');
  }
  return data;
}

export async function loginApi(credentials: { username: string; password: string }): Promise<AuthLoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Error al iniciar sesión');
  }
  return data;
}

export async function registerApi(user: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  department?: string;
  role?: string;
}): Promise<UserAccount> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Error al registrar usuario');
  }
  return data;
}

export async function fetchUsersApi(): Promise<UserAccount[]> {
  const res = await fetch(`${API_BASE}/auth/users`);
  if (!res.ok) throw new Error('Error al obtener lista de usuarios');
  return res.json();
}

export async function createUserApi(user: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  department?: string;
  role?: string;
}): Promise<UserAccount> {
  const res = await fetch(`${API_BASE}/auth/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Error al crear usuario');
  }
  return data;
}

export async function updateUserApi(
  username: string,
  user: {
    fullName: string;
    email: string;
    department?: string;
    role?: string;
    active?: boolean;
    password?: string;
  }
): Promise<UserAccount> {
  const res = await fetch(`${API_BASE}/auth/users/${username}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Error al actualizar usuario');
  }
  return data;
}

export async function deleteUserApi(username: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/users/${username}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar usuario');
  }
}
