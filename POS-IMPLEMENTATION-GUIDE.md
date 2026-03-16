# Guía de Implementación — Módulo POS

Guía dividida en 7 sesiones independientes para implementar el módulo de Punto de Venta (POS) en el dashboard existente.

**Referencia visual**: `entrypoint.png` (botón de acceso) y `pos.png` (layout POS).
**Especificación API**: `pos-api-spec.md` (50 endpoints, base URL `/api/pos`).

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│ POSView.tsx (fixed inset-0 z-50 — overlay fullscreen)       │
│ ┌──────────┬──────────────────────────┬───────────────────┐ │
│ │ Category │    ProductGrid +         │   OrderPanel      │ │
│ │ Sidebar  │    SearchBar +           │   (w-80)          │ │
│ │ (w-16)   │    POSHeader             │                   │ │
│ │          │    (flex-1)              │   - Customer      │ │
│ │ Iconos   │                          │   - Items list    │ │
│ │ de       │  ┌────┐ ┌────┐ ┌────┐  │   - Summary       │ │
│ │ categoría│  │Card│ │Card│ │Card│  │   - Actions       │ │
│ │          │  └────┘ └────┘ └────┘  │                   │ │
│ │          │  ┌────┐ ┌────┐ ┌────┐  │                   │ │
│ │          │  │Card│ │Card│ │Card│  │                   │ │
│ │          │  └────┘ └────┘ └────┘  │                   │ │
│ └──────────┴──────────────────────────┴───────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Decisiones clave**:
- El POS es un **overlay fullscreen** (`fixed inset-0 z-50`) — no modifica el sistema de layouts
- Estado del carrito en **Zustand sin persist** (efímero, no sobrevive refresh)
- **Quick Sale** como flujo primario (un solo request atómico)
- API host separado: `posApiHost` en `app.config.ts`

---

## Sesión 1: Configuración y Servicio POS

**Objetivo**: Crear la capa de datos — configuración, interfaces TypeScript, y servicio API.

### 1.1 Modificar `src/configs/app.config.ts`

Agregar `posApiHost` al tipo y al objeto de configuración:

```typescript
export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    tourPath: string
    locale: string
    enableMock: boolean
    inventoryApiHost?: string
    posApiHost?: string          // <-- NUEVO
}

const appConfig: AppConfig = {
    apiPrefix: '',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    locale: 'en',
    enableMock: false,
    inventoryApiHost: 'http://localhost:3000/api/admin',
    posApiHost: 'http://localhost:3000/api/pos',   // <-- NUEVO
}
```

### 1.2 Crear `src/services/POSService.ts`

Seguir el patrón de `SaleService.ts`. Definir todas las interfaces basadas en `pos-api-spec.md` y los métodos API.

**Interfaces a definir**:

```typescript
// === ENUMS ===
export type ShiftStatus = 'OPEN' | 'CLOSED'
export type POSSaleStatus = 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'CANCELLED'
export type POSPaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID'
export type POSPaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT'
export type CashMovementType = 'IN' | 'OUT'
export type RefundStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'
export type DiscountType = 'PERCENTAGE' | 'AMOUNT'

// === SHIFTS ===
export interface Shift {
    id: number
    cashierName: string
    openedAt: string
    closedAt: string | null
    openingBalance: number
    closingBalance: number | null
    expectedBalance: number | null
    discrepancy: number | null
    status: ShiftStatus
    notes: string | null
}

export interface OpenShiftInput {
    cashierName: string
    openingBalance: number
    notes?: string
}

export interface CloseShiftInput {
    closingBalance: number
    notes?: string
}

// === SALES ===
export interface POSSale {
    id: number
    customerId: number | null
    isFinalConsumer: boolean
    shiftId: number
    status: POSSaleStatus
    saleDate: string | null
    subtotal: number
    tax: number
    discount: number
    discountType: DiscountType | null
    discountValue: number
    total: number
    paymentStatus: POSPaymentStatus
    notes: string | null
    createdBy: string | null
    parkedAt: string | null
    parkReason: string | null
    createdAt: string
}

export interface POSSaleItem {
    id: number
    saleId: number
    productId: number
    quantity: number
    unitPrice: number
    discount: number
    taxRate: number
    taxAmount: number
    subtotal: number
    priceOverride: number | null
    overrideReason: string | null
}

export interface POSPayment {
    id: number
    saleId: number
    amount: number
    paymentMethod: POSPaymentMethod
    paymentDate: string
    reference: string | null
    notes: string | null
}

// === INPUTS ===
export interface CreateSaleInput {
    customerId?: number | null
    isFinalConsumer?: boolean
    notes?: string
    createdBy?: string
}

export interface QuickSaleInput {
    customerId?: number | null
    items: QuickSaleItemInput[]
    payments: QuickSalePaymentInput[]
    notes?: string
    createdBy?: string
}

export interface QuickSaleItemInput {
    productId: number
    quantity: number
    unitPrice?: number
    discount?: number
}

export interface QuickSalePaymentInput {
    amount: number
    paymentMethod: POSPaymentMethod
    reference?: string
    notes?: string
}

export interface AddSaleItemInput {
    productId: number
    quantity: number
}

export interface UpdateSaleItemInput {
    quantity: number
}

export interface SaleDiscountInput {
    discountType: DiscountType
    discountValue: number
}

export interface PriceOverrideInput {
    newPrice: number
    reason: string
}

export interface PaymentInput {
    amount: number
    paymentMethod: POSPaymentMethod
    reference?: string
    notes?: string
}

// === REFUNDS ===
export interface Refund {
    id: number
    originalSaleId: number
    shiftId: number
    refundDate: string | null
    subtotal: number
    tax: number
    total: number
    reason: string | null
    status: RefundStatus
    refundedBy: string | null
}

export interface RefundItem {
    id: number
    refundId: number
    originalSaleItemId: number
    productId: number
    quantity: number
    unitPrice: number
    discount: number
    taxRate: number
    taxAmount: number
    subtotal: number
}

export interface CreateRefundInput {
    originalSaleId: number
    items: { saleItemId: number; quantity: number }[]
    reason?: string
    refundedBy?: string
}

export interface ProcessRefundInput {
    payments: { amount: number; paymentMethod: POSPaymentMethod; reference?: string }[]
}

// === CASH MOVEMENTS ===
export interface CashMovement {
    id: number
    shiftId: number
    type: CashMovementType
    amount: number
    reason: string | null
    performedBy: string | null
    createdAt: string
}

export interface CashMovementInput {
    type: CashMovementType
    amount: number
    reason?: string
    performedBy?: string
}

export interface CashSummary {
    shiftId: number
    openingBalance: number
    cashSales: number
    cashRefunds: number
    cashIn: number
    cashOut: number
    expectedBalance: number
}

// === RECEIPT ===
export interface Receipt {
    saleId: number
    saleDate: string
    status: string
    cashier: string
    customer: { name: string; taxId: string } | null
    isFinalConsumer: boolean
    items: ReceiptItem[]
    taxBreakdown: { taxRate: number; taxableBase: number; taxAmount: number }[]
    subtotal: number
    discount: number
    discountType: DiscountType | null
    discountValue: number
    tax: number
    total: number
    payments: { method: string; amount: number; reference: string | null }[]
    totalPaid: number
    change: number
}

export interface ReceiptItem {
    productName: string
    quantity: number
    unitPrice: number
    discount: number
    discountAmount: number
    taxRate: number
    taxAmount: number
    subtotal: number
    priceOverride: number | null
    overrideReason: string | null
}

// === REPORTS ===
export interface XReport {
    shift: Shift
    salesSummary: { count: number; subtotal: number; tax: number; discount: number; total: number }
    paymentsByMethod: { paymentMethod: string; count: number; total: number }[]
    itemsSold: { productName: string; sku: string; quantity: number; total: number }[]
}

export interface ZReport extends XReport {
    refundSummary: { count: number; total: number }
    cashReconciliation: CashSummary & { closingBalance: number; discrepancy: number }
}

export interface DailyReport {
    date: string
    totalSales: number
    totalAmount: number
    paymentsByMethod: { paymentMethod: string; count: number; total: number }[]
    topProducts: { productName: string; sku: string; quantity: number; total: number }[]
    refundSummary: { count: number; total: number }
}

// === POS PRODUCT (simplificado) ===
export interface POSProduct {
    id: number
    name: string
    sku: string
    barcode: string | null
    categoryId: number | null
    salePrice: number | null
    isActive: boolean
}

// === POS CUSTOMER ===
export interface POSCustomer {
    id: number
    name: string
    taxId: string
    taxType: string
}

export interface QuickCustomerInput {
    name: string
    taxId: string
    taxType: string
}
```

