# Plan de Implementación — Faclab Dashboard

> Plan para cubrir todos los módulos del API de administración de Faclab Core.
> Cada sesión es una unidad de trabajo independiente que se puede abordar con Claude Code.

---

## Estado Actual

### Módulos ya implementados

| Módulo | Service | Hooks | View | Notas |
|--------|---------|-------|------|-------|
| Categorías | ✅ | ✅ | ✅ | CRUD completo |
| Productos | ✅ | ✅ | ✅ | CRUD completo con selector de categoría y unidad de medida |
| Unidades de medida | ✅ | ✅ | ✅ | CRUD completo con estado activo/inactivo |
| Stock | ✅ | ✅ | ✅ | Solo lectura con filtros |
| Movimientos | ✅ | ✅ | ✅ | Listado con filtros + creación |
| Clientes | ✅ | ✅ | ✅ | CRUD + activar/desactivar |
| Contactos de cliente | ✅ | ✅ | ✅ | CRUD dentro de detalle de cliente |
| Autenticación | ✅ | ✅ | ✅ | Sign in/up/out, recovery |
| Proveedores | ✅ | ✅ | ✅ | CRUD + activar/desactivar + contactos |
| Productos de proveedor | ✅ | ✅ | ✅ | CRUD en detalle de proveedor con tabs |

### Módulos pendientes

| # | Módulo | Complejidad | Dependencias |
|---|--------|-------------|--------------|
| ~~1~~ | ~~Unidades de medida~~ | ~~Baja~~ | ~~Completado en Sesión 1~~ |
| ~~2~~ | ~~Bodegas~~ | ~~Baja~~ | ~~Completado en Sesión 2~~ |
| ~~3~~ | ~~Ubicaciones~~ | ~~Baja~~ | ~~Completado en Sesión 2~~ |
| ~~4~~ | ~~Proveedores~~ | ~~Media~~ | ~~Completado en Sesión 3~~ |
| ~~5~~ | ~~Contactos de proveedor~~ | ~~Baja~~ | ~~Completado en Sesión 3~~ |
| ~~6~~ | ~~Productos de proveedor~~ | ~~Media~~ | ~~Completado en Sesión 4~~ |
| 7 | Lotes | Media | Productos |
| 8 | Números de serie | Media | Productos, Lotes, Ubicaciones |
| 9 | Ajustes de inventario | Alta | Productos, Ubicaciones, Bodegas |
| 10 | Transferencias | Alta | Productos, Ubicaciones |
| 11 | Órdenes de compra | Alta | Proveedores, Productos |
| 12 | Alertas | Baja | Bodegas |
| 13 | Ventas (solo lectura) | Media | Clientes |
| 14 | Reportes de inventario | Media | Bodegas |

---

## Sesiones de Trabajo

### Sesión 1 — Unidades de Medida

**Objetivo:** CRUD de unidades de medida + integración en formulario de productos.

**Tareas:**
- [ ] Crear `UnitOfMeasureService.ts` (CRUD + filtro `isActive`)
- [ ] Crear hooks en `useUnitsOfMeasure.ts` (useUnitsOfMeasure, useCreateUnitOfMeasure, useUpdateUnitOfMeasure, useDeleteUnitOfMeasure)
- [ ] Crear vista `UnitsOfMeasureView/` con tabla, formulario modal (name, symbol, description, isActive)
- [ ] Agregar ruta `inventory.unitsOfMeasure` → `/units-of-measure`
- [ ] Agregar enlace en navegación lateral
- [ ] Integrar selector de unidad de medida en formulario de productos (similar a categorías)

**Prompt sugerido:**
> Implementa el CRUD de unidades de medida siguiendo el patrón de CategoriesView. Campos: name (requerido), symbol (requerido), description, isActive. Endpoint: /api/admin/units-of-measure. Agrega también un selector de unidad de medida en el formulario de productos.

---

### Sesión 2 — Bodegas y Ubicaciones

**Objetivo:** CRUD de bodegas y ubicaciones de almacenamiento.

