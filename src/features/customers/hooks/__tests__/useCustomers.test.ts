import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
    useCustomersList,
    useCustomer,
    useCustomerMutations,
} from '../useCustomers'
import * as api from '../../api/client'

vi.mock('../../api/client')

const mockCustomer = {
    id: 1,
    name: 'Acme Corp',
    taxId: '1234567890001',
    taxType: 1 as const,
    email: 'acme@example.com',
    phone: '0987654321',
    address: null,
    city: 'Quito',
    state: null,
    country: 'Ecuador',
    creditLimit: 5000,
    paymentTerms: 30,
    isActive: true,
}

const mockPaginatedResponse = {
    data: [mockCustomer],
    meta: {
        requestId: 'req-1',
        timestamp: '2025-01-01T00:00:00Z',
        pagination: { total: 1, limit: 10, offset: 0 },
    },
}

const mockDataResponse = {
    data: mockCustomer,
    meta: { requestId: 'req-1', timestamp: '2025-01-01T00:00:00Z' },
}

function wrapper({ children }: { children: React.ReactNode }) {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('useCustomersList', () => {
    it('returns mapped data with items and pagination', async () => {
        vi.mocked(api.getCustomers).mockResolvedValue(mockPaginatedResponse)

        const { result } = renderHook(() => useCustomersList(), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.items).toHaveLength(1)
        expect(result.current.data?.items[0].name).toBe('Acme Corp')
        expect(result.current.data?.pagination.total).toBe(1)
    })

    it('passes params to getCustomers', async () => {
        vi.mocked(api.getCustomers).mockResolvedValue(mockPaginatedResponse)
        const params = { limit: 5, offset: 10 }

        const { result } = renderHook(() => useCustomersList(params), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(api.getCustomers).toHaveBeenCalledWith(params)
    })
})

describe('useCustomer', () => {
    it('returns customer data for a valid id', async () => {
        vi.mocked(api.getCustomer).mockResolvedValue(mockDataResponse)

        const { result } = renderHook(() => useCustomer(1), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.name).toBe('Acme Corp')
        expect(result.current.data?.taxType).toBe(1)
    })

    it('does not fetch when id is 0', async () => {
        const { result } = renderHook(() => useCustomer(0), { wrapper })

        expect(result.current.fetchStatus).toBe('idle')
        expect(api.getCustomer).not.toHaveBeenCalled()
    })
})

describe('useCustomerMutations.create', () => {
    it('calls createCustomer and returns data', async () => {
        vi.mocked(api.createCustomer).mockResolvedValue(mockDataResponse)

        const { result } = renderHook(() => useCustomerMutations(), { wrapper })

        result.current.create.mutate({
            name: 'Acme Corp',
            taxId: '1234567890001',
            taxType: 1,
        })

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true))

        expect(api.createCustomer).toHaveBeenCalledWith({
            name: 'Acme Corp',
            taxId: '1234567890001',
            taxType: 1,
        })
        expect(result.current.create.data?.name).toBe('Acme Corp')
    })
})

describe('useCustomerMutations.activate', () => {
    it('calls activateCustomer and returns data', async () => {
        vi.mocked(api.activateCustomer).mockResolvedValue(mockDataResponse)

        const { result } = renderHook(() => useCustomerMutations(), { wrapper })

        result.current.activate.mutate(1)

        await waitFor(() =>
            expect(result.current.activate.isSuccess).toBe(true)
        )

        expect(api.activateCustomer).toHaveBeenCalledWith(1)
        expect(result.current.activate.data?.isActive).toBe(true)
    })
})
