import { describe, it, expect } from 'vitest'
import { unitOfMeasureSchema } from '../unitOfMeasure.schema'

describe('unitOfMeasureSchema', () => {
    it('accepts valid data', () => {
        const result = unitOfMeasureSchema.safeParse({
            name: 'Kilogramo',
            symbol: 'kg',
            description: 'Unidad de masa',
            isActive: true,
            decimals: 3,
        })
        expect(result.success).toBe(true)
    })

    it('accepts missing optional description and isActive', () => {
        const result = unitOfMeasureSchema.safeParse({
            name: 'Litro',
            symbol: 'L',
            decimals: 2,
        })
        expect(result.success).toBe(true)
    })

    it.each([-1, 7, 1.5])('rejects %s decimals', (decimals) => {
        const result = unitOfMeasureSchema.safeParse({
            name: 'Metro',
            symbol: 'm',
            decimals,
        })
        expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
        const result = unitOfMeasureSchema.safeParse({ name: '', symbol: 'kg' })
        expect(result.success).toBe(false)
    })

    it('rejects empty symbol', () => {
        const result = unitOfMeasureSchema.safeParse({
            name: 'Kilogramo',
            symbol: '',
        })
        expect(result.success).toBe(false)
    })
})
