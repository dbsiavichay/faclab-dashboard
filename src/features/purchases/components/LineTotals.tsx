import {
    TAX_CODE_LABELS,
    TAX_CODE_RATES,
    type TaxCode,
} from '@/constants/tax.constant'
import { formatCurrency } from '@shared/lib/format'

type Props = {
    subtotal: number
    /** The product's VAT code; the line keeps it (S5.7) */
    taxCode?: TaxCode | null
}

/** Preview of a purchase line: its base, its VAT and both. The order rounds
 *  each rate to the cent when it adds its lines */
export const LineTotals = ({ subtotal, taxCode }: Props) => {
    const tax = taxCode ? (subtotal * TAX_CODE_RATES[taxCode]) / 100 : 0
    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg grid grid-cols-3 gap-2">
            <div>
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="font-medium">{formatCurrency(subtotal)}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">
                    {taxCode ? TAX_CODE_LABELS[taxCode] : 'IVA'}
                </p>
                <p className="font-medium">{formatCurrency(tax)}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-lg font-semibold">
                    {formatCurrency(subtotal + tax)}
                </p>
            </div>
        </div>
    )
}
