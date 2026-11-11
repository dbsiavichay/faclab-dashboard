import { isExpired, OPEN_QUOTE_STATUSES, type Quote } from './types'

/**
 * Lo que se puede hacer con una cotización hoy, como lo valida faclab-core: se
 * edita en borrador; se envía, acepta o cobra con ítems mientras rige; una
 * vencida solo se renueva. `canWrite` es `sale:write` y `canCharge`
 * `pos:operate` (cobrarla es una venta del POS).
 */
export const quoteAbilities = (
    quote: Pick<Quote, 'status' | 'validUntil' | 'items'>,
    today: string,
    { canWrite, canCharge }: { canWrite: boolean; canCharge: boolean }
) => {
    const expired = isExpired(quote, today)
    const open = OPEN_QUOTE_STATUSES.includes(quote.status)
    const usable = open && !expired && quote.items.length > 0
    return {
        expired,
        edit: canWrite && quote.status === 'DRAFT',
        send: canWrite && usable && quote.status === 'DRAFT',
        email: canWrite && usable,
        accept: canWrite && usable && quote.status !== 'ACCEPTED',
        renew: canWrite && expired,
        charge: canCharge && usable,
    }
}
