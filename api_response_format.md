# Faclab Core — Formato de Respuestas API y Paginación

Guía para consumir la API desde un cliente frontend. Todos los campos JSON usan **camelCase**.

---

## 1. Envelope de Respuesta

Toda respuesta exitosa sigue un patrón envelope con dos campos raíz: `data` y `meta`.

### Respuesta de un solo recurso

```
GET /api/admin/products/1
```

```json
{
  "data": {
    "id": 1,
    "name": "Tornillo M6",
    "sku": "SKU-001",
    "categoryId": 5,
    "salePrice": 0.25,
    "isActive": true
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-03-05T14:23:45.123456+00:00"
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `data` | `object` | El recurso solicitado |
| `meta.requestId` | `string (UUID)` | Identificador único de la petición. Se puede enviar desde el cliente con el header `X-Request-ID`; si no se envía, el servidor genera uno |
| `meta.timestamp` | `string (ISO 8601)` | Fecha/hora UTC en que se generó la respuesta |

### Respuesta de lista simple (sin paginación)

Se usa para sub-recursos o colecciones pequeñas que no requieren paginación.

```
GET /api/admin/sales/10/items
```

```json
{
  "data": [
    { "id": 1, "productId": 5, "quantity": 2, "unitPrice": 49.99, "subtotal": 99.98 },
    { "id": 2, "productId": 8, "quantity": 1, "unitPrice": 29.99, "subtotal": 29.99 }
  ],
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

`data` es un **array** de objetos. `meta` no incluye información de paginación.

### Respuesta paginada

Se usa para listados principales (productos, categorías, stock, movimientos, etc.).

```
GET /api/admin/products?limit=10&offset=20
```

```json
{
  "data": [
    { "id": 21, "name": "Producto 21", "sku": "SKU-021", "salePrice": 49.99 },
    { "id": 22, "name": "Producto 22", "sku": "SKU-022", "salePrice": 79.99 }
  ],
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-03-05T14:23:45.123456+00:00",
    "pagination": {
      "total": 250,
      "limit": 10,
      "offset": 20
    }
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `data` | `array` | Lista de recursos de la página actual |
| `meta.pagination.total` | `int` | Cantidad total de registros que coinciden con los filtros |
| `meta.pagination.limit` | `int` | Tamaño de página solicitado |
| `meta.pagination.offset` | `int` | Cantidad de registros omitidos (inicio de la página) |

---

## 2. Paginación

### Query parameters

| Parámetro | Tipo | Default | Rango | Descripción |
|-----------|------|---------|-------|-------------|
| `limit` | `int` | `100` | `1 – 1000` | Cantidad máxima de elementos por página |
| `offset` | `int` | `0` | `≥ 0` | Cantidad de elementos a saltar desde el inicio |

### Cálculos útiles para el frontend

```ts
const currentPage = Math.floor(offset / limit) + 1;
const totalPages  = Math.ceil(total / limit);
const hasNext     = offset + limit < total;
const hasPrev     = offset > 0;

// Para ir a una página específica:
const goToPage = (page: number) => {
  const newOffset = (page - 1) * limit;
  // fetch con ?limit=${limit}&offset=${newOffset}
};
```

### Ejemplo de implementación con fetch

```ts
interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

interface Meta {
  requestId: string;
  timestamp: string;
  pagination?: PaginationMeta;
}

interface ApiResponse<T> {
  data: T;
  meta: Meta;
}

// Obtener lista paginada
async function fetchProducts(limit = 10, offset = 0) {
  const res = await fetch(`/api/admin/products?limit=${limit}&offset=${offset}`);
  const json: ApiResponse<Product[]> = await res.json();

  return {
    items: json.data,
    total: json.meta.pagination!.total,
    limit: json.meta.pagination!.limit,
    offset: json.meta.pagination!.offset,
  };
}
```

---

## 3. Filtros adicionales

Algunos endpoints aceptan query params extra para filtrar. Se combinan con `limit` y `offset`.

```
GET /api/admin/products?categoryId=3&limit=25&offset=0
GET /api/admin/stock?warehouseId=1&limit=50&offset=0
```

Los filtros disponibles dependen de cada endpoint. Consultar la documentación interactiva en `/docs/admin`.

---

## 4. Respuestas de Error

Todas las respuestas de error usan el mismo envelope con `errors` (array) y `meta`.

### Estructura

```json
{
  "errors": [
    {
      "code": "ERROR_CODE",
      "message": "Descripción legible del error",
      "field": "body.fieldName"
    }
  ],
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `errors` | `array` | Lista de errores (puede haber varios en validación) |
| `errors[].code` | `string` | Código máquina del error |
| `errors[].message` | `string` | Mensaje legible para humanos |
| `errors[].field` | `string \| null` | Ruta del campo que causó el error (solo en errores de validación) |

### Códigos HTTP y tipos de error

| HTTP Status | Código | Cuándo ocurre |
|-------------|--------|---------------|
| `400` | Varía por dominio | Violación de regla de negocio (ej: stock insuficiente, estado inválido) |
| `404` | `NOT_FOUND` | Recurso no encontrado |
| `409` | `INTEGRITY_ERROR` | Conflicto de integridad (ej: eliminar un registro referenciado por otros) |
| `422` | `VALIDATION_ERROR` | Error de validación de campos en el body |
| `422` | `REQUEST_VALIDATION_ERROR` | Error de validación en query params o path params |
| `500` | `INTERNAL_ERROR` | Error interno no controlado |

### Ejemplos

**404 — Recurso no encontrado:**

```json
{
  "errors": [
    { "code": "NOT_FOUND", "message": "Product with id 999 not found" }
  ],
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

**422 — Errores de validación (múltiples campos):**

```json
{
  "errors": [
    { "code": "VALIDATION_ERROR", "message": "Field required", "field": "body.name" },
    { "code": "VALIDATION_ERROR", "message": "ensure this value is greater than 0", "field": "body.salePrice" }
  ],
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

**400 — Error de dominio:**

```json
{
  "errors": [
    { "code": "INSUFFICIENT_STOCK", "message": "Insufficient stock for product 5. Requested: 100, Available: 50" }
  ],
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

**409 — Error de integridad:**

```json
{
  "errors": [
    { "code": "INTEGRITY_ERROR", "message": "Cannot complete operation because this record is referenced by other records" }
  ],
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

---

## 5. Headers relevantes

| Header | Dirección | Descripción |
|--------|-----------|-------------|
| `X-Request-ID` | Request → Response | UUID para rastrear la petición. Si el cliente lo envía, el servidor lo respeta; si no, genera uno nuevo. Se incluye en `meta.requestId` |
| `Content-Type` | Response | Siempre `application/json` |

---

## 6. Resumen de tipos TypeScript

```ts
// === Meta ===
interface Meta {
  requestId: string;
  timestamp: string;
}

interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

interface PaginatedMeta extends Meta {
  pagination: PaginationMeta;
}

// === Respuestas exitosas ===
interface DataResponse<T> {
  data: T;
  meta: Meta;
}

interface ListResponse<T> {
  data: T[];
  meta: Meta;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

// === Respuestas de error ===
interface ErrorDetail {
  code: string;
  message: string;
  field?: string;
}

interface ErrorResponse {
  errors: ErrorDetail[];
  meta: Meta;
}
```

---

## 7. Convenciones de naming

- **JSON**: todos los campos usan `camelCase` (`categoryId`, `salePrice`, `isActive`)
- **Query params**: `camelCase` (`categoryId`, `warehouseId`, `limit`, `offset`)
- **Endpoints Admin**: `/api/admin/{resource}`
- **Endpoints POS**: `/api/pos/{resource}`
- **Documentación interactiva**: `/docs` (general), `/docs/admin`, `/docs/pos`
