/**
 * Order Flow Microservices - Frontend Control Center
 */

const API_BASE = 'http://localhost:8080';

// Application State
const state = {
  products: [],
  cart: new Map(), // productId -> { product, quantity }
  orders: [],
  payments: [],
  notifications: [],
  unreadNotifs: 0,
  selectedOrderForPayment: null
};

// DOM Elements
const elements = {
  // Tabs
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),

  // Gateway Status
  gatewayStatusChip: document.getElementById('gatewayStatusChip'),
  gatewayStatusText: document.getElementById('gatewayStatusText'),

  // Notification Bell
  notifBellBtn: document.getElementById('notifBellBtn'),
  notifBadge: document.getElementById('notifBadge'),
  notifDropdown: document.getElementById('notifDropdown'),
  notifList: document.getElementById('notifList'),
  clearNotifsBtn: document.getElementById('clearNotifsBtn'),

  // Catalog
  createProductForm: document.getElementById('createProductForm'),
  prodName: document.getElementById('prodName'),
  prodPrice: document.getElementById('prodPrice'),
  prodStock: document.getElementById('prodStock'),
  btnSaveProduct: document.getElementById('btnSaveProduct'),
  saveProductLoader: document.getElementById('saveProductLoader'),
  productGrid: document.getElementById('productGrid'),
  productCountBadge: document.getElementById('productCountBadge'),
  refreshProductsBtn: document.getElementById('refreshProductsBtn'),

  // Create Order
  createOrderForm: document.getElementById('createOrderForm'),
  customerName: document.getElementById('customerName'),
  cartItemsList: document.getElementById('cartItemsList'),
  cartItemCount: document.getElementById('cartItemCount'),
  orderSummaryTotal: document.getElementById('orderSummaryTotal'),
  quickPickGrid: document.getElementById('quickPickGrid'),
  btnPlaceOrder: document.getElementById('btnPlaceOrder'),
  placeOrderLoader: document.getElementById('placeOrderLoader'),

  // Orders Tab
  ordersTableBody: document.getElementById('ordersTableBody'),
  orderCountBadge: document.getElementById('orderCountBadge'),
  orderSearchInput: document.getElementById('orderSearchInput'),
  refreshOrdersBtn: document.getElementById('refreshOrdersBtn'),

  // Payments Tab
  paymentsTableBody: document.getElementById('paymentsTableBody'),
  paymentCountBadge: document.getElementById('paymentCountBadge'),
  refreshPaymentsBtn: document.getElementById('refreshPaymentsBtn'),

  // Payment Modal
  paymentModal: document.getElementById('paymentModal'),
  closePaymentModalBtn: document.getElementById('closePaymentModalBtn'),
  cancelPayBtn: document.getElementById('cancelPayBtn'),
  modalOrderIdBadge: document.getElementById('modalOrderIdBadge'),
  modalOrderTotal: document.getElementById('modalOrderTotal'),
  modalOrderPaid: document.getElementById('modalOrderPaid'),
  modalOrderRemaining: document.getElementById('modalOrderRemaining'),
  chipPayFull: document.getElementById('chipPayFull'),
  chipPay50: document.getElementById('chipPay50'),
  chipPayCustom: document.getElementById('chipPayCustom'),
  processPaymentForm: document.getElementById('processPaymentForm'),
  payAmount: document.getElementById('payAmount'),
  btnExecutePayment: document.getElementById('btnExecutePayment'),
  payLoader: document.getElementById('payLoader'),
  paymentReceipt: document.getElementById('paymentReceipt'),
  receiptIcon: document.getElementById('receiptIcon'),
  receiptTitle: document.getElementById('receiptTitle'),
  receiptMessage: document.getElementById('receiptMessage'),
  receiptRef: document.getElementById('receiptRef'),
  receiptTxId: document.getElementById('receiptTxId'),
  receiptAmount: document.getElementById('receiptAmount'),
  receiptNewBalance: document.getElementById('receiptNewBalance'),

  // Swagger Modal
  swaggerModal: document.getElementById('swaggerModal'),
  openSwaggerModalBtn: document.getElementById('openSwaggerModalBtn'),
  closeSwaggerModalBtn: document.getElementById('closeSwaggerModalBtn'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

// ================= Initialization =================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  fetchProducts();
  fetchOrders();
  fetchPayments();
  fetchNotifications();
  checkGatewayHealth();

  // Periodic polling for notifications and gateway health
  setInterval(fetchNotifications, 4000);
  setInterval(checkGatewayHealth, 15000);
});

