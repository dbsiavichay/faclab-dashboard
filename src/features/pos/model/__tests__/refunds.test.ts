import { describe, expect, it } from 'vitest'
import {
    invoicedToFinalConsumer,
    refundedQuantities,
    saleHasInvoice,
} from '../refunds'

describe('saleHasInvoice', () => {
    it('counts an authorized invoice and one on its way', () => {
        expect(saleHasInvoice({ status: 'INVOICED' })).toBe(true)
        expect(
            saleHasInvoice({ status: 'CONFIRMED', invoiceStatus: 'PENDING' })
        ).toBe(true)
    })

    it('does not count a rejected invoice, nor one never sent', () => {
        expect(
            saleHasInvoice({ status: 'CONFIRMED', invoiceStatus: 'REJECTED' })
        ).toBe(false)
        expect(
            saleHasInvoice({ status: 'CONFIRMED', invoiceStatus: null })
        ).toBe(false)
    })
})

describe('invoicedToFinalConsumer', () => {
    it('blocks a sale without a customer with an invoice, also on its way', () => {
        expect(
            invoicedToFinalConsumer({ status: 'INVOICED', customerId: null })
        ).toBe(true)
        expect(
            invoicedToFinalConsumer({
                status: 'CONFIRMED',
                invoiceStatus: 'PENDING',
                customerId: null,
            })
        ).toBe(true)
    })

    it('lets through a sale with a customer, and one without an invoice', () => {
        expect(
            invoicedToFinalConsumer({ status: 'INVOICED', customerId: 5 })
        ).toBe(false)
        expect(
            invoicedToFinalConsumer({
                status: 'CONFIRMED',
                invoiceStatus: 'REJECTED',
                customerId: null,
            })
        ).toBe(false)
    })
})

describe('refundedQuantities', () => {
    it('adds up what was refunded of each item, without the cancelled ones', () => {
        const refunded = refundedQuantities([
            {
                status: 'COMPLETED',
                items: [
                    { originalSaleItemId: 10, quantity: 1 },
                    { originalSaleItemId: 11, quantity: 2 },
                ],
            },
            {
                status: 'PENDING',
                items: [{ originalSaleItemId: 10, quantity: 2 }],
            },
            {
                status: 'CANCELLED',
                items: [{ originalSaleItemId: 10, quantity: 5 }],
            },
        ])

        expect(refunded.get(10)).toBe(3)
        expect(refunded.get(11)).toBe(2)
    })
})
