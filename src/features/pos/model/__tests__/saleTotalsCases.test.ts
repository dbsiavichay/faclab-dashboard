import { describe, expect, it } from 'vitest'
import type { TaxCode } from '@/constants/tax.constant'
import {
    getCartDiscountAmount,
    getCartSubtotal,
    getCartTax,
    getCartTotal,
    type POSCartItem,
} from '../../store/usePOSStore'
import shared from './sale-totals.cases.json'

/*
 * Los mismos casos que faclab-core recorre en tests/unit/sales/test_totals_cases.py
 * (S5.1): el carrito y el core calculan los mismos totales, al centavo, con
 * cantidades decimales. Las dos copias de sale-totals.cases.json son idénticas.
 */

interface SharedCase {
    name: string
    items: {
        quantity: string
        unitPrice: string
        discount: string
        taxCode: string
    }[]
    discount: { type: 'PERCENTAGE' | 'AMOUNT'; value: string } | null
    expected: { subtotal: string; discount: string; tax: string; total: string }
}

const cases = (shared as { cases: SharedCase[] }).cases

const cart = (c: SharedCase): POSCartItem[] =>
    c.items.map((line, index) => ({
        lineKey: `${index + 1}:base`,
        productId: index + 1,
        name: `Producto ${index + 1}`,
        sku: `SKU-${index + 1}`,
        salePrice: Number(line.unitPrice),
        listPrice: Number(line.unitPrice),
        taxCode: line.taxCode as TaxCode,
        quantity: Number(line.quantity),
        discount: Number(line.discount),
        unitSymbol: null,
        quantityDecimals: 6,
        presentationId: null,
        presentationName: null,
        unitFactor: 1,
    }))

describe('cart totals shared with faclab-core', () => {
    it('has cases with decimal quantities', () => {
        expect(
            cases.some((c) =>
                c.items.some((line) => !Number.isInteger(Number(line.quantity)))
            )
        ).toBe(true)
    })

    it.each(cases.map((c) => [c.name, c] as const))('%s', (_name, c) => {
        const items = cart(c)
        const type = c.discount?.type ?? null
        const value = Number(c.discount?.value ?? 0)
        const subtotal = getCartSubtotal(items)

        expect({
            subtotal,
            discount: getCartDiscountAmount(subtotal, type, value),
            tax: getCartTax(items, type, value),
            total: getCartTotal(items, type, value),
        }).toEqual({
            subtotal: Number(c.expected.subtotal),
            discount: Number(c.expected.discount),
            tax: Number(c.expected.tax),
            total: Number(c.expected.total),
        })
    })
})
