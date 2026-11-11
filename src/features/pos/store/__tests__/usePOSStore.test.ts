import { beforeEach, describe, it, expect } from 'vitest'
import {
    getCartDiscountAmount,
    getCartSubtotal,
    getCartTax,
    getCartTotal,
    isPriceOverridden,
    usePOSStore,
    type POSCartItem,
} from '../usePOSStore'

const item = (overrides: Partial<POSCartItem>): POSCartItem => ({
    lineKey: `${overrides.productId ?? 1}:base`,
    productId: 1,
    name: 'Producto',
    sku: 'SKU',
    salePrice: 100,
    listPrice: 100,
    taxCode: 'VAT_15',
    quantity: 1,
    discount: 0,
    unitSymbol: null,
    quantityDecimals: 0,
    presentationId: null,
    presentationName: null,
    unitFactor: 1,
    ...overrides,
})

describe('getCartTax', () => {
    it('applies the rate of each tax code', () => {
        const items = [
            item({ productId: 1, taxCode: 'VAT_15' }),
            item({ productId: 2, taxCode: 'VAT_5', salePrice: 20 }),
        ]
        // 100 × 15% + 20 × 5%
        expect(getCartTax(items, null, 0)).toBeCloseTo(16)
    })

    it('charges no tax for VAT_0, EXEMPT and NOT_TAXED', () => {
        const items = [
            item({ productId: 1, taxCode: 'VAT_0' }),
            item({ productId: 2, taxCode: 'EXEMPT' }),
            item({ productId: 3, taxCode: 'NOT_TAXED' }),
        ]
        expect(getCartTax(items, null, 0)).toBe(0)
    })

    it('computes tax after item and sale discounts', () => {
        const items = [
            item({
                productId: 1,
                taxCode: 'VAT_15',
                quantity: 2,
                discount: 10,
            }),
            item({ productId: 2, taxCode: 'EXEMPT', salePrice: 20 }),
        ]
        // subtotal = 180 + 20 = 200; 10% sale discount → factor 0.9
        // tax = 180 × 0.9 × 15% = 24.3
        expect(getCartTax(items, 'PERCENTAGE', 10)).toBeCloseTo(24.3)
        // total = 200 - 20 + 24.3
        expect(getCartTotal(items, 'PERCENTAGE', 10)).toBeCloseTo(204.3)
    })
})

// Same cases as tests/unit/sales/test_services.py in faclab-core
describe('cart totals match the backend rounding', () => {
    it('keeps lines exact and rounds the sale to cents', () => {
        const items = [item({ salePrice: 0.15, quantity: 3 })]
        // subtotal 0.45, VAT 0.0675 → 0.07
        expect(getCartSubtotal(items)).toBe(0.45)
        expect(getCartTax(items, null, 0)).toBe(0.07)
        expect(getCartTotal(items, null, 0)).toBe(0.52)
    })

    it('rounds a percentage discount and the VAT after it', () => {
        const items = [item({ salePrice: 10 })]
        // discount 0.333 → 0.33; VAT 1.5 × 9.67 / 10 = 1.4505 → 1.45
        expect(getCartDiscountAmount(10, 'PERCENTAGE', 3.33)).toBe(0.33)
        expect(getCartTax(items, 'PERCENTAGE', 3.33)).toBe(1.45)
        expect(getCartTotal(items, 'PERCENTAGE', 3.33)).toBe(11.12)
    })

    it('rounds VAT per tax code', () => {
        const items = [
            item({ productId: 1, salePrice: 0.1, taxCode: 'VAT_5' }),
            item({ productId: 2, salePrice: 0.1, taxCode: 'VAT_15' }),
        ]
        // 0.005 → 0.01 and 0.015 → 0.02
        expect(getCartTax(items, null, 0)).toBe(0.03)
        expect(getCartTotal(items, null, 0)).toBe(0.23)
    })

    it('caps an amount discount at the subtotal', () => {
        const items = [item({ salePrice: 100 })]
        expect(getCartDiscountAmount(100, 'AMOUNT', 500)).toBe(100)
        expect(getCartTotal(items, 'AMOUNT', 500)).toBe(0)
    })
})