**Tareas:**
- [ ] Crear `WarehouseService.ts` (CRUD + filtro `isActive`)
- [ ] Crear hooks en `useWarehouses.ts`
- [ ] Crear vista `WarehousesView/` con tabla y formulario (name, code, address, city, country, isActive, isDefault, manager, phone, email)
- [ ] Crear `LocationService.ts` (CRUD + filtros warehouseId, isActive)
- [ ] Crear hooks en `useLocations.ts`
- [ ] Crear vista `LocationsView/` con tabla y formulario (warehouseId, name, code, type [STORAGE/RECEIVING/SHIPPING/RETURN], isActive, capacity)
- [ ] Agregar rutas: `inventory.warehouses` → `/warehouses`, `inventory.locations` → `/locations`
- [ ] Agregar enlaces en navegación lateral

**Prompt sugerido:**
> Implementa el CRUD de bodegas (warehouses) y ubicaciones (locations). Bodegas tienen: name, code (únicos), address, city, country, isActive, isDefault, manager, phone, email. Ubicaciones pertenecen a una bodega y tienen: warehouseId, name, code, type (enum: STORAGE, RECEIVING, SHIPPING, RETURN), isActive, capacity. Sigue los patrones existentes del proyecto.

---

### Sesión 3 — Proveedores (CRUD + Contactos)

**Objetivo:** CRUD de proveedores con gestión de contactos, similar a clientes.

**Tareas:**
- [ ] Crear `SupplierService.ts` (CRUD + activate/deactivate + filtro isActive)
- [ ] Crear `SupplierContactService.ts` (CRUD anidado bajo supplier)
- [ ] Crear hooks: `useSuppliers.ts`, `useSupplierContacts.ts`
- [ ] Crear vista `SuppliersView/` con tabla y formulario (name, taxId, taxType, email, phone, address, city, country, paymentTerms, leadTimeDays, isActive, notes)
- [ ] Crear vista `SupplierDetailView/` con detalle + contactos (replicar patrón de CustomerDetailView)
- [ ] Agregar rutas: `purchases.suppliers` → `/suppliers`, `purchases.supplierDetail` → `/suppliers/:id`
- [ ] Agregar sección "Compras" en navegación lateral

**Prompt sugerido:**
> Implementa el CRUD de proveedores (suppliers) siguiendo el patrón exacto de clientes (CustomersView + CustomerDetailView). Los proveedores tienen los mismos campos que clientes más: leadTimeDays y notes. También tienen contactos con la misma estructura. Endpoints: /api/admin/suppliers, /api/admin/suppliers/{id}/contacts, /api/admin/supplier-contacts/{id}.

---

### Sesión 4 — Catálogo de Productos por Proveedor

**Objetivo:** Gestión de qué productos ofrece cada proveedor con precios y condiciones.

**Tareas:**
- [ ] Crear `SupplierProductService.ts` (CRUD + búsqueda por producto)
- [ ] Crear hooks en `useSupplierProducts.ts`
- [ ] Agregar pestaña/sección "Productos" en `SupplierDetailView` (tabla con: productId, purchasePrice, supplierSku, minOrderQuantity, leadTimeDays, isPreferred)
- [ ] Formulario modal para agregar/editar productos del proveedor con selector de producto
- [ ] Endpoint especial: `GET /supplier-products/by-product/{product_id}` para ver proveedores de un producto

**Prompt sugerido:**
> Agrega gestión de productos por proveedor en el SupplierDetailView. Cada entrada tiene: supplierId, productId, purchasePrice, supplierSku, minOrderQuantity, leadTimeDays, isPreferred. Endpoints: POST/GET /api/admin/suppliers/{id}/products, GET/PUT/DELETE /api/admin/supplier-products/{id}, GET /api/admin/supplier-products/by-product/{product_id}.

---

### Sesión 5 — Lotes y Números de Serie

**Objetivo:** Tracking de lotes (productos perecederos) y números de serie (ítems individuales).

