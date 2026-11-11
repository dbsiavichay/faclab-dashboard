import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import * as api from '../api/client'
import type {
    Quote,
    QuoteInput,
    QuoteItemInput,
    QuoteItemUpdateInput,
    QuoteParams,
    QuoteUpdateInput,
} from '../model/types'

const QUOTES = ['quotes'] as const

export function useQuotes(params?: QuoteParams) {
    return useQuery({
        queryKey: [...QUOTES, 'list', params],
        queryFn: async () => {
            const body = await api.getQuotes(params)
            return { items: body.data, pagination: body.meta.pagination }
        },
        placeholderData: keepPreviousData,
    })
}

export function useQuote(id: number) {
    return useQuery({
        queryKey: [...QUOTES, id],
        queryFn: async () => (await api.getQuote(id)).data,
        enabled: id > 0,
    })
}

export function useCreateQuote() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: QuoteInput) =>
            (await api.createQuote(data)).data,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUOTES }),
    })
}

/**
 * Las operaciones sobre una cotización: cada una responde la cotización
 * completa, que reemplaza la del detalle; la lista se vuelve a pedir.
 */
export function useQuoteMutations(id: number) {
    const queryClient = useQueryClient()
    const onSuccess = (quote: Quote) => {
        queryClient.setQueryData([...QUOTES, id], quote)
        return queryClient.invalidateQueries({
            queryKey: [...QUOTES, 'list'],
        })
    }
    const quoteOf = async (request: Promise<{ data: Quote }>) =>
        (await request).data

    return {
        update: useMutation({
            mutationFn: (data: QuoteUpdateInput) =>
                quoteOf(api.updateQuote(id, data)),
            onSuccess,
        }),
        remove: useMutation({
            mutationFn: () => api.deleteQuote(id),
            onSuccess: () => {
                queryClient.removeQueries({ queryKey: [...QUOTES, id] })
                return queryClient.invalidateQueries({
                    queryKey: [...QUOTES, 'list'],
                })
            },
        }),
        addItem: useMutation({
            mutationFn: (data: QuoteItemInput) =>
                quoteOf(api.addQuoteItem(id, data)),
            onSuccess,
        }),
        updateItem: useMutation({
            mutationFn: ({
                itemId,
                data,
            }: {
                itemId: number
                data: QuoteItemUpdateInput
            }) => quoteOf(api.updateQuoteItem(id, itemId, data)),
            onSuccess,
        }),
        removeItem: useMutation({
            mutationFn: (itemId: number) =>
                quoteOf(api.removeQuoteItem(id, itemId)),
            onSuccess,
        }),
        send: useMutation({
            mutationFn: () => quoteOf(api.sendQuote(id)),
            onSuccess,
        }),
        accept: useMutation({
            mutationFn: () => quoteOf(api.acceptQuote(id)),
            onSuccess,
        }),
        renew: useMutation({
            mutationFn: (validUntil: string) =>
                quoteOf(api.renewQuote(id, validUntil)),
            onSuccess,
        }),
        email: useMutation({
            mutationFn: (to: string | null) => quoteOf(api.emailQuote(id, to)),
            onSuccess,
        }),
    }
}
