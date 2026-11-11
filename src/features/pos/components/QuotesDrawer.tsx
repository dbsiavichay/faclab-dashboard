import { useState } from 'react'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import ListSearchInput from '@shared/ui/ListSearchInput'
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue'
import { formatCurrency } from '@shared/lib/format'
import { formatDay } from '@features/quotes'
import { usePosQuotes } from '../hooks/usePosQuotes'

interface QuotesDrawerProps {
    isOpen: boolean
    loading: boolean
    onClose: () => void
    onSelect: (quoteId: number) => void
}

/** Las cotizaciones vigentes de la sucursal, para cobrarlas (S5.4) */
const QuotesDrawer = ({
    isOpen,
    loading,
    onClose,
    onSelect,
}: QuotesDrawerProps) => {
    const [search, setSearch] = useState('')
    const term = useDebouncedValue(search.trim())
    const { data: quotes, isLoading } = usePosQuotes(term, isOpen)

    return (
        <Drawer
            isOpen={isOpen}
            title="Cotizaciones"
            width={420}
            overlayClassName="!z-[60]"
            onClose={onClose}
        >
            <div className="space-y-3 p-4">
                <ListSearchInput
                    placeholder="Buscar por número o cliente"
                    value={search}
                    onChange={setSearch}
                />
                {isLoading && (
                    <div className="flex justify-center py-8">
                        <Spinner />
                    </div>
                )}
                {!isLoading && (quotes ?? []).length === 0 && (
                    <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No hay cotizaciones vigentes
                    </p>
                )}
                {(quotes ?? []).map((quote) => (
                    <div
                        key={quote.id}
                        className="flex items-start justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-600"
                    >
                        <div>
                            <p className="font-medium">{quote.number}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {quote.customerName ?? 'Consumidor final'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Válida hasta {formatDay(quote.validUntil)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">
                                {formatCurrency(quote.total)}
                            </p>
                            <Button
                                className="mt-1"
                                size="xs"
                                variant="solid"
                                loading={loading}
                                aria-label={`Cargar cotización ${quote.number}`}
                                onClick={() => onSelect(quote.id)}
                            >
                                Cargar
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Drawer>
    )
}

export default QuotesDrawer
