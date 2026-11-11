import { describe, expect, it } from 'vitest'
import type { POSProduct, PosQuote, PosQuoteItem } from '../../model/types'
import {
    changedPriceLines,
    quoteCartLines,
    quoteReason,
    shortLines,
} from '../quoteCart'

const CEMENT: POSProduct = {
    id: 100,
    name: 'Cemento',
    sku: 'FERR-003',
    barcode: null,
    categoryId: null,
    salePrice: 9.5,
    taxCode: 'VAT_15',
    isActive: true,
    image: null,
    unitSymbol: 'saco',
    quantityDecimals: 0,
    presentations: [
        {
            id: 10,
            productId: 100,
            name: 'Saco',
            factor: 1,
            barcode: null,
            salePrice: null,
            purchasePrice: null,
            isBase: true,
            isActive: true,
            effectiveSalePrice: 9.5,
            effectivePurchasePrice: null,
            quantityDecimals: 0,
        },
        {
            id: 11,
            productId: 100,
            name: 'Pallet x40',
            factor: 40,
            barcode: null,
            salePrice: 360,
            purchasePrice: null,
            isBase: false,
            isActive: true,
            effectiveSalePrice: 360,
            effectivePurchasePrice: null,
            quantityDecimals: 0,
        },
    ],
}

const line = (overrides: Partial<PosQuoteItem>): PosQuoteItem => ({
    id: 1,
    quoteId: 7,
    productId: 100,
    productName: 'Cemento',
    productSku: 'FERR-003',
    presentationId: 10,
    presentationName: 'Saco',
    quantity: 10,
    unitFactor: 1,
    baseQuantity: 10,
    unitPrice: 8.9,
    discount: 0,
    taxCode: 'VAT_15',
    taxAmount: 13.35,
    subtotal: 89,
    listPrice: 8.9,
    priceListName: 'Mayorista',
    priceChanged: false,
    availableQuantity: 100,
    enoughStock: true,
    ...overrides,
})

const quote = (items: PosQuoteItem[]): PosQuote => ({
    id: 7,
    number: 'COT-001-000007',
    branchId: 1,
    branchName: 'Matriz',
    establishmentCode: '001',
    customerId: 6,
    customerName: 'Constructora Andes',
    customerTaxId: '1790012345001',
    customerEmail: null,
    status: 'ACCEPTED',
    issueDate: '2026-11-01',
    validUntil: '2026-11-30',
    subtotal: 89,
    tax: 13.35,
    total: 102.35,
    notes: null,
    createdBy: 'Ana',
    sentAt: null,
    acceptedAt: null,
    convertedAt: null,
    saleId: null,
    saleNumber: null,
    expired: false,
    items,
})

const products = new Map([[CEMENT.id, CEMENT]])

describe('quoteCartLines', () => {
    it('puts each line in its presentation with its quantity and discount', () => {
        const [bags, pallet] = quoteCartLines(
            quote([
                line({ discount: 5 }),
                line({
                    id: 2,
                    presentationId: 11,
                    presentationName: 'Pallet x40',
                    quantity: 2,
                    unitFactor: 40,
                    unitPrice: 340,
                    listPrice: 340,
                }),
            ]),
            products,
            'current'
        )

        // The base unit goes without a presentation, as the cart sells it
        expect(bags).toMatchObject({
            lineKey: '100:base',
            presentationId: null,
            quantity: 10,
            discount: 5,
            salePrice: 8.9,
            listPrice: 8.9,
            overrideReason: undefined,
        })
        expect(pallet).toMatchObject({
            lineKey: '100:11',
            presentationId: 11,
            unitFactor: 40,
            quantity: 2,
            salePrice: 340,
        })
    })

    it('keeps a changed price as quoted, with the quote as its reason', () => {
        const [cartLine] = quoteCartLines(
            quote([line({ listPrice: 9.2, priceChanged: true })]),
            products,
            'quoted'
        )

        expect(cartLine).toMatchObject({
            salePrice: 8.9,
            listPrice: 9.2,
            overrideReason: 'Cotización COT-001-000007',
        })
    })

    it("charges today's price when the cashier chooses it", () => {
        const [cartLine] = quoteCartLines(
            quote([line({ listPrice: 9.2, priceChanged: true })]),
            products,
            'current'
        )

        expect(cartLine.salePrice).toBe(9.2)
        expect(cartLine.overrideReason).toBeUndefined()
    })

    it('keeps two lines of the same presentation apart', () => {
        const lines = quoteCartLines(
            quote([line({}), line({ id: 2, discount: 10 })]),
            products,
            'current'
        )

        expect(lines.map((l) => l.lineKey)).toEqual(['100:base', '100:base#1'])
    })
})

describe('quote checks', () => {
    it('finds the changed prices and the lines without stock', () => {
        const q = quote([
            line({ priceChanged: true }),
            line({ id: 2, enoughStock: false }),
        ])

        expect(changedPriceLines(q).map((i) => i.id)).toEqual([1])
        expect(shortLines(q).map((i) => i.id)).toEqual([2])
        expect(quoteReason(q)).toBe('Cotización COT-001-000007')
    })
})
