import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { fetchOrders, processPayment, Order, PaymentProcessResponse } from 'src/api/microservices';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Badge } from 'src/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';

const OrdersView = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Payment Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<PaymentProcessResponse | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openPayModal = (order: Order) => {
    setSelectedOrder(order);
    setPayAmount(order.remainingBalance.toFixed(2));
    setReceipt(null);
    setPayError(null);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      setPayError('Ingresa un monto válido.');
      return;
    }

    setPaying(true);
    setPayError(null);
    try {
      const res = await processPayment({ orderId: selectedOrder.id, amount: amt });
      setReceipt(res);
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              paidAmount: (prev.paidAmount || 0) + amt,
              remainingBalance: res.remainingBalance ?? Math.max(0, prev.remainingBalance - amt),
              status: res.orderStatus || (res.remainingBalance === 0 ? 'PAGADO' : 'PAGO_PARCIAL'),
            }
          : null
      );
      loadOrders();
    } catch (err: any) {
      setPayError(err.message);
    } finally {
      setPaying(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search) ||
      o.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión & Pago de Pedidos</h1>
          <p className="text-sm text-muted-foreground">Historial, progreso de amortización y pagos parciales</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            placeholder="Buscar por cliente, ID o estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 text-xs"
          />
          <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading}>
            🔄
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 min-w-[140px]">Progreso de Pago</th>
                <th className="py-3 px-4">Saldo Pendiente</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    {loading ? 'Cargando pedidos...' : 'No se encontraron pedidos.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const percent = o.total > 0 ? Math.min(100, Math.round(((o.paidAmount || 0) / o.total) * 100)) : 0;
                  const canPay = o.remainingBalance > 0 && o.status !== 'PAGADO';

                  return (
                    <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">#{o.id}</td>
                      <td className="py-3.5 px-4 font-medium text-foreground">{o.customerName}</td>
                      <td className="py-3.5 px-4 text-muted-foreground max-w-[200px] truncate" title={(o.items || []).map((it) => `${it.productName} (x${it.quantity})`).join(', ')}>
                        {(o.items || []).map((it) => `${it.productName || 'Prod'} x${it.quantity}`).join(', ') || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">${o.total.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            ${(o.paidAmount || 0).toFixed(2)} ({percent}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className={o.remainingBalance > 0 ? 'text-red-400' : 'text-emerald-400'}>
                          ${o.remainingBalance.toFixed(2)}
                        </strong>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={
                            o.status === 'PAGADO'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                              : o.status === 'PAGO_PARCIAL'
                              ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          }
                        >
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canPay ? (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 px-3" onClick={() => openPayModal(o)}>
                            💳 Abonar
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-500 font-medium">Liquidado ✅</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Pago / Abono */}
      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Icon icon="solar:card-recive-bold-duotone" className="text-emerald-500" />
              Procesar Pago / Abono Parcial
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 pt-2">
              {/* Resumen Financiero */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-center">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Total Orden</span>
                  <strong className="text-foreground">${selectedOrder.total.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Abonado</span>
                  <strong className="text-primary">${(selectedOrder.paidAmount || 0).toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Saldo Pendiente</span>
                  <strong className="text-red-400">${selectedOrder.remainingBalance.toFixed(2)}</strong>
                </div>
              </div>

              {payError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
                  {payError}
                </div>
              )}

              {/* Formulario y Quick Chips */}
              {!receipt && (
                <>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setPayAmount(selectedOrder.remainingBalance.toFixed(2))}
                    >
                      {selectedOrder.paidAmount > 0
                        ? `Liquidar Saldo ($${selectedOrder.remainingBalance.toFixed(2)})`
                        : `Pagar 100% ($${selectedOrder.total.toFixed(2)})`}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setPayAmount((selectedOrder.remainingBalance / 2).toFixed(2))}
                    >
                      Abonar 50% ($${(selectedOrder.remainingBalance / 2).toFixed(2)})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setPayAmount('')}
                    >
                      Monto Libre
                    </Button>
                  </div>

                  <form onSubmit={handlePay} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Monto a Pagar ($ USD)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={selectedOrder.remainingBalance.toFixed(2)}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="Ingresa monto..."
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setSelectedOrder(null)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white" disabled={paying}>
                        {paying ? 'Procesando...' : 'Confirmar Pago'}
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {/* Recibo de Confirmación */}
              {receipt && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold">
                    <Icon icon="solar:check-circle-bold" width={20} />
                    <span>{receipt.message}</span>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-emerald-500/20 text-foreground">
                    <p><strong>Referencia SHA-256:</strong> <span className="font-mono text-[10px] text-muted-foreground block break-all">{receipt.reference}</span></p>
                    <p><strong>Monto Pagado:</strong> ${receipt.amount.toFixed(2)}</p>
                    <p><strong>Nuevo Saldo Pendiente:</strong> <span className="text-emerald-400 font-bold">${(receipt.remainingBalance ?? 0).toFixed(2)}</span></p>
                    <p><strong>Estado de Orden:</strong> <Badge variant="outline" className="text-[10px] ml-1">{receipt.orderStatus || 'PAGADO'}</Badge></p>
                  </div>
                  <Button className="w-full mt-3" size="sm" onClick={() => setSelectedOrder(null)}>
                    Cerrar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersView;
