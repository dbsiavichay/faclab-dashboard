# Faclab Core — Admin API Specification

> Documento de referencia para implementar un frontend que consuma la API de administración de Faclab Core.

## Tabla de contenidos

- [Información general](#información-general)
- [Autenticación](#autenticación)
- [Convenciones](#convenciones)
- [OpenAPI / Documentación interactiva](#openapi--documentación-interactiva)
- [Manejo de errores](#manejo-de-errores)
- [Módulos](#módulos)
  - [Catálogo — Categorías](#categorías)
  - [Catálogo — Productos](#productos)
  - [Catálogo — Unidades de medida](#unidades-de-medida)
  - [Inventario — Bodegas](#bodegas)
  - [Inventario — Ubicaciones](#ubicaciones)
  - [Inventario — Stock](#stock)
  - [Inventario — Movimientos](#movimientos)
  - [Inventario — Lotes](#lotes)
  - [Inventario — Números de serie](#números-de-serie)
  - [Inventario — Ajustes](#ajustes)
  - [Inventario — Transferencias](#transferencias)
  - [Inventario — Alertas](#alertas)
  - [Clientes](#clientes)
  - [Proveedores](#proveedores)
  - [Compras — Órdenes de compra](#órdenes-de-compra)
  - [Ventas (solo lectura)](#ventas-solo-lectura)
  - [Reportes de inventario](#reportes-de-inventario)

---

## Información general

| Propiedad | Valor |
|---|---|
| **Base URL** | `http://localhost:3000/api/admin` |
| **Protocolo** | HTTP / HTTPS |
| **Formato** | JSON (`Content-Type: application/json`) |
| **Puerto por defecto** | `3000` |
| **CORS habilitados** | `http://localhost:3000`, `http://localhost:5173` |

---

## Autenticación

Actualmente la API **no requiere autenticación**. Todos los endpoints son públicos.

---

## Convenciones

### Nomenclatura de campos

- **Request/Response**: `camelCase` (ej. `productId`, `taxId`, `isActive`)
- **Enums**: `UPPERCASE` (ej. `DRAFT`, `CONFIRMED`, `IN`, `OUT`)
- **Booleanos**: prefijo `is` (ej. `isActive`, `isDefault`, `isService`)

### Paginación

Los endpoints que soportan paginación usan estos query params:

| Param | Tipo | Default | Rango | Descripción |
|---|---|---|---|---|
| `limit` | integer | 100 | 1–1000 | Máximo de resultados |
| `offset` | integer | 0 | >= 0 | Resultados a omitir |

### Filtros

- Todos los filtros son opcionales
- Se combinan con lógica **AND**
- Se pasan como **query parameters**

### Formatos de fecha

- **date**: `YYYY-MM-DD` (ej. `2026-02-27`)
- **datetime**: `YYYY-MM-DDTHH:MM:SSZ` (ej. `2026-02-27T10:30:00Z`)

### Tipos de datos

| Tipo | Descripción |
|---|---|
| `integer` | Número entero |
| `decimal` | Número con decimales (precios, costos) |
| `string` | Texto |
| `boolean` | `true` / `false` |
| `date` | ISO 8601 `YYYY-MM-DD` |
| `datetime` | ISO 8601 `YYYY-MM-DDTHH:MM:SSZ` |

---

## OpenAPI / Documentación interactiva

La API expone su especificación OpenAPI 3.0 y documentación interactiva (Scalar):

| Recurso | URL | Descripción |
|---|---|---|
| **Docs completa** | `GET /docs` | Documentación interactiva (todos los endpoints) |
| **Docs Admin** | `GET /docs/admin` | Solo endpoints de administración |
| **Docs POS** | `GET /docs/pos` | Solo endpoints de punto de venta |
| **OpenAPI JSON (completo)** | `GET /openapi.json` | Esquema OpenAPI completo |
| **OpenAPI JSON (Admin)** | `GET /openapi/admin.json` | Esquema filtrado solo Admin |
| **OpenAPI JSON (POS)** | `GET /openapi/pos.json` | Esquema filtrado solo POS |

> **Tip para frontend**: Puedes usar `/openapi/admin.json` con herramientas como [openapi-typescript](https://github.com/drwpow/openapi-typescript) o [orval](https://orval.dev/) para generar tipos TypeScript y clientes HTTP automáticamente.

---

## Manejo de errores

Todas las respuestas de error siguen una estructura uniforme:

```json
{
  "error_code": "DOMAIN_ERROR_CODE",
  "message": "Descripción del error",
  "timestamp": "2026-02-27T10:30:00Z",
  "request_id": "unique-request-id",
  "detail": "Detalles adicionales o array de errores de validación"
}
```

### Códigos de estado

| Código | Significado | Cuándo ocurre |
|---|---|---|
| **200** | OK | Operación exitosa con contenido |
| **204** | No Content | DELETE exitoso |
| **400** | Bad Request | Violación de regla de negocio (ej. no se puede eliminar categoría con productos) |
| **404** | Not Found | Recurso no encontrado |
| **422** | Unprocessable Entity | Error de validación de datos |

### Ejemplo de error de validación (422)

```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "timestamp": "2026-02-27T10:30:00Z",
  "request_id": "abc-123",
  "detail": [
    {
      "field": "name",
      "message": "Field required"
    }
  ]
}
```

---

## Módulos

---

### Categorías

Gestión de categorías de productos.

**Tag**: `admin - categories`

#### `POST /api/admin/categories` — Crear categoría

**Request Body:**

```json
{
  "name": "Electrónica",
  "description": "Productos electrónicos"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | string | si | Nombre de la categoría |
| `description` | string \| null | no | Descripción |

**Response (200):**

```json
{
  "id": 1,
  "name": "Electrónica",
  "description": "Productos electrónicos"
}
```

#### `GET /api/admin/categories` — Listar categorías

**Response (200):** `CategoryResponse[]`

#### `GET /api/admin/categories/{id}` — Obtener categoría

| Path Param | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID de la categoría |

**Response (200):** `CategoryResponse`

#### `PUT /api/admin/categories/{id}` — Actualizar categoría

**Request Body:** igual que crear.

**Response (200):** `CategoryResponse`

#### `DELETE /api/admin/categories/{id}` — Eliminar categoría

**Response:** `204 No Content`

---

### Productos

Gestión del catálogo de productos.

**Tag**: `admin - products`

#### `POST /api/admin/products` — Crear producto

**Request Body:**

```json
{
  "name": "Laptop HP",
  "sku": "LAP-HP-001",
  "description": "Laptop HP 15 pulgadas",
  "barcode": "7861234567890",
  "categoryId": 1,
  "unitOfMeasureId": 1,
  "purchasePrice": 450.00,
  "salePrice": 650.00,
  "isActive": true,
  "isService": false,
  "minStock": 5,
  "maxStock": 100,
  "reorderPoint": 10,
  "leadTimeDays": 7
}
```

| Campo | Tipo | Requerido | Default | Validación | Descripción |
|---|---|---|---|---|---|
| `name` | string | si | — | — | Nombre del producto |
| `sku` | string | si | — | — | Código SKU (único) |
| `description` | string \| null | no | null | — | Descripción |
| `barcode` | string \| null | no | null | — | Código de barras |
| `categoryId` | integer \| null | no | null | >= 1 | ID de categoría |
| `unitOfMeasureId` | integer \| null | no | null | >= 1 | ID de unidad de medida |
| `purchasePrice` | decimal \| null | no | null | >= 0 | Precio de compra |
| `salePrice` | decimal \| null | no | null | >= 0 | Precio de venta |
| `isActive` | boolean | no | true | — | Estado activo |
| `isService` | boolean | no | false | — | Es servicio (no maneja stock) |
| `minStock` | integer | no | 0 | >= 0 | Stock mínimo |
| `maxStock` | integer \| null | no | null | >= 0 | Stock máximo |
| `reorderPoint` | integer | no | 0 | >= 0 | Punto de reorden |
| `leadTimeDays` | integer \| null | no | null | >= 0 | Días de entrega |

**Response (200):** `ProductResponse` (mismos campos + `id`)

#### `GET /api/admin/products` — Listar productos

**Response (200):** `ProductResponse[]`

#### `GET /api/admin/products/{id}` — Obtener producto

**Response (200):** `ProductResponse`

#### `PUT /api/admin/products/{id}` — Actualizar producto

**Request Body:** igual que crear.

**Response (200):** `ProductResponse`

#### `DELETE /api/admin/products/{id}` — Eliminar producto

**Response:** `204 No Content`

---

### Unidades de medida

Gestión de unidades de medida vinculadas a productos.

**Tag**: `admin - units of measure`

#### `POST /api/admin/units-of-measure` — Crear unidad

**Request Body:**

```json
{
  "name": "Kilogramo",
  "symbol": "kg",
  "description": "Unidad de peso",
  "isActive": true
}
```

| Campo | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `name` | string | si | — | Nombre |
| `symbol` | string | si | — | Símbolo (ej. kg, m, u) |
| `description` | string \| null | no | null | Descripción |
| `isActive` | boolean | no | true | Estado activo |

**Response (200):** `UnitOfMeasureResponse`

```json
{
  "id": 1,
  "name": "Kilogramo",
  "symbol": "kg",
  "description": "Unidad de peso",
  "isActive": true
}
```

#### `GET /api/admin/units-of-measure` — Listar unidades

| Query Param | Tipo | Descripción |
|---|---|---|
| `isActive` | boolean \| null | Filtrar por estado |

**Response (200):** `UnitOfMeasureResponse[]`

#### `GET /api/admin/units-of-measure/{id}` — Obtener unidad

#### `PUT /api/admin/units-of-measure/{id}` — Actualizar unidad

#### `DELETE /api/admin/units-of-measure/{id}` — Eliminar unidad

---

### Bodegas

Gestión de bodegas/almacenes.

**Tag**: `admin - warehouses`

#### `POST /api/admin/warehouses` — Crear bodega

**Request Body:**

```json
{
  "name": "Bodega Central",
  "code": "BOD-001",
  "address": "Av. Principal 123",
  "city": "Quito",
  "country": "Ecuador",
  "isActive": true,
  "isDefault": false,
  "manager": "Juan Pérez",
  "phone": "0991234567",
  "email": "bodega@empresa.com"
}
```

| Campo | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `name` | string | si | — | Nombre de la bodega |
| `code` | string | si | — | Código único |
| `address` | string \| null | no | null | Dirección |
| `city` | string \| null | no | null | Ciudad |
| `country` | string \| null | no | null | País |
| `isActive` | boolean | no | true | Estado activo |
| `isDefault` | boolean | no | false | Bodega por defecto |
| `manager` | string \| null | no | null | Responsable |
| `phone` | string \| null | no | null | Teléfono |
| `email` | string \| null | no | null | Email |

**Response (200):** `WarehouseResponse` (mismos campos + `id`)

#### `GET /api/admin/warehouses` — Listar bodegas

| Query Param | Tipo | Descripción |
|---|---|---|
| `isActive` | boolean \| null | Filtrar por estado |

#### `GET /api/admin/warehouses/{id}` — Obtener bodega

#### `PUT /api/admin/warehouses/{id}` — Actualizar bodega

#### `DELETE /api/admin/warehouses/{id}` — Eliminar bodega

---

### Ubicaciones

Ubicaciones de almacenamiento dentro de bodegas.

**Tag**: `admin - locations`

#### `POST /api/admin/locations` — Crear ubicación

**Request Body:**

```json
{
  "warehouseId": 1,
  "name": "Estante A1",
  "code": "A1",
  "type": "STORAGE",
  "isActive": true,
  "capacity": 500
}
```

| Campo | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `warehouseId` | integer | si | — | ID de bodega |
| `name` | string | si | — | Nombre |
| `code` | string | si | — | Código |
| `type` | string | no | `STORAGE` | Tipo: `STORAGE`, `RECEIVING`, `SHIPPING`, `RETURN` |
| `isActive` | boolean | no | true | Estado activo |
| `capacity` | integer \| null | no | null | Capacidad |

**Response (200):** `LocationResponse` (mismos campos + `id`)

#### `GET /api/admin/locations` — Listar ubicaciones

| Query Param | Tipo | Descripción |
|---|---|---|
| `warehouseId` | integer \| null | Filtrar por bodega |
| `isActive` | boolean \| null | Filtrar por estado |

#### `GET /api/admin/locations/{id}` — Obtener ubicación

#### `PUT /api/admin/locations/{id}` — Actualizar ubicación

#### `DELETE /api/admin/locations/{id}` — Eliminar ubicación

---

### Stock

Consulta de niveles de stock en tiempo real (solo lectura).

**Tag**: `admin - stock`

#### `GET /api/admin/stock` — Consultar stock

| Query Param | Tipo | Default | Validación | Descripción |
|---|---|---|---|---|
| `productId` | integer \| null | — | >= 1 | Filtrar por producto |
| `locationId` | integer \| null | — | >= 1 | Filtrar por ubicación |
| `limit` | integer | 100 | 1–1000 | Paginación |
| `offset` | integer | 0 | >= 0 | Paginación |

**Response (200):** `StockResponse[]`

```json
[
  {
    "id": 1,
    "productId": 5,
    "quantity": 150,
    "locationId": 2,
    "reservedQuantity": 10
  }
]
```

---

### Movimientos

Registro y consulta de movimientos de inventario (IN/OUT).

**Tag**: `admin - movements`

#### `POST /api/admin/movements` — Crear movimiento

**Request Body:**

```json
{
  "productId": 5,
  "quantity": 100,
  "type": "IN",
  "locationId": 2,
  "referenceType": "PURCHASE_ORDER",
  "referenceId": 1,
  "reason": "Recepción de mercadería",
  "date": "2026-02-27T10:00:00Z"
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|---|---|---|---|---|
| `productId` | integer | si | >= 1 | ID del producto |
| `quantity` | integer | si | >= 1 | Cantidad |
| `type` | string | si | `IN` o `OUT` | Tipo de movimiento |
| `locationId` | integer \| null | no | — | ID de ubicación |
| `referenceType` | string \| null | no | — | Tipo de referencia (ej. `SALE`, `PURCHASE_ORDER`) |
| `referenceId` | integer \| null | no | — | ID de referencia |
| `reason` | string \| null | no | — | Razón del movimiento |
| `date` | datetime \| null | no | — | Fecha del movimiento |

> **Reglas de validación**:
> - `quantity` no puede ser cero
> - Movimientos `IN`: cantidad positiva
> - Movimientos `OUT`: cantidad negativa

**Response (200):** `MovementResponse`

```json
{
  "id": 1,
  "productId": 5,
  "quantity": 100,
  "type": "IN",
  "locationId": 2,
  "referenceType": "PURCHASE_ORDER",
  "referenceId": 1,
  "reason": "Recepción de mercadería",
  "date": "2026-02-27T10:00:00Z"
}
```

#### `GET /api/admin/movements` — Listar movimientos

| Query Param | Tipo | Default | Descripción |
|---|---|---|---|
| `productId` | integer \| null | — | Filtrar por producto |
| `type` | string \| null | — | Filtrar por tipo (`IN`/`OUT`) |
| `fromDate` | datetime \| null | — | Desde fecha |
| `toDate` | datetime \| null | — | Hasta fecha |
| `limit` | integer | 100 | Paginación |
| `offset` | integer | 0 | Paginación |

**Response (200):** `MovementResponse[]`

---

### Lotes

Tracking de lotes para productos perecederos o trazables.

**Tag**: `admin - lots`

#### `POST /api/admin/lots` — Crear lote

**Request Body:**

```json
{
  "productId": 5,
  "lotNumber": "LOT-2026-001",
  "initialQuantity": 500,
  "manufactureDate": "2026-01-15",
  "expirationDate": "2027-01-15",
  "notes": "Primer lote del año"
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|---|---|---|---|---|
| `productId` | integer | si | >= 1 | ID del producto |
| `lotNumber` | string | si | max: 64 | Número de lote (único) |
| `initialQuantity` | integer | no | >= 0, default: 0 | Cantidad inicial |
| `manufactureDate` | date \| null | no | — | Fecha de fabricación |
| `expirationDate` | date \| null | no | — | Fecha de vencimiento |
| `notes` | string \| null | no | max: 1024 | Notas |

**Response (200):** `LotResponse`

```json
{
  "id": 1,
  "productId": 5,
  "lotNumber": "LOT-2026-001",
  "manufactureDate": "2026-01-15",
  "expirationDate": "2027-01-15",
  "initialQuantity": 500,
  "currentQuantity": 500,
  "isExpired": false,
  "daysToExpiry": 322,
  "notes": "Primer lote del año",
  "createdAt": "2026-02-27T10:00:00Z"
}
```

#### `PUT /api/admin/lots/{id}` — Actualizar lote

**Request Body:**

| Campo | Tipo | Descripción |
|---|---|---|
| `currentQuantity` | integer \| null | Cantidad actual (>= 0) |
| `manufactureDate` | date \| null | Fecha de fabricación |
| `expirationDate` | date \| null | Fecha de vencimiento |
| `notes` | string \| null | Notas (max: 1024) |

#### `GET /api/admin/lots` — Listar lotes

| Query Param | Tipo | Descripción |
|---|---|---|
| `productId` | integer \| null | Filtrar por producto |
| `expiringInDays` | integer \| null | Lotes que vencen en N días |

#### `GET /api/admin/lots/{id}` — Obtener lote

---

### Números de serie

Tracking individual de ítems por número de serie.

**Tag**: `admin - serials`

#### `POST /api/admin/serials` — Crear número de serie

**Request Body:**

```json
{
  "productId": 5,
  "serialNumber": "SN-2026-00001",
  "lotId": 1,
  "locationId": 2,
  "notes": "Importado"
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|---|---|---|---|---|
| `productId` | integer | si | >= 1 | ID del producto |
| `serialNumber` | string | si | max: 128 | Número de serie (único) |
| `lotId` | integer \| null | no | >= 1 | ID de lote asociado |
| `locationId` | integer \| null | no | >= 1 | ID de ubicación |
| `notes` | string \| null | no | max: 1024 | Notas |

**Response (200):** `SerialNumberResponse`

```json
{
  "id": 1,
  "productId": 5,
  "serialNumber": "SN-2026-00001",
  "status": "AVAILABLE",
  "lotId": 1,
  "locationId": 2,
  "purchaseOrderId": null,
  "saleId": null,
  "notes": "Importado",
  "createdAt": "2026-02-27T10:00:00Z"
}
```

#### `GET /api/admin/serials` — Listar números de serie

| Query Param | Tipo | Descripción |
|---|---|---|
| `productId` | integer \| null | Filtrar por producto |
| `status` | string \| null | Filtrar por estado |

#### `GET /api/admin/serials/{id}` — Obtener número de serie

#### `PUT /api/admin/serials/{id}/status` — Cambiar estado

**Request Body:**

```json
{
  "status": "SOLD"
}
```

---

### Ajustes

Ajustes de inventario: conteos físicos, correcciones, mermas.

**Tag**: `admin - adjustments`

**Ciclo de vida:** `DRAFT` → `CONFIRMED` / `CANCELLED`

#### `POST /api/admin/adjustments` — Crear ajuste

**Request Body:**

```json
{
  "warehouseId": 1,
  "reason": "Conteo físico mensual",
  "notes": "Febrero 2026",
  "adjustedBy": "Juan Pérez"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `warehouseId` | integer | si | ID de bodega |
| `reason` | string | si | Razón del ajuste |
| `notes` | string \| null | no | Notas adicionales |
| `adjustedBy` | string \| null | no | Responsable |

**Response (200):** `AdjustmentResponse`

```json
{
  "id": 1,
  "warehouseId": 1,
  "reason": "Conteo físico mensual",
  "status": "DRAFT",
  "adjustmentDate": null,
  "notes": "Febrero 2026",
  "adjustedBy": "Juan Pérez",
  "createdAt": "2026-02-27T10:00:00Z"
}
```

#### `GET /api/admin/adjustments` — Listar ajustes

| Query Param | Tipo | Default | Descripción |
|---|---|---|---|
| `status` | string \| null | — | Filtrar por estado |
| `warehouseId` | integer \| null | — | Filtrar por bodega (>= 1) |
| `limit` | integer | 100 | Paginación |
| `offset` | integer | 0 | Paginación |

#### `GET /api/admin/adjustments/{id}` — Obtener ajuste

#### `PUT /api/admin/adjustments/{id}` — Actualizar ajuste (solo DRAFT)

**Request Body:**

| Campo | Tipo | Descripción |
|---|---|---|
| `notes` | string \| null | Notas |
| `adjustedBy` | string \| null | Responsable |

#### `DELETE /api/admin/adjustments/{id}` — Eliminar ajuste (solo DRAFT)

**Response:** `204 No Content`

#### `POST /api/admin/adjustments/{id}/confirm` — Confirmar ajuste

Genera movimientos de inventario automáticamente. **Request Body:** vacío.

#### `POST /api/admin/adjustments/{id}/cancel` — Cancelar ajuste

Solo ajustes en `DRAFT`. **Request Body:** vacío.

#### `POST /api/admin/adjustments/{id}/items` — Agregar ítem al ajuste

**Request Body:**

```json
{
  "productId": 5,
  "locationId": 2,
  "actualQuantity": 148,
  "lotId": null,
  "notes": "Diferencia de 2 unidades"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `productId` | integer | si | ID del producto |
| `locationId` | integer | si | ID de ubicación |
| `actualQuantity` | integer | si | Cantidad real contada |
| `lotId` | integer \| null | no | ID de lote |
| `notes` | string \| null | no | Notas |

**Response (200):** `AdjustmentItemResponse`

```json
{
  "id": 1,
  "adjustmentId": 1,
  "productId": 5,
  "locationId": 2,
  "expectedQuantity": 150,
  "actualQuantity": 148,
  "difference": -2,
  "lotId": null,
  "notes": "Diferencia de 2 unidades"
}
```

#### `GET /api/admin/adjustments/{id}/items` — Listar ítems del ajuste

**Tag**: `admin - adjustment-items`

#### `PUT /api/admin/adjustment-items/{id}` — Actualizar ítem

**Request Body:**

| Campo | Tipo | Descripción |
|---|---|---|
| `actualQuantity` | integer \| null | Cantidad real |
| `notes` | string \| null | Notas |

#### `DELETE /api/admin/adjustment-items/{id}` — Eliminar ítem

**Response:** `204 No Content`

---

### Transferencias

Transferencias de stock entre ubicaciones.

**Tag**: `admin - transfers`

**Ciclo de vida:** `DRAFT` → `CONFIRMED` → `RECEIVED` / `CANCELLED`

#### `POST /api/admin/transfers` — Crear transferencia

**Request Body:**

```json
{
  "sourceLocationId": 1,
  "destinationLocationId": 2,
  "notes": "Reabastecimiento zona B",
  "requestedBy": "María López"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `sourceLocationId` | integer | si | Ubicación origen |
| `destinationLocationId` | integer | si | Ubicación destino |
| `notes` | string \| null | no | Notas |
| `requestedBy` | string \| null | no | Solicitado por |

**Response (200):** `TransferResponse`

```json
{
  "id": 1,
  "sourceLocationId": 1,
  "destinationLocationId": 2,
  "status": "DRAFT",
  "transferDate": null,
  "requestedBy": "María López",
  "notes": "Reabastecimiento zona B",
  "createdAt": "2026-02-27T10:00:00Z"
}
```

#### `GET /api/admin/transfers` — Listar transferencias

| Query Param | Tipo | Default | Descripción |
|---|---|---|---|
| `status` | string \| null | — | Filtrar por estado |
| `sourceLocationId` | integer \| null | — | Filtrar por origen (>= 1) |
| `limit` | integer | 100 | Paginación |
| `offset` | integer | 0 | Paginación |

#### `GET /api/admin/transfers/{id}` — Obtener transferencia

#### `PUT /api/admin/transfers/{id}` — Actualizar (solo DRAFT)

**Request Body:**

| Campo | Tipo | Descripción |
|---|---|---|
| `notes` | string \| null | Notas |
| `requestedBy` | string \| null | Solicitado por |

#### `DELETE /api/admin/transfers/{id}` — Eliminar (solo DRAFT)

#### `POST /api/admin/transfers/{id}/confirm` — Confirmar

Reserva stock en la ubicación de origen. **Request Body:** vacío.

#### `POST /api/admin/transfers/{id}/receive` — Recibir

Crea movimientos OUT/IN y mueve el stock. **Request Body:** vacío.

#### `POST /api/admin/transfers/{id}/cancel` — Cancelar

Libera reservas si estaba confirmada. **Request Body:** vacío.

#### `POST /api/admin/transfers/{id}/items` — Agregar ítem

**Request Body:**

```json
{
  "productId": 5,
  "quantity": 20,
  "lotId": null,
  "notes": null
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|---|---|---|---|---|
| `productId` | integer | si | — | ID del producto |
| `quantity` | integer | si | > 0 | Cantidad a transferir |
| `lotId` | integer \| null | no | — | ID de lote |
| `notes` | string \| null | no | — | Notas |

**Response (200):** `TransferItemResponse`

```json
{
  "id": 1,
  "transferId": 1,
  "productId": 5,
  "quantity": 20,
  "lotId": null,
  "notes": null
}
```

#### `GET /api/admin/transfers/{id}/items` — Listar ítems

**Tag**: `admin - transfer-items`

#### `PUT /api/admin/transfer-items/{id}` — Actualizar ítem

**Request Body:**

| Campo | Tipo | Validación | Descripción |
|---|---|---|---|
| `quantity` | integer \| null | > 0 | Cantidad |
| `notes` | string \| null | — | Notas |

#### `DELETE /api/admin/transfer-items/{id}` — Eliminar ítem

**Response:** `204 No Content`

---

### Alertas

Monitoreo de niveles de stock y vencimientos (solo lectura).

**Tag**: `admin - alerts`

#### `GET /api/admin/alerts/low-stock` — Stock bajo

Productos cuyo stock está en o por debajo del mínimo configurado.

| Query Param | Tipo | Descripción |
|---|---|---|
| `warehouseId` | integer \| null | Filtrar por bodega (>= 1) |

**Response (200):** `StockAlertResponse[]`

```json
[
  {
    "type": "LOW_STOCK",
    "productId": 5,
    "productName": "Laptop HP",
    "sku": "LAP-HP-001",
    "currentQuantity": 3,
    "threshold": 5,
    "warehouseId": 1,
    "lotId": null,
    "daysToExpiry": null
  }
]
```

#### `GET /api/admin/alerts/out-of-stock` — Sin stock

Productos con stock cero.

| Query Param | Tipo | Descripción |
|---|---|---|
| `warehouseId` | integer \| null | Filtrar por bodega |

#### `GET /api/admin/alerts/reorder-point` — Punto de reorden

Productos cuyo stock está en o por debajo del punto de reorden.

| Query Param | Tipo | Descripción |
|---|---|---|
| `warehouseId` | integer \| null | Filtrar por bodega |

#### `GET /api/admin/alerts/expiring-lots` — Lotes por vencer

Lotes que vencen dentro de los próximos N días.

| Query Param | Tipo | Default | Descripción |
|---|---|---|---|
| `days` | integer | 30 | Días hasta el vencimiento (>= 1) |

---

### Clientes

Gestión de clientes con identificación fiscal y contactos.

**Tag**: `admin - customers`

#### `POST /api/admin/customers` — Crear cliente

**Request Body:**

```json
{
  "name": "Empresa ABC",
  "taxId": "1791234567001",
  "taxType": 1,
  "email": "info@abc.com",
  "phone": "0991234567",
  "address": "Av. Principal 456",
  "city": "Quito",
  "state": "Pichincha",
  "country": "Ecuador",
  "creditLimit": 5000.00,
  "paymentTerms": 30,
  "isActive": true
}
```

| Campo | Tipo | Requerido | Default | Validación | Descripción |
|---|---|---|---|---|---|
| `name` | string | si | — | 1–128 chars | Nombre o razón social |
| `taxId` | string | si | — | 1–32 chars | Identificación fiscal |
| `taxType` | integer | no | 1 | 1–4 | Tipo: 1=RUC, 2=Cédula, 3=Pasaporte, 4=ID Extranjero |
| `email` | string \| null | no | null | max: 128 | Email |
| `phone` | string \| null | no | null | max: 32 | Teléfono |
| `address` | string \| null | no | null | max: 255 | Dirección |
| `city` | string \| null | no | null | max: 64 | Ciudad |
| `state` | string \| null | no | null | max: 64 | Provincia/Estado |
| `country` | string \| null | no | null | max: 64 | País |
| `creditLimit` | decimal \| null | no | null | >= 0 | Límite de crédito |
| `paymentTerms` | integer \| null | no | null | >= 0 | Plazo de pago (días) |
| `isActive` | boolean | no | true | — | Estado activo |

**Response (200):** `CustomerResponse` (mismos campos + `id`)

#### `GET /api/admin/customers` — Listar clientes

**Response (200):** `CustomerResponse[]`

#### `GET /api/admin/customers/{id}` — Obtener cliente

#### `GET /api/admin/customers/search/by-tax-id` — Buscar por identificación fiscal

| Query Param | Tipo | Requerido | Descripción |
|---|---|---|---|
| `taxId` | string | si | Número de identificación fiscal |

**Response (200):** `CustomerResponse`

#### `PUT /api/admin/customers/{id}` — Actualizar cliente

#### `DELETE /api/admin/customers/{id}` — Eliminar cliente

#### `POST /api/admin/customers/{id}/activate` — Activar cliente

**Request Body:** vacío.

#### `POST /api/admin/customers/{id}/deactivate` — Desactivar cliente

**Request Body:** vacío.

#### `POST /api/admin/customers/{customer_id}/contacts` — Crear contacto

**Request Body:**

```json
{
  "name": "Ana García",
  "role": "Compras",
  "email": "ana@abc.com",
  "phone": "0987654321"
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|---|---|---|---|---|
| `name` | string | si | 1–128 chars | Nombre del contacto |
| `role` | string \| null | no | max: 64 | Cargo/rol |
| `email` | string \| null | no | max: 128 | Email |
| `phone` | string \| null | no | max: 32 | Teléfono |

**Response (200):** `CustomerContactResponse`

```json
{
  "id": 1,
  "customerId": 1,
  "name": "Ana García",
  "role": "Compras",
  "email": "ana@abc.com",
  "phone": "0987654321"
}
```

#### `GET /api/admin/customers/{customer_id}/contacts` — Listar contactos

**Tag**: `admin - customer-contacts`

#### `GET /api/admin/customer-contacts/{id}` — Obtener contacto

#### `PUT /api/admin/customer-contacts/{id}` — Actualizar contacto

#### `DELETE /api/admin/customer-contacts/{id}` — Eliminar contacto

---

### Proveedores

Gestión de proveedores con contactos y catálogo de productos.

**Tag**: `admin - suppliers`

#### `POST /api/admin/suppliers` — Crear proveedor

**Request Body:**

```json
{
  "name": "Distribuidora XYZ",
  "taxId": "1792345678001",
  "taxType": 1,
  "email": "ventas@xyz.com",
  "phone": "0998765432",
  "address": "Zona Industrial",
  "city": "Guayaquil",
  "country": "Ecuador",
  "paymentTerms": 60,
  "leadTimeDays": 5,
  "isActive": true,
  "notes": "Proveedor preferido de electrónica"
}
```

| Campo | Tipo | Requerido | Default | Validación | Descripción |
|---|---|---|---|---|---|
| `name` | string | si | — | 1–128 chars | Nombre o razón social |
| `taxId` | string | si | — | 1–32 chars | Identificación fiscal |
| `taxType` | integer | no | 1 | 1–4 | Tipo: 1=RUC, 2=Cédula, 3=Pasaporte, 4=ID Extranjero |
| `email` | string \| null | no | null | max: 128 | Email |
| `phone` | string \| null | no | null | max: 32 | Teléfono |
| `address` | string \| null | no | null | max: 255 | Dirección |
| `city` | string \| null | no | null | max: 64 | Ciudad |
| `country` | string \| null | no | null | max: 64 | País |
| `paymentTerms` | integer \| null | no | null | >= 0 | Plazo de pago (días) |
| `leadTimeDays` | integer \| null | no | null | >= 0 | Tiempo de entrega (días) |
| `isActive` | boolean | no | true | — | Estado activo |
| `notes` | string \| null | no | null | max: 512 | Notas |

**Response (200):** `SupplierResponse` (mismos campos + `id`)

#### `GET /api/admin/suppliers` — Listar proveedores

| Query Param | Tipo | Descripción |
|---|---|---|
| `isActive` | boolean \| null | Filtrar por estado |

#### `GET /api/admin/suppliers/{id}` — Obtener proveedor

#### `PUT /api/admin/suppliers/{id}` — Actualizar proveedor

#### `DELETE /api/admin/suppliers/{id}` — Eliminar proveedor

#### `POST /api/admin/suppliers/{id}/activate` — Activar proveedor

#### `POST /api/admin/suppliers/{id}/deactivate` — Desactivar proveedor

#### `POST /api/admin/suppliers/{supplier_id}/contacts` — Crear contacto

**Request Body:** (igual que contacto de cliente)

| Campo | Tipo | Requerido | Validación | Descripción |
|---|---|---|---|---|
| `name` | string | si | 1–128 chars | Nombre |
| `role` | string \| null | no | max: 64 | Cargo |
| `email` | string \| null | no | max: 128 | Email |
| `phone` | string \| null | no | max: 32 | Teléfono |

**Response (200):** `SupplierContactResponse`

```json
{
  "id": 1,
  "supplierId": 1,
  "name": "Carlos Ruiz",
  "role": "Ventas",
  "email": "carlos@xyz.com",
  "phone": "0991112233"
}
```

#### `GET /api/admin/suppliers/{supplier_id}/contacts` — Listar contactos

**Tag**: `admin - supplier-contacts`

#### `GET /api/admin/supplier-contacts/{id}` — Obtener contacto

#### `PUT /api/admin/supplier-contacts/{id}` — Actualizar contacto

#### `DELETE /api/admin/supplier-contacts/{id}` — Eliminar contacto

#### `POST /api/admin/suppliers/{supplier_id}/products` — Agregar producto al catálogo

**Request Body:**

```json
{
  "supplierId": 1,
  "productId": 5,
  "purchasePrice": 420.00,
  "supplierSku": "XYZ-LAP-001",
  "minOrderQuantity": 5,
  "leadTimeDays": 3,
  "isPreferred": true
}
```

| Campo | Tipo | Requerido | Default | Validación | Descripción |
|---|---|---|---|---|---|
| `supplierId` | integer | si | — | >= 1 | ID del proveedor |
| `productId` | integer | si | — | >= 1 | ID del producto |
| `purchasePrice` | decimal | si | — | >= 0 | Precio de compra |
| `supplierSku` | string \| null | no | null | max: 64 | SKU del proveedor |
| `minOrderQuantity` | integer | no | 1 | >= 1 | Cantidad mínima de orden |
| `leadTimeDays` | integer \| null | no | null | >= 0 | Tiempo de entrega |
| `isPreferred` | boolean | no | false | — | Proveedor preferido para este producto |

**Response (200):** `SupplierProductResponse`

#### `GET /api/admin/suppliers/{supplier_id}/products` — Listar productos del proveedor

**Tag**: `admin - supplier-products`

#### `GET /api/admin/supplier-products/{id}` — Obtener entrada

#### `PUT /api/admin/supplier-products/{id}` — Actualizar entrada

#### `GET /api/admin/supplier-products/by-product/{product_id}` — Proveedores de un producto

Retorna todos los proveedores que ofrecen un producto específico.

#### `DELETE /api/admin/supplier-products/{id}` — Eliminar entrada

---

### Órdenes de compra

Gestión del ciclo de vida de órdenes de compra.

**Tag**: `admin - purchase-orders`

**Ciclo de vida:** `DRAFT` → `SENT` → `RECEIVED` / `CANCELLED`

#### `POST /api/admin/purchase-orders` — Crear orden de compra

**Request Body:**

```json
{
  "supplierId": 1,
  "notes": "Orden urgente",
  "expectedDate": "2026-03-15T00:00:00Z"
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|---|---|---|---|---|
| `supplierId` | integer | si | >= 1 | ID del proveedor |
| `notes` | string \| null | no | max: 1024 | Notas |
| `expectedDate` | datetime \| null | no | — | Fecha esperada de entrega |

**Response (200):** `PurchaseOrderResponse`

```json
{
  "id": 1,
  "supplierId": 1,
  "orderNumber": "PO-2026-0001",
  "status": "DRAFT",
  "subtotal": 0.00,
  "tax": 0.00,
  "total": 0.00,
  "notes": "Orden urgente",
  "expectedDate": "2026-03-15T00:00:00Z",
  "createdAt": "2026-02-27T10:00:00Z",
  "updatedAt": "2026-02-27T10:00:00Z"
}
```

#### `GET /api/admin/purchase-orders` — Listar órdenes

| Query Param | Tipo | Descripción |
|---|---|---|
| `status` | string \| null | Filtrar por estado |
| `supplierId` | integer \| null | Filtrar por proveedor |

#### `GET /api/admin/purchase-orders/{id}` — Obtener orden

#### `PUT /api/admin/purchase-orders/{id}` — Actualizar (solo DRAFT)

#### `DELETE /api/admin/purchase-orders/{id}` — Eliminar (solo DRAFT)

#### `POST /api/admin/purchase-orders/{id}/send` — Enviar al proveedor

Cambia estado a `SENT`. **Request Body:** vacío.

#### `POST /api/admin/purchase-orders/{id}/cancel` — Cancelar

**Request Body:** vacío.

#### `GET /api/admin/purchase-orders/{id}/items` — Listar ítems

**Response (200):** `PurchaseOrderItemResponse[]`

```json
[
  {
    "id": 1,
    "purchaseOrderId": 1,
    "productId": 5,
    "quantityOrdered": 50,
    "quantityReceived": 0,
    "unitCost": 420.00
  }
]
```

#### `GET /api/admin/purchase-orders/{id}/receipts` — Listar recepciones

**Response (200):** `PurchaseReceiptResponse[]`

```json
[
  {
    "id": 1,
    "purchaseOrderId": 1,
    "notes": "Recepción parcial",
    "receivedAt": "2026-03-10T14:00:00Z",
    "createdAt": "2026-03-10T14:00:00Z"
  }
]
```

#### `POST /api/admin/purchase-orders/{id}/receive` — Registrar recepción de mercadería

**Request Body:**

```json
{
  "items": [
    {
      "purchaseOrderItemId": 1,
      "quantityReceived": 25,
      "locationId": 2,
      "lotNumber": "LOT-2026-001",
      "serialNumbers": ["SN-001", "SN-002"]
    }
  ],
  "notes": "Recepción parcial",
  "receivedAt": "2026-03-10T14:00:00Z"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `items` | array | si (min: 1) | Ítems recibidos |
| `items[].purchaseOrderItemId` | integer | si (>= 1) | ID del ítem de la orden |
| `items[].quantityReceived` | integer | si (>= 1) | Cantidad recibida |
| `items[].locationId` | integer \| null | no (>= 1) | Ubicación de destino |
| `items[].lotNumber` | string \| null | no (max: 64) | Número de lote |
| `items[].serialNumbers` | string[] \| null | no | Números de serie |
| `notes` | string \| null | no (max: 1024) | Notas |
| `receivedAt` | datetime \| null | no | Fecha de recepción |

> **Evento**: Al recibir mercadería se publica `PurchaseOrderReceived`, lo que automáticamente crea movimientos de inventario `IN` y actualiza el stock.

**Tag**: `admin - purchase-order-items`

#### `POST /api/admin/purchase-order-items` — Agregar ítem a orden

**Request Body:**

```json
{
  "purchaseOrderId": 1,
  "productId": 5,
  "quantityOrdered": 50,
  "unitCost": 420.00
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|---|---|---|---|---|
| `purchaseOrderId` | integer | si | >= 1 | ID de la orden |
| `productId` | integer | si | >= 1 | ID del producto |
| `quantityOrdered` | integer | si | >= 1 | Cantidad ordenada |
| `unitCost` | decimal | si | >= 0 | Costo unitario |

#### `PUT /api/admin/purchase-order-items/{id}` — Actualizar ítem

**Request Body:**

| Campo | Tipo | Validación | Descripción |
|---|---|---|---|
| `quantityOrdered` | integer | >= 1 | Cantidad ordenada |
| `unitCost` | decimal | >= 0 | Costo unitario |

#### `DELETE /api/admin/purchase-order-items/{id}` — Eliminar ítem

**Response:** `204 No Content`

---

### Ventas (solo lectura)

Consulta de ventas desde el panel de administración. La creación de ventas se realiza desde la API de POS.

**Tag**: `admin - sales`

**Ciclo de vida:** `DRAFT` → `CONFIRMED` → `CANCELLED`

#### `GET /api/admin/sales` — Listar ventas

| Query Param | Tipo | Descripción |
|---|---|---|
| `customerId` | integer \| null | Filtrar por cliente |
| `status` | string \| null | Filtrar por estado |
| `limit` | integer \| null | Paginación |
| `offset` | integer \| null | Paginación |

**Response (200):** `SaleResponse[]`

```json
[
  {
    "id": 1,
    "customerId": 1,
    "status": "CONFIRMED",
    "saleDate": "2026-02-27T10:00:00Z",
    "subtotal": 650.00,
    "tax": 78.00,
    "discount": 0.00,
    "total": 728.00,
    "paymentStatus": "PAID",
    "notes": null,
    "createdBy": "cajero1",
    "createdAt": "2026-02-27T10:00:00Z",
    "updatedAt": "2026-02-27T10:00:00Z"
  }
]
```

#### `GET /api/admin/sales/{sale_id}` — Obtener venta

#### `GET /api/admin/sales/{sale_id}/items` — Ítems de la venta

**Response (200):** `SaleItemResponse[]`

```json
[
  {
    "id": 1,
    "saleId": 1,
    "productId": 5,
    "quantity": 1,
    "unitPrice": 650.00,
    "discount": 0.00,
    "subtotal": 650.00
  }
]
```

#### `GET /api/admin/sales/{sale_id}/payments` — Pagos de la venta

**Response (200):** `PaymentResponse[]`

```json
[
  {
    "id": 1,
    "saleId": 1,
    "amount": 728.00,
    "paymentMethod": "CASH",
    "paymentDate": "2026-02-27T10:00:00Z",
    "reference": null,
    "notes": null,
    "createdAt": "2026-02-27T10:00:00Z"
  }
]
```

---

### Reportes de inventario

Reportes analíticos de inventario (solo lectura).

**Tag**: `admin - reports`

#### `GET /api/admin/reports/inventory/valuation` — Valuación de inventario

Valor actual del inventario (cantidad x precio de compra por producto).

| Query Param | Tipo | Descripción |
|---|---|---|
| `warehouseId` | integer \| null | Filtrar por bodega (>= 1) |
| `asOfDate` | date \| null | Fecha de corte (reconstruye stock desde historial de movimientos) |

**Response (200):**

```json
{
  "totalValue": 315000.00,
  "asOfDate": "2026-02-27",
  "items": [
    {
      "productId": 5,
      "productName": "Laptop HP",
      "sku": "LAP-HP-001",
      "quantity": 150,
      "averageCost": 450.00,
      "totalValue": 67500.00
    }
  ]
}
```

#### `GET /api/admin/reports/inventory/rotation` — Rotación de productos

Métricas de rotación: movimientos IN/OUT, stock actual, tasa de rotación, días de stock.

| Query Param | Tipo | Default | Descripción |
|---|---|---|---|
| `fromDate` | date | 1er día del mes actual | Inicio del periodo |
| `toDate` | date | hoy | Fin del periodo |
| `warehouseId` | integer \| null | — | Filtrar por bodega |

**Response (200):** `ProductRotationResponse[]`

```json
[
  {
    "productId": 5,
    "productName": "Laptop HP",
    "sku": "LAP-HP-001",
    "totalIn": 200,
    "totalOut": 50,
    "currentStock": 150,
    "turnoverRate": 0.33,
    "daysOfStock": 81
  }
]
```

#### `GET /api/admin/reports/inventory/movements` — Historial de movimientos

Lista paginada de movimientos con detalle de producto.

| Query Param | Tipo | Default | Descripción |
|---|---|---|---|
| `productId` | integer \| null | — | Filtrar por producto |
| `type` | string \| null | — | Filtrar por tipo (`IN`/`OUT`) |
| `fromDate` | date \| null | — | Desde fecha |
| `toDate` | date \| null | — | Hasta fecha |
| `warehouseId` | integer \| null | — | Filtrar por bodega |
| `limit` | integer | 50 | Paginación (1–500) |
| `offset` | integer | 0 | Paginación |

**Response (200):**

```json
{
  "total": 1250,
  "limit": 50,
  "offset": 0,
  "items": [
    {
      "id": 1,
      "productId": 5,
      "productName": "Laptop HP",
      "sku": "LAP-HP-001",
      "quantity": 100,
      "type": "IN",
      "locationId": 2,
      "sourceLocationId": null,
      "referenceType": "PURCHASE_ORDER",
      "referenceId": 1,
      "reason": "Recepción de mercadería",
      "date": "2026-02-27T10:00:00Z",
      "createdAt": "2026-02-27T10:00:00Z"
    }
  ]
}
```

#### `GET /api/admin/reports/inventory/summary` — Resumen por bodega

Resumen agregado por bodega: total de productos, cantidades, stock reservado, valor total.

| Query Param | Tipo | Descripción |
|---|---|---|
| `warehouseId` | integer \| null | Filtrar por bodega específica |

**Response (200):** `WarehouseSummaryResponse[]`

```json
[
  {
    "warehouseId": 1,
    "warehouseName": "Bodega Central",
    "warehouseCode": "BOD-001",
    "totalProducts": 45,
    "totalQuantity": 12500,
    "reservedQuantity": 200,
    "availableQuantity": 12300,
    "totalValue": 315000.00
  }
]
```

---

## Resumen de endpoints

| Módulo | Método | Ruta | Descripción |
|---|---|---|---|
| **Categorías** | POST | `/categories` | Crear |
| | GET | `/categories` | Listar |
| | GET | `/categories/{id}` | Obtener |
| | PUT | `/categories/{id}` | Actualizar |
| | DELETE | `/categories/{id}` | Eliminar |
| **Productos** | POST | `/products` | Crear |
| | GET | `/products` | Listar |
| | GET | `/products/{id}` | Obtener |
| | PUT | `/products/{id}` | Actualizar |
| | DELETE | `/products/{id}` | Eliminar |
| **Unidades** | POST | `/units-of-measure` | Crear |
| | GET | `/units-of-measure` | Listar |
| | GET | `/units-of-measure/{id}` | Obtener |
| | PUT | `/units-of-measure/{id}` | Actualizar |
| | DELETE | `/units-of-measure/{id}` | Eliminar |
| **Bodegas** | POST | `/warehouses` | Crear |
| | GET | `/warehouses` | Listar |
| | GET | `/warehouses/{id}` | Obtener |
| | PUT | `/warehouses/{id}` | Actualizar |
| | DELETE | `/warehouses/{id}` | Eliminar |
| **Ubicaciones** | POST | `/locations` | Crear |
| | GET | `/locations` | Listar |
| | GET | `/locations/{id}` | Obtener |
| | PUT | `/locations/{id}` | Actualizar |
| | DELETE | `/locations/{id}` | Eliminar |
| **Stock** | GET | `/stock` | Consultar |
| **Movimientos** | POST | `/movements` | Crear |
| | GET | `/movements` | Listar |
| **Lotes** | POST | `/lots` | Crear |
| | GET | `/lots` | Listar |
| | GET | `/lots/{id}` | Obtener |
| | PUT | `/lots/{id}` | Actualizar |
| **Seriales** | POST | `/serials` | Crear |
| | GET | `/serials` | Listar |
| | GET | `/serials/{id}` | Obtener |
| | PUT | `/serials/{id}/status` | Cambiar estado |
| **Ajustes** | POST | `/adjustments` | Crear |
| | GET | `/adjustments` | Listar |
| | GET | `/adjustments/{id}` | Obtener |
| | PUT | `/adjustments/{id}` | Actualizar |
| | DELETE | `/adjustments/{id}` | Eliminar |
| | POST | `/adjustments/{id}/confirm` | Confirmar |
| | POST | `/adjustments/{id}/cancel` | Cancelar |
| | POST | `/adjustments/{id}/items` | Agregar ítem |
| | GET | `/adjustments/{id}/items` | Listar ítems |
| **Ajuste Ítems** | PUT | `/adjustment-items/{id}` | Actualizar |
| | DELETE | `/adjustment-items/{id}` | Eliminar |
| **Transferencias** | POST | `/transfers` | Crear |
| | GET | `/transfers` | Listar |
| | GET | `/transfers/{id}` | Obtener |
| | PUT | `/transfers/{id}` | Actualizar |
| | DELETE | `/transfers/{id}` | Eliminar |
| | POST | `/transfers/{id}/confirm` | Confirmar |
| | POST | `/transfers/{id}/receive` | Recibir |
| | POST | `/transfers/{id}/cancel` | Cancelar |
| | POST | `/transfers/{id}/items` | Agregar ítem |
| | GET | `/transfers/{id}/items` | Listar ítems |
| **Transfer Ítems** | PUT | `/transfer-items/{id}` | Actualizar |
| | DELETE | `/transfer-items/{id}` | Eliminar |
| **Alertas** | GET | `/alerts/low-stock` | Stock bajo |
| | GET | `/alerts/out-of-stock` | Sin stock |
| | GET | `/alerts/reorder-point` | Punto de reorden |
| | GET | `/alerts/expiring-lots` | Lotes por vencer |
| **Clientes** | POST | `/customers` | Crear |
| | GET | `/customers` | Listar |
| | GET | `/customers/{id}` | Obtener |
| | GET | `/customers/search/by-tax-id` | Buscar por tax ID |
| | PUT | `/customers/{id}` | Actualizar |
| | DELETE | `/customers/{id}` | Eliminar |
| | POST | `/customers/{id}/activate` | Activar |
| | POST | `/customers/{id}/deactivate` | Desactivar |
| | POST | `/customers/{cid}/contacts` | Crear contacto |
| | GET | `/customers/{cid}/contacts` | Listar contactos |
| **Contactos Cliente** | GET | `/customer-contacts/{id}` | Obtener |
| | PUT | `/customer-contacts/{id}` | Actualizar |
| | DELETE | `/customer-contacts/{id}` | Eliminar |
| **Proveedores** | POST | `/suppliers` | Crear |
| | GET | `/suppliers` | Listar |
| | GET | `/suppliers/{id}` | Obtener |
| | PUT | `/suppliers/{id}` | Actualizar |
| | DELETE | `/suppliers/{id}` | Eliminar |
| | POST | `/suppliers/{id}/activate` | Activar |
| | POST | `/suppliers/{id}/deactivate` | Desactivar |
| | POST | `/suppliers/{sid}/contacts` | Crear contacto |
| | GET | `/suppliers/{sid}/contacts` | Listar contactos |
| | POST | `/suppliers/{sid}/products` | Agregar producto |
| | GET | `/suppliers/{sid}/products` | Listar productos |
| **Contactos Proveedor** | GET | `/supplier-contacts/{id}` | Obtener |
| | PUT | `/supplier-contacts/{id}` | Actualizar |
| | DELETE | `/supplier-contacts/{id}` | Eliminar |
| **Productos Proveedor** | GET | `/supplier-products/{id}` | Obtener |
| | PUT | `/supplier-products/{id}` | Actualizar |
| | GET | `/supplier-products/by-product/{pid}` | Por producto |
| | DELETE | `/supplier-products/{id}` | Eliminar |
| **Órdenes Compra** | POST | `/purchase-orders` | Crear |
| | GET | `/purchase-orders` | Listar |
| | GET | `/purchase-orders/{id}` | Obtener |
| | PUT | `/purchase-orders/{id}` | Actualizar |
| | DELETE | `/purchase-orders/{id}` | Eliminar |
| | POST | `/purchase-orders/{id}/send` | Enviar |
| | POST | `/purchase-orders/{id}/cancel` | Cancelar |
| | GET | `/purchase-orders/{id}/items` | Listar ítems |
| | GET | `/purchase-orders/{id}/receipts` | Listar recepciones |
| | POST | `/purchase-orders/{id}/receive` | Recibir mercadería |
| **Ítems OC** | POST | `/purchase-order-items` | Agregar |
| | PUT | `/purchase-order-items/{id}` | Actualizar |
| | DELETE | `/purchase-order-items/{id}` | Eliminar |
| **Ventas** | GET | `/sales` | Listar |
| | GET | `/sales/{sale_id}` | Obtener |
| | GET | `/sales/{sale_id}/items` | Ítems |
| | GET | `/sales/{sale_id}/payments` | Pagos |
| **Reportes** | GET | `/reports/inventory/valuation` | Valuación |
| | GET | `/reports/inventory/rotation` | Rotación |
| | GET | `/reports/inventory/movements` | Historial movimientos |
| | GET | `/reports/inventory/summary` | Resumen por bodega |

> Todas las rutas tienen prefijo `/api/admin`. Ejemplo: `GET /api/admin/categories`

---

## Notas para implementación frontend

1. **Generación de tipos**: Usar `/openapi/admin.json` con herramientas como `openapi-typescript` u `orval` para generar tipos y clientes HTTP automáticamente.

2. **Manejo de errores**: Todas las respuestas de error tienen la misma estructura. Implementar un interceptor global que maneje `error_code` y `message`.

3. **Ciclos de vida**: Los módulos de ajustes, transferencias, órdenes de compra y ventas tienen máquinas de estado. Las acciones disponibles dependen del `status` actual.

4. **Eventos automáticos**: Al confirmar ventas, recibir compras, o confirmar ajustes, el backend genera movimientos de inventario y actualiza stock automáticamente. El frontend no necesita hacer llamadas adicionales.

5. **Paginación**: Los endpoints que retornan listas grandes soportan `limit` y `offset`. El reporte de movimientos retorna un campo `total` para calcular la paginación.

6. **Filtros combinados**: Todos los filtros se combinan con AND. Ejemplo: `GET /api/admin/movements?productId=5&type=IN&fromDate=2026-01-01`.

7. **CORS**: El backend acepta requests desde `localhost:3000` y `localhost:5173`.