**Métodos del servicio** (seguir patrón de `SaleService.ts` con `ApiService.fetchData`):

```
Shifts:
  getActiveShift()         → GET  /shifts/active
  openShift(data)          → POST /shifts/open
  closeShift(id, data)     → POST /shifts/{id}/close
  getShift(id)             → GET  /shifts/{id}
  getShifts(params)        → GET  /shifts

Sales:
  createSale(data)         → POST /sales
  quickSale(data)          → POST /sales/quick
  getSale(id)              → GET  /sales/{id}
  addSaleItem(id, data)    → POST /sales/{id}/items
  getSaleItems(id)         → GET  /sales/{id}/items
  updateSaleItem(sId, iId, data) → PUT  /sales/{sId}/items/{iId}
  deleteSaleItem(sId, iId) → DELETE /sales/{sId}/items/{iId}
  confirmSale(id)          → POST /sales/{id}/confirm
  cancelSale(id, reason)   → POST /sales/{id}/cancel
  parkSale(id, reason)     → POST /sales/{id}/park
  resumeSale(id)           → POST /sales/{id}/resume
  getParkedSales()         → GET  /sales/parked
  applySaleDiscount(id, data) → POST /sales/{id}/discount
  addPayment(id, data)     → POST /sales/{id}/payments
  getSalePayments(id)      → GET  /sales/{id}/payments
  overrideItemPrice(sId, iId, data) → PUT /sales/{sId}/items/{iId}/price
  getReceipt(id)           → GET  /sales/{id}/receipt

Refunds:
  createRefund(data)       → POST /refunds
  processRefund(id, data)  → POST /refunds/{id}/process
  cancelRefund(id)         → POST /refunds/{id}/cancel
  getRefund(id)            → GET  /refunds/{id}
  getRefunds(params)       → GET  /refunds

Cash Movements:
  addCashMovement(shiftId, data) → POST /shifts/{shiftId}/cash-movements
  getCashMovements(shiftId)      → GET  /shifts/{shiftId}/cash-movements
  getCashSummary(shiftId)        → GET  /shifts/{shiftId}/cash-summary

Reports:
  getXReport(shiftId)      → GET /reports/x-report?shiftId={id}
  getZReport(shiftId)      → GET /reports/z-report?shiftId={id}
  getDailyReport(date)     → GET /reports/daily?date={date}
  getByPaymentMethod(from, to) → GET /reports/by-payment-method?fromDate={}&toDate={}

Products:
  getProducts()            → GET /products
  searchProducts(term, limit?) → GET /products/search?term={}&limit={}
  getProduct(id)           → GET /products/{id}

Customers:
  getCustomers()           → GET /customers
  searchCustomerByTaxId(taxId) → GET /customers/search/by-tax-id?taxId={}
  quickCreateCustomer(data) → POST /customers
  getCustomer(id)          → GET /customers/{id}
```

**Patrón de referencia** — cada método sigue esta estructura (ver `SaleService.ts:106-131`):
```typescript
private config = {
    host: appConfig.posApiHost || 'http://localhost:3000/api/pos',
}

async getActiveShift() {
    return ApiService.fetchData<DataResponse<Shift | null>>({
        url: `${this.config.host}/shifts/active`,
        method: 'get',
    })
}
```

**Labels y clases CSS** para estados (mismo patrón que `SaleService.ts:13-46`):
```typescript
export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
    OPEN: 'Abierto',
    CLOSED: 'Cerrado',
}

export const POS_SALE_STATUS_LABELS: Record<POSSaleStatus, string> = {
    DRAFT: 'Borrador',
    CONFIRMED: 'Confirmada',
    INVOICED: 'Facturada',
    CANCELLED: 'Cancelada',
}

export const POS_PAYMENT_METHOD_LABELS: Record<POSPaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    CREDIT: 'Crédito',
}
```

### Verificación Sesión 1
- `npm run lint` pasa sin errores
- `npm run build` compila correctamente
- Las interfaces cubren todas las entidades de `pos-api-spec.md`
- El servicio tiene métodos para los ~50 endpoints

---

