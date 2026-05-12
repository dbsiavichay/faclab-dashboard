import { describe, it, expect } from 'vitest'
import { purchaseOrderSchema } from '../purchaseOrder.schema'

describe('purchaseOrderSchema', () => {
    it('accepts valid values', () => {
        const result = purchaseOrderSchema.safeParse({
            supplierId: 1,
            notes: 'Urgente',
            expectedDate: '2025-06-01',
        })
        expect(result.success).toBe(true)
    })

    it('accepts minimal values (only supplierId)', () => {
        const result = purchaseOrderSchema.safeParse({ supplierId: 3 })
        expect(result.success).toBe(true)
    })

    it('rejects missing supplierId', () => {
        const result = purchaseOrderSchema.safeParse({ notes: 'Sin proveedor' })
        expect(result.success).toBe(false)
    })

    it('rejects supplierId = 0', () => {
        const result = purchaseOrderSchema.safeParse({ supplierId: 0 })
        expect(result.success).toBe(false)
    })

    it('rejects negative supplierId', () => {
        const result = purchaseOrderSchema.safeParse({ supplierId: -1 })
        expect(result.success).toBe(false)
    })

    it('rejects non-integer supplierId', () => {
        const result = purchaseOrderSchema.safeParse({ supplierId: 1.5 })
        expect(result.success).toBe(false)
    })
})
