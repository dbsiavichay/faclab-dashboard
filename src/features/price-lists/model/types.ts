/**
 * Lista de precios de la empresa (S5.3): minorista, mayorista, por volumen. Se
 * asigna a un cliente o a una sucursal; una venta toma la del cliente, luego la
 * de su sucursal y al final la general.
 */
export interface PriceList {
    id: number
    name: string
    description: string | null
    /**
     * La general de la empresa: siempre activa, sin vigencia, su precio base es
     * el del producto y solo guarda escalas por volumen
     */
    isDefault: boolean
    isActive: boolean
    /** Primer y último día en que rige (fechas `YYYY-MM-DD`, inclusivas) */
    validFrom: string | null
    validTo: string | null
}

export interface PriceListInput {
    name: string
    description: string | null
    isActive: boolean
    validFrom: string | null
    validTo: string | null
}

/**
 * El precio de una presentación de un producto en una lista, desde una
 * cantidad en esa presentación: 0 es el precio base de la lista, más es una
 * escala ("desde 10 sacos"). Una presentación sin ítem toma el de la unidad
 * base de la lista × su factor.
 */
export interface PriceListItem {
    id: number
    priceListId: number
    productId: number
    presentationId: number
    price: number
    minQuantity: number
    productName: string | null
    productSku: string | null
    presentationName: string | null
    unitFactor: number | null
    isBasePresentation: boolean
}

export interface PriceListItemCreateInput {
    productId: number
    /** Sin ella, la unidad base del producto */
    presentationId?: number | null
    price: number
    minQuantity: number
}

export interface PriceListItemUpdateInput {
    price: number
    minQuantity: number
}

export interface PriceListParams {
    isActive?: boolean
    limit?: number
    offset?: number
}

export interface PriceListItemParams {
    productId?: number
    limit?: number
    offset?: number
}

// El backend responde en inglés: estos casos los ve quien administra precios
export const PRICE_LIST_ERROR_MESSAGES: Record<string, string> = {
    PRICE_LIST_ALREADY_EXISTS: 'Ya existe una lista con ese nombre.',
    PRICE_LIST_ITEM_ALREADY_EXISTS:
        'La lista ya tiene un precio para esa presentación desde esa cantidad.',
    DEFAULT_PRICE_LIST_LOCKED:
        'La lista general siempre está activa, sin vigencia, y no se elimina.',
    DEFAULT_PRICE_LIST_BASE_PRICE:
        'El precio base de la lista general es el del producto: aquí solo van escalas desde una cantidad mayor a cero.',
    RECORD_IN_USE:
        'La lista está asignada a clientes o sucursales: desactívala o quita la asignación.',
}
