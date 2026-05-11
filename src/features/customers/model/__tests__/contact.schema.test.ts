import { describe, it, expect } from 'vitest'
import { contactSchema } from '../contact.schema'

describe('contactSchema', () => {
    const valid = {
        name: 'Juan Pérez',
        role: 'Gerente de Compras',
        email: 'juan@example.com',
        phone: '0987654321',
    }

    it('accepts a valid contact with all fields', () => {
        expect(contactSchema.safeParse(valid).success).toBe(true)
    })

    it('accepts minimal required fields only', () => {
        const result = contactSchema.safeParse({ name: 'Juan' })
        expect(result.success).toBe(true)
    })

    it('rejects missing name', () => {
        const result = contactSchema.safeParse({ ...valid, name: undefined })
        expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
        const result = contactSchema.safeParse({ ...valid, name: '' })
        expect(result.success).toBe(false)
    })

    it('accepts undefined role', () => {
        const result = contactSchema.safeParse({ ...valid, role: undefined })
        expect(result.success).toBe(true)
    })

    it('accepts empty email as optional', () => {
        const result = contactSchema.safeParse({ ...valid, email: '' })
        expect(result.success).toBe(true)
    })

    it('accepts undefined email', () => {
        const result = contactSchema.safeParse({ ...valid, email: undefined })
        expect(result.success).toBe(true)
    })

    it('rejects invalid email format', () => {
        const result = contactSchema.safeParse({
            ...valid,
            email: 'not-an-email',
        })
        expect(result.success).toBe(false)
    })

    it('accepts undefined phone', () => {
        const result = contactSchema.safeParse({ ...valid, phone: undefined })
        expect(result.success).toBe(true)
    })
})
