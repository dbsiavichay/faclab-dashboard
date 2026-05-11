import { describe, it, expect } from 'vitest'
import { categorySchema } from '../category.schema'

describe('categorySchema', () => {
    it('accepts valid data', () => {
        const result = categorySchema.safeParse({
            name: 'Electrónica',
            description: 'Productos electrónicos',
        })
        expect(result.success).toBe(true)
    })

    it('accepts missing optional description', () => {
        const result = categorySchema.safeParse({ name: 'Ropa' })
        expect(result.success).toBe(true)
    })

    it('rejects empty name', () => {
        const result = categorySchema.safeParse({ name: '' })
        expect(result.success).toBe(false)
    })

    it('rejects name exceeding 200 chars', () => {
        const result = categorySchema.safeParse({ name: 'a'.repeat(201) })
        expect(result.success).toBe(false)
    })
})
