import { describe, expect, it } from 'vitest'
import {
    priceListItemCreateSchema,
    priceListItemUpdateSchema,
    priceListSchema,
} from '../priceList.schema'
import { validityLabel } from '../validity'

describe('priceListSchema', () => {
    const valid = {
        name: 'Mayorista',
        description: '',
        isActive: true,
        validFrom: '',
        validTo: '',
    }

    it('takes a name and optional validity dates', () => {
        expect(priceListSchema.safeParse(valid).success).toBe(true)
        expect(
            priceListSchema.safeParse({
                ...valid,
                validFrom: '2026-11-01',
                validTo: '2026-11-30',
            }).success
        ).toBe(true)
        expect(priceListSchema.safeParse({ ...valid, name: ' ' }).success).toBe(
            false
        )
    })

    it("can't end before it starts", () => {
        const result = priceListSchema.safeParse({
            ...valid,
            validFrom: '2026-12-01',
            validTo: '2026-11-01',
        })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].path).toEqual(['validTo'])
    })
})

describe('price list items', () => {
    it('take a product, a price and a quantity from which they apply', () => {
        expect(
            priceListItemCreateSchema.safeParse({
                productId: 3,
                presentationId: null,
                price: 8.9,
                minQuantity: 0,
            }).success
        ).toBe(true)
        expect(
            priceListItemCreateSchema.safeParse({
                productId: 0,
                presentationId: null,
                price: 8.9,
                minQuantity: 0,
            }).success
        ).toBe(false)
    })

    it('reject a negative price or quantity', () => {
        expect(
            priceListItemUpdateSchema.safeParse({ price: -1, minQuantity: 0 })
                .success
        ).toBe(false)
        expect(
            priceListItemUpdateSchema.safeParse({ price: 1, minQuantity: -1 })
                .success
        ).toBe(false)
        expect(
            priceListItemUpdateSchema.safeParse({ price: 1, minQuantity: 2.5 })
                .success
        ).toBe(true)
    })
})

describe('validityLabel', () => {
    it('reads the days as local dates', () => {
        expect(validityLabel({ validFrom: null, validTo: null })).toBe(
            'Siempre'
        )
        expect(
            validityLabel({ validFrom: '2026-11-01', validTo: null })
        ).toContain('1/11/2026')
    })
})
