import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useQuote, useQuoteMutations, useQuotes } from '../useQuotes'
import * as api from '../../api/client'
import type { Quote } from '../../model/types'

vi.mock('../../api/client')

const META = { requestId: 'req-1', timestamp: '2026-11-11T00:00:00Z' }

const QUOTE: Quote = {
    id: 7,
    number: 'COT-001-000007',
    branchId: 1,
    branchName: 'Matriz',
    establishmentCode: '001',
    customerId: null,
    customerName: null,
    customerTaxId: null,
    customerEmail: null,
    status: 'DRAFT',
    issueDate: '2026-11-11',
    validUntil: '2026-11-26',
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: null,
    createdBy: 'Ana',
    sentAt: null,
    acceptedAt: null,
    convertedAt: null,
    items: [],
    saleId: null,
    saleNumber: null,
}

let qc: QueryClient

function wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => {
    vi.clearAllMocks()
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

describe('useQuotes', () => {
    it('unwraps the quotes and their pagination', async () => {
        vi.mocked(api.getQuotes).mockResolvedValue({
            data: [QUOTE],
            meta: { ...META, pagination: { total: 1, limit: 10, offset: 0 } },
        })

        const { result } = renderHook(
            () => useQuotes({ status: 'DRAFT', limit: 10 }),
            { wrapper }
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(api.getQuotes).toHaveBeenCalledWith({
            status: 'DRAFT',
            limit: 10,
        })
        expect(result.current.data?.items).toEqual([QUOTE])
        expect(result.current.data?.pagination.total).toBe(1)
    })
})

describe('useQuoteMutations', () => {
    it('puts the quote an action answers in its detail and reloads the lists', async () => {
        const sent = { ...QUOTE, status: 'SENT' as const }
        vi.mocked(api.sendQuote).mockResolvedValue({ data: sent, meta: META })
        vi.mocked(api.getQuote).mockResolvedValue({ data: QUOTE, meta: META })
        const invalidate = vi.spyOn(qc, 'invalidateQueries')

        const { result } = renderHook(
            () => ({ detail: useQuote(7), mutations: useQuoteMutations(7) }),
            { wrapper }
        )
        await waitFor(() => expect(result.current.detail.isSuccess).toBe(true))

        await act(() => result.current.mutations.send.mutateAsync())

        await waitFor(() =>
            expect(result.current.detail.data?.status).toBe('SENT')
        )
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: ['quotes', 'list'],
        })
    })

    it('adds an item and emails the quote to the address given', async () => {
        vi.mocked(api.addQuoteItem).mockResolvedValue({
            data: QUOTE,
            meta: META,
        })
        vi.mocked(api.emailQuote).mockResolvedValue({ data: QUOTE, meta: META })

        const { result } = renderHook(() => useQuoteMutations(7), { wrapper })
        await act(() =>
            result.current.addItem.mutateAsync({
                productId: 3,
                presentationId: null,
                quantity: 2,
                discount: 0,
            })
        )
        await act(() => result.current.email.mutateAsync('a@b.ec'))

        expect(api.addQuoteItem).toHaveBeenCalledWith(7, {
            productId: 3,
            presentationId: null,
            quantity: 2,
            discount: 0,
        })
        expect(api.emailQuote).toHaveBeenCalledWith(7, 'a@b.ec')
    })
})