// ================= Event Listeners =================
function setupEventListeners() {
  // Tab Navigation
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Notification Bell Toggle
  elements.notifBellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.notifDropdown.classList.toggle('hidden');
    if (!elements.notifDropdown.classList.contains('hidden')) {
      state.unreadNotifs = 0;
      updateNotifBadge();
    }
  });

  document.addEventListener('click', (e) => {
    if (!elements.notifDropdown.contains(e.target) && e.target !== elements.notifBellBtn) {
      elements.notifDropdown.classList.add('hidden');
    }
  });

  elements.clearNotifsBtn.addEventListener('click', () => {
    state.unreadNotifs = 0;
    updateNotifBadge();
    showToast('Notificaciones marcadas como leídas', 'info');
  });

  // Swagger Modal
  elements.openSwaggerModalBtn.addEventListener('click', () => {
    elements.swaggerModal.classList.remove('hidden');
  });
  elements.closeSwaggerModalBtn.addEventListener('click', () => {
    elements.swaggerModal.classList.add('hidden');
  });
  elements.swaggerModal.addEventListener('click', (e) => {
    if (e.target === elements.swaggerModal) elements.swaggerModal.classList.add('hidden');
  });

  // Create Product Form
  elements.createProductForm.addEventListener('submit', handleCreateProduct);
  elements.refreshProductsBtn.addEventListener('click', fetchProducts);

  // Create Order Form
  elements.createOrderForm.addEventListener('submit', handleCreateOrder);

  // Orders Table Controls
  elements.refreshOrdersBtn.addEventListener('click', fetchOrders);
  elements.orderSearchInput.addEventListener('input', renderOrdersTable);

  // Payments Table Controls
  elements.refreshPaymentsBtn.addEventListener('click', fetchPayments);

  // Payment Modal Controls
  elements.closePaymentModalBtn.addEventListener('click', closePaymentModal);
  elements.cancelPayBtn.addEventListener('click', closePaymentModal);
  elements.paymentModal.addEventListener('click', (e) => {
    if (e.target === elements.paymentModal) closePaymentModal();
  });
  elements.processPaymentForm.addEventListener('submit', handleProcessPayment);

  // Quick Amount Chips
  elements.chipPayFull.addEventListener('click', () => {
    if (state.selectedOrderForPayment) {
      elements.payAmount.value = (state.selectedOrderForPayment.remainingBalance || 0).toFixed(2);
    }
  });
  elements.chipPay50.addEventListener('click', () => {
    if (state.selectedOrderForPayment) {
      const rem = state.selectedOrderForPayment.remainingBalance || 0;
      elements.payAmount.value = (rem / 2).toFixed(2);
    }
  });
  elements.chipPayCustom.addEventListener('click', () => {
    elements.payAmount.value = '';
    elements.payAmount.focus();
  });
}

function switchTab(tabId) {
  elements.tabBtns.forEach(b => b.classList.remove('active'));
  elements.tabContents.forEach(c => c.classList.remove('active'));

  const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
  const activeContent = document.getElementById(tabId);
  if (activeBtn) activeBtn.classList.add('active');
  if (activeContent) activeContent.classList.add('active');

  // Trigger refresh on tab switch
  if (tabId === 'catalog-tab') fetchProducts();
  if (tabId === 'orders-tab') fetchOrders();
  if (tabId === 'payments-tab') fetchPayments();
}

// ================= API & Business Logic =================

