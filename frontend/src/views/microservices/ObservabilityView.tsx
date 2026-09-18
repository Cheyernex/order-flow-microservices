import { Icon } from '@iconify/react';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';

const tools = [
  {
    name: 'Grafana Dashboards',
    port: ':3000',
    url: 'http://localhost:3000',
    desc: 'Visualización de métricas de JVM (Heap, CPU), tasa de peticiones HTTP (RPS), latencias percentiles y estados de Circuit Breakers en tiempo real.',
    badge: 'admin / admin',
    icon: 'logos:grafana',
    color: 'hover:border-orange-500/50 hover:bg-orange-500/5',
  },
  {
    name: 'Prometheus Metrics',
    port: ':9090',
    url: 'http://localhost:9090',
    desc: 'Motor de recolección de series temporales. Scrapea `/actuator/prometheus` de todos los microservicios cada 10s. Permite consultas directas en lenguaje PromQL.',
    badge: 'PromQL Engine',
    icon: 'logos:prometheus',
    color: 'hover:border-rose-500/50 hover:bg-rose-500/5',
  },
  {
    name: 'Zipkin Distributed Tracing',
    port: ':9411',
    url: 'http://localhost:9411',
    desc: 'Trazabilidad distribuida con Micrometer Tracing y Brave. Permite visualizar el flujo completo de una petición entre Gateway, Feign Clients y RabbitMQ.',
    badge: 'Trace & Span Analysis',
    icon: 'solar:magnifer-bold-duotone',
    color: 'hover:border-sky-500/50 hover:bg-sky-500/5',
  },
  {
    name: 'RabbitMQ Management',
    port: ':15672',
    url: 'http://localhost:15672',
    desc: 'Panel de administración del broker AMQP. Monitorea colas (`product.notification.queue`, `order.notification.queue`, `payment.notification.queue`) y exchanges en vivo.',
    badge: 'guest / guest',
    icon: 'logos:rabbitmq-icon',
    color: 'hover:border-amber-500/50 hover:bg-amber-500/5',
  },
  {
    name: 'Eureka Service Discovery',
    port: ':8761',
    url: 'http://localhost:8761',
    desc: 'Servidor de registro y descubrimiento dinámico de instancias (Netflix Eureka). Muestra el estado de salud e instancias activas de cada microservicio.',
    badge: 'Discovery Registry',
    icon: 'solar:compass-bold-duotone',
    color: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
  },
];

const swaggerDocs = [
  { name: 'Catalog Service OpenAPI', url: 'http://localhost:8081/swagger-ui/index.html', port: ':8081' },
  { name: 'Order Service OpenAPI', url: 'http://localhost:8082/swagger-ui/index.html', port: ':8082' },
  { name: 'Payment Service OpenAPI', url: 'http://localhost:8083/swagger-ui/index.html', port: ':8083' },
  { name: 'Notification Service OpenAPI', url: 'http://localhost:8084/swagger-ui/index.html', port: ':8084' },
];

const ObservabilityView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hub de Observabilidad & Herramientas</h1>
        <p className="text-sm text-muted-foreground">Plataformas de monitoreo, mensajería y documentación OpenAPI integradas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((t) => (
          <div
            key={t.name}
            className={`bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between transition-all ${t.color}`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <Icon icon={t.icon} width={36} />
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">{t.port}</Badge>
              </div>

              <h3 className="font-bold text-foreground text-base mb-1">{t.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{t.desc}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border/40">
              <span className="text-[11px] font-mono text-muted-foreground">{t.badge}</span>
              <Button asChild size="sm" variant="outline" className="text-xs">
                <a href={t.url} target="_blank" rel="noreferrer">
                  Abrir Panel ↗
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Swagger Section */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
          <Icon icon="solar:document-text-bold-duotone" className="text-primary" /> Contratos OpenAPI (Swagger UI)
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Documentación interactiva de cada microservicio</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {swaggerDocs.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all flex items-center justify-between group"
            >
              <div>
                <strong className="text-foreground text-xs block group-hover:text-primary transition-colors">{s.name}</strong>
                <span className="text-[11px] font-mono text-muted-foreground">{s.port}</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:translate-x-1 transition-transform">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ObservabilityView;
