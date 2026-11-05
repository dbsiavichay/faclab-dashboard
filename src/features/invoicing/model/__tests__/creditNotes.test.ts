import { describe, expect, it } from 'vitest'
import {
    canAskAgain,
    onlyInvoices,
    type CreditNote,
    type Invoice,
} from '../types'

const note = (overrides: Partial<CreditNote> = {}): CreditNote => ({
    id: 31,
    status: 'PENDING',
    saleId: 1,
    refundId: 45,
    invoiceId: 'inv-1',
    documentId: null,
    number: null,
    accessCode: null,
    reason: 'Producto con defecto',
    total: 11.5,
    authorizedAt: null,
    rejectionReason: null,
    requestedAt: '2026-11-02T10:00:00Z',
    ...overrides,
})

describe('canAskAgain', () => {
    const NOW = new Date('2026-11-02T10:45:00Z')

    it('asks again after a rejection', () => {
        expect(canAskAgain(note({ status: 'REJECTED' }), NOW)).toBe(true)
    })

    it('asks again when its result does not arrive', () => {
        expect(canAskAgain(note(), NOW)).toBe(true)
        expect(
            canAskAgain(note({ requestedAt: '2026-11-02T10:30:00Z' }), NOW)
        ).toBe(false)
    })

    it('never once authorized', () => {
        expect(canAskAgain(note({ status: 'AUTHORIZED' }), NOW)).toBe(false)
    })
})

describe('onlyInvoices', () => {
    it('leaves out the credit notes of a sale', () => {
        const documents = [{ docType: '01' }, { docType: '04' }] as Invoice[]

        expect(onlyInvoices(documents)).toEqual([{ docType: '01' }])
    })
})
