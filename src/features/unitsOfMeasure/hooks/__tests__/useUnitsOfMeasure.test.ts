import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
    useUnitsOfMeasureList,
    useUnitOfMeasureMutations,
} from '../useUnitsOfMeasure'
import * as api from '../../api/client'

vi.mock('../../api/client')

const mockUnit = {
    id: 1,
    name: 'Kilogramo',
    symbol: 'kg',
    description: null,
    isActive: true,
}

const mockPaginatedResponse = {
    data: [mockUnit],
    meta: {
        requestId: 'req-1',
        timestamp: '2025-01-01T00:00:00Z',
        pagination: { total: 1, limit: 10, offset: 0 },
    },
}

const mockDataResponse = {
    data: mockUnit,
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

describe('useUnitsOfMeasureList', () => {
    it('returns mapped data with items and pagination', async () => {
        vi.mocked(api.getUnitsOfMeasure).mockResolvedValue(
            mockPaginatedResponse
        )

        const { result } = renderHook(() => useUnitsOfMeasureList(), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.items).toHaveLength(1)
        expect(result.current.data?.items[0].symbol).toBe('kg')
        expect(result.current.data?.pagination.total).toBe(1)
    })

    it('passes params to getUnitsOfMeasure', async () => {
        vi.mocked(api.getUnitsOfMeasure).mockResolvedValue(
            mockPaginatedResponse
        )
        const params = { limit: 5, offset: 10 }

        const { result } = renderHook(() => useUnitsOfMeasureList(params), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(api.getUnitsOfMeasure).toHaveBeenCalledWith(params)
    })
})

describe('useUnitOfMeasureMutations.create', () => {
    it('calls createUnitOfMeasure and returns data', async () => {
        vi.mocked(api.createUnitOfMeasure).mockResolvedValue(mockDataResponse)

        const { result } = renderHook(() => useUnitOfMeasureMutations(), {
            wrapper,
        })

        result.current.create.mutate({ name: 'Kilogramo', symbol: 'kg' })

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true))

        expect(api.createUnitOfMeasure).toHaveBeenCalledWith({
            name: 'Kilogramo',
            symbol: 'kg',
        })
        expect(result.current.create.data?.symbol).toBe('kg')
    })
})
