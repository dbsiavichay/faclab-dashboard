import { describe, it, expect } from 'vitest'
import { supplierSchema } from '../supplier.schema'

describe('supplierSchema', () => {
    it('accepts valid data', () => {
        const result = supplierSchema.safeParse({
            name: 'Proveedor S.A.',
            taxId: '1234567890001',
            taxType: 1,
            isActive: true,
        })
        expect(result.success).toBe(true)
    })

    it('accepts all optional fields', () => {
        const result = supplierSchema.safeParse({
            name: 'Proveedor S.A.',
            taxId: '1234567890001',
            taxType: 2,
            email: 'proveedor@ejemplo.com',
            phone: '0987654321',
            address: 'Av. Principal 123',
            city: 'Quito',
            country: 'Ecuador',
            paymentTerms: 30,
            leadTimeDays: 7,
            notes: 'Notas del proveedor',
            isActive: true,
        })
        expect(result.success).toBe(true)
    })

    it('rejects empty name', () => {
        const result = supplierSchema.safeParse({
            name: '',
            taxId: '1234567890001',
            taxType: 1,
        })
        expect(result.success).toBe(false)
        if (!result.success) {
            const nameError = result.error.issues.find(
                (i) => i.path[0] === 'name'
            )
            expect(nameError).toBeDefined()
        }
    })

    it('rejects empty taxId', () => {
        const result = supplierSchema.safeParse({
            name: 'Proveedor S.A.',
            taxId: '',
            taxType: 1,
        })
        expect(result.success).toBe(false)
        if (!result.success) {
            const taxIdError = result.error.issues.find(
                (i) => i.path[0] === 'taxId'
            )
            expect(taxIdError).toBeDefined()
        }
    })

    it('rejects invalid taxType', () => {
        const result = supplierSchema.safeParse({
            name: 'Proveedor S.A.',
            taxId: '1234567890001',
            taxType: 5,
        })
        expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
        const result = supplierSchema.safeParse({
            name: 'Proveedor S.A.',
            taxId: '1234567890001',
            taxType: 1,
            email: 'not-an-email',
        })
        expect(result.success).toBe(false)
    })

    it('accepts empty string as email (optional)', () => {
        const result = supplierSchema.safeParse({
            name: 'Proveedor S.A.',
            taxId: '1234567890001',
            taxType: 1,
            email: '',
        })
        expect(result.success).toBe(true)
    })

    it('rejects negative paymentTerms', () => {
        const result = supplierSchema.safeParse({
            name: 'Proveedor S.A.',
            taxId: '1234567890001',
            taxType: 1,
            paymentTerms: -1,
        })
        expect(result.success).toBe(false)
    })
})