// 1. Check Gateway Health
async function checkGatewayHealth() {
  try {
    const res = await fetch(`${API_BASE}/actuator/health`, { method: 'GET' });
    if (res.ok) {
      elements.gatewayStatusChip.classList.remove('error');
      elements.gatewayStatusText.textContent = 'Gateway :8080 Conectado';
    } else {
      throw new Error('Health check failed');
    }
  } catch (err) {
    elements.gatewayStatusChip.classList.add('error');
    elements.gatewayStatusText.textContent = 'Gateway :8080 Desconectado';
  }
}

// 2. Products (Catalog Service)
async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error('Error al consultar catálogo');
    state.products = await res.json();
    renderProductGrid();
    renderQuickPickGrid();
    elements.productCountBadge.textContent = `${state.products.length} productos`;
  } catch (err) {
    console.error(err);
    elements.productGrid.innerHTML = `<div class="empty-state">Error cargando productos: ${err.message}</div>`;
    elements.quickPickGrid.innerHTML = `<div class="empty-state">Error cargando catálogo</div>`;
  }
}

function renderProductGrid() {
  if (!state.products.length) {
    elements.productGrid.innerHTML = `<div class="empty-state">No hay productos registrados en el catálogo.</div>`;
    return;
  }

  elements.productGrid.innerHTML = state.products.map(p => `
    <div class="product-card">
      <div class="product-info">
        <h4>${escapeHtml(p.name)}</h4>
        <div class="product-meta">
          <span class="product-price">$${formatMoney(p.price)}</span>
          <span class="stock-tag ${p.stock <= 5 ? 'low' : ''}">Stock: ${p.stock}</span>
        </div>
      </div>
      <button class="add-cart-btn" onclick="addToCart(${p.id})">
        <span>+ Agregar al Pedido</span>
      </button>
    </div>
  `).join('');
}

function renderQuickPickGrid() {
  if (!state.products.length) {
    elements.quickPickGrid.innerHTML = `<div class="empty-state">No hay productos para seleccionar.</div>`;
    return;
  }

  elements.quickPickGrid.innerHTML = state.products.map(p => `
    <div class="product-card">
      <div class="product-info">
        <h4>${escapeHtml(p.name)}</h4>
        <div class="product-meta">
          <span class="product-price">$${formatMoney(p.price)}</span>
          <span class="stock-tag ${p.stock <= 5 ? 'low' : ''}">Stock: ${p.stock}</span>
        </div>
      </div>
      <button class="add-cart-btn" onclick="addToCart(${p.id})">
        <span>+ Agregar</span>
      </button>
    </div>
  `).join('');
}

async function handleCreateProduct(e) {
  e.preventDefault();
  const name = elements.prodName.value.trim();
  const price = parseFloat(elements.prodPrice.value);
  const stock = parseInt(elements.prodStock.value, 10);

  if (!name || isNaN(price) || isNaN(stock)) return;

  elements.btnSaveProduct.disabled = true;
  elements.saveProductLoader.classList.remove('hidden');

  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, stock })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || 'Error al guardar producto');
    }

    const created = await res.json();
    showToast(`Producto "${created.name}" creado exitosamente`, 'success');
    elements.createProductForm.reset();
    fetchProducts();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    elements.btnSaveProduct.disabled = false;
    elements.saveProductLoader.classList.add('hidden');
  }
}

// 3. Cart & Order Creation (Order Service)
window.addToCart = function(productId) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;

  if (state.cart.has(productId)) {
    const item = state.cart.get(productId);
    if (item.quantity < prod.stock) {
      item.quantity += 1;
    } else {
      showToast(`Stock máximo alcanzado para "${prod.name}"`, 'info');
    }
  } else {
    state.cart.set(productId, { product: prod, quantity: 1 });
  }

  renderCart();
  showToast(`"${prod.name}" añadido al pedido`, 'info');
};

