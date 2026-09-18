import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import { fetchOrders, fetchPayments, fetchProducts, fetchNotifications, Order, PaymentTransaction, Product, NotificationItem } from 'src/api/microservices';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';

const DashboardView = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, ords, pays, notifs] = await Promise.all([
        fetchProducts().catch(() => []),
        fetchOrders().catch(() => []),
        fetchPayments().catch(() => []),
        fetchNotifications().catch(() => []),
      ]);
      setProducts(prods);
      setOrders(ords);
      setPayments(pays);
      setNotifications(notifs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.paidAmount || 0), 0);
  const pendingBalance = orders.reduce((acc, o) => acc + (o.remainingBalance || 0), 0);
  const paidOrdersCount = orders.filter((o) => o.status === 'PAGADO').length;
  const partialOrdersCount = orders.filter((o) => o.status === 'PAGO_PARCIAL').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Icon icon="solar:spinner-line-duotone" className="animate-spin text-primary" width={48} />
        <p className="text-sm text-muted-foreground font-medium">Cargando estado de microservicios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Order Flow <span className="text-primary">Microservices</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plataforma Integral de E-Commerce, Pagos Criptográficos y Observabilidad · {products.length} productos en catálogo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="default" className="shadow-lg shadow-primary/25">
            <Link to="/orders/new">
              <Icon icon="solar:cart-plus-bold" className="mr-2" /> Nuevo Pedido
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/catalog">
              <Icon icon="solar:box-minimalistic-bold" className="mr-2" /> + Producto ({products.length})
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
            <Icon icon="solar:dollar-bold-duotone" width={28} />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Recaudación Cobrada</span>
            <h3 className="text-xl font-bold text-foreground mt-0.5">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <span className="text-[11px] text-emerald-500 font-medium">Saldo por cobrar: ${pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Icon icon="solar:bag-check-bold-duotone" width={28} />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Total Pedidos</span>
            <h3 className="text-xl font-bold text-foreground mt-0.5">{orders.length}</h3>
            <span className="text-[11px] text-muted-foreground font-medium">{paidOrdersCount} Pagados · {partialOrdersCount} Abonos</span>
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Icon icon="solar:card-check-bold-duotone" width={28} />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Transacciones Pasarela</span>
            <h3 className="text-xl font-bold text-foreground mt-0.5">{payments.length}</h3>
            <span className="text-[11px] text-emerald-500 font-medium">Auditoría SHA-256 activa</span>
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Icon icon="solar:bell-bing-bold-duotone" width={28} />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Eventos RabbitMQ</span>
            <h3 className="text-xl font-bold text-foreground mt-0.5">{notifications.length}</h3>
            <span className="text-[11px] text-amber-500 font-medium">AMQP Asíncrono</span>
          </div>
        </div>
      </div>

      {/* Observability Hub Tiles */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Icon icon="solar:graph-up-bold-duotone" className="text-primary" /> Hub de Observabilidad & Herramientas
            </h3>
            <p className="text-xs text-muted-foreground">Accesos directos con 1-click a todos los paneles de monitoreo</p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">Docker Compose Ecosystem</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all text-center group"
          >
            <Icon icon="logos:grafana" width={32} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">Grafana</span>
            <span className="text-[10px] text-muted-foreground font-mono">:3000</span>
          </a>

          <a
            href="http://localhost:9090"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all text-center group"
          >
            <Icon icon="logos:prometheus" width={32} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">Prometheus</span>
            <span className="text-[10px] text-muted-foreground font-mono">:9090</span>
          </a>

          <a
            href="http://localhost:9411"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-sky-500/10 hover:border-sky-500/40 transition-all text-center group"
          >
            <Icon icon="solar:magnifer-bold-duotone" width={32} className="text-sky-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">Zipkin</span>
            <span className="text-[10px] text-muted-foreground font-mono">:9411</span>
          </a>

          <a
            href="http://localhost:15672"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all text-center group"
          >
            <Icon icon="logos:rabbitmq-icon" width={32} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">RabbitMQ</span>
            <span className="text-[10px] text-muted-foreground font-mono">:15672</span>
          </a>

          <a
            href="http://localhost:8761"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all text-center group"
          >
            <Icon icon="solar:compass-bold-duotone" width={32} className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">Eureka Server</span>
            <span className="text-[10px] text-muted-foreground font-mono">:8761</span>
          </a>

          <Link
            to="/observability"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/10 hover:border-primary/40 transition-all text-center group"
          >
            <Icon icon="solar:document-text-bold-duotone" width={32} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">Swagger UI</span>
            <span className="text-[10px] text-muted-foreground font-mono">OpenAPI Docs</span>
          </Link>
        </div>
      </div>

      {/* Bottom Grids: Recent Orders & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Icon icon="solar:bag-3-bold-duotone" className="text-blue-500" /> Últimos Pedidos
              </h4>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/orders">Ver todos →</Link>
              </Button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No hay pedidos registrados.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/40 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-foreground">#{o.id}</strong>
                        <span className="font-medium text-foreground">{o.customerName}</span>
                      </div>
                      <span className="text-muted-foreground text-[11px]">
                        Total: ${o.total.toFixed(2)} · Saldo: ${o.remainingBalance.toFixed(2)}
                      </span>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Icon icon="solar:shield-check-bold-duotone" className="text-emerald-500" /> Últimos Pagos Registrados
              </h4>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/payments">Ver todos →</Link>
              </Button>
            </div>

            {payments.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No hay transacciones registradas.</p>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 5).map((p) => (
                  <div key={p.reference} className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/40 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-primary">{p.reference.substring(0, 14)}...</span>
                        <strong className="text-foreground">Orden #{p.orderId}</strong>
                      </div>
                      <span className="text-muted-foreground text-[11px]">{p.message}</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-foreground">${p.amount.toFixed(2)}</strong>
                      <div>
                        <span className={`text-[10px] font-bold ${p.status === 'APPROVED' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
