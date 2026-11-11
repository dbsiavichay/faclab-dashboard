import { formatDate } from '@shared/lib/format'
import type { PriceList } from './types'

/** A `YYYY-MM-DD` day as the local date it names (not UTC midnight) */
const day = (value: string): string => formatDate(new Date(`${value}T00:00:00`))

/** Vigencia de una lista (fechas inclusivas): sin fechas, siempre */
export const validityLabel = (
    list: Pick<PriceList, 'validFrom' | 'validTo'>
): string => {
    if (list.validFrom && list.validTo)
        return `${day(list.validFrom)} – ${day(list.validTo)}`
    if (list.validFrom) return `Desde ${day(list.validFrom)}`
    if (list.validTo) return `Hasta ${day(list.validTo)}`
    return 'Siempre'
}
