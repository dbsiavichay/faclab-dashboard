import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useActiveBranch } from '@/stores'
import { notifyError, notifySuccess, notifyWarning } from '@shared/ui/notify'
import { formatQuantity } from '@shared/lib/quantity'
import * as api from '../api/client'
import { POS_ERROR_MESSAGES } from '../model/errors'
import type { POSProduct, PosQuote } from '../model/types'
import { usePOSStore } from '../store/usePOSStore'
import {
    changedPriceLines,
    quoteCartLines,
    shortLines,
    type QuotePriceChoice,
} from '../lib/quoteCart'

/** The quotes in force of the branch, for the drawer (S5.4) */
export function usePosQuotes(search: string, enabled: boolean) {
    const branch = useActiveBranch()
    return useQuery({
        queryKey: ['pos', 'quotes', branch?.id ?? null, search],
        queryFn: async () =>
            (await api.getPosQuotes({ search: search || undefined, limit: 20 }))
                .data,
        enabled,
        staleTime: 0,
        placeholderData: keepPreviousData,
    })
}

/** A quote fetched with its products, ready to go to the cart */
export interface PreparedQuote {
    quote: PosQuote
    products: Map<number, POSProduct>
}

/**
 * Loads a quote into the cart (S5.4): reads it with today's prices and the
 * terminal's stock, and its products. An expired one isn't loaded. When a price
 * changed the caller asks the cashier (`pending`), then `load` puts it in the
 * cart with the chosen price.
 */
export function useLoadQuote() {
    const loadQuote = usePOSStore((s) => s.loadQuote)
    const [loading, setLoading] = useState(false)
    const [pending, setPending] = useState<PreparedQuote | null>(null)

    const load = (prepared: PreparedQuote, choice: QuotePriceChoice) => {
        const { quote, products } = prepared
        loadQuote(
            { id: quote.id, number: quote.number ?? `#${quote.id}` },
            quote.customerId !== null
                ? {
                      id: quote.customerId,
                      name: quote.customerName ?? `#${quote.customerId}`,
                  }
                : null,
            quoteCartLines(quote, products, choice)
        )
        setPending(null)
        const short = shortLines(quote)
        if (short.length > 0) {
            notifyWarning(
                'Falta stock en esta caja',
                short
                    .map(
                        (item) =>
                            `${item.productName}: hay ${formatQuantity(
                                item.availableQuantity
                            )}`
                    )
                    .join(' · ')
            )
        } else {
            notifySuccess(`Cotización ${quote.number} cargada`)
        }
    }

    /** Returns true when it went to the cart or needs the cashier's choice */
    const start = async (quoteId: number): Promise<boolean> => {
        setLoading(true)
        try {
            const quote = (await api.getPosQuote(quoteId)).data
            if (quote.expired) {
                notifyWarning(
                    `La cotización ${quote.number} venció`,
                    'Renuévala en Cotizaciones antes de cobrarla.'
                )
                return false
            }
            const ids = [...new Set(quote.items.map((i) => i.productId))]
            const products = new Map(
                (await Promise.all(ids.map((id) => api.getProduct(id)))).map(
                    (response) => [response.data.id, response.data]
                )
            )
            const prepared = { quote, products }
            if (changedPriceLines(quote).length > 0) {
                setPending(prepared)
            } else {
                load(prepared, 'current')
            }
            return true
        } catch (error) {
            notifyError(error, 'No se pudo cargar la cotización', {
                messages: POS_ERROR_MESSAGES,
            })
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        start,
        load,
        loading,
        pending,
        cancel: () => setPending(null),
    }
}
