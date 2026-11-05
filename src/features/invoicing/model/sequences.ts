import type { Branch, EmissionPoint } from '@features/organization'
import type { SriSequence, VoucherType } from './types'

/** Un establecimiento y punto de emisión con la numeración de un documento */
export interface SequenceRow {
    establishment: string
    emissionPoint: string
    /** Sucursal y punto del core; null si el core ya no los tiene */
    branchName: string | null
    emissionPointName: string | null
    lastSequence: string | null
    nextSequence: number
}

const keyOf = (establishment: string, emissionPoint: string) =>
    `${establishment}-${emissionPoint}`

/**
 * Cada punto de emisión activo de una sucursal activa, con su contador de ese
 * documento o, si todavía no emitió, desde 1; más los contadores de códigos que
 * el core ya no tiene activos (siguen numerando si vuelven). Facturas y notas de
 * crédito numeran aparte: un contador nunca pisa al del otro documento.
 */
export const sequenceRows = (
    branches: Branch[],
    emissionPoints: EmissionPoint[],
    allSequences: SriSequence[],
    docType: VoucherType = '01'
): SequenceRow[] => {
    const branchById = new Map(branches.map((b) => [b.id, b]))
    const rows = new Map<string, SequenceRow>()
    const sequences = allSequences.filter((s) => s.docType === docType)

    for (const point of emissionPoints) {
        const branch = branchById.get(point.branchId)
        if (!branch) continue
        const key = keyOf(branch.establishmentCode, point.code)
        const counted = sequences.some(
            (s) => keyOf(s.establishment, s.emissionPoint) === key
        )
        if (!(branch.isActive && point.isActive) && !counted) continue
        rows.set(key, {
            establishment: branch.establishmentCode,
            emissionPoint: point.code,
            branchName: branch.name,
            emissionPointName: point.name,
            lastSequence: null,
            nextSequence: 1,
        })
    }

    for (const sequence of sequences) {
        const key = keyOf(sequence.establishment, sequence.emissionPoint)
        rows.set(key, {
            establishment: sequence.establishment,
            emissionPoint: sequence.emissionPoint,
            branchName: rows.get(key)?.branchName ?? null,
            emissionPointName: rows.get(key)?.emissionPointName ?? null,
            lastSequence: sequence.lastSequence,
            nextSequence: sequence.nextSequence,
        })
    }

    return [...rows.values()].sort((a, b) =>
        keyOf(a.establishment, a.emissionPoint).localeCompare(
            keyOf(b.establishment, b.emissionPoint)
        )
    )
}
