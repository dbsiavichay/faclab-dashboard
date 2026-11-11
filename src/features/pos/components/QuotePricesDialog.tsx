import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@shared/lib/format'
import type { PosQuote } from '../model/types'
import { changedPriceLines, type QuotePriceChoice } from '../lib/quoteCart'

interface QuotePricesDialogProps {
    quote: PosQuote | null
    onChoose: (choice: QuotePriceChoice) => void
    onClose: () => void
}

/**
 * Los precios cambiaron desde que se cotizó (S5.4): el cajero cobra el cotizado
 * (queda como cambio de precio con el motivo de la cotización, en la bitácora)
 * o el de hoy.
 */
const QuotePricesDialog = ({
    quote,
    onChoose,
    onClose,
}: QuotePricesDialogProps) => {
    const changed = quote ? changedPriceLines(quote) : []
    return (
        <Dialog
            isOpen={quote !== null}
            contentLabel="Precios cambiados"
            width={520}
            overlayClassName="!z-[70]"
            onClose={onClose}
            onRequestClose={onClose}
        >
            <h5 className="mb-2">Cambiaron los precios</h5>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Desde que se emitió la cotización {quote?.number} cambió el
                precio de {changed.length === 1 ? 'un ítem' : 'estos ítems'}.
                ¿Qué precio cobras?
            </p>
            <table className="mb-6 w-full text-sm">
                <thead>
                    <tr className="text-left text-gray-500">
                        <th className="py-1 font-medium">Producto</th>
                        <th className="py-1 text-right font-medium">
                            Cotizado
                        </th>
                        <th className="py-1 text-right font-medium">Hoy</th>
                    </tr>
                </thead>
                <tbody>
                    {changed.map((item) => (
                        <tr
                            key={item.id}
                            className="border-t border-gray-200 dark:border-gray-700"
                        >
                            <td className="py-1.5">
                                {item.productName}
                                {item.presentationName &&
                                    item.unitFactor !== 1 &&
                                    ` (${item.presentationName})`}
                            </td>
                            <td className="py-1.5 text-right">
                                {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="py-1.5 text-right font-medium">
                                {formatCurrency(item.listPrice ?? 0)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="plain" onClick={onClose}>
                    Cancelar
                </Button>
                <Button onClick={() => onChoose('current')}>
                    Cobrar precio de hoy
                </Button>
                <Button variant="solid" onClick={() => onChoose('quoted')}>
                    Respetar precio cotizado
                </Button>
            </div>
        </Dialog>
    )
}

export default QuotePricesDialog
