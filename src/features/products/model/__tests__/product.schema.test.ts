import { describe, it, expect } from 'vitest'
import { productSchema } from '../product.schema'

describe('productSchema', () => {
    const material = {
        name: 'Cemento 50 kg',
        sku: 'CEM-50',
        constructionMaterialCode: 'F010401',
    }

    it('accepts a construction material at its rate', () => {
        const result = productSchema.safeParse({
            ...material,
            taxCode: 'VAT_5',
        })
        expect(result.success).toBe(true)
    })

    it('marks the VAT of a construction material at another rate', () => {
        const result = productSchema.safeParse({
            ...material,
            taxCode: 'VAT_15',
        })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0]).toMatchObject({
            path: ['taxCode'],
            message: 'Un material de construcción lleva IVA 5%',
        })
    })

    it('rejects a code outside the catalog', () => {
        const result = productSchema.safeParse({
            ...material,
            taxCode: 'VAT_5',
            constructionMaterialCode: 'CEMENTO',
        })
        expect(result.success).toBe(false)
    })

    it.each([null, undefined])(
        'leaves the VAT free without a code (%s)',
        (constructionMaterialCode) => {
            const result = productSchema.safeParse({
                ...material,
                taxCode: 'VAT_15',
                constructionMaterialCode,
            })
            expect(result.success).toBe(true)
        }
    )

    it('accepts valid minimal data', () => {
        const result = productSchema.safeParse({
            name: 'Producto X',
            sku: 'SKU-001',
            taxCode: 'VAT_15',
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
            taxCode: 'EXEMPT',
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
        const result = productSchema.safeParse({
            name: '',
            sku: 'SKU',
            taxCode: 'VAT_15',
        })
        expect(result.success).toBe(false)
    })

    it('rejects empty sku', () => {
        const result = productSchema.safeParse({
            name: 'X',
            sku: '',
            taxCode: 'VAT_15',
        })
        expect(result.success).toBe(false)
    })

    it('rejects negative purchasePrice', () => {
        const result = productSchema.safeParse({
            name: 'X',
            sku: 'SKU',
            taxCode: 'VAT_15',
            purchasePrice: -1,
        })
        expect(result.success).toBe(false)
    })

    // S5.1: thresholds take the decimals of the product's unit
    it('accepts a decimal minStock', () => {
        const result = productSchema.safeParse({
            name: 'X',
            sku: 'SKU',
            taxCode: 'VAT_15',
            minStock: 1.5,
        })
        expect(result.success).toBe(true)
    })

    it('rejects a negative minStock', () => {
        const result = productSchema.safeParse({
            name: 'X',
            sku: 'SKU',
            taxCode: 'VAT_15',
            minStock: -1,
        })
        expect(result.success).toBe(false)
    })

    it('rejects missing taxCode', () => {
        const result = productSchema.safeParse({ name: 'X', sku: 'SKU' })
        expect(result.success).toBe(false)
    })

    it('rejects unknown taxCode', () => {
        const result = productSchema.safeParse({
            name: 'X',
            sku: 'SKU',
            taxCode: 'VAT_16',
        })
        expect(result.success).toBe(false)
    })
})