window.updateCartQty = function(productId, delta) {
  if (!state.cart.has(productId)) return;
  const item = state.cart.get(productId);
  const newQty = item.quantity + delta;

  if (newQty <= 0) {
    state.cart.delete(productId);
  } else if (newQty > item.product.stock) {
    showToast(`Stock máximo alcanzado (${item.product.stock})`, 'info');
  } else {
    item.quantity = newQty;
  }

  renderCart();
};

function renderCart() {
  const entries = Array.from(state.cart.values());
  const count = entries.reduce((acc, i) => acc + i.quantity, 0);
  const total = entries.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

  elements.cartItemCount.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  elements.orderSummaryTotal.textContent = `$${formatMoney(total)}`;
  elements.btnPlaceOrder.disabled = entries.length === 0;

  if (!entries.length) {
    elements.cartItemsList.innerHTML = `<p class="empty-cart-text">Selecciona productos del catálogo para agregarlos.</p>`;
    return;
  }

  elements.cartItemsList.innerHTML = entries.map(i => `
    <div class="cart-item-row">
      <div>
        <strong>${escapeHtml(i.product.name)}</strong>
        <span style="color: var(--text-dim); font-size: 0.75rem;"> ($${formatMoney(i.product.price)} c/u)</span>
      </div>
      <div class="item-qty-controls">
        <button type="button" class="qty-btn" onclick="updateCartQty(${i.product.id}, -1)">-</button>
        <span>${i.quantity}</span>
        <button type="button" class="qty-btn" onclick="updateCartQty(${i.product.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

async function handleCreateOrder(e) {
  e.preventDefault();
  const customerName = elements.customerName.value.trim();
  const items = Array.from(state.cart.values()).map(i => ({
    productId: i.product.id,
    quantity: i.quantity
  }));

  if (!customerName || !items.length) return;

  elements.btnPlaceOrder.disabled = true;
  elements.placeOrderLoader.classList.remove('hidden');

  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, items })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || 'Error al emitir orden');
    }

    const order = await res.json();
    showToast(`Pedido #${order.id} emitido. Estado: ${order.status}`, 'success');

    // Reset Cart & Form
    state.cart.clear();
    renderCart();
    elements.createOrderForm.reset();

    // Refresh products stock & orders
    fetchProducts();
    fetchOrders();

    // Switch to orders tab to view progress
    switchTab('orders-tab');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    elements.btnPlaceOrder.disabled = false;
    elements.placeOrderLoader.classList.add('hidden');
  }
}

