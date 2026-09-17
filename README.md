# Order System Microservices

Sistema de pedidos basado en microservicios construido con **Java 21 + Spring Boot 3.3**, presentado como portafolio técnico. Cada servicio es un proyecto Maven independiente dentro de un monorepo, comunicado entre sí mediante **Service Discovery (Eureka)**, **API Gateway**, **OpenFeign** y protegido con **Resilience4j Circuit Breaker**.

## Descripción y propósito

El proyecto simula un flujo de pedidos real:

1. El cliente envía un pedido al **api-gateway** (único punto de entrada).
2. **order-service** valida productos y stock consultando a **catalog-service**.
3. **order-service** procesa el pago llamando a **payment-service** (que falla en ~30% de los casos para demostrar resiliencia).
4. Si el pago falla, un **circuit breaker** degrada la respuesta marcando el pedido como `PAGO_PENDIENTE` en vez de devolver un error 500.
5. Una vez creado, se notifica a **notification-service** (solo log).

Permite demostrar: registro/descubrimiento de servicios, balanceo de carga con `lb://`, resiliencia con circuit breaker, manejo global de errores con `ProblemDetail`, bases de datos segregadas y despliegue completo con Docker Compose.

## Diagrama de arquitectura

```mermaid
flowchart LR
    Client[Cliente HTTP] -->|:8080| Gateway[API Gateway :8080]

    Gateway -->|lb://eureka-server| Eureka[Eureka Server :8761]
    Gateway -->|lb://catalog-service| Catalog[Catalog Service :8081]
    Gateway -->|lb://order-service| Order[Order Service :8082]
    Gateway -->|lb://payment-service| Payment[Payment Service :8083]
    Gateway -->|lb://notification-service| Notif[Notification Service :8084]

    Eureka <-->|registro/descubrimiento| Catalog
    Eureka <-->|registro/descubrimiento| Order
    Eureka <-->|registro/descubrimiento| Payment
    Eureka <-->|registro/descubrimiento| Notif

    Order -->|Feign valida producto/stock| Catalog
    Order -->|Feign procesa pago + CircuitBreaker| Payment
    Order -->|Feign notifica creación| Notif

    Catalog -->|JPA| PGC[(PostgreSQL catalog)]
    Order -->|JPA| PGO[(PostgreSQL order)]
```

## Instrucciones de ejecución

### Requisitos previos

- Docker + Docker Compose (v2)
- Puerto libres: 8080, 8081, 8082, 8083, 8084, 8761, 5433, 5434

### Clonar y levantar

```bash
git clone https://github.com/Cheyernex/order-flow-microservices.git
cd order-system-microservices
docker compose up --build
```

La primera compilación puede tardar varios minutos (descarga de dependencias Maven e imágenes base). Los Dockerfiles usan un cache de BuildKit (`--mount=type=cache,target=/root/.m2`), así que los builds siguientes son rápidos y no re-descargan dependencias. Si el build falla con `Unknown host repo.maven.apache.org`, es un problema temporal de DNS de tu red: ejecuta `docker compose build` de nuevo y continuará desde la caché.

### URLs resultantes

| Servicio | URL |
|---|---|
| API Gateway (punto de entrada) | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| Catalog Service (directo) | http://localhost:8081/api/products |
| Order Service (directo) | http://localhost:8082/api/orders |
| Payment Service (directo) | http://localhost:8083 |
| Notification Service (directo) | http://localhost:8084 |
| Healthchecks (Actuator) | http://localhost:<puerto>/actuator/health |

### Documentación de API (Swagger UI)

Los servicios REST exponen su contrato OpenAPI (springdoc-openapi). UI interactiva en `/swagger-ui/index.html` y JSON en `/v3/api-docs`:

| Servicio | Swagger UI | OpenAPI JSON |
|---|---|---|
| Catalog Service | http://localhost:8081/swagger-ui/index.html | http://localhost:8081/v3/api-docs |
| Order Service | http://localhost:8082/swagger-ui/index.html | http://localhost:8082/v3/api-docs |
| Payment Service | http://localhost:8083/swagger-ui/index.html | http://localhost:8083/v3/api-docs |
| Notification Service | http://localhost:8084/swagger-ui/index.html | http://localhost:8084/v3/api-docs |

### Probar el flujo

```bash
# 1. Crear un producto en el catálogo
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":1500.00,"stock":10}'

# 2. Crear un pedido (gateway redirige a order-service)
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Ana Pérez","items":[{"productId":1,"quantity":2}]}'

# 3. El pago fallará aleatoriamente (~30%); el pedido se creará igual
#    con estado PAGADO o PAGO_PENDIENTE según el circuit breaker.
```

## Probar el Circuit Breaker

El circuit breaker de `order-service` (name: `paymentService`) está configurado para:

- `slidingWindowSize: 10` (evalúa las últimas 10 llamadas)
- `failureRateThreshold: 50%` (abre si >= 50% de llamadas fallan)
- `waitDurationInOpenState: 10s` (permanece abierto 10s antes de pasar a half-open)
- `permittedNumberOfCallsInHalfOpenState: 3`

### Escenario recomendado

