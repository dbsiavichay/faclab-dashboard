import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useSuppliersList, useSupplier } from '../useSuppliers'
import * as api from '../../api/client'
import type { Supplier } from '../../model/types'

vi.mock('../../api/client')

const mockSupplier: Supplier = {
    id: 1,
    name: 'Proveedor Test',
    taxId: '1234567890001',
    taxType: 1,
    isActive: true,
}

const mockPaginatedResponse = {
    data: [mockSupplier],
    meta: {
        requestId: 'req-1',
        timestamp: '2025-01-01T00:00:00Z',
        pagination: { total: 1, limit: 10, offset: 0 },
    },
}

const mockDataResponse = {
    data: mockSupplier,
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

describe('useSuppliersList', () => {
    it('returns mapped data with items and pagination', async () => {
        vi.mocked(api.getSuppliers).mockResolvedValue(mockPaginatedResponse)

        const { result } = renderHook(() => useSuppliersList(), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.items).toHaveLength(1)
        expect(result.current.data?.items[0].name).toBe('Proveedor Test')
        expect(result.current.data?.pagination.total).toBe(1)
    })

    it('passes params to getSuppliers', async () => {
        vi.mocked(api.getSuppliers).mockResolvedValue(mockPaginatedResponse)
        const params = { limit: 5, offset: 10 }

        const { result } = renderHook(() => useSuppliersList(params), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(api.getSuppliers).toHaveBeenCalledWith(params)
    })
})

describe('useSupplier', () => {
    it('returns supplier data for valid id', async () => {
        vi.mocked(api.getSupplier).mockResolvedValue(mockDataResponse)

        const { result } = renderHook(() => useSupplier(1), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.name).toBe('Proveedor Test')
    })

    it('does not fetch when id is 0', () => {
        const { result } = renderHook(() => useSupplier(0), { wrapper })

        expect(result.current.fetchStatus).toBe('idle')
        expect(api.getSupplier).not.toHaveBeenCalled()
    })
})
