import { describe, it, expect } from 'vitest'
import { lotCreateSchema, lotUpdateSchema } from '../lot.schema'

describe('lotCreateSchema', () => {
    it('accepts valid data', () => {
        const result = lotCreateSchema.safeParse({
            lotNumber: 'LOT-001',
            productId: 1,
            initialQuantity: 100,
        })
        expect(result.success).toBe(true)
    })

    it('rejects empty lotNumber', () => {
        const result = lotCreateSchema.safeParse({
            lotNumber: '',
            productId: 1,
            initialQuantity: 100,
        })
        expect(result.success).toBe(false)
    })

    it('rejects productId < 1', () => {
        const result = lotCreateSchema.safeParse({
            lotNumber: 'LOT',
            productId: 0,
            initialQuantity: 100,
        })
        expect(result.success).toBe(false)
    })

    it('rejects initialQuantity < 1', () => {
        const result = lotCreateSchema.safeParse({
            lotNumber: 'LOT',
            productId: 1,
            initialQuantity: 0,
        })
        expect(result.success).toBe(false)
    })
})

describe('lotUpdateSchema', () => {
    it('accepts valid data', () => {
        const result = lotUpdateSchema.safeParse({ currentQuantity: 50 })
        expect(result.success).toBe(true)
    })

    it('accepts currentQuantity = 0', () => {
        const result = lotUpdateSchema.safeParse({ currentQuantity: 0 })
        expect(result.success).toBe(true)
    })

    it('rejects negative currentQuantity', () => {
        const result = lotUpdateSchema.safeParse({ currentQuantity: -1 })
        expect(result.success).toBe(false)
    })
})
