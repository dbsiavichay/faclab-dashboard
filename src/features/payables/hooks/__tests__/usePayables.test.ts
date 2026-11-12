import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
    useCreateSupplierPayment,
    usePayables,
    useSupplierAccount,
} from '../usePayables'
import * as api from '../../api/client'
import type {
    Payable,
    SupplierAccount,
    SupplierPayment,
} from '../../model/types'

vi.mock('../../api/client')

const META = { requestId: 'req-1', timestamp: '2026-11-12T00:00:00Z' }

const PAYABLE: Payable = {
    id: 4,
    supplierId: 10,
    supplierName: 'Distribuidora Andina',
    supplierTaxId: '0990000000001',
    purchaseOrderId: 1,
    orderNumber: 'PO-2026-0001',
    purchaseReceiptId: 7,
    supplierInvoiceNumber: '001-001-000000123',
    amount: 69,
    balance: 69,
    issuedOn: '2026-11-12',
    dueOn: '2026-12-12',
    termDays: 30,
    status: 'OPEN',
    daysOverdue: 0,
    createdAt: '2026-11-12T10:00:00',
}

const ACCOUNT: SupplierAccount = {
    supplierId: 10,
    supplierName: 'Distribuidora Andina',
    supplierTaxId: '0990000000001',
    paymentTerms: 30,
    outstanding: 69,
    overdue: 0,
    payables: [PAYABLE],
    payments: [],
    returns: [],
}

let qc: QueryClient

function wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => {
    vi.clearAllMocks()
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

describe('usePayables', () => {
    it('unwraps the payables and their pagination', async () => {
        vi.mocked(api.getPayables).mockResolvedValue({
            data: [PAYABLE],
            meta: { ...META, pagination: { total: 1, limit: 50, offset: 0 } },
        })

        const { result } = renderHook(
            () => usePayables({ status: 'OPEN', overdue: true }),
            { wrapper }
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.items).toEqual([PAYABLE])
        expect(result.current.data?.pagination.total).toBe(1)
        expect(api.getPayables).toHaveBeenCalledWith({
            status: 'OPEN',
            overdue: true,
        })
    })
})

describe('useSupplierAccount', () => {
    it('reads what is owed to a supplier', async () => {
        vi.mocked(api.getSupplierAccount).mockResolvedValue({
            data: ACCOUNT,
            meta: META,
        })

        const { result } = renderHook(() => useSupplierAccount(10), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(ACCOUNT)
    })

    it('waits for a supplier', () => {
        renderHook(() => useSupplierAccount(0), { wrapper })
        expect(api.getSupplierAccount).not.toHaveBeenCalled()
    })
})

describe('useCreateSupplierPayment', () => {
    it('records the payment and refreshes payables and accounts', async () => {
        const payment: SupplierPayment = {
            id: 2,
            number: 'PP-2026-0001',
            supplierId: 10,
            supplierName: 'Distribuidora Andina',
            amount: 69,
            paymentMethod: 'TRANSFER',
            reference: 'TRF-881',
            notes: null,
            paidAt: '2026-11-12T11:00:00',
            paidBy: 'Ana',
            applications: [
                {
                    payableId: 4,
                    purchaseOrderId: 1,
                    supplierInvoiceNumber: '001-001-000000123',
                    amount: 69,
                    balance: 0,
                },
            ],
        }
        vi.mocked(api.createSupplierPayment).mockResolvedValue({
            data: payment,
            meta: META,
        })
        const invalidate = vi.spyOn(qc, 'invalidateQueries')

        const { result } = renderHook(() => useCreateSupplierPayment(), {
            wrapper,
        })
        await act(() =>
            result.current.mutateAsync({
                supplierId: 10,
                amount: 69,
                paymentMethod: 'TRANSFER',
            })
        )

        expect(api.createSupplierPayment).toHaveBeenCalledWith({
            supplierId: 10,
            amount: 69,
            paymentMethod: 'TRANSFER',
        })
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['payables'] })
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: ['supplierAccounts'],
        })
    })
})
