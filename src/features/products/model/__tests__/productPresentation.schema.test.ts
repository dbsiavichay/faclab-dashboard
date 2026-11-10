import { describe, it, expect } from 'vitest'
import { productPresentationSchema } from '../productPresentation.schema'

describe('productPresentationSchema (S5.2)', () => {
    const box = { name: 'Caja x100', factor: 100, isActive: true }

    it('accepts a box with its barcode and price', () => {
        const result = productPresentationSchema.safeParse({
            ...box,
            barcode: '7861000001001',
            salePrice: 4.5,
        })
        expect(result.success).toBe(true)
    })

    it('leaves the price to factor × the product without one', () => {
        expect(productPresentationSchema.safeParse(box).success).toBe(true)
    })

    it.each([0, -1])('rejects a factor of %s', (factor) => {
        const result = productPresentationSchema.safeParse({ ...box, factor })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['factor'])
    })

    it('takes a decimal factor: a roll of 50,5 m', () => {
        const result = productPresentationSchema.safeParse({
            ...box,
            name: 'Rollo',
            factor: 50.5,
        })
        expect(result.success).toBe(true)
    })

    it('requires a name', () => {
        const result = productPresentationSchema.safeParse({
            ...box,
            name: ' ',
        })
        expect(result.success).toBe(false)
    })
})
