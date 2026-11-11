import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
    usePriceListItemMutations,
    usePriceListItems,
    usePriceListsList,
} from '../usePriceLists'
import * as api from '../../api/client'
import type { PriceList, PriceListItem } from '../../model/types'

vi.mock('../../api/client')

const META = { requestId: 'req-1', timestamp: '2026-11-10T00:00:00Z' }
const PAGINATION = { total: 1, limit: 10, offset: 0 }

const WHOLESALE: PriceList = {
    id: 2,
    name: 'Mayorista',
    description: null,
    isDefault: false,
    isActive: true,
    validFrom: null,
    validTo: null,
}

const ITEM: PriceListItem = {
    id: 5,
    priceListId: 2,
    productId: 3,
    presentationId: 30,
    price: 8.9,
    minQuantity: 0,
    productName: 'Cemento',
    productSku: 'FERR-003',
    presentationName: 'Saco',
    unitFactor: 1,
    isBasePresentation: true,
}

let qc: QueryClient

function wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => {
    vi.clearAllMocks()
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

describe('usePriceListsList', () => {
    it('unwraps the lists and their pagination', async () => {
        vi.mocked(api.getPriceLists).mockResolvedValue({
            data: [WHOLESALE],
            meta: { ...META, pagination: PAGINATION },
        })

        const { result } = renderHook(() => usePriceListsList({ limit: 10 }), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.items[0].name).toBe('Mayorista')
        expect(api.getPriceLists).toHaveBeenCalledWith({ limit: 10 })
    })
})

describe('usePriceListItems', () => {
    it('reads the prices of one list', async () => {
        vi.mocked(api.getPriceListItems).mockResolvedValue({
            data: [ITEM],
            meta: { ...META, pagination: PAGINATION },
        })

        const { result } = renderHook(() => usePriceListItems(2), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.items[0].price).toBe(8.9)
        expect(api.getPriceListItems).toHaveBeenCalledWith(2, undefined)
    })
})

describe('usePriceListItemMutations', () => {
    it('asks the POS for its prices again after a change', async () => {
        vi.mocked(api.createPriceListItem).mockResolvedValue({
            data: ITEM,
            meta: META,
        })
        const invalidate = vi.spyOn(qc, 'invalidateQueries')
        const { result } = renderHook(() => usePriceListItemMutations(2), {
            wrapper,
        })

        await act(() =>
            result.current.create.mutateAsync({
                productId: 3,
                price: 8.9,
                minQuantity: 0,
            })
        )

        expect(api.createPriceListItem).toHaveBeenCalledWith(2, {
            productId: 3,
            price: 8.9,
            minQuantity: 0,
        })
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['priceLists'] })
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['pos', 'prices'] })
    })
})