## Sesión 2: Store Zustand y React Query Hooks

**Objetivo**: Crear el estado del carrito y los hooks de React Query para todas las operaciones POS.

### 2.1 Crear `src/stores/usePOSStore.ts`

Store Zustand **sin persist** para el estado del carrito. Seguir patrón de `useAuthStore.ts`.

**Estado y acciones**:

```typescript
import { create } from 'zustand'

export interface POSCartItem {
    productId: number
    name: string
    sku: string
    salePrice: number
    quantity: number
    discount: number          // porcentaje 0-100
}

interface POSState {
    // Cart
    cartItems: POSCartItem[]
    customerId: number | null
    customerName: string | null
    isFinalConsumer: boolean

    // Discount a nivel de venta
    discountType: 'PERCENTAGE' | 'AMOUNT' | null
    discountValue: number

    // UI
    selectedCategoryId: number | null
    searchTerm: string

    // Actions
    addItem: (product: { productId: number; name: string; sku: string; salePrice: number }) => void
    updateItemQuantity: (productId: number, quantity: number) => void
    updateItemDiscount: (productId: number, discount: number) => void
    removeItem: (productId: number) => void
    setCustomer: (id: number | null, name: string | null) => void
    setFinalConsumer: (value: boolean) => void
    applyDiscount: (type: 'PERCENTAGE' | 'AMOUNT', value: number) => void
    clearDiscount: () => void
    clearCart: () => void
    setSelectedCategory: (categoryId: number | null) => void
    setSearchTerm: (term: string) => void
}
```

**Lógica clave de `addItem`**: Si el producto ya existe en el carrito, incrementar quantity. Si no, agregarlo con quantity 1.

**Helpers computados** (funciones puras exportadas, no en el store):
```typescript
export function getCartSubtotal(items: POSCartItem[]): number {
    return items.reduce((sum, item) => {
        const lineTotal = item.salePrice * item.quantity * (1 - item.discount / 100)
        return sum + lineTotal
    }, 0)
}

export function getCartDiscountAmount(
    subtotal: number,
    discountType: 'PERCENTAGE' | 'AMOUNT' | null,
    discountValue: number
): number {
    if (!discountType) return 0
    if (discountType === 'PERCENTAGE') return subtotal * (discountValue / 100)
    return discountValue
}

export function getCartTotal(
    items: POSCartItem[],
    discountType: 'PERCENTAGE' | 'AMOUNT' | null,
    discountValue: number
): number {
    const subtotal = getCartSubtotal(items)
    const discount = getCartDiscountAmount(subtotal, discountType, discountValue)
    return Math.max(0, subtotal - discount)
}
```

### 2.2 Crear `src/hooks/usePOS.ts`

React Query hooks siguiendo el patrón de `useProducts.ts` y `useSales.ts`.

**Hooks a implementar**:

```typescript
// === QUERIES ===

// Turno activo — se usa en ShiftGuard
export function useActiveShift() {
    return useQuery({
        queryKey: ['pos', 'activeShift'],
        queryFn: async () => {
            const response = await POSService.getActiveShift()
            return response.data.data  // Shift | null
        },
    })
}

// Productos POS — para el grid de productos
export function usePOSProducts() {
    return useQuery({
        queryKey: ['pos', 'products'],
        queryFn: async () => {
            const response = await POSService.getProducts()
            return response.data.data
        },
    })
}

// Buscar productos — con debounce en el componente
export function usePOSSearchProducts(term: string) {
    return useQuery({
        queryKey: ['pos', 'products', 'search', term],
        queryFn: async () => {
            const response = await POSService.searchProducts(term)
            return response.data.data
        },
        enabled: term.length >= 2,
    })
}

// Ventas parkeadas
export function useParkedSales() {
    return useQuery({
        queryKey: ['pos', 'parkedSales'],
        queryFn: async () => {
            const response = await POSService.getParkedSales()
            return response.data.data
        },
    })
}

// Recibo
export function useReceipt(saleId: number) {
    return useQuery({
        queryKey: ['pos', 'receipt', saleId],
        queryFn: async () => {
            const response = await POSService.getReceipt(saleId)
            return response.data.data
        },
        enabled: saleId > 0,
    })
}

// Resumen de caja
export function useCashSummary(shiftId: number) {
    return useQuery({
        queryKey: ['pos', 'cashSummary', shiftId],
        queryFn: async () => {
            const response = await POSService.getCashSummary(shiftId)
            return response.data.data
        },
        enabled: shiftId > 0,
    })
}

// X-Report
export function useXReport(shiftId: number) {
    return useQuery({
        queryKey: ['pos', 'xReport', shiftId],
        queryFn: async () => {
            const response = await POSService.getXReport(shiftId)
            return response.data.data
        },
        enabled: shiftId > 0,
    })
}

// Buscar cliente por RUC/cédula
export function usePOSCustomerSearch(taxId: string) {
    return useQuery({
        queryKey: ['pos', 'customers', 'search', taxId],
        queryFn: async () => {
            const response = await POSService.searchCustomerByTaxId(taxId)
            return response.data.data
        },
        enabled: taxId.length >= 5,
    })
}

// === MUTATIONS ===

export function useOpenShift() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: OpenShiftInput) => {
            const response = await POSService.openShift(data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'activeShift'] })
        },
    })
}

export function useCloseShift() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ shiftId, data }: { shiftId: number; data: CloseShiftInput }) => {
            const response = await POSService.closeShift(shiftId, data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'activeShift'] })
        },
    })
}

export function useQuickSale() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: QuickSaleInput) => {
            const response = await POSService.quickSale(data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'products'] })
        },
    })
}

export function useCreateSale() {
    return useMutation({
        mutationFn: async (data: CreateSaleInput) => {
            const response = await POSService.createSale(data)
            return response.data.data
        },
    })
}

export function useAddSaleItem() {
    return useMutation({
        mutationFn: async ({ saleId, data }: { saleId: number; data: AddSaleItemInput }) => {
            const response = await POSService.addSaleItem(saleId, data)
            return response.data.data
        },
    })
}

export function useConfirmSale() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (saleId: number) => {
            const response = await POSService.confirmSale(saleId)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'products'] })
        },
    })
}

export function useParkSale() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ saleId, reason }: { saleId: number; reason?: string }) => {
            const response = await POSService.parkSale(saleId, reason)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'parkedSales'] })
        },
    })
}

export function useResumeSale() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (saleId: number) => {
            const response = await POSService.resumeSale(saleId)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'parkedSales'] })
        },
    })
}

export function useAddPayment() {
    return useMutation({
        mutationFn: async ({ saleId, data }: { saleId: number; data: PaymentInput }) => {
            const response = await POSService.addPayment(saleId, data)
            return response.data.data
        },
    })
}

export function useCreateRefund() {
    return useMutation({
        mutationFn: async (data: CreateRefundInput) => {
            const response = await POSService.createRefund(data)
            return response.data.data
        },
    })
}

export function useProcessRefund() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ refundId, data }: { refundId: number; data: ProcessRefundInput }) => {
            const response = await POSService.processRefund(refundId, data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'products'] })
        },
    })
}

export function useAddCashMovement() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ shiftId, data }: { shiftId: number; data: CashMovementInput }) => {
            const response = await POSService.addCashMovement(shiftId, data)
            return response.data.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'cashSummary', variables.shiftId] })
        },
    })
}

export function useQuickCreateCustomer() {
    return useMutation({
        mutationFn: async (data: QuickCustomerInput) => {
            const response = await POSService.quickCreateCustomer(data)
            return response.data.data
        },
    })
}
```

