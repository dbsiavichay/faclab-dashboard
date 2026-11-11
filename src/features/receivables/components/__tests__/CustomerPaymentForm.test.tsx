import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CustomerPaymentForm from '../CustomerPaymentForm'
import type { CustomerAccount } from '../../model/types'

const ACCOUNT: CustomerAccount = {
    customerId: 70,
    customerName: 'Ferretería El Maestro',
    customerTaxId: '1790012345001',
    creditLimit: 500,
    paymentTerms: 30,
    hasCredit: true,
    outstanding: 120,
    overdue: 120,
    available: 380,
    receivables: [
        {
            id: 31,
            customerId: 70,
            saleId: 501,
            saleNumber: 'V-001-000501',
            branchId: 1,
            amount: 120,
            balance: 120,
            issuedOn: '2026-10-02',
            dueOn: '2026-11-01',
            termDays: 30,
            status: 'OPEN',
            cancelledAt: null,
            daysOverdue: 10,
        },
    ],
}

const renderForm = () => {
    const onSubmit = vi.fn()
    render(
        <>
            <CustomerPaymentForm
                formId="f"
                account={ACCOUNT}
                onSubmit={onSubmit}
            />
            <button type="submit" form="f">
                Guardar
            </button>
        </>
    )
    return onSubmit
}

describe('CustomerPaymentForm', () => {
    it('sends the payment to the receivable due first', async () => {
        const onSubmit = renderForm()

        await userEvent.type(screen.getByLabelText(/Monto/), '50')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

        await waitFor(() =>
            expect(onSubmit).toHaveBeenCalledWith({
                customerId: 70,
                amount: 50,
                paymentMethod: 'CASH',
                reference: null,
                notes: null,
            })
        )
    })

    it('refuses more than the customer owes', async () => {
        const onSubmit = renderForm()

        await userEvent.type(screen.getByLabelText(/Monto/), '120.01')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

        expect(
            await screen.findByText('Supera lo que debe el cliente')
        ).toBeInTheDocument()
        expect(onSubmit).not.toHaveBeenCalled()
    })
})
