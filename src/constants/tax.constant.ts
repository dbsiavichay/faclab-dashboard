/**
 * Códigos semánticos de IVA. Espejo de `TaxCode` en faclab-core
 * (src/shared/domain/tax.py): 0%, exento y no objeto comparten tarifa 0
 * pero son códigos distintos para el SRI.
 */
export const TAX_CODES = [
    'VAT_0',
    'VAT_5',
    'VAT_8_TOURISM',
    'VAT_12',
    'VAT_13',
    'VAT_14',
    'VAT_15',
    'EXEMPT',
    'NOT_TAXED',
] as const

export type TaxCode = (typeof TAX_CODES)[number]

export const DEFAULT_TAX_CODE: TaxCode = 'VAT_15'

export const TAX_CODE_LABELS: Record<TaxCode, string> = {
    VAT_0: 'IVA 0%',
    VAT_5: 'IVA 5%',
    VAT_8_TOURISM: 'IVA 8% (turismo)',
    VAT_12: 'IVA 12%',
    VAT_13: 'IVA 13%',
    VAT_14: 'IVA 14%',
    VAT_15: 'IVA 15%',
    EXEMPT: 'Exento de IVA',
    NOT_TAXED: 'No objeto de IVA',
}

/** Tarifa de IVA de cada código, como porcentaje (0-100). */
export const TAX_CODE_RATES: Record<TaxCode, number> = {
    VAT_0: 0,
    VAT_5: 5,
    VAT_8_TOURISM: 8,
    VAT_12: 12,
    VAT_13: 13,
    VAT_14: 14,
    VAT_15: 15,
    EXEMPT: 0,
    NOT_TAXED: 0,
}

/**
 * Subcategorías de materiales de construcción. Espejo de
 * `ConstructionMaterialCode` en faclab-core (src/shared/domain/tax.py): Tabla 31
 * del Anexo 23 de la ficha técnica offline 2.34, con el texto de la Res.
 * NAC-DGERCGC24-00000013. El código va exacto en la factura.
 */
export const CONSTRUCTION_MATERIAL_CODES = [
    'F010101',
    'F010201',
    'F010202',
    'F010203',
    'F010204',
    'F010205',
    'F010301',
    'F010401',
    'F010402',
    'F010501',
    'F010601',
    'F010701',
    'F010702',
    'F010703',
    'F010801',
    'F010802',
    'F010803',
    'F010804',
] as const

export type ConstructionMaterialCode =
    (typeof CONSTRUCTION_MATERIAL_CODES)[number]

export const CONSTRUCTION_MATERIAL_LABELS: Record<
    ConstructionMaterialCode,
    string
> = {
    F010101: 'Varilla laminada corrugada AS42 de 8, 10 y 12 mm',
    F010201: 'Arcilla',
    F010202: 'Arena',
    F010203: 'Cal',
    F010204: 'Caliza',
    F010205: 'Pétreos',
    F010301: 'Hormigón premezclado',
    F010401: 'Cemento y sus derivados',
    F010402: 'Residuo cementero',
    F010501: 'Chatarra ferrosa',
    F010601: 'Morteros',
    F010701: 'Clinker',
    F010702: 'Puzolana',
    F010703: 'Yeso',
    F010801: 'Adoquín',
    F010802: 'Bloques',
    F010803: 'Ladrillos',
    F010804: 'Productos de hormigón prefabricado',
}

/** La tarifa de esos materiales: `CONSTRUCTION_MATERIAL_TAX_CODE` en faclab-core. */
export const CONSTRUCTION_MATERIAL_TAX_CODE: TaxCode = 'VAT_5'