### Verificación Sesión 2
- `npm run lint` pasa sin errores
- `npm run build` compila correctamente
- El store tiene todas las acciones del carrito
- Los hooks cubren los endpoints más usados del POS

---

## Sesión 3: Vista Principal y Layout

**Objetivo**: Crear la estructura visual del POS — overlay fullscreen, verificación de turno, y layout de 3 paneles.

### Estructura de archivos a crear

```
src/views/pos/
├── POSView.tsx
└── components/
    ├── POSLayout.tsx
    ├── POSHeader.tsx
    ├── ShiftGuard.tsx
    └── ShiftOpenDialog.tsx
```

### 3.1 Crear `src/views/pos/POSView.tsx`

Componente principal. Overlay fullscreen que cubre todo el viewport:

```tsx
// Overlay container
<div className="fixed inset-0 z-50 bg-white dark:bg-gray-800 flex flex-col">
    <ShiftGuard>
        <POSLayout />
    </ShiftGuard>
</div>
```

- Usa `z-50` para estar sobre el layout del dashboard
- El usuario navega aquí desde `/pos` y sale con botón "Volver"

### 3.2 Crear `src/views/pos/components/ShiftGuard.tsx`

Wrapper que verifica si hay un turno activo antes de mostrar el POS:

```tsx
// Usa useActiveShift() de usePOS.ts
// Si isLoading → mostrar Spinner centrado
// Si data es null → mostrar ShiftOpenDialog
// Si data existe → renderizar children y pasar shift como contexto
```

Puede usar React Context para pasar el shift activo a componentes hijos:
```typescript
export const ShiftContext = createContext<Shift | null>(null)
export const useShift = () => useContext(ShiftContext)
```

### 3.3 Crear `src/views/pos/components/ShiftOpenDialog.tsx`

Dialog para abrir un nuevo turno. Componentes a usar:
- `Dialog` de `@/components/ui/Dialog`
- `Input` para nombre de cajero y saldo inicial
- `Button` para confirmar

```tsx
// Campos:
// - cashierName (Input, requerido) — prellenar con useAuthStore().user?.userName
// - openingBalance (Input type number, requerido, default 0)
// - notes (Input, opcional)
//
// Al submit → useOpenShift().mutateAsync(data)
// Dialog siempre visible (no se puede cerrar sin abrir turno)
// Botón "Volver al Dashboard" como alternativa → navigate('/home')
```

### 3.4 Crear `src/views/pos/components/POSHeader.tsx`

Header minimal del POS (no el header del dashboard):

```tsx
<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
    {/* Izquierda: Logo o nombre de app + info turno */}
    <div className="flex items-center gap-3">
        <span className="font-semibold text-lg">POS</span>
        <Badge>Turno #{shift.id} — {shift.cashierName}</Badge>
    </div>

    {/* Centro: Fecha/hora actual */}
    <span className="text-gray-500">{formattedDate}</span>

    {/* Derecha: Acciones */}
    <div className="flex items-center gap-2">
        <Button size="sm" variant="plain" onClick={openCashMovementDialog}>
            Caja
        </Button>
        <Button size="sm" variant="plain" onClick={openCloseShiftDialog}>
            Cerrar Turno
        </Button>
        <Button size="sm" variant="solid" onClick={() => navigate('/home')}>
            Volver al Dashboard
        </Button>
    </div>
</div>
```

### 3.5 Crear `src/views/pos/components/POSLayout.tsx`

Layout de 3 paneles:

```tsx
<div className="flex flex-col h-full">
    <POSHeader />
    <div className="flex flex-1 min-h-0">
        {/* Sidebar categorías */}
        <div className="w-16 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <CategorySidebar />
        </div>

        {/* Grid de productos */}
        <div className="flex-1 overflow-y-auto p-4">
            <SearchBar />
            <ProductGrid />
        </div>

        {/* Panel de orden */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <OrderPanel />
        </div>
    </div>
</div>
```

### Verificación Sesión 3
- `npm run build` compila correctamente
- La vista renderiza el overlay fullscreen
- ShiftGuard muestra el dialog si no hay turno
- El layout de 3 paneles ocupa todo el viewport
- Nota: Los componentes internos (CategorySidebar, ProductGrid, etc.) serán placeholder vacíos por ahora

---

## Sesión 4: Sidebar de Categorías y Grid de Productos

**Objetivo**: Implementar la navegación por categorías y la grilla de productos.

### Archivos a crear

```
src/views/pos/components/
├── CategorySidebar.tsx
├── SearchBar.tsx
├── ProductGrid.tsx
└── ProductCard.tsx
```

### 4.1 Crear `CategorySidebar.tsx`

Barra vertical de iconos de categorías. Referencia visual: columna izquierda de `pos.png`.

```tsx
// Usa useCategories() (hook existente en src/hooks/useCategories.ts)
// Primera opción: "Todos" (selectedCategoryId = null)
// Cada categoría es un botón con icono
// Click → usePOSStore().setSelectedCategory(id)
// Categoría activa: bg-{themeColor}-100 o borde izquierdo coloreado

// Iconos: Usar react-icons/hi2 o mapear iconos por nombre de categoría
// Si no hay icono mapeado, usar un icono genérico (HiOutlineTag)

// Layout:
<div className="flex flex-col items-center py-4 gap-2">
    {/* Botón "Todos" */}
    <button className={`p-3 rounded-lg ${!selected ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}>
        <HiOutlineViewGrid className="text-xl" />
    </button>

    {/* Categorías */}
    {categories.map(cat => (
        <button key={cat.id} className={...} onClick={...} title={cat.name}>
            <CategoryIcon name={cat.name} />
        </button>
    ))}
