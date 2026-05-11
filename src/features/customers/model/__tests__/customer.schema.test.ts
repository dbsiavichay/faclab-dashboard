import { describe, it, expect } from 'vitest'
import { customerSchema } from '../customer.schema'

describe('customerSchema', () => {
    const valid = {
        name: 'Acme Corp',
        taxId: '1234567890001',
        taxType: 1 as const,
        email: 'acme@example.com',
        phone: '0987654321',
        address: 'Calle 1 y Av. 2',
        city: 'Quito',
        state: 'Pichincha',
        country: 'Ecuador',
        creditLimit: 5000,
        paymentTerms: 30,
        isActive: true,
    }

    it('accepts a valid customer with all fields', () => {
        expect(customerSchema.safeParse(valid).success).toBe(true)
    })

    it('accepts minimal required fields only', () => {
        const result = customerSchema.safeParse({
            name: 'Cliente',
            taxId: '1234567890001',
            taxType: 2,
        })
        expect(result.success).toBe(true)
    })

    it('rejects missing name', () => {
        const result = customerSchema.safeParse({ ...valid, name: undefined })
        expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
        const result = customerSchema.safeParse({ ...valid, name: '' })
        expect(result.success).toBe(false)
    })

    it('rejects missing taxId', () => {
        const result = customerSchema.safeParse({ ...valid, taxId: undefined })
        expect(result.success).toBe(false)
    })

    it('rejects empty taxId', () => {
        const result = customerSchema.safeParse({ ...valid, taxId: '' })
        expect(result.success).toBe(false)
    })

    it('accepts all valid taxTypes (1-4)', () => {
        for (const taxType of [1, 2, 3, 4] as const) {
            expect(
                customerSchema.safeParse({ ...valid, taxType }).success
            ).toBe(true)
        }
    })

    it('rejects invalid taxType', () => {
        const result = customerSchema.safeParse({ ...valid, taxType: 5 })
        expect(result.success).toBe(false)
    })

    it('rejects string taxType', () => {
        const result = customerSchema.safeParse({ ...valid, taxType: 'RUC' })
        expect(result.success).toBe(false)
    })

    it('accepts empty email as optional', () => {
        const result = customerSchema.safeParse({ ...valid, email: '' })
        expect(result.success).toBe(true)
    })

    it('accepts undefined email', () => {
        const result = customerSchema.safeParse({ ...valid, email: undefined })
        expect(result.success).toBe(true)
    })

    it('rejects invalid email format', () => {
        const result = customerSchema.safeParse({
            ...valid,
            email: 'not-an-email',
        })
        expect(result.success).toBe(false)
    })

    it('accepts 0 creditLimit', () => {
        const result = customerSchema.safeParse({ ...valid, creditLimit: 0 })
        expect(result.success).toBe(true)
    })

    it('rejects negative creditLimit', () => {
        const result = customerSchema.safeParse({ ...valid, creditLimit: -1 })
        expect(result.success).toBe(false)
    })

    it('accepts 0 paymentTerms', () => {
        const result = customerSchema.safeParse({ ...valid, paymentTerms: 0 })
        expect(result.success).toBe(true)
    })

    it('rejects negative paymentTerms', () => {
        const result = customerSchema.safeParse({ ...valid, paymentTerms: -5 })
        expect(result.success).toBe(false)
    })
})