// 4. Orders Management (Order Service)
async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE}/api/orders`);
    if (!res.ok) throw new Error('Error consultando pedidos');
    state.orders = await res.json();
    elements.orderCountBadge.textContent = `${state.orders.length} pedidos`;
    renderOrdersTable();
  } catch (err) {
    console.error(err);
    elements.ordersTableBody.innerHTML = `<tr><td colspan="9" class="table-empty">Error cargando pedidos: ${err.message}</td></tr>`;
  }
}

function renderOrdersTable() {
  const query = (elements.orderSearchInput.value || '').toLowerCase().trim();
  const filtered = state.orders.filter(o =>
    o.customerName?.toLowerCase().includes(query) ||
    o.id.toString().includes(query) ||
    o.status?.toLowerCase().includes(query)
  );

  if (!filtered.length) {
    elements.ordersTableBody.innerHTML = `<tr><td colspan="9" class="table-empty">No se encontraron pedidos.</td></tr>`;
    return;
  }

  elements.ordersTableBody.innerHTML = filtered.map(order => {
    const total = order.total || 0;
    const paid = order.paidAmount || 0;
    const remaining = order.remainingBalance !== undefined ? order.remainingBalance : (total - paid);
    const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
    const dateFormatted = order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

    const itemsSummary = (order.items || []).map(it => `${it.productName} (x${it.quantity})`).join(', ') || 'Sin items';

    const canPay = remaining > 0 && order.status !== 'PAGADO';

    return `
      <tr>
        <td><strong>#${order.id}</strong></td>
        <td>${escapeHtml(order.customerName)}</td>
        <td><span style="color: var(--text-dim);">${dateFormatted}</span></td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(itemsSummary)}">${escapeHtml(itemsSummary)}</td>
        <td><strong>$${formatMoney(total)}</strong></td>
        <td>
          <div class="progress-wrapper">
            <div class="progress-track">
              <div class="progress-fill" style="width: ${percent}%;"></div>
            </div>
            <span class="progress-label">$${formatMoney(paid)} (${percent}%)</span>
          </div>
        </td>
        <td><strong style="color: ${remaining > 0 ? '#f87171' : '#34d399'};">$${formatMoney(remaining)}</strong></td>
        <td><span class="status-pill ${order.status}">${order.status}</span></td>
        <td>
          ${canPay ? `
            <button class="action-pay-btn" onclick="openPaymentModal(${order.id})">
              <span>💳 Abonar</span>
            </button>
          ` : `
            <span style="color: var(--text-dim); font-size: 0.75rem;">Liquidado ✅</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

// 5. Payments & Modal (Payment Service)
window.openPaymentModal = function(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  state.selectedOrderForPayment = order;

  elements.modalOrderIdBadge.textContent = `Orden #${order.id}`;
  elements.modalOrderTotal.textContent = `$${formatMoney(order.total)}`;
  elements.modalOrderPaid.textContent = `$${formatMoney(order.paidAmount || 0)}`;
  elements.modalOrderRemaining.textContent = `$${formatMoney(order.remainingBalance || 0)}`;

  elements.payAmount.value = (order.remainingBalance || 0).toFixed(2);
  elements.payAmount.max = (order.remainingBalance || 0).toFixed(2);

  elements.paymentReceipt.classList.add('hidden');
  elements.paymentModal.classList.remove('hidden');
};

function closePaymentModal() {
  elements.paymentModal.classList.add('hidden');
  state.selectedOrderForPayment = null;
  elements.processPaymentForm.reset();
}