**Tareas:**
- [ ] Crear `LotService.ts` (crear, listar, obtener, actualizar + filtros productId, expiringInDays)
- [ ] Crear hooks en `useLots.ts`
- [ ] Crear vista `LotsView/` con tabla (lotNumber, productId, initialQuantity, currentQuantity, manufactureDate, expirationDate, isExpired, daysToExpiry, notes)
- [ ] Crear `SerialNumberService.ts` (crear, listar, obtener, cambiar estado)
- [ ] Crear hooks en `useSerialNumbers.ts`
- [ ] Crear vista `SerialNumbersView/` con tabla (serialNumber, productId, status, lotId, locationId, notes)
- [ ] Agregar rutas y navegación

**Prompt sugerido:**
> Implementa lotes (lots) y números de serie (serials). Lotes: lotNumber (único), productId, initialQuantity, currentQuantity, manufactureDate, expirationDate, notes. Filtros: productId, expiringInDays. Seriales: serialNumber (único), productId, status (AVAILABLE, SOLD, etc.), lotId, locationId, notes. Cambio de estado via PUT /serials/{id}/status. Sigue los patrones existentes.

---

### Sesión 6 — Ajustes de Inventario

**Objetivo:** Módulo de ajustes con ciclo de vida DRAFT → CONFIRMED/CANCELLED.

**Tareas:**
- [ ] Crear `AdjustmentService.ts` (CRUD ajustes + confirm/cancel + CRUD ítems)
- [ ] Crear hooks en `useAdjustments.ts` y `useAdjustmentItems.ts`
- [ ] Crear vista `AdjustmentsView/` con tabla de ajustes (filtros: status, warehouseId)
- [ ] Crear vista `AdjustmentDetailView/` con:
  - Información del ajuste (warehouseId, reason, status, notes, adjustedBy)
  - Tabla de ítems (productId, locationId, expectedQuantity, actualQuantity, difference, lotId, notes)
  - Botones de acción según estado: Confirmar (DRAFT→CONFIRMED), Cancelar (DRAFT→CANCELLED)
  - Agregar/editar/eliminar ítems solo en DRAFT
- [ ] Agregar rutas y navegación

**Prompt sugerido:**
> Implementa ajustes de inventario (adjustments). Ciclo: DRAFT → CONFIRMED/CANCELLED. Un ajuste tiene: warehouseId, reason, status, notes, adjustedBy. Cada ajuste tiene ítems: productId, locationId, actualQuantity, lotId, notes. El backend calcula expectedQuantity y difference. Acciones: POST /adjustments/{id}/confirm y /cancel. Ítems solo editables en DRAFT.

---

### Sesión 7 — Transferencias de Inventario

**Objetivo:** Módulo de transferencias con ciclo de vida DRAFT → CONFIRMED → RECEIVED/CANCELLED.

**Tareas:**
- [ ] Crear `TransferService.ts` (CRUD transferencias + confirm/receive/cancel + CRUD ítems)
- [ ] Crear hooks en `useTransfers.ts` y `useTransferItems.ts`
- [ ] Crear vista `TransfersView/` con tabla (filtros: status, sourceLocationId)
- [ ] Crear vista `TransferDetailView/` con:
  - Información (sourceLocationId, destinationLocationId, status, requestedBy, notes)
  - Tabla de ítems (productId, quantity, lotId, notes)
  - Botones según estado: Confirmar (DRAFT→CONFIRMED), Recibir (CONFIRMED→RECEIVED), Cancelar
  - Ítems solo editables en DRAFT
- [ ] Agregar rutas y navegación

**Prompt sugerido:**
> Implementa transferencias de inventario (transfers). Ciclo: DRAFT → CONFIRMED → RECEIVED / CANCELLED. Una transferencia tiene: sourceLocationId, destinationLocationId, status, requestedBy, notes. Ítems: productId, quantity, lotId, notes. Acciones: confirm, receive, cancel. Ítems editables solo en DRAFT.

