import type {
    PurchaseOrder,
    PurchaseOrderItem,
    SupplierReturn,
    SupplierReturnItem,
} from '@/features/purchases/model/types'
import type { Payable, SupplierAccount } from '@/features/payables/model/types'

/** An order of 10 at 6.00 with 15 % VAT, fully received (S5.7) */
export const receivedOrder = (
    overrides: Partial<PurchaseOrder> = {}
): PurchaseOrder => ({
    id: 1,
    supplierId: 10,
    supplierName: 'Distribuidora Andina',
    orderNumber: 'PO-2026-0001',
    status: 'received',
    subtotal: 60,
    tax: 9,
    total: 69,
    taxes: [{ taxCode: 'VAT_15', rate: 15, base: 60, tax: 9 }],
    notes: null,
    expectedDate: null,
    createdAt: '2026-11-10T10:00:00',
    updatedAt: '2026-11-11T10:00:00',
    ...overrides,
})

export const receivedItem = (
    overrides: Partial<PurchaseOrderItem> = {}
): PurchaseOrderItem => ({
    id: 7,
    purchaseOrderId: 1,
    productId: 5,
    productName: 'Tornillo 1/2',
    productSku: 'TOR-12',
    quantityOrdered: 10,
    quantityReceived: 10,
    quantityReturned: 0,
    unitCost: 6,
    taxCode: 'VAT_15',
    subtotal: 60,
    taxAmount: 9,
    presentationId: null,
    presentationName: null,
    unitFactor: 1,
    ...overrides,
})

export const draftReturn = (
    overrides: Partial<SupplierReturn> = {}
): SupplierReturn => ({
    id: 3,
    number: 'DP-2026-0001',
    supplierId: 10,
    supplierName: 'Distribuidora Andina',
    purchaseOrderId: 1,
    orderNumber: 'PO-2026-0001',
    status: 'draft',
    notes: null,
    supplierCreditNoteNumber: null,
    subtotal: 24,
    tax: 3.6,
    total: 27.6,
    creditedAmount: 0,
    refundDue: 27.6,
    taxes: [{ taxCode: 'VAT_15', rate: 15, base: 24, tax: 3.6 }],
    confirmedAt: null,
    confirmedBy: null,
    createdAt: '2026-11-12T09:00:00',
    updatedAt: '2026-11-12T09:00:00',
    ...overrides,
})

export const returnLine = (
    overrides: Partial<SupplierReturnItem> = {}
): SupplierReturnItem => ({
    id: 20,
    supplierReturnId: 3,
    purchaseOrderItemId: 7,
    productId: 5,
    productName: 'Tornillo 1/2',
    productSku: 'TOR-12',
    presentationId: null,
    presentationName: null,
    unitFactor: 1,
    quantity: 4,
    baseQuantity: 4,
    unitCost: 6,
    taxCode: 'VAT_15',
    subtotal: 24,
    taxAmount: 3.6,
    locationId: null,
    ...overrides,
})

/** What is owed for the receipt of the order above, due in 30 days */
export const openPayable = (overrides: Partial<Payable> = {}): Payable => ({
    id: 4,
    supplierId: 10,
    supplierName: 'Distribuidora Andina',
    supplierTaxId: '0990000000001',
    purchaseOrderId: 1,
    orderNumber: 'PO-2026-0001',
    purchaseReceiptId: 2,
    supplierInvoiceNumber: '001-001-000000123',
    amount: 69,
    balance: 69,
    issuedOn: '2026-11-11',
    dueOn: '2026-12-11',
    termDays: 30,
    status: 'OPEN',
    daysOverdue: 0,
    createdAt: '2026-11-11T10:00:00',
    ...overrides,
})

export const supplierAccount = (
    overrides: Partial<SupplierAccount> = {}
): SupplierAccount => ({
    supplierId: 10,
    supplierName: 'Distribuidora Andina',
    supplierTaxId: '0990000000001',
    paymentTerms: 30,
    outstanding: 69,
    overdue: 0,
    payables: [openPayable()],
    payments: [],
    returns: [],
    ...overrides,
})