</div>
```

### 4.2 Crear `SearchBar.tsx`

Input de búsqueda con debounce:

```tsx
// Usa usePOSStore().searchTerm y setSearchTerm
// Input con icono de búsqueda (HiOutlineSearch)
// Debounce de 300ms antes de actualizar el store
// Placeholder: "Buscar por nombre, SKU o código de barras..."

// Componentes: InputGroup de @/components/ui con addon de icono
// Referencia: ver cómo se usan InputGroup en vistas existentes

<InputGroup className="mb-4">
    <InputGroup.Addon>
        <HiOutlineSearch className="text-lg" />
    </InputGroup.Addon>
    <Input
        placeholder="Buscar productos..."
        value={localTerm}
        onChange={handleChange}
    />
</InputGroup>
```

### 4.3 Crear `ProductGrid.tsx`

Grid responsivo de ProductCards:

```tsx
// Lee selectedCategoryId y searchTerm del store
// Si searchTerm tiene valor → usa usePOSSearchProducts(searchTerm)
// Si no → usa usePOSProducts() y filtra por categoría en cliente
//
// Grid: grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4
// Loading: grid de Skeleton cards
// Empty: mensaje "No se encontraron productos"

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {products.map(product => (
        <ProductCard key={product.id} product={product} />
    ))}
</div>
```

### 4.4 Crear `ProductCard.tsx`

Card individual de producto. Referencia: cards en `pos.png`.

```tsx
// Props: product (POSProduct del servicio POS o Product filtrado)
// Click → usePOSStore().addItem({ productId, name, sku, salePrice })
//
// Visual:
// - Imagen placeholder (bg-gray-100 con icono de imagen) o imagen real
// - Nombre del producto (truncado a 2 líneas)
// - Precio de venta formateado ($XX.XX)
// - Hover: border color primario o shadow

<div
    className="cursor-pointer border border-gray-200 dark:border-gray-600 rounded-lg
               overflow-hidden hover:border-primary-400 hover:shadow-md transition-all"
    onClick={handleClick}
>
    {/* Imagen */}
    <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <HiOutlinePhotograph className="text-4xl text-gray-400" />
    </div>

    {/* Info */}
    <div className="p-3">
        <p className="text-sm font-medium line-clamp-2">{product.name}</p>
        <p className="text-primary-600 font-bold mt-1">
            ${product.salePrice?.toFixed(2) ?? '0.00'}
        </p>
    </div>
</div>
```

### Verificación Sesión 4
- Las categorías se cargan y filtran productos al hacer click
- La búsqueda filtra productos con debounce
- Los productos se muestran en grid responsivo
- Click en ProductCard agrega el item al carrito (verificar con console.log o React DevTools)

---

## Sesión 5: Panel de Orden (Carrito)

**Objetivo**: Implementar el panel derecho con lista de items, selector de cliente, resumen de pago y botones de acción.

### Archivos a crear

```
src/views/pos/components/
├── OrderPanel.tsx
├── OrderItemRow.tsx
├── CustomerSelector.tsx
├── PaymentSummary.tsx
└── ActionButtons.tsx
```

### 5.1 Crear `OrderPanel.tsx`

Contenedor del panel derecho. Referencia: columna derecha de `pos.png`.

```tsx
<div className="flex flex-col h-full">
    {/* Header */}
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg">Lista de Orden</h3>
    </div>

    {/* Selector de cliente */}
    <CustomerSelector />

    {/* Lista de items (scrollable) */}
    <div className="flex-1 overflow-y-auto p-4">
        {cartItems.length === 0 ? (
            <EmptyState />
        ) : (
            <div className="space-y-3">
                {cartItems.map(item => (
                    <OrderItemRow key={item.productId} item={item} />
                ))}
            </div>
        )}
    </div>

    {/* Resumen de pago */}
    <PaymentSummary />

    {/* Botones de acción */}
    <ActionButtons />
</div>
```

### 5.2 Crear `OrderItemRow.tsx`

Fila de item en el carrito. Referencia: tabla "Order Details" en `pos.png`.

```tsx
// Props: item (POSCartItem del store)
// Muestra: nombre, controles de cantidad (+/-), precio unitario, subtotal línea
// Botón eliminar (ícono trash)

<div className="flex items-center gap-3">
    {/* Info */}
    <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className="text-xs text-gray-500">${item.salePrice.toFixed(2)}</p>
    </div>

    {/* Controles cantidad */}
    <div className="flex items-center gap-1">
        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
            <HiMinus />
        </button>
        <span className="w-8 text-center text-sm">{item.quantity}</span>
        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
            <HiPlus />
        </button>
    </div>

    {/* Subtotal */}
    <span className="text-sm font-medium w-16 text-right">
        ${(item.salePrice * item.quantity).toFixed(2)}
    </span>

    {/* Eliminar */}
    <button onClick={() => removeItem(item.productId)}>
        <HiOutlineTrash className="text-red-500" />
    </button>
</div>
```

**Nota**: Si quantity llega a 0 al hacer click en -, eliminar el item.

### 5.3 Crear `CustomerSelector.tsx`

Selector de cliente con búsqueda por RUC/cédula:

```tsx
// Lee customerId y customerName del store
// Si no hay cliente → muestra "Consumidor Final" con botón para buscar
// Si hay cliente → muestra nombre con botón para cambiar/quitar
//
// Click "Buscar" → abre Dialog con:
//   - Input para RUC/cédula
//   - Resultados de usePOSCustomerSearch(taxId)
//   - Botón "Crear cliente rápido" → abre formulario inline
//
// Componentes: Dialog, Input, Button, Avatar

<div className="p-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Avatar size={32} />
            <div>
                <p className="text-sm font-medium">
                    {customerName || 'Consumidor Final'}
                </p>
                {customerId && (
                    <button className="text-xs text-red-500" onClick={clearCustomer}>
                        Quitar
                    </button>
                )}
            </div>
        </div>
        <Button size="xs" variant="twoTone" onClick={() => setDialogOpen(true)}>
            {customerId ? 'Cambiar' : 'Buscar'}
        </Button>
    </div>
