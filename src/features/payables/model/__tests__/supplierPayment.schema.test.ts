import { describe, expect, it } from 'vitest'
import { supplierPaymentSchema } from '../supplierPayment.schema'
import { allocateFifo } from '../allocation'

const schema = supplierPaymentSchema({
    outstanding: 80,
    balances: { 1: 50, 2: 30 },
})

const valid = {
    amount: 40,
    paymentMethod: 'TRANSFER' as const,
    mode: 'FIFO' as const,
}

describe('supplierPaymentSchema', () => {
    it('takes a payment up to what is owed to the supplier', () => {
        expect(schema.safeParse(valid).success).toBe(true)
        expect(schema.safeParse({ ...valid, amount: 80 }).success).toBe(true)
        expect(schema.safeParse({ ...valid, amount: 80.01 }).success).toBe(
            false
        )
        expect(schema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
    })

    it('never pays on credit', () => {
        expect(
            schema.safeParse({ ...valid, paymentMethod: 'CREDIT' }).success
        ).toBe(false)
    })

    it('applies by hand what adds up to the payment, within each balance', () => {
        const manual = { ...valid, mode: 'MANUAL' as const }

        expect(
            schema.safeParse({ ...manual, applications: { 1: 10, 2: 30 } })
                .success
        ).toBe(true)
        expect(
            schema.safeParse({ ...manual, applications: { 1: 10 } }).success
        ).toBe(false)
        expect(
            schema.safeParse({ ...manual, applications: { 2: 40 } }).success
        ).toBe(false)
    })
})

describe('allocateFifo', () => {
    it('pays the one due first, then the next, like core', () => {
        expect(
            allocateFifo(60, [
                { id: 1, dueOn: '2026-12-01', balance: 50 },
                { id: 2, dueOn: '2026-11-01', balance: 30 },
            ])
        ).toEqual([
            { payableId: 2, amount: 30, balance: 0 },
            { payableId: 1, amount: 30, balance: 20 },
        ])
    })

    it('breaks a tie by the oldest payable and skips what is paid', () => {
        expect(
            allocateFifo(10, [
                { id: 5, dueOn: '2026-11-01', balance: 20 },
                { id: 4, dueOn: '2026-11-01', balance: 20 },
                { id: 3, dueOn: '2026-10-01', balance: 0 },
            ])
        ).toEqual([{ payableId: 4, amount: 10, balance: 10 }])
    })
})
