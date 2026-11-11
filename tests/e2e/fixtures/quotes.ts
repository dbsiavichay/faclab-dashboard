import type { Customer } from '@/features/customers/model/types'
import type { Product } from '@/features/products/model/types'
import type {
    Quote,
    QuoteInput,
    QuoteItem,
    QuoteItemInput,
} from '@/features/quotes/model/types'
import type { PosQuote, PosQuoteItem } from '@/features/pos/model/types'
import {
    ADMIN,
    POS,
    created,
    file,
    ok,
    paginated,
    type MockApi,
} from '../support/mockApi'
import { mockCatalog } from './catalog'
import { builder, posProducts } from './pos'

const day = (offset: number): string => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
    )}`
}

export const TODAY = day(0)
export const IN_TWO_WEEKS = day(15)

export const buildQuote = (overrides: Partial<Quote> = {}): Quote => ({
    id: 1,
    number: 'COT-001-000001',
    branchId: 1,
    branchName: 'Matriz',
    establishmentCode: '001',
    customerId: null,
    customerName: null,
    customerTaxId: null,
    customerEmail: null,
    status: 'DRAFT',
    issueDate: TODAY,
    validUntil: IN_TWO_WEEKS,
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: null,
    createdBy: 'admin',
    sentAt: null,
    acceptedAt: null,
    convertedAt: null,
    items: [],
    saleId: null,
    saleNumber: null,
    ...overrides,
})

export const ANDES: Customer = {
    id: 6,
    name: 'Constructora Andes',
    taxId: '1790012345001',
    taxType: 1,
    email: 'compras@andes.ec',
    isActive: true,
}

const withTotals = (quote: Quote): Quote => {
    const subtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = Math.round(subtotal * 15) / 100
    return { ...quote, subtotal, tax, total: subtotal + tax }
}

/**
 * Cotizaciones del admin con estado en memoria, sobre el catálogo (el selector
 * de producto lo busca ahí). Los ítems toman el precio del producto, como la
 * lista general sin escalas.
 */
export const mockQuotes = (api: MockApi, seed: Quote[] = []) => {
    const products: Product[] = mockCatalog(api)
    const quotes = [...seed]
    const find = (id: string) => quotes.find((q) => q.id === Number(id))!
    const replace = (quote: Quote) => {
        quotes.splice(quotes.indexOf(find(String(quote.id))), 1, quote)
        return ok(quote)
    }

    api.get(`${ADMIN}/products/:id`, ({ params }) =>
        ok(products.find((p) => p.id === Number(params.id)))
    )
    api.get(`${ADMIN}/customers`, ({ query }) => paginated([ANDES], query))
    api.get(`${ADMIN}/customers/:id`, () => ok(ANDES))
    api.get(`${ADMIN}/quotes`, ({ query }) => paginated(quotes, query))
    api.get(`${ADMIN}/quotes/:id`, ({ params }) => ok(find(params.id)))
    api.post(`${ADMIN}/quotes`, ({ body }) => {
        const input = body as QuoteInput
        const quote = buildQuote({
            id: quotes.length + 1,
            number: `COT-001-${String(quotes.length + 1).padStart(6, '0')}`,
            customerId: input.customerId,
            customerName: input.customerId ? ANDES.name : null,
            customerEmail: input.customerId ? ANDES.email : null,
            validUntil: input.validUntil,
            notes: input.notes,
        })
        quotes.push(quote)
        return created(quote)
    })
    api.post(`${ADMIN}/quotes/:id/items`, ({ params, body }) => {
        const input = body as QuoteItemInput
        const quote = find(params.id)
        const product = products.find((p) => p.id === input.productId)!
        const unitPrice = product.salePrice ?? 0
        const subtotal = unitPrice * input.quantity * (1 - input.discount / 100)
        const item: QuoteItem = {
            id: quote.items.length + 1,
            quoteId: quote.id,
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            presentationId: product.id * 100,
            presentationName: 'Unidad',
            quantity: input.quantity,
            unitFactor: 1,
            baseQuantity: input.quantity,
            unitPrice,
            discount: input.discount,
            taxCode: 'VAT_15',
            taxAmount: subtotal * 0.15,
            subtotal,
        }
        return replace(withTotals({ ...quote, items: [...quote.items, item] }))
    })
    api.post(`${ADMIN}/quotes/:id/send`, ({ params }) =>
        replace({ ...find(params.id), status: 'SENT' })
    )
    api.post(`${ADMIN}/quotes/:id/accept`, ({ params }) =>
        replace({ ...find(params.id), status: 'ACCEPTED' })
    )
    api.post(`${ADMIN}/quotes/:id/email`, ({ params }) => {
        const quote = find(params.id)
        return replace({
            ...quote,
            status: quote.status === 'DRAFT' ? 'SENT' : quote.status,
        })
    })
    api.post(`${ADMIN}/quotes/:id/renew`, ({ params, body }) =>
        replace({
            ...find(params.id),
            status: 'DRAFT',
            issueDate: TODAY,
            validUntil: (body as { validUntil: string }).validUntil,
        })
    )
    api.get(`${ADMIN}/quotes/:id/pdf`, () =>
        file('%PDF-1.4 cotización', 'application/pdf')
    )
    return quotes
}

/** Una línea de la cotización vista desde el POS */
export const posQuoteItem = (
    overrides: Partial<PosQuoteItem> = {}
): PosQuoteItem => ({
    id: 1,
    quoteId: 7,
    productId: 1,
    productName: 'Tablero MDF 15mm',
    productSku: 'TAB-MDF-15',
    presentationId: null,
    presentationName: null,
    quantity: 2,
    unitFactor: 1,
    baseQuantity: 2,
    unitPrice: 10,
    discount: 0,
    taxCode: 'VAT_15',
    taxAmount: 3,
    subtotal: 20,
    listPrice: 10,
    priceListName: null,
    priceChanged: false,
    availableQuantity: 50,
    enoughStock: true,
    ...overrides,
})

/** La cotización del maestro de la lista mayorista, aceptada, por cobrar */
export const posQuote = (overrides: Partial<PosQuote> = {}): PosQuote => {
    const { items: _items, ...summary } = buildQuote({
        id: 7,
        number: 'COT-001-000007',
        customerId: builder().id,
        customerName: builder().name,
        status: 'ACCEPTED',
        subtotal: 20,
        tax: 3,
        total: 23,
    })
    return { ...summary, items: [posQuoteItem()], expired: false, ...overrides }
}

/** Las cotizaciones vigentes del POS y sus productos (S5.4) */
export const mockPosQuotes = (api: MockApi, quote: PosQuote = posQuote()) => {
    api.get(`${POS}/quotes`, ({ query }) => paginated([quote], query))
    api.get(`${POS}/quotes/:id`, () => ok(quote))
    api.get(`${POS}/products/:id`, ({ params }) =>
        ok(posProducts().find((p) => p.id === Number(params.id)))
    )
}
