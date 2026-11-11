import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
    useCreateCustomerPayment,
    useCustomerAccount,
    useReceivables,
    useReceivablesAging,
} from '../useReceivables'
import * as api from '../../api/client'
import type {
    CustomerAccount,
    CustomerPayment,
    Receivable,
} from '../../model/types'

vi.mock('../../api/client')

const META = { requestId: 'req-1', timestamp: '2026-11-11T00:00:00Z' }

const RECEIVABLE: Receivable = {
    id: 3,
    customerId: 7,
    customerName: 'Constructora Andina',
    customerTaxId: '1790012345001',
    saleId: 41,
    saleNumber: 'V-001-000041',
    branchId: 1,
    amount: 95,
    balance: 95,
    issuedOn: '2026-11-11',
    dueOn: '2026-12-11',
    termDays: 30,
    status: 'OPEN',
    cancelledAt: null,
    daysOverdue: 0,
}

const ACCOUNT: CustomerAccount = {
    customerId: 7,
    customerName: 'Constructora Andina',
    customerTaxId: '1790012345001',
    creditLimit: 500,
    paymentTerms: 30,
    hasCredit: true,
    outstanding: 95,
    overdue: 0,
    available: 405,
    receivables: [RECEIVABLE],
}

let qc: QueryClient

function wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => {
    vi.clearAllMocks()
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

describe('useReceivables', () => {
    it('unwraps the receivables and their pagination', async () => {
        vi.mocked(api.getReceivables).mockResolvedValue({
            data: [RECEIVABLE],
            meta: { ...META, pagination: { total: 1, limit: 10, offset: 0 } },
        })

        const { result } = renderHook(
            () => useReceivables({ overdue: true, limit: 10 }),
            { wrapper }
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.items).toEqual([RECEIVABLE])
        expect(result.current.data?.pagination.total).toBe(1)
        expect(api.getReceivables).toHaveBeenCalledWith({
            overdue: true,
            limit: 10,
        })
    })
})

describe('useReceivablesAging', () => {
    it('answers the aging as faclab-core computes it', async () => {
        const totals = {
            notDue: 95,
            days1To30: 0,
            days31To60: 0,
            days61To90: 0,
            over90: 0,
            total: 95,
        }
        vi.mocked(api.getAging).mockResolvedValue({
            data: { asOf: '2026-11-11', customers: [], totals },
            meta: META,
        })

        const { result } = renderHook(() => useReceivablesAging(), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.totals).toEqual(totals)
    })
})

describe('useCustomerAccount', () => {
    it('waits for a customer', () => {
        renderHook(() => useCustomerAccount(0), { wrapper })

        expect(api.getCustomerAccount).not.toHaveBeenCalled()
    })
})

describe('useCreateCustomerPayment', () => {
    it('refreshes the portfolio, the account and the sales', async () => {
        const payment: CustomerPayment = {
            id: 1,
            number: 'AB-2026-0001',
            customerId: 7,
            customerName: 'Constructora Andina',
            amount: 40,
            paymentMethod: 'TRANSFER',
            reference: 'TRF-1',
            notes: null,
            paidAt: '2026-11-11T10:00:00',
            receivedBy: 'Ana',
            branchId: null,
            terminalId: null,
            shiftId: null,
            applications: [],
        }
        vi.mocked(api.createCustomerPayment).mockResolvedValue({
            data: payment,
            meta: META,
        })
        qc.setQueryData(['customerAccounts', 7], ACCOUNT)
        qc.setQueryData(['sales', 'list'], [])

        const { result } = renderHook(() => useCreateCustomerPayment(), {
            wrapper,
        })
        await act(() =>
            result.current.mutateAsync({
                customerId: 7,
                amount: 40,
                paymentMethod: 'TRANSFER',
            })
        )

        expect(qc.getQueryState(['customerAccounts', 7])?.isInvalidated).toBe(
            true
        )
        expect(qc.getQueryState(['sales', 'list'])?.isInvalidated).toBe(true)
    })
})