</div>
```

### 5.4 Crear `PaymentSummary.tsx`

Resumen de totales. Referencia: "Payment Summary" en `pos.png`.

```tsx
// Usa helpers del store: getCartSubtotal, getCartDiscountAmount, getCartTotal

<div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
    <div className="flex justify-between text-sm">
        <span className="text-gray-500">Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
    </div>
    {discountAmount > 0 && (
        <div className="flex justify-between text-sm">
            <span className="text-gray-500">Descuento</span>
            <span className="text-red-500">-${discountAmount.toFixed(2)}</span>
        </div>
    )}
    <div className="flex justify-between font-bold text-lg pt-2 border-t">
        <span>Total</span>
        <span className="text-primary-600">${total.toFixed(2)}</span>
    </div>
</div>
```

**Nota**: Los impuestos se calculan en el servidor. En el carrito local solo mostramos subtotal, descuento y total estimado. El total final viene de la respuesta de la API al confirmar.

### 5.5 Crear `ActionButtons.tsx`

Botones de acción al fondo del OrderPanel. Referencia: botones en `pos.png`.

```tsx
// 4 botones en grid 2x2 o fila:
// - Hold (parkear) → abre confirmación, luego parkea la venta
// - Discount → abre DiscountDialog
// - Payment → abre PaymentDialog (solo si hay items)
// - View Orders → abre ParkedSalesDrawer

<div className="p-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2">
    <Button variant="default" block onClick={handleHold} disabled={cartEmpty}>
        Retener
    </Button>
    <Button variant="twoTone" block onClick={handleDiscount} disabled={cartEmpty}>
        Descuento
    </Button>
    <Button variant="solid" block onClick={handlePayment} disabled={cartEmpty}>
        Cobrar
    </Button>
    <Button variant="plain" block onClick={handleViewOrders}>
        Órdenes
    </Button>
</div>
```

### Verificación Sesión 5
- Agregar productos al carrito desde el grid actualiza el OrderPanel
- +/- cantidad funciona, eliminar item funciona
- PaymentSummary se actualiza en tiempo real
- CustomerSelector abre dialog de búsqueda
- Botones de acción están habilitados/deshabilitados según estado del carrito

---

## Sesión 6: Diálogos de Operaciones

**Objetivo**: Implementar los diálogos de pago, descuento y ventas parkeadas.

### Archivos a crear

```
src/views/pos/components/
├── PaymentDialog.tsx
├── DiscountDialog.tsx
├── ParkedSalesDrawer.tsx
└── ReceiptDialog.tsx
```

### 6.1 Crear `PaymentDialog.tsx`

El diálogo más importante — procesa el cobro de la venta.

**Flujo**:
1. Muestra el total a cobrar
2. Usuario selecciona método de pago (Cash/Card/Transfer/Credit)
3. Ingresa monto (prellenado con el total)
4. Para efectivo: calcula el cambio si el monto es mayor al total
5. Opción de split payment: agregar múltiples pagos
6. Botón "Completar Venta" → llama `useQuickSale()` con items del carrito + pagos

```tsx
// Componentes: Dialog, Button, Input, Radio (para método de pago)
// Estado local: paymentEntries[], cada una con { amount, method, reference }
//
// Al completar:
// 1. Construir QuickSaleInput desde usePOSStore (cartItems → items, customer)
// 2. Agregar payments del estado local
// 3. Llamar useQuickSale().mutateAsync(input)
// 4. Si éxito → clearCart(), cerrar dialog, mostrar ReceiptDialog o Notification
// 5. Si error → mostrar error (INSUFFICIENT_STOCK, NO_OPEN_SHIFT, etc.)

// Layout del dialog:
<Dialog isOpen={isOpen} onClose={onClose} width={500}>
    <h4 className="text-lg font-bold mb-4">Cobrar</h4>

    {/* Total */}
    <div className="text-center mb-6">
        <p className="text-3xl font-bold text-primary-600">${total.toFixed(2)}</p>
        <p className="text-sm text-gray-500">Total a cobrar</p>
    </div>

    {/* Método de pago */}
    <div className="grid grid-cols-4 gap-2 mb-4">
        {['CASH', 'CARD', 'TRANSFER', 'CREDIT'].map(method => (
            <Button
                key={method}
                variant={selectedMethod === method ? 'solid' : 'default'}
                block
                onClick={() => setSelectedMethod(method)}
            >
                {POS_PAYMENT_METHOD_LABELS[method]}
            </Button>
        ))}
    </div>

    {/* Monto */}
    <Input
        type="number"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        prefix="$"
        className="mb-4"
    />

    {/* Cambio (solo para efectivo) */}
    {selectedMethod === 'CASH' && amount > total && (
        <div className="bg-emerald-50 p-3 rounded-lg mb-4 text-center">
            <p className="text-sm text-gray-500">Cambio</p>
            <p className="text-xl font-bold text-emerald-600">
                ${(amount - total).toFixed(2)}
            </p>
        </div>
    )}

    {/* Lista de pagos (para split) */}
    {payments.length > 1 && (
        <PaymentsList payments={payments} onRemove={removePayment} />
    )}

    {/* Acciones */}
    <div className="flex gap-2 mt-6">
        <Button variant="default" block onClick={onClose}>
            Cancelar
        </Button>
        <Button
            variant="solid"
            block
            loading={isPending}
            onClick={handleComplete}
            disabled={totalPayments < total}
        >
            Completar Venta
        </Button>
    </div>
</Dialog>
```

### 6.2 Crear `DiscountDialog.tsx`

Dialog para aplicar descuento a nivel de venta:

```tsx
// Componentes: Dialog, Radio/Segment, Input, Button
//
// Dos modos: PERCENTAGE y AMOUNT
// Input numérico para el valor
// Preview del descuento aplicado
// Botón "Aplicar" → usePOSStore().applyDiscount(type, value)
// Botón "Quitar descuento" si ya hay uno aplicado → clearDiscount()

