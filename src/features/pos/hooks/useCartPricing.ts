import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue'
import { useActiveBranch } from '@/stores'
import * as api from '../api/client'
import { usePOSStore, type CartLinePrice } from '../store/usePOSStore'

// Typing a quantity or adding several units waits for the last one
const PRICING_DELAY_MS = 250

interface PricingRequest {
    customerId: number | null
    lines: {
        lineKey: string
        productId: number
        presentationId: number | null
        quantity: number
    }[]
}

/**
 * Keeps the cart at the prices of its lists (S5.3): each time a line, its
 * quantity or the customer changes, asks faclab-core the price of every line
 * (`POST /api/pos/prices/resolve`: the customer's list, the branch's or the
 * general one with its volume tiers) and applies it. While it asks, the store's
 * `pricesPending` holds back charging and holding the sale.
 */
export function useCartPricing() {
    const cartItems = usePOSStore((s) => s.cartItems)
    const customerId = usePOSStore((s) => s.customerId)
    const applyResolvedPrices = usePOSStore((s) => s.applyResolvedPrices)
    const setPricesPending = usePOSStore((s) => s.setPricesPending)
    const branch = useActiveBranch()

    // Only what changes the price: not the line's own price nor its discount
    const signature = JSON.stringify([
        customerId,
        cartItems.map((item) => [
            item.lineKey,
            item.productId,
            item.presentationId,
            item.quantity,
        ]),
    ])
    const settled = useDebouncedValue(signature, PRICING_DELAY_MS)
    const request = useMemo<PricingRequest>(() => {
        const [customer, lines] = JSON.parse(settled) as [
            number | null,
            [string, number, number | null, number][]
        ]
        return {
            customerId: customer,
            lines: lines.map(
                ([lineKey, productId, presentationId, quantity]) => ({
                    lineKey,
                    productId,
                    presentationId,
                    quantity,
                })
            ),
        }
    }, [settled])

    const query = useQuery({
        queryKey: ['pos', 'prices', branch?.id ?? null, settled],
        queryFn: async (): Promise<CartLinePrice[]> => {
            const response = await api.resolvePrices({
                customerId: request.customerId,
                items: request.lines.map(
                    ({ productId, presentationId, quantity }) => ({
                        productId,
                        presentationId,
                        quantity,
                    })
                ),
            })
            // In the order of the request: a line without a presentation
            // comes back with its base one
            return response.data.map((price, index) => ({
                lineKey: request.lines[index].lineKey,
                quantity: request.lines[index].quantity,
                unitPrice: price.unitPrice,
                priceListName: price.priceListName,
            }))
        },
        enabled: request.lines.length > 0,
        staleTime: 0,
        gcTime: 0,
        retry: false,
    })

    useEffect(() => {
        if (query.data) applyResolvedPrices(query.data)
    }, [query.data, applyResolvedPrices])

    const pending =
        cartItems.length > 0 && (signature !== settled || query.isFetching)
    useEffect(() => {
        setPricesPending(pending)
    }, [pending, setPricesPending])

    // Leaving the POS mid-request mustn't leave the next cart blocked
    useEffect(() => () => setPricesPending(false), [setPricesPending])
}