async function handleProcessPayment(e) {
  e.preventDefault();
  if (!state.selectedOrderForPayment) return;

  const orderId = state.selectedOrderForPayment.id;
  const amount = parseFloat(elements.payAmount.value);

  if (isNaN(amount) || amount <= 0) {
    showToast('Ingresa un monto válido para pagar', 'error');
    return;
  }

  elements.btnExecutePayment.disabled = true;
  elements.payLoader.classList.remove('hidden');

  try {
    const res = await fetch(`${API_BASE}/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.message || `Error en el pago (${res.status})`);
    }

    // Show Receipt in Modal
    elements.paymentReceipt.classList.remove('hidden');
    elements.receiptIcon.textContent = '✅';
    elements.receiptTitle.textContent = 'Pago Procesado con Éxito';
    elements.receiptTitle.style.color = '#34d399';
    elements.receiptMessage.textContent = data.message || 'Transacción aprobada y confirmada.';
    elements.receiptRef.textContent = data.reference;
    elements.receiptTxId.textContent = `#${data.transactionId || 'N/A'}`;
    elements.receiptAmount.textContent = `$${formatMoney(data.amount)}`;
    elements.receiptNewBalance.textContent = `$${formatMoney(data.remainingBalance !== undefined ? data.remainingBalance : 0)}`;

    showToast(`Pago de $${formatMoney(data.amount)} registrado exitosamente`, 'success');

    // Refresh data in background
    fetchOrders();
    fetchPayments();
  } catch (err) {
    // Show Rejected/Failed Receipt
    elements.paymentReceipt.classList.remove('hidden');
    elements.receiptIcon.textContent = '⚠️';
    elements.receiptTitle.textContent = 'Pago Rechazado / Fallido';
    elements.receiptTitle.style.color = '#f87171';
    elements.receiptMessage.textContent = err.message;
    elements.receiptRef.textContent = 'N/A';
    elements.receiptTxId.textContent = 'Fallo de Pasarela';
    elements.receiptAmount.textContent = `$${formatMoney(amount)}`;
    elements.receiptNewBalance.textContent = `$${formatMoney(state.selectedOrderForPayment.remainingBalance || 0)}`;

    showToast(`Error al procesar pago: ${err.message}`, 'error');
    fetchPayments();
  } finally {
    elements.btnExecutePayment.disabled = false;
    elements.payLoader.classList.add('hidden');
  }
}

// 6. Payments Audit List
async function fetchPayments() {
  try {
    const res = await fetch(`${API_BASE}/payments`);
    if (!res.ok) throw new Error('Error al consultar auditoría de pagos');
    state.payments = await res.json();
    elements.paymentCountBadge.textContent = `${state.payments.length} transacciones`;
    renderPaymentsTable();
  } catch (err) {
    console.error(err);
    elements.paymentsTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">Error cargando transacciones: ${err.message}</td></tr>`;
  }
}

function renderPaymentsTable() {
  if (!state.payments.length) {
    elements.paymentsTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No hay transacciones registradas aún.</td></tr>`;
    return;
  }

  elements.paymentsTableBody.innerHTML = state.payments.map(p => {
    const dateFormatted = p.createdAt ? new Date(p.createdAt).toLocaleString() : '--';
    const shortRef = p.reference && p.reference.length > 20 ? `${p.reference.substring(0, 16)}...` : p.reference;

    return `
      <tr>
        <td>
          <code class="code-ref" onclick="copyToClipboard('${p.reference}')" title="Copiar SHA-256 completo">${shortRef} 📋</code>
        </td>
        <td><strong>#${p.orderId}</strong></td>
        <td><strong>$${formatMoney(p.amount)}</strong></td>
        <td><span class="status-pill ${p.status}">${p.status}</span></td>
        <td><span style="color: var(--text-muted);">${escapeHtml(p.message || '')}</span></td>
        <td><span style="color: var(--text-dim); font-size: 0.78rem;">${dateFormatted}</span></td>
      </tr>
    `;
  }).join('');
}

// 7. Notifications (AMQP / RabbitMQ History from notification-service)
async function fetchNotifications() {
  try {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) return;
    const notifs = await res.json();

    if (Array.isArray(notifs)) {
      // Check for new notifications
      if (notifs.length > state.notifications.length && state.notifications.length > 0) {
        const diff = notifs.length - state.notifications.length;
        state.unreadNotifs += diff;
        updateNotifBadge();

        // Show toast for latest notification
        const latest = notifs[0];
        if (latest) {
          showToast(`🔔 ${latest.title}: ${latest.message}`, 'info');
        }
      }

      state.notifications = notifs;
      renderNotifications();
    }
  } catch (err) {
    // Silent fail on polling
  }
}

function renderNotifications() {
  if (!state.notifications.length) {
    elements.notifList.innerHTML = `<div class="notif-empty">No hay notificaciones de eventos registradas.</div>`;
    return;
  }

  elements.notifList.innerHTML = state.notifications.map(n => {
    const timeStr = n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
    const typeClass = (n.type || 'ORDER').toLowerCase();

    return `
      <div class="notif-item ${typeClass}">
        <div class="notif-item-header">
          <span>${escapeHtml(n.title)}</span>
          <span class="notif-item-time">${timeStr}</span>
        </div>
        <p class="notif-item-msg">${escapeHtml(n.message)}</p>
      </div>
    `;
  }).join('');
}

function updateNotifBadge() {
  if (state.unreadNotifs > 0) {
    elements.notifBadge.textContent = state.unreadNotifs > 99 ? '99+' : state.unreadNotifs;
    elements.notifBadge.classList.remove('hidden');
  } else {
    elements.notifBadge.classList.add('hidden');
  }
}

// ================= Utilities =================
function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.copyToClipboard = function(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Referencia SHA-256 copiada al portapapeles', 'info');
  }).catch(() => {
    showToast('No se pudo copiar al portapapeles', 'error');
  });
};

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
