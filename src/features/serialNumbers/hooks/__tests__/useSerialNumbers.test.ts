import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
    useSerialNumbersList,
    useSerialNumberMutations,
} from '../useSerialNumbers'
import * as api from '../../api/client'

vi.mock('../../api/client')

const mockSerial = {
    id: 1,
    serialNumber: 'SN-001',
    productId: 5,
    status: 'available' as const,
    lotId: null,
    locationId: null,
    purchaseOrderId: null,
    saleId: null,
    notes: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
}

const mockPaginatedResponse = {
    data: [mockSerial],
    meta: {
        requestId: 'req-1',
        timestamp: '2025-01-01T00:00:00Z',
        pagination: { total: 1, limit: 10, offset: 0 },
    },
}

const mockDataResponse = {
    data: mockSerial,
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

describe('useSerialNumbersList', () => {
    it('returns mapped data', async () => {
        vi.mocked(api.getSerialNumbers).mockResolvedValue(mockPaginatedResponse)

        const { result } = renderHook(() => useSerialNumbersList(), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.items).toHaveLength(1)
        expect(result.current.data?.items[0].serialNumber).toBe('SN-001')
    })
})

describe('useSerialNumberMutations.changeStatus', () => {
    it('calls changeStatus and returns data', async () => {
        vi.mocked(api.changeStatus).mockResolvedValue(mockDataResponse)

        const { result } = renderHook(() => useSerialNumberMutations(), {
            wrapper,
        })

        result.current.changeStatus.mutate({ id: 1, status: 'sold' })

        await waitFor(() =>
            expect(result.current.changeStatus.isSuccess).toBe(true)
        )

        expect(api.changeStatus).toHaveBeenCalledWith(1, 'sold')
    })
})
