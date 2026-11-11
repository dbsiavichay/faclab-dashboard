import { describe, expect, it } from 'vitest'
import { customerPaymentSchema } from '../customerPayment.schema'
import { allocateFifo } from '../allocation'

const schema = customerPaymentSchema({
    outstanding: 80,
    balances: { 1: 50, 2: 30 },
})

const valid = {
    amount: 40,
    paymentMethod: 'CASH' as const,
    mode: 'FIFO' as const,
}

describe('customerPaymentSchema', () => {
    it('takes a payment up to what the customer owes', () => {
        expect(schema.safeParse(valid).success).toBe(true)
        expect(schema.safeParse({ ...valid, amount: 80 }).success).toBe(true)
        expect(schema.safeParse({ ...valid, amount: 80.01 }).success).toBe(
            false
        )
        expect(schema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
    })

    it('never takes credit as the method', () => {
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
        // Doesn't add up
        expect(
            schema.safeParse({ ...manual, applications: { 1: 10 } }).success
        ).toBe(false)
        // Above the balance of receivable 2
        expect(
            schema.safeParse({ ...manual, applications: { 1: 5, 2: 35 } })
                .success
        ).toBe(false)
    })
})

describe('allocateFifo', () => {
    it('pays the receivable due first, like faclab-core', () => {
        const receivables = [
            { id: 1, dueOn: '2026-12-01', balance: 50 },
            { id: 2, dueOn: '2026-11-01', balance: 30 },
            { id: 3, dueOn: '2026-12-01', balance: 40 },
        ]

        expect(allocateFifo(100, receivables)).toEqual([
            { receivableId: 2, amount: 30, balance: 0 },
            { receivableId: 1, amount: 50, balance: 0 },
            { receivableId: 3, amount: 20, balance: 20 },
        ])
    })
})
