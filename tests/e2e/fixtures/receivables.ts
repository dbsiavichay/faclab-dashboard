import type {
    Aging,
    CustomerAccount,
    Receivable,
} from '@/features/receivables/model/types'

/** Una venta a crédito de la Ferretería El Maestro, vencida hace 10 días */
export const builderReceivable = (
    overrides: Partial<Receivable> = {}
): Receivable => ({
    id: 31,
    customerId: 70,
    customerName: 'Ferretería El Maestro',
    customerTaxId: '1790012345001',
    saleId: 501,
    saleNumber: 'V-001-000501',
    branchId: 1,
    amount: 120,
    balance: 120,
    issuedOn: '2026-10-02',
    dueOn: '2026-11-01',
    termDays: 30,
    status: 'OPEN',
    cancelledAt: null,
    daysOverdue: 10,
    ...overrides,
})

/** El cliente con cupo de 500, que debe 120 vencidos */
export const builderAccount = (
    overrides: Partial<CustomerAccount> = {}
): CustomerAccount => ({
    customerId: 70,
    customerName: 'Ferretería El Maestro',
    customerTaxId: '1790012345001',
    creditLimit: 500,
    paymentTerms: 30,
    hasCredit: true,
    outstanding: 120,
    overdue: 120,
    available: 380,
    receivables: [builderReceivable()],
    ...overrides,
})

const totals = (over: Partial<Aging['totals']> = {}): Aging['totals'] => ({
    notDue: 0,
    days1To30: 0,
    days31To60: 0,
    days61To90: 0,
    over90: 0,
    total: 0,
    ...over,
})

export const emptyAging = (): Aging => ({
    asOf: '2026-11-11',
    customers: [],
    totals: totals(),
})

/** El maestro debe 120 vencidos hace 10 días; otro cliente, 80 por vencer */
export const aging = (): Aging => ({
    asOf: '2026-11-11',
    customers: [
        {
            customerId: 70,
            customerName: 'Ferretería El Maestro',
            customerTaxId: '1790012345001',
            receivables: 1,
            ...totals({ days1To30: 120, total: 120 }),
        },
        {
            customerId: 71,
            customerName: 'Constructora Andina',
            customerTaxId: '1790016919001',
            receivables: 1,
            ...totals({ notDue: 80, total: 80 }),
        },
    ],
    totals: totals({ notDue: 80, days1To30: 120, total: 200 }),
})
