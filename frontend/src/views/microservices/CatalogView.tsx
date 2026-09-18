import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { fetchProducts, createProduct, Product } from 'src/api/microservices';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Badge } from 'src/components/ui/badge';

const CatalogView = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadCatalog = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    const s = parseInt(stock, 10);
    if (!name.trim() || isNaN(p) || isNaN(s)) return;

    setLoading(true);
    setFeedback(null);
    try {
      const created = await createProduct({ name: name.trim(), price: p, stock: s });
      setFeedback({
        type: 'success',
        message: `Producto "${created.name}" guardado exitosamente (ID: #${created.id}). Evento publicado a RabbitMQ.`,
      });
      setName('');
      setPrice('');
      setStock('');
      loadCatalog();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo de Productos</h1>
          <p className="text-sm text-muted-foreground">Administra el inventario de catalog-service</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadCatalog}>
          🔄 Actualizar
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}
        >
          <Icon icon={feedback.type === 'success' ? 'solar:check-circle-bold' : 'solar:danger-triangle-bold'} width={22} />
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Crear Producto */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-fit">
          <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Icon icon="solar:box-minimalistic-bold-duotone" className="text-primary" /> Registrar Producto
          </h3>
          <p className="text-xs text-muted-foreground mb-4">POST /api/products</p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre del Producto</label>
              <Input
                placeholder="Ej. Monitor Gamer 4K 144Hz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Precio ($ USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="450.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Stock Inicial</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="20"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full shadow-lg shadow-primary/25" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar y Publicar a RabbitMQ'}
            </Button>
          </form>
        </div>

        {/* Grid de Productos */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground">Inventario Actual ({products.length})</h3>
            <Badge variant="secondary">{products.reduce((acc, p) => acc + p.stock, 0)} unidades en stock</Badge>
          </div>

          {products.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No hay productos registrados en el catálogo.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-bold text-foreground text-sm leading-snug">{p.name}</h4>
                      <Badge variant="outline" className="font-mono text-xs text-primary">#{p.id}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-3">
                      <span className="text-lg font-extrabold text-foreground">${p.price.toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${p.stock <= 5 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        Stock: {p.stock}
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
  );
};

export default CatalogView;
