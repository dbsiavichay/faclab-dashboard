import { z } from 'zod'

/**
 * Cantidades decimales (S5.1): 2,5 m de cable o 1,25 kg de clavos. faclab-core
 * guarda seis decimales (lo que admite `cantidad` en el XML del SRI) y cada
 * unidad de medida dice cuántos acepta; un producto sin unidad, solo enteros.
 * La API envía y recibe las cantidades como números JSON, igual que el dinero.
 */
export const MAX_QUANTITY_DECIMALS = 6

/**
 * Redondea a `decimals` decimales con la mitad hacia arriba. `toPrecision(15)`
 * descarta el error binario de sumar o restar (0,1 + 0,2), como `roundMoney`.
 */
export function roundQuantity(
    value: number,
    decimals = MAX_QUANTITY_DECIMALS
): number {
    const factor = 10 ** decimals
    return Math.round(Number((value * factor).toPrecision(15))) / factor
}

/**
 * Si la cantidad no tiene más decimales de los que admite su unidad. La
 * tolerancia absorbe el error binario (0,1 + 0,2), muy por debajo del
 * millonésimo que guarda faclab-core
 */
export function fitsDecimals(value: number, decimals: number): boolean {
    return Math.abs(roundQuantity(value, decimals) - value) < 1e-9
}

/**
 * La cantidad para mostrar, con coma decimal y sin ceros sobrantes:
 * 2,5 m · 10 · 1,25 kg
 */
export function formatQuantity(value: number, unitSymbol?: string | null) {
    const text = new Intl.NumberFormat('es-EC', {
        maximumFractionDigits: MAX_QUANTITY_DECIMALS,
        useGrouping: false,
    }).format(roundQuantity(value))
    return unitSymbol ? `${text} ${unitSymbol}` : text
}

/**
 * Lee lo que se escribe en un campo de cantidad: acepta coma o punto
 * decimal ("2,5" o "2.5"). Devuelve `null` si no es un número.
 */
export function parseQuantity(text: string): number | null {
    const normalized = text.trim().replace(',', '.')
    if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null
    return Number(normalized)
}

/** Lo que admite una unidad, para el mensaje de error de una cantidad */
export function decimalsHint(decimals: number): string {
    if (decimals === 0) return 'Solo cantidades enteras'
    return decimals === 1 ? 'Máximo 1 decimal' : `Máximo ${decimals} decimales`
}

/**
 * Cantidad de un formulario: hasta seis decimales, mayor que cero o, con
 * `allowZero`, desde cero. Los decimales de la unidad del producto los valida
 * el servidor (`QUANTITY_PRECISION_EXCEEDED`).
 */
export function quantitySchema(
    opts: { allowZero?: boolean; message?: string } = {}
) {
    const { allowZero = false, message } = opts
    const base = z.number({ error: message ?? 'Ingrese una cantidad' })
    return (
        allowZero
            ? base.min(0, 'No puede ser negativa')
            : base.positive('Debe ser mayor a cero')
    ).refine((v) => fitsDecimals(v, MAX_QUANTITY_DECIMALS), {
        message: `Máximo ${MAX_QUANTITY_DECIMALS} decimales`,
    })
}