<Dialog isOpen={isOpen} onClose={onClose} width={400}>
    <h4 className="text-lg font-bold mb-4">Aplicar Descuento</h4>

    {/* Toggle tipo */}
    <div className="flex gap-2 mb-4">
        <Button variant={type === 'PERCENTAGE' ? 'solid' : 'default'} block
                onClick={() => setType('PERCENTAGE')}>
            Porcentaje (%)
        </Button>
        <Button variant={type === 'AMOUNT' ? 'solid' : 'default'} block
                onClick={() => setType('AMOUNT')}>
            Monto ($)
        </Button>
    </div>

    {/* Input valor */}
    <Input
        type="number"
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        suffix={type === 'PERCENTAGE' ? '%' : '$'}
    />

    {/* Preview */}
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Descuento: ${previewAmount.toFixed(2)}</p>
        <p className="font-bold">Nuevo total: ${newTotal.toFixed(2)}</p>
    </div>

    {/* Acciones */}
    <div className="flex gap-2 mt-4">
        {hasExistingDiscount && (
            <Button variant="plain" className="text-red-500" onClick={handleClear}>
                Quitar
            </Button>
        )}
        <Button variant="default" block onClick={onClose}>Cancelar</Button>
        <Button variant="solid" block onClick={handleApply}>Aplicar</Button>
    </div>
</Dialog>
```

### 6.3 Crear `ParkedSalesDrawer.tsx`

Drawer lateral con lista de ventas parkeadas:

```tsx
// Componentes: Drawer (de @/components/ui), Button, Badge
// Usa useParkedSales() para obtener la lista
// Cada venta muestra: ID, fecha de parkeo, razón, total, # items
// Botón "Reanudar" → useResumeSale().mutateAsync(saleId)
//   → luego cargar items al carrito (getSaleItems → poblar usePOSStore)

