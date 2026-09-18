import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { fetchPayments, PaymentTransaction } from 'src/api/microservices';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';

const PaymentsView = () => {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await fetchPayments();
      setPayments(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleCopy = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(ref);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Auditoría de Pagos (SHA-256)</h1>
          <p className="text-sm text-muted-foreground">Registro inmutable de transacciones procesadas por payment-service</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadPayments} disabled={loading}>
          🔄 Actualizar
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Referencia SHA-256</th>
                <th className="py-3 px-4">Orden</th>
                <th className="py-3 px-4">Monto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Mensaje de Pasarela</th>
                <th className="py-3 px-4">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    {loading ? 'Cargando transacciones...' : 'No hay transacciones registradas aún.'}
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.reference} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-medium" title={p.reference}>
                          {p.reference.substring(0, 20)}...
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopy(p.reference)}
                          title="Copiar hash SHA-256"
                        >
                          <Icon icon={copied === p.reference ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={14} />
                        </Button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">#{p.orderId}</td>
                    <td className="py-3.5 px-4 font-bold text-foreground">${p.amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={
                          p.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{p.message}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsView;
