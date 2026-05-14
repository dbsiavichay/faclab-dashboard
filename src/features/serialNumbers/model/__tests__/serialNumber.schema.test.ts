import { describe, it, expect } from 'vitest'
import { serialNumberSchema } from '../serialNumber.schema'
import { serialStatusChangeSchema } from '../serialStatusChange.schema'

describe('serialNumberSchema', () => {
    it('accepts valid data', () => {
        const result = serialNumberSchema.safeParse({
            serialNumber: 'SN-001',
            productId: 1,
        })
        expect(result.success).toBe(true)
    })

    it('rejects empty serialNumber', () => {
        const result = serialNumberSchema.safeParse({
            serialNumber: '',
            productId: 1,
        })
        expect(result.success).toBe(false)
    })

    it('rejects productId < 1', () => {
        const result = serialNumberSchema.safeParse({
            serialNumber: 'SN',
            productId: 0,
        })
        expect(result.success).toBe(false)
    })

    it('accepts optional lotId', () => {
        const result = serialNumberSchema.safeParse({
            serialNumber: 'SN',
            productId: 1,
            lotId: 5,
        })
        expect(result.success).toBe(true)
    })
})

describe('serialStatusChangeSchema', () => {
    it('accepts valid status', () => {
        const result = serialStatusChangeSchema.safeParse({ status: 'sold' })
        expect(result.success).toBe(true)
    })

    it('rejects empty status', () => {
        const result = serialStatusChangeSchema.safeParse({ status: '' })
        expect(result.success).toBe(false)
    })
})
