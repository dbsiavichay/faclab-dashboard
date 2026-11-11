import { describe, it, expect } from 'vitest'
import { applyPayments } from '../payments'

// Same cases as the Sale.settle tests in faclab-core (tests/unit/sales/test_entities.py)
describe('applyPayments', () => {
    it('applies in order and gives change from cash', () => {
        expect(
            applyPayments(24.15, [
                { amount: 10, paymentMethod: 'CREDIT_CARD' },
                { amount: 20, paymentMethod: 'CASH' },
            ])
        ).toEqual({ owed: 0, change: 5.85, covered: true, exceeds: false })
    })

    it('keeps what is still owed', () => {
        expect(
            applyPayments(24.15, [{ amount: 24.14, paymentMethod: 'CASH' }])
        ).toEqual({ owed: 0.01, change: 0, covered: false, exceeds: false })
    })

    it('leaves the rest on credit, which counts to cover the total (S5.5)', () => {
        expect(
            applyPayments(100, [
                { amount: 30, paymentMethod: 'CASH' },
                { amount: 70, paymentMethod: 'CREDIT' },
            ])
        ).toEqual({ owed: 0, change: 0, covered: true, exceeds: false })
    })

    it.each([
        'CREDIT_CARD',
        'DEBIT_CARD',
        'TRANSFER',
        'OTHER',
        'CREDIT',
    ] as const)('does not let %s exceed what is owed', (paymentMethod) => {
        expect(
            applyPayments(24.15, [{ amount: 25, paymentMethod }]).exceeds
        ).toBe(true)
    })

    it('rejects a payment after the total is covered', () => {
        expect(
            applyPayments(10, [
                { amount: 10, paymentMethod: 'CASH' },
                { amount: 5, paymentMethod: 'CASH' },
            ]).exceeds
        ).toBe(true)
    })

    it('rounds what is handed over to the cent', () => {
        // 100.8 typed as 100.79999999999998 after float sums
        expect(
            applyPayments(100.8, [
                { amount: 100.79999999999998, paymentMethod: 'CASH' },
            ])
        ).toEqual({ owed: 0, change: 0, covered: true, exceeds: false })
    })
})