---

### Sesión 8 — Órdenes de Compra

**Objetivo:** Módulo completo de órdenes de compra con ciclo de vida y recepción de mercadería.

**Tareas:**
- [ ] Crear `PurchaseOrderService.ts` (CRUD OC + send/cancel/receive + CRUD ítems + recepciones)
- [ ] Crear hooks en `usePurchaseOrders.ts` y `usePurchaseOrderItems.ts`
- [ ] Crear vista `PurchaseOrdersView/` con tabla (filtros: status, supplierId)
- [ ] Crear vista `PurchaseOrderDetailView/` con:
  - Información (supplierId, orderNumber, status, subtotal, tax, total, notes, expectedDate)
  - Tabla de ítems (productId, quantityOrdered, quantityReceived, unitCost)
  - Tabla de recepciones (receipts)
  - Botones: Enviar (DRAFT→SENT), Cancelar, Recibir mercadería
  - Modal de recepción (items[]: purchaseOrderItemId, quantityReceived, locationId, lotNumber, serialNumbers[])
  - Ítems editables solo en DRAFT
- [ ] Agregar rutas y navegación

**Prompt sugerido:**
> Implementa órdenes de compra (purchase-orders). Ciclo: DRAFT → SENT → RECEIVED / CANCELLED. OC tiene: supplierId, orderNumber (auto), status, subtotal/tax/total (calculados), notes, expectedDate. Ítems: productId, quantityOrdered, quantityReceived, unitCost. Recepción via POST /purchase-orders/{id}/receive con items (purchaseOrderItemId, quantityReceived, locationId, lotNumber, serialNumbers[]).

---

### Sesión 9 — Ventas (Solo Lectura)

**Objetivo:** Vista de consulta de ventas desde el panel de administración.

**Tareas:**
- [ ] Crear `SaleService.ts` (listar, obtener, ítems, pagos)
- [ ] Crear hooks en `useSales.ts`
- [ ] Crear vista `SalesView/` con tabla (filtros: customerId, status, paginación)
- [ ] Crear vista `SaleDetailView/` con:
  - Información (customerId, status, saleDate, subtotal, tax, discount, total, paymentStatus, notes, createdBy)
  - Tabla de ítems (productId, quantity, unitPrice, discount, subtotal)
  - Tabla de pagos (amount, paymentMethod, paymentDate, reference, notes)
- [ ] Agregar rutas y navegación bajo sección "Ventas"

**Prompt sugerido:**
> Implementa la vista de ventas (solo lectura). Listar ventas con filtros (customerId, status, paginación). Detalle con: info de la venta, ítems (productId, quantity, unitPrice, discount, subtotal) y pagos (amount, paymentMethod, paymentDate, reference). Endpoints: GET /sales, /sales/{id}, /sales/{id}/items, /sales/{id}/payments.

---

### Sesión 10 — Alertas de Inventario

**Objetivo:** Dashboard de alertas de stock bajo, sin stock, punto de reorden y lotes por vencer.

**Tareas:**
- [ ] Crear `AlertService.ts` (4 endpoints de alerta)
- [ ] Crear hooks en `useAlerts.ts`
- [ ] Crear vista `AlertsView/` con:
  - Panel/cards resumen con contadores
  - Pestaña "Stock bajo" (filtro: warehouseId)
  - Pestaña "Sin stock" (filtro: warehouseId)
  - Pestaña "Punto de reorden" (filtro: warehouseId)
  - Pestaña "Lotes por vencer" (filtro: days, default 30)
  - Cada pestaña con tabla mostrando los datos de StockAlertResponse
- [ ] Agregar ruta y enlace en navegación (podría ir en Home/Dashboard también)

**Prompt sugerido:**
> Implementa la vista de alertas de inventario. 4 endpoints: /alerts/low-stock, /alerts/out-of-stock, /alerts/reorder-point, /alerts/expiring-lots. Muestra con pestañas (Tabs), cada una con su tabla. Filtros: warehouseId para stock, days para lotes. Response: type, productId, productName, sku, currentQuantity, threshold, warehouseId, lotId, daysToExpiry.