describe('price overrides', () => {
    const product = {
        productId: 1,
        name: 'Producto',
        sku: 'SKU',
        salePrice: 10,
        taxCode: 'VAT_15' as const,
    }

    beforeEach(() => {
        usePOSStore.getState().clearCart()
        usePOSStore.getState().addItem(product)
    })

    it('keeps the product price as the list price', () => {
        const [cartItem] = usePOSStore.getState().cartItems
        expect(cartItem.listPrice).toBe(10)
        expect(isPriceOverridden(cartItem)).toBe(false)
    })

    it('stores the reason of another price', () => {
        usePOSStore.getState().updateItemPrice('1:base', 8, 'Empaque dañado')

        const [cartItem] = usePOSStore.getState().cartItems
        expect(cartItem.salePrice).toBe(8)
        expect(cartItem.overrideReason).toBe('Empaque dañado')
        expect(isPriceOverridden(cartItem)).toBe(true)
    })

    it('drops the reason when going back to the list price', () => {
        usePOSStore.getState().updateItemPrice('1:base', 8, 'Empaque dañado')
        usePOSStore.getState().updateItemPrice('1:base', 10, 'Empaque dañado')

        const [cartItem] = usePOSStore.getState().cartItems
        expect(cartItem.overrideReason).toBeUndefined()
        expect(isPriceOverridden(cartItem)).toBe(false)
    })
})

describe('list prices (S5.3)', () => {
    const cement = {
        productId: 3,
        name: 'Cemento',
        sku: 'FERR-003',
        salePrice: 9.5,
        taxCode: 'VAT_15' as const,
    }
    const price = (unitPrice: number | null, quantity = 1) => ({
        lineKey: '3:base',
        quantity,
        unitPrice,
        priceListName: unitPrice === null ? null : 'Mayorista',
    })

    beforeEach(() => {
        usePOSStore.getState().clearCart()
        usePOSStore.getState().addItem(cement)
    })

    it('a line takes the price of its list', () => {
        usePOSStore.getState().applyResolvedPrices([price(8.9)])

        const [line] = usePOSStore.getState().cartItems
        expect([line.salePrice, line.listPrice]).toEqual([8.9, 8.9])
        expect(line.priceListName).toBe('Mayorista')
        expect(isPriceOverridden(line)).toBe(false)
    })

    it('an overridden line keeps its price and reason', () => {
        usePOSStore.getState().updateItemPrice('3:base', 8, 'Saco roto')
        usePOSStore.getState().applyResolvedPrices([price(8.9)])

        const [line] = usePOSStore.getState().cartItems
        expect([line.salePrice, line.listPrice]).toEqual([8, 8.9])
        expect(line.overrideReason).toBe('Saco roto')
    })

    it('an override equal to the new list price is no longer one', () => {
        usePOSStore.getState().updateItemPrice('3:base', 8.9, 'Precio pactado')
        usePOSStore.getState().applyResolvedPrices([price(8.9)])

        const [line] = usePOSStore.getState().cartItems
        expect(line.overrideReason).toBeUndefined()
        expect(isPriceOverridden(line)).toBe(false)
    })

    it('waits for the price of the quantity the line has now', () => {
        usePOSStore.getState().updateItemQuantity('3:base', 60)
        usePOSStore.getState().applyResolvedPrices([price(8.9, 1)])

        const [line] = usePOSStore.getState().cartItems
        expect(line.salePrice).toBe(9.5)
    })

    it('a line without any price keeps the one it has', () => {
        usePOSStore.getState().applyResolvedPrices([price(null)])

        expect(usePOSStore.getState().cartItems[0].salePrice).toBe(9.5)
    })
})

describe('cart lines by presentation (S5.2)', () => {
    const screw = {
        productId: 7,
        name: 'Tornillo 1/2',
        sku: 'TOR-1',
        salePrice: 0.05,
        taxCode: 'VAT_15' as const,
        unitSymbol: 'und',
        quantityDecimals: 0,
    }
    const box = {
        ...screw,
        salePrice: 4.5,
        presentationId: 70,
        presentationName: 'Caja x100',
        unitFactor: 100,
    }

    beforeEach(() => {
        usePOSStore.getState().clearCart()
    })

    it('keeps the unit and the box of a product in two lines', () => {
        const { addItem } = usePOSStore.getState()
        addItem(screw)
        addItem(box)
        addItem(box)

        const lines = usePOSStore.getState().cartItems
        expect(
            lines.map((l) => [l.lineKey, l.quantity, l.salePrice, l.unitFactor])
        ).toEqual([
            ['7:base', 1, 0.05, 1],
            ['7:70', 2, 4.5, 100],
        ])
        expect(getCartSubtotal(lines)).toBe(9.05)
    })

    it('changes and removes only the line it is told', () => {
        const store = usePOSStore.getState()
        store.addItem(screw)
        store.addItem(box)

        store.updateItemQuantity('7:base', 15)
        store.removeItem('7:70')

        const lines = usePOSStore.getState().cartItems
        expect(lines.map((l) => [l.lineKey, l.quantity])).toEqual([
            ['7:base', 15],
        ])
    })
})