```bash
# 1. Genera tráfico para que el breaker se cierre normalmente
for i in $(seq 1 30); do
  curl -s -o /dev/null http://localhost:8080/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Test","items":[{"productId":1,"quantity":1}]}'
done

# 2. Detén payment-service para forzar fallos
docker stop payment-service

# 3. Envía 10+ pedidos seguidos: el breaker detecta el 100% de fallos
#    y abre el circuito. A partir de ahí las respuestas son inmediatas
#    (sin esperar timeout) y los pedidos se crean con estado PAGO_PENDIENTE.
for i in $(seq 1 15); do
  curl -s http://localhost:8080/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Test","items":[{"productId":1,"quantity":1}]}'
  echo
done

# 4. Ver en logs de order-service la transición del estado del breaker:
#    docker logs order-service --tail 50
#    Deberías ver mensajes tipo "Payment fallback invoked" y respuestas degradadas.

# 5. Reinicia el pago y observa la recuperación (half-open -> closed)
docker start payment-service
```

### Estado del breaker en tiempo real

```bash
curl http://localhost:8082/actuator/health
curl http://localhost:8082/actuator/metrics/resilience4j.circuitbreaker.state
```

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 (LTS) | Lenguaje base, records para DTOs |
| Spring Boot | 3.3.x | Framework principal |
| Spring Cloud | 2023.0.x | Gobernanza de microservicios |
| Spring Cloud Netflix Eureka | (Spring Cloud) | Service Discovery |
| Spring Cloud Gateway | (Spring Cloud) | API Gateway / rutas `lb://` |
| Spring Cloud OpenFeign | (Spring Cloud) | Comunicación HTTP declarativa entre servicios |
| Spring Data JPA | (Spring Boot) | Persistencia y repositorios |
| PostgreSQL | 16 | Bases de datos por servicio (catalog/order) |
| Bean Validation | (Spring Boot) | Validación de payloads con `@NotNull`, `@Positive` |
| Resilience4j | 2.x | Circuit Breaker + métricas Micrometer |
| ProblemDetail (Spring 6) | (Spring Boot) | Manejo global de errores estructurados |
| springdoc-openapi | 2.6.0 | Documentación OpenAPI / Swagger UI de los servicios REST |
| Docker | Compose v2 | Contenedores multi-stage + orquestación local |
| Testcontainers | 1.x | Test de integración con PostgreSQL real |
| WireMock | 3.x | Simulación de fallas de payment-service en tests |
| Maven | 3.9+ | Build y gestión de dependencias |

## Estructura del monorepo

```
order-system-microservices/
├── eureka-server/        (8761 - Service Discovery)
├── api-gateway/          (8080 - Spring Cloud Gateway)
├── catalog-service/      (8081 - CRUD productos + PostgreSQL)
├── order-service/        (8082 - Pedidos, Feign + Circuit Breaker)
├── payment-service/      (8083 - Pago simulado, 30% de fallas)
├── notification-service/ (8084 - Notificación solo log)
└── docker-compose.yml
```

## Ejecutar los tests

Cada servicio incluye tests unitarios/integración:

```bash
cd catalog-service
./mvnw test          # usa Testcontainers -> necesita Docker corriendo

cd ../order-service
./mvnw test          # fallback + integración con WireMock
```

```bash
./mvnw test
```
(Si usas `mvn` local, reemplaza `./mvnw` por `mvn`.)

## Troubleshooting

### `eureka-server`: `SocketTimeoutException: Read timed out` en `ReplicationTaskProcessor`

Eureka interpreta cada URL de `eureka.client.service-url.defaultZone` como un nodo peer. Si el host de esa URL no coincide con `eureka.instance.hostname` (en Docker el hostname por defecto es el ID del contenedor, p.ej. `5b4c6f8f8ec3`), no reconoce la URL como propia, la trata como un peer y se replica a sí mismo hasta agotar el timeout de lectura.

Se corrige fijando `eureka.instance.hostname` al mismo host del `defaultZone`:

- `application.yml` (local): `eureka.instance.hostname: localhost`
- `application-docker.yml` (Docker): `eureka.instance.hostname: eureka-server`

## Notas

- El `payment-service` falla intencionalmente el ~30% de las veces y simula latencia de 200-800ms.
- Las credenciales de base de datos se transmiten vía variables de entorno; los valores por defecto solo existen en el entorno Docker de demostración.
- La notificación es una llamada síncrona vía Feign (migrar a Kafka/RabbitMQ en el futuro).
- Se excluye `commons-logging` (transitivo de `jersey-apache-connector` vía Eureka) del starter de Eureka en todos los servicios, ya que Spring usa `spring-jcl`; y se añade `com.github.ben-manes.caffeine:caffeine` para que Spring Cloud LoadBalancer use la caché Caffeine. Ambos cambios eliminan warnings benignos del arranque.
- La self-preservation de Eureka está deshabilitada (`eureka.server.enable-self-preservation: false`) por tratarse de un entorno de desarrollo/demo de un solo nodo. Así el registro expira las instancias caídas en lugar de mostrar el banner `EMERGENCY! ... RENEWALS ARE LESSER THAN THRESHOLD` durante reinicios o arranques masivos.