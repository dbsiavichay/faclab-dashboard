import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useCategoriesList, useCategoryMutations } from '../useCategories'
import * as api from '../../api/client'

vi.mock('../../api/client')

const mockCategory = { id: 1, name: 'Electrónica', description: null }

const mockPaginatedResponse = {
    data: [mockCategory],
    meta: {
        requestId: 'req-1',
        timestamp: '2025-01-01T00:00:00Z',
        pagination: { total: 1, limit: 10, offset: 0 },
    },
}

const mockDataResponse = {
    data: mockCategory,
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

describe('useCategoriesList', () => {
    it('returns mapped data with items and pagination', async () => {
        vi.mocked(api.getCategories).mockResolvedValue(mockPaginatedResponse)

        const { result } = renderHook(() => useCategoriesList(), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.items).toHaveLength(1)
        expect(result.current.data?.items[0].name).toBe('Electrónica')
        expect(result.current.data?.pagination.total).toBe(1)
    })

    it('passes params to getCategories', async () => {
        vi.mocked(api.getCategories).mockResolvedValue(mockPaginatedResponse)
        const params = { limit: 5, offset: 10 }

        const { result } = renderHook(() => useCategoriesList(params), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(api.getCategories).toHaveBeenCalledWith(params)
    })
})

describe('useCategoryMutations.create', () => {
    it('calls createCategory and returns data', async () => {
        vi.mocked(api.createCategory).mockResolvedValue(mockDataResponse)

        const { result } = renderHook(() => useCategoryMutations(), { wrapper })

        result.current.create.mutate({ name: 'Electrónica' })

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true))

        expect(api.createCategory).toHaveBeenCalledWith({ name: 'Electrónica' })
        expect(result.current.create.data?.name).toBe('Electrónica')
    })
})
