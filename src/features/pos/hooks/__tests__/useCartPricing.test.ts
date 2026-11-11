import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useCartPricing } from '../useCartPricing'
import * as api from '../../api/client'
import { usePOSStore } from '../../store/usePOSStore'

vi.mock('../../api/client')

const meta = { requestId: 'req-1', timestamp: '2026-11-10T00:00:00Z' }

function wrapper({ children }: { children: React.ReactNode }) {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => {
    vi.clearAllMocks()
    usePOSStore.getState().clearCart()
    usePOSStore.getState().addItem({
        productId: 3,
        name: 'Cemento',
        sku: 'FERR-003',
        salePrice: 9.5,
        taxCode: 'VAT_15',
    })
    usePOSStore.getState().setCustomer(7, 'Ferretería El Maestro')
})

describe('useCartPricing', () => {
    it('asks the price of every line for the customer and applies it', async () => {
        vi.mocked(api.resolvePrices).mockResolvedValue({
            data: [
                {
                    productId: 3,
                    presentationId: 30,
                    quantity: 1,
                    unitPrice: 8.9,
                    priceListId: 2,
                    priceListName: 'Mayorista',
                    minQuantity: 0,
                },
            ],
            meta,
        })

        renderHook(() => useCartPricing(), { wrapper })

        await waitFor(() =>
            expect(usePOSStore.getState().cartItems[0].salePrice).toBe(8.9)
        )
        expect(api.resolvePrices).toHaveBeenCalledWith({
            customerId: 7,
            items: [{ productId: 3, presentationId: null, quantity: 1 }],
        })
        expect(usePOSStore.getState().cartItems[0].priceListName).toBe(
            'Mayorista'
        )
        await waitFor(() =>
            expect(usePOSStore.getState().pricesPending).toBe(false)
        )
    })

    it('holds back charging while it asks', () => {
        vi.mocked(api.resolvePrices).mockReturnValue(new Promise(() => {}))

        renderHook(() => useCartPricing(), { wrapper })

        expect(usePOSStore.getState().pricesPending).toBe(true)
    })
})
