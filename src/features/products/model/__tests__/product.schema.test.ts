import { describe, it, expect } from 'vitest'
import { productSchema } from '../product.schema'

describe('productSchema', () => {
    it('accepts valid minimal data', () => {
        const result = productSchema.safeParse({
            name: 'Producto X',
            sku: 'SKU-001',
        })
        expect(result.success).toBe(true)
    })

    it('accepts full valid data', () => {
        const result = productSchema.safeParse({
            name: 'Producto Completo',
            sku: 'SKU-FULL',
            description: 'desc',
            barcode: '7501234567890',
            categoryId: 1,
            unitOfMeasureId: 2,
            purchasePrice: 10.5,
            salePrice: 20.99,
            isActive: true,
            isService: false,
            minStock: 5,
            maxStock: 100,
            reorderPoint: 10,
            leadTimeDays: 7,
        })
        expect(result.success).toBe(true)
    })

    it('rejects empty name', () => {
        const result = productSchema.safeParse({ name: '', sku: 'SKU' })
        expect(result.success).toBe(false)
    })

    it('rejects empty sku', () => {
        const result = productSchema.safeParse({ name: 'X', sku: '' })
        expect(result.success).toBe(false)
    })

    it('rejects negative purchasePrice', () => {
        const result = productSchema.safeParse({
            name: 'X',
            sku: 'SKU',
            purchasePrice: -1,
        })
        expect(result.success).toBe(false)
    })

    it('rejects non-integer minStock', () => {
        const result = productSchema.safeParse({
            name: 'X',
            sku: 'SKU',
            minStock: 1.5,
        })
        expect(result.success).toBe(false)
    })
})