<Drawer isOpen={isOpen} onClose={onClose} title="Ventas Retenidas" width={400}>
    {parkedSales?.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No hay ventas retenidas</p>
    ) : (
        <div className="space-y-3 p-4">
            {parkedSales?.map(sale => (
                <Card key={sale.id} bordered>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium">Venta #{sale.id}</p>
                            <p className="text-xs text-gray-500">
                                {formatDate(sale.parkedAt)}
                            </p>
                            {sale.parkReason && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {sale.parkReason}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="font-bold">${sale.total.toFixed(2)}</p>
                            <Button size="xs" variant="solid" onClick={() => handleResume(sale.id)}>
                                Reanudar
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )}
</Drawer>
```

### 6.4 Crear `ReceiptDialog.tsx`

Dialog de recibo después de completar una venta:

```tsx
// Usa useReceipt(saleId) para obtener datos del recibo
// Muestra: fecha, cajero, cliente, items, totales, pagos, cambio
// Botón "Imprimir" (window.print() o similar)
// Botón "Cerrar" → cierra y limpia

<Dialog isOpen={isOpen} onClose={onClose} width={400}>
    <div className="text-center mb-4">
        <HiOutlineCheckCircle className="text-5xl text-emerald-500 mx-auto" />
        <h4 className="text-lg font-bold mt-2">Venta Completada</h4>
    </div>

    {receipt && (
        <div className="space-y-4 text-sm">
            {/* Items */}
            {receipt.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                </div>
            ))}

            {/* Totales */}
            <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${receipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Impuestos</span>
                    <span>${receipt.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${receipt.total.toFixed(2)}</span>
                </div>
            </div>

            {/* Cambio */}
            {receipt.change > 0 && (
                <div className="bg-emerald-50 p-2 rounded text-center">
                    <span className="font-bold text-emerald-600">
                        Cambio: ${receipt.change.toFixed(2)}
                    </span>
                </div>
            )}
        </div>
    )}

    <div className="flex gap-2 mt-6">
        <Button variant="default" block onClick={onClose}>Cerrar</Button>
        <Button variant="solid" block onClick={handlePrint}>Imprimir</Button>
    </div>
</Dialog>
```

### Verificación Sesión 6
- PaymentDialog: seleccionar método, ingresar monto, ver cambio para efectivo
- PaymentDialog: completar venta llama a la API y limpia el carrito
- DiscountDialog: aplicar porcentaje/monto actualiza el PaymentSummary
- ParkedSalesDrawer: lista ventas parkeadas y permite reanudar
- ReceiptDialog: muestra después de venta exitosa

---

## Sesión 7: Integración Final y Features Avanzados

**Objetivo**: Conectar la ruta, agregar el botón de acceso al header, y features de gestión de turno.

### 7.1 Modificar `src/configs/routes.config/routes.config.ts`

Agregar la ruta POS a `protectedRoutes`:

```typescript
{
    key: 'pos',
    path: '/pos',
    component: lazy(() => import('@/views/pos/POSView')),
    authority: [],
},
```

### 7.2 Modificar `src/components/layouts/ModernLayout.tsx`

Agregar botón POS en `HeaderActionsEnd`:

```tsx
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { HiOutlineShoppingCart } from 'react-icons/hi'

const HeaderActionsEnd = () => {
    const navigate = useNavigate()

    return (
        <>
            <Button
                size="sm"
                variant="solid"
                icon={<HiOutlineShoppingCart />}
                onClick={() => navigate('/pos')}
            >
                POS
            </Button>
            <SidePanel />
            <UserDropdown hoverable={false} />
        </>
    )
}
```

**Referencia visual**: En `entrypoint.png`, el botón está en la zona superior derecha del header, antes del avatar del usuario.

### 7.3 Crear `src/views/pos/components/ShiftCloseDialog.tsx`

Dialog para cerrar turno con reconciliación de caja:

```tsx
// Se abre desde POSHeader botón "Cerrar Turno"
// Usa useCashSummary(shiftId) para mostrar resumen actual
//
// Campos:
// - closingBalance (Input number, requerido) — saldo real en caja
// - notes (Input, opcional)
//
// Muestra:
// - openingBalance, cashSales, cashRefunds, cashIn, cashOut, expectedBalance
// - Preview de discrepancia: closingBalance - expectedBalance
//   (verde si 0, rojo si diferencia)
//
// Al confirmar → useCloseShift().mutateAsync({ shiftId, data })
// Si éxito → navegar a /home (ya no hay turno activo)

<Dialog isOpen={isOpen} onClose={onClose} width={500}>
    <h4 className="text-lg font-bold mb-4">Cerrar Turno</h4>

    {cashSummary && (
        <div className="space-y-2 mb-6">
            <SummaryRow label="Saldo inicial" value={cashSummary.openingBalance} />
            <SummaryRow label="Ventas en efectivo" value={cashSummary.cashSales} positive />
            <SummaryRow label="Devoluciones en efectivo" value={cashSummary.cashRefunds} negative />
            <SummaryRow label="Entradas de caja" value={cashSummary.cashIn} positive />
            <SummaryRow label="Salidas de caja" value={cashSummary.cashOut} negative />
            <div className="border-t pt-2">
                <SummaryRow label="Saldo esperado" value={cashSummary.expectedBalance} bold />
            </div>
        </div>
    )}

    <Input
        type="number"
        label="Saldo real en caja"
        value={closingBalance}
        onChange={...}
        prefix="$"
    />

    {/* Discrepancia */}
    {closingBalance !== '' && (
        <div className={`mt-2 p-2 rounded ${discrepancy === 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
            Discrepancia: ${discrepancy.toFixed(2)}
        </div>
    )}

    <Input label="Notas" value={notes} onChange={...} className="mt-4" />

    <div className="flex gap-2 mt-6">
        <Button variant="default" block onClick={onClose}>Cancelar</Button>
        <Button variant="solid" block loading={isPending} onClick={handleClose}>
            Cerrar Turno
        </Button>
    </div>
</Dialog>
```

### 7.4 Crear `src/views/pos/components/CashMovementDialog.tsx`

Dialog para registrar entradas/salidas de caja:

```tsx
// Campos:
// - type: IN | OUT (toggle con 2 botones)
// - amount (Input number, requerido, > 0)
// - reason (Input, opcional)
//
// Al confirmar → useAddCashMovement().mutateAsync({ shiftId, data })
// Notification de éxito

<Dialog isOpen={isOpen} onClose={onClose} width={400}>
    <h4 className="text-lg font-bold mb-4">Movimiento de Caja</h4>

    <div className="flex gap-2 mb-4">
        <Button variant={type === 'IN' ? 'solid' : 'default'} block
                className={type === 'IN' ? 'bg-emerald-500' : ''}
                onClick={() => setType('IN')}>
            Entrada
        </Button>
        <Button variant={type === 'OUT' ? 'solid' : 'default'} block
                className={type === 'OUT' ? 'bg-red-500' : ''}
                onClick={() => setType('OUT')}>
            Salida
        </Button>
    </div>

    <Input type="number" label="Monto" prefix="$" value={amount} onChange={...} />
    <Input label="Razón" value={reason} onChange={...} className="mt-3" />

    <div className="flex gap-2 mt-6">
        <Button variant="default" block onClick={onClose}>Cancelar</Button>
        <Button variant="solid" block onClick={handleSubmit} loading={isPending}>
            Registrar
        </Button>
    </div>
</Dialog>
```

### 7.5 Conectar todos los diálogos en POSView

Asegurarse de que `POSView.tsx` o `POSLayout.tsx` tenga los estados para controlar la apertura/cierre de cada diálogo:

```tsx
// Opción A: Estados locales en POSLayout
const [paymentOpen, setPaymentOpen] = useState(false)
const [discountOpen, setDiscountOpen] = useState(false)
const [parkedOpen, setParkedOpen] = useState(false)
const [receiptOpen, setReceiptOpen] = useState(false)
const [receiptSaleId, setReceiptSaleId] = useState<number>(0)
const [closeShiftOpen, setCloseShiftOpen] = useState(false)
const [cashMovementOpen, setCashMovementOpen] = useState(false)

// Pasar callbacks a componentes hijos via props o context
```

### Verificación Final Sesión 7
- Navegar desde Dashboard al POS con el botón del header
- Flujo completo: abrir turno → buscar productos → agregar al carrito → cobrar → ver recibo
- Parkear una venta y reanudarla
- Aplicar descuento y verificar totales
- Cerrar turno con reconciliación de caja
- Movimientos de caja (entrada/salida)
- `npm run lint` sin errores
- `npm run build` exitoso
- Dark mode funciona en todas las vistas POS

---

## Resumen de Archivos

### Archivos a Modificar (3)
| Archivo | Cambio |
|---------|--------|
| `src/configs/app.config.ts` | Agregar `posApiHost` |
| `src/configs/routes.config/routes.config.ts` | Agregar ruta `/pos` |
| `src/components/layouts/ModernLayout.tsx` | Agregar botón POS en header |

### Archivos a Crear (17)
| Archivo | Sesión |
|---------|--------|
| `src/services/POSService.ts` | 1 |
| `src/stores/usePOSStore.ts` | 2 |
| `src/hooks/usePOS.ts` | 2 |
| `src/views/pos/POSView.tsx` | 3 |
| `src/views/pos/components/POSLayout.tsx` | 3 |
| `src/views/pos/components/POSHeader.tsx` | 3 |
| `src/views/pos/components/ShiftGuard.tsx` | 3 |
| `src/views/pos/components/ShiftOpenDialog.tsx` | 3 |
| `src/views/pos/components/CategorySidebar.tsx` | 4 |
| `src/views/pos/components/SearchBar.tsx` | 4 |
| `src/views/pos/components/ProductGrid.tsx` | 4 |
| `src/views/pos/components/ProductCard.tsx` | 4 |
| `src/views/pos/components/OrderPanel.tsx` | 5 |
| `src/views/pos/components/OrderItemRow.tsx` | 5 |
| `src/views/pos/components/CustomerSelector.tsx` | 5 |
| `src/views/pos/components/PaymentSummary.tsx` | 5 |
| `src/views/pos/components/ActionButtons.tsx` | 5 |
| `src/views/pos/components/PaymentDialog.tsx` | 6 |
| `src/views/pos/components/DiscountDialog.tsx` | 6 |
| `src/views/pos/components/ParkedSalesDrawer.tsx` | 6 |
| `src/views/pos/components/ReceiptDialog.tsx` | 6 |
| `src/views/pos/components/ShiftCloseDialog.tsx` | 7 |
| `src/views/pos/components/CashMovementDialog.tsx` | 7 |

### Patrones de Referencia
| Patrón | Archivo de referencia |
|--------|----------------------|
| Service class | `src/services/SaleService.ts` |
| React Query hooks | `src/hooks/useProducts.ts` |
| Zustand store | `src/stores/useAuthStore.ts` |
| Dialog usage | Ver componentes en `src/views/inventory/` |
| Card/Badge/Button | `src/components/ui/` |
| Route definition | `src/configs/routes.config/routes.config.ts` |
| Layout header | `src/components/layouts/ModernLayout.tsx` |
