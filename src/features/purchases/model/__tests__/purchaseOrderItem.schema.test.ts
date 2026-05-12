import { describe, it, expect } from 'vitest'
import {
    purchaseOrderItemCreateSchema,
    purchaseOrderItemUpdateSchema,
} from '../purchaseOrderItem.schema'

describe('purchaseOrderItemCreateSchema', () => {
    it('accepts valid create values', () => {
        const result = purchaseOrderItemCreateSchema.safeParse({
            productId: 5,
            quantityOrdered: 10,
            unitCost: 25.5,
        })
        expect(result.success).toBe(true)
    })

    it('rejects missing productId', () => {
        const result = purchaseOrderItemCreateSchema.safeParse({
            quantityOrdered: 2,
            unitCost: 10,
        })
        expect(result.success).toBe(false)
    })

    it('rejects productId = 0', () => {
        const result = purchaseOrderItemCreateSchema.safeParse({
            productId: 0,
            quantityOrdered: 2,
            unitCost: 10,
        })
        expect(result.success).toBe(false)
    })

    it('rejects quantityOrdered < 1', () => {
        const result = purchaseOrderItemCreateSchema.safeParse({
            productId: 1,
            quantityOrdered: 0,
            unitCost: 10,
        })
        expect(result.success).toBe(false)
    })

    it('accepts unitCost = 0', () => {
        const result = purchaseOrderItemCreateSchema.safeParse({
            productId: 1,
            quantityOrdered: 1,
            unitCost: 0,
        })
        expect(result.success).toBe(true)
    })

    it('rejects negative unitCost', () => {
        const result = purchaseOrderItemCreateSchema.safeParse({
            productId: 1,
            quantityOrdered: 1,
            unitCost: -1,
        })
        expect(result.success).toBe(false)
    })
})

describe('purchaseOrderItemUpdateSchema', () => {
    it('accepts valid update values', () => {
        const result = purchaseOrderItemUpdateSchema.safeParse({
            quantityOrdered: 5,
            unitCost: 12.99,
        })
        expect(result.success).toBe(true)
    })

    it('rejects quantityOrdered < 1', () => {
        const result = purchaseOrderItemUpdateSchema.safeParse({
            quantityOrdered: 0,
            unitCost: 10,
        })
        expect(result.success).toBe(false)
    })

    it('rejects non-integer quantityOrdered', () => {
        const result = purchaseOrderItemUpdateSchema.safeParse({
            quantityOrdered: 1.5,
            unitCost: 10,
        })
        expect(result.success).toBe(false)
    })
})
