import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@iconify/react';
import { fetchProducts, createOrder, Product } from 'src/api/microservices';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Badge } from 'src/components/ui/badge';

const CreateOrderView = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<{ [productId: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  const handleAddToCart = (productId: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const currentQty = cart[productId] || 0;
    if (currentQty < prod.stock) {
      setCart({ ...cart, [productId]: currentQty + 1 });
    }
  };

  const handleUpdateQty = (productId: number, delta: number) => {
    const currentQty = cart[productId] || 0;
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      const next = { ...cart };
      delete next[productId];
      setCart(next);
    } else {
      const prod = products.find((p) => p.id === productId);
      if (prod && newQty <= prod.stock) {
        setCart({ ...cart, [productId]: newQty });
      }
    }
  };

  const cartEntries = Object.entries(cart).map(([pid, qty]) => {
    const prod = products.find((p) => p.id === Number(pid));
    return { product: prod!, quantity: qty };
  }).filter((item) => item.product !== undefined);

  const estimatedTotal = cartEntries.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || cartEntries.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const items = cartEntries.map((i) => ({ productId: i.product.id, quantity: i.quantity }));
      const order = await createOrder({ customerName: customerName.trim(), items });
      navigate('/orders', { state: { justCreated: order.id } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Crear Nuevo Pedido</h1>
        <p className="text-sm text-muted-foreground">Emite una orden y ejecuta cobro automático con Circuit Breaker</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm flex items-center gap-3">
          <Icon icon="solar:danger-triangle-bold" width={22} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario y Resumen */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-fit space-y-5">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Icon icon="solar:cart-large-4-bold-duotone" className="text-primary" /> Datos del Pedido
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre del Cliente</label>
              <Input
                placeholder="Ej. Cheyernex Manzanillo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            {/* Carrito */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted-foreground">Artículos Seleccionados ({cartEntries.length})</span>
                {cartEntries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart({})}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {cartEntries.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                  Selecciona productos del catálogo a la derecha.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cartEntries.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs">
                      <div>
                        <strong className="text-foreground block">{item.product.name}</strong>
                        <span className="text-muted-foreground text-[11px]">${item.product.price.toFixed(2)} c/u</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6 text-xs"
                          onClick={() => handleUpdateQty(item.product.id, -1)}
                        >
                          -
                        </Button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6 text-xs"
                          onClick={() => handleUpdateQty(item.product.id, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">Total Estimado:</span>
                <span className="text-xl font-bold text-primary">${estimatedTotal.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                ⚡ Al emitir, <code>order-service</code> valida inventario y registra el pedido en estado <code>PAGO_PENDIENTE</code>. Luego podrás gestionar abonos parciales o liquidación total desde el módulo de Pedidos.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full shadow-lg shadow-primary/25"
              disabled={loading || cartEntries.length === 0 || !customerName.trim()}
            >
              {loading ? 'Emitiendo orden...' : 'Confirmar y Emitir Orden'}
            </Button>
          </form>
        </div>

        {/* Selector de Catálogo */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Seleccionar Productos</h3>

          {products.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Cargando catálogo de productos...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => {
                const inCart = cart[p.id] || 0;
                return (
                  <div key={p.id} className="p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-bold text-foreground text-sm">{p.name}</h4>
                        <Badge variant="outline" className="font-mono text-[11px]">#{p.id}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs my-2">
                        <span className="text-base font-extrabold text-foreground">${p.price.toFixed(2)}</span>
                        <span className="text-muted-foreground text-[11px]">Disponibles: {p.stock - inCart}</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={inCart > 0 ? 'secondary' : 'default'}
                      size="sm"
                      className="w-full mt-2"
                      disabled={p.stock - inCart <= 0}
                      onClick={() => handleAddToCart(p.id)}
                    >
                      {inCart > 0 ? `Agregado (${inCart}) +` : '+ Agregar'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateOrderView;
