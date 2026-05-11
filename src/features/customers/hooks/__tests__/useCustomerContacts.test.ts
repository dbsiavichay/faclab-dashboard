import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
    useCustomerContactsList,
    useCustomerContactMutations,
} from '../useCustomerContacts'
import * as api from '../../api/client'

vi.mock('../../api/client')

const mockContact = {
    id: 10,
    customerId: 1,
    name: 'Juan Pérez',
    role: 'Gerente de Compras',
    email: 'juan@example.com',
    phone: '0987654321',
}

const mockDataResponse = {
    data: mockContact,
    meta: { requestId: 'req-1', timestamp: '2025-01-01T00:00:00Z' },
}

const mockListResponse = {
    data: [mockContact],
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

describe('useCustomerContactsList', () => {
    it('returns contacts array for a customer', async () => {
        vi.mocked(api.getCustomerContacts).mockResolvedValue(mockListResponse)

        const { result } = renderHook(() => useCustomerContactsList(1), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toHaveLength(1)
        expect(result.current.data?.[0].name).toBe('Juan Pérez')
        expect(api.getCustomerContacts).toHaveBeenCalledWith(1)
    })

    it('does not fetch when customerId is 0', () => {
        const { result } = renderHook(() => useCustomerContactsList(0), {
            wrapper,
        })

        expect(result.current.fetchStatus).toBe('idle')
        expect(api.getCustomerContacts).not.toHaveBeenCalled()
    })
})

describe('useCustomerContactMutations.create', () => {
    it('calls createCustomerContact with customerId and data', async () => {
        vi.mocked(api.createCustomerContact).mockResolvedValue(mockDataResponse)

        const { result } = renderHook(() => useCustomerContactMutations(1), {
            wrapper,
        })

        result.current.create.mutate({ name: 'Juan Pérez' })

        await waitFor(() => expect(result.current.create.isSuccess).toBe(true))

        expect(api.createCustomerContact).toHaveBeenCalledWith(1, {
            name: 'Juan Pérez',
        })
        expect(result.current.create.data?.name).toBe('Juan Pérez')
    })
})

describe('useCustomerContactMutations.delete', () => {
    it('calls deleteCustomerContact with contact id', async () => {
        vi.mocked(api.deleteCustomerContact).mockResolvedValue(undefined)

        const { result } = renderHook(() => useCustomerContactMutations(1), {
            wrapper,
        })

        result.current.delete.mutate(10)

        await waitFor(() => expect(result.current.delete.isSuccess).toBe(true))

        expect(api.deleteCustomerContact).toHaveBeenCalledWith(10)
    })
})
