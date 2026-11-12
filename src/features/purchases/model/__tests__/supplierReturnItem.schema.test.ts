import { describe, expect, it } from 'vitest'
import {
    returnableOf,
    supplierReturnItemSchema,
} from '../supplierReturnItem.schema'
import type { PurchaseOrderItem, SupplierReturnItem } from '../types'

const orderItem: PurchaseOrderItem = {
    id: 7,
    purchaseOrderId: 1,
    productId: 5,
    quantityOrdered: 10,
    quantityReceived: 10,
    quantityReturned: 4,
    unitCost: 2.5,
    taxCode: 'VAT_15',
}

const line = (id: number, quantity: number): SupplierReturnItem => ({
    id,
    supplierReturnId: 3,
    purchaseOrderItemId: 7,
    productId: 5,
    unitFactor: 1,
    quantity,
    baseQuantity: quantity,
    unitCost: 2.5,
    taxCode: 'VAT_15',
    subtotal: quantity * 2.5,
    taxAmount: quantity * 0.375,
    locationId: null,
})

describe('returnableOf', () => {
    it('is what was received minus what was returned and what the draft takes', () => {
        expect(returnableOf(orderItem, [])).toBe(6)
        expect(returnableOf(orderItem, [line(1, 5)])).toBe(1)
        // The line being edited doesn't count against itself
        expect(returnableOf(orderItem, [line(1, 5)], 1)).toBe(6)
    })
})

describe('supplierReturnItemSchema', () => {
    const schema = supplierReturnItemSchema({ 7: 6 })

    it('takes at most what the order line can still give back', () => {
        const valid = { purchaseOrderItemId: 7, quantity: 6, locationId: null }
        expect(schema.safeParse(valid).success).toBe(true)

        const over = schema.safeParse({ ...valid, quantity: 6.5 })
        expect(over.success).toBe(false)
        if (!over.success) {
            expect(over.error.issues[0].path).toEqual(['quantity'])
            expect(over.error.issues[0].message).toContain('Máximo 6')
        }
    })

    it('needs an order line and a positive quantity', () => {
        expect(
            schema.safeParse({
                purchaseOrderItemId: 0,
                quantity: 1,
                locationId: null,
            }).success
        ).toBe(false)
        expect(
            schema.safeParse({
                purchaseOrderItemId: 7,
                quantity: 0,
                locationId: 2,
            }).success
        ).toBe(false)
    })
})
