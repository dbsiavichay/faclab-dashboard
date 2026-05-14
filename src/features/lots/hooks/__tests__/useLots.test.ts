import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useLotsList, useLotMutations } from '../useLots'
import * as api from '../../api/client'

vi.mock('../../api/client')

const mockLot = {
    id: 1,
    lotNumber: 'LOT-001',
    productId: 5,
    initialQuantity: 100,
    currentQuantity: 80,
    manufactureDate: null,
    expirationDate: null,
    isExpired: false,
    daysToExpiry: null,
    notes: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
}

const mockPaginatedResponse = {
    data: [mockLot],
    meta: {
        requestId: 'req-1',
        timestamp: '2025-01-01T00:00:00Z',
        pagination: { total: 1, limit: 10, offset: 0 },
    },
}

const mockDataResponse = {
    data: mockLot,
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

describe('useLotsList', () => {
    it('returns mapped data with items and pagination', async () => {
        vi.mocked(api.getLots).mockResolvedValue(mockPaginatedResponse)

        const { result } = renderHook(() => useLotsList(), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.items).toHaveLength(1)
        expect(result.current.data?.items[0].lotNumber).toBe('LOT-001')
        expect(result.current.data?.pagination.total).toBe(1)
    })
})

describe('useLotMutations.create', () => {
    it('calls createLot and returns data', async () => {
        vi.mocked(api.createLot).mockResolvedValue(mockDataResponse)

        const { result } = renderHook(() => useLotMutations(), { wrapper })

        result.current.create.mutate({
            lotNumber: 'LOT-001',
            productId: 5,
            initialQuantity: 100,
        })

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true))

        expect(api.createLot).toHaveBeenCalled()
        expect(result.current.create.data?.lotNumber).toBe('LOT-001')
    })
})