---

### Sesión 11 — Reportes de Inventario

**Objetivo:** Vistas de reportes analíticos de inventario.

**Tareas:**
- [ ] Crear `ReportService.ts` (4 endpoints de reportes)
- [ ] Crear hooks en `useReports.ts`
- [ ] Crear vista `ReportsView/` con sub-vistas o pestañas:
  - **Valuación:** tabla con totalValue, items (productName, sku, quantity, averageCost, totalValue). Filtros: warehouseId, asOfDate
  - **Rotación:** tabla (productName, sku, totalIn, totalOut, currentStock, turnoverRate, daysOfStock). Filtros: fromDate, toDate, warehouseId
  - **Historial de movimientos:** tabla paginada (productName, sku, quantity, type, locationId, referenceType, reason, date). Filtros: productId, type, fromDate, toDate, warehouseId
  - **Resumen por bodega:** tabla/cards (warehouseName, code, totalProducts, totalQuantity, reservedQuantity, availableQuantity, totalValue)
- [ ] Agregar rutas y navegación bajo sección "Reportes"

**Prompt sugerido:**
> Implementa los 4 reportes de inventario: valuación (valuation), rotación (rotation), historial de movimientos (movements), y resumen por bodega (summary). Cada uno con sus filtros según la API. El reporte de movimientos es paginado con total. Usa pestañas o sub-rutas.

---

### Sesión 12 — Mejoras de Integración y Navegación

**Objetivo:** Refinamientos finales de integración entre módulos.

**Tareas:**
- [ ] Revisar y mejorar la navegación lateral (organizar secciones: Catálogo, Inventario, Compras, Ventas, Reportes)
- [ ] Agregar links cruzados entre módulos (ej: desde producto ver proveedores, desde proveedor ver productos)
- [ ] Mejorar la vista Home con dashboard resumen (alertas, resumen por bodega)
- [ ] Revisar manejo de errores global según estructura de error de la API
- [ ] Verificar que todos los selectores (producto, bodega, ubicación, proveedor, cliente) se usen consistentemente

**Prompt sugerido:**
> Revisa la navegación lateral y organízala en secciones lógicas: Catálogo (Productos, Categorías, Unidades), Inventario (Stock, Movimientos, Ajustes, Transferencias, Lotes, Seriales, Alertas), Compras (Proveedores, Órdenes de Compra), Ventas (Clientes, Ventas), Reportes. Mejora el Home con un dashboard resumen.

---

## Orden Recomendado

```
Sesión 1  → Unidades de Medida (baja complejidad, desbloquea selector en productos)
Sesión 2  → Bodegas + Ubicaciones (base para inventario avanzado)
Sesión 3  → Proveedores + Contactos (base para compras)
Sesión 4  → Productos de Proveedor (complementa proveedores)
Sesión 5  → Lotes + Números de Serie (tracking avanzado)
Sesión 6  → Ajustes de Inventario (usa bodegas, ubicaciones, productos)
Sesión 7  → Transferencias (usa ubicaciones, productos)
Sesión 8  → Órdenes de Compra (usa proveedores, productos, ubicaciones)
Sesión 9  → Ventas solo lectura (usa clientes)
Sesión 10 → Alertas (usa bodegas, productos, lotes)
Sesión 11 → Reportes (usa todo lo anterior)
Sesión 12 → Integración y pulido final
```

## Convenciones a Seguir

- **Servicios:** Clase con métodos async que usan `ApiService.fetchData()`
- **Hooks:** Un archivo por módulo, exportando useQuery/useMutation con cache invalidation
- **Vistas:** Carpeta por feature con index.tsx + componentes internos
- **Rutas:** Lazy import en `routes.config.ts`, key con notación de punto
- **Formularios:** Modales con validación, selectores para foreign keys
- **Navegación:** Actualizar `navigation.config.ts` con nuevos items
