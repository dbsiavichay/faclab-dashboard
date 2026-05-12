import { describe, it, expect } from 'vitest'
import { receiveFormSchema } from '../receivePurchaseOrder.schema'

const baseItem = {
    purchaseOrderItemId: 1,
    productId: 5,
    quantityOrdered: 10,
    quantityReceived: 0,
    quantityPending: 10,
    quantityToReceive: 0,
    locationId: null,
    lotNumber: '',
    serialNumbers: '',
}

describe('receiveFormSchema', () => {
    it('accepts a valid form with at least one item to receive', () => {
        const result = receiveFormSchema.safeParse({
            items: [{ ...baseItem, quantityToReceive: 5 }],
            notes: '',
            receivedAt: '',
        })
        expect(result.success).toBe(true)
    })

    it('rejects when no item has quantityToReceive > 0', () => {
        const result = receiveFormSchema.safeParse({
            items: [{ ...baseItem, quantityToReceive: 0 }],
            notes: '',
            receivedAt: '',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
            const paths = result.error.issues.map((i) => i.path.join('.'))
            expect(paths).toContain('items')
        }
    })

    it('rejects when quantityToReceive exceeds quantityPending', () => {
        const result = receiveFormSchema.safeParse({
            items: [{ ...baseItem, quantityPending: 3, quantityToReceive: 5 }],
            notes: '',
            receivedAt: '',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
            const hasExceedError = result.error.issues.some(
                (i) => i.message === 'Excede pendiente'
            )
            expect(hasExceedError).toBe(true)
        }
    })

    it('rejects negative quantityToReceive', () => {
        const result = receiveFormSchema.safeParse({
            items: [{ ...baseItem, quantityToReceive: -1 }],
            notes: '',
            receivedAt: '',
        })
        expect(result.success).toBe(false)
    })

    it('accepts optional notes and receivedAt as empty strings', () => {
        const result = receiveFormSchema.safeParse({
            items: [{ ...baseItem, quantityToReceive: 2 }],
            notes: '',
            receivedAt: '',
        })
        expect(result.success).toBe(true)
    })
})
