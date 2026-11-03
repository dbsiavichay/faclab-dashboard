import { describe, it, expect } from 'vitest'
import type { Branch, EmissionPoint } from '@features/organization'
import { sequenceRows } from '../sequences'
import type { SriSequence } from '../types'

const branch = (overrides: Partial<Branch>): Branch => ({
    id: 1,
    establishmentCode: '001',
    name: 'Matriz',
    address: null,
    isMain: true,
    isActive: true,
    ...overrides,
})

const point = (overrides: Partial<EmissionPoint>): EmissionPoint => ({
    id: 1,
    branchId: 1,
    code: '001',
    name: null,
    isActive: true,
    ...overrides,
})

const sequence = (overrides: Partial<SriSequence>): SriSequence => ({
    establishment: '001',
    emissionPoint: '001',
    docType: '01',
    lastSequence: '000000041',
    nextSequence: 42,
    ...overrides,
})

describe('sequenceRows', () => {
    it('lists every active emission point, from 1 if it never issued', () => {
        const rows = sequenceRows(
            [
                branch({}),
                branch({ id: 2, establishmentCode: '002', name: 'Norte' }),
            ],
            [
                point({ id: 1, code: '001' }),
                point({ id: 2, code: '002', name: 'Caja 2' }),
                point({ id: 3, branchId: 2, code: '001' }),
            ],
            [sequence({})]
        )

        expect(rows).toEqual([
            {
                establishment: '001',
                emissionPoint: '001',
                branchName: 'Matriz',
                emissionPointName: null,
                lastSequence: '000000041',
                nextSequence: 42,
            },
            {
                establishment: '001',
                emissionPoint: '002',
                branchName: 'Matriz',
                emissionPointName: 'Caja 2',
                lastSequence: null,
                nextSequence: 1,
            },
            {
                establishment: '002',
                emissionPoint: '001',
                branchName: 'Norte',
                emissionPointName: null,
                lastSequence: null,
                nextSequence: 1,
            },
        ])
    })

    it('hides inactive points without invoices but keeps the ones that issued', () => {
        const rows = sequenceRows(
            [branch({})],
            [
                point({ id: 1, code: '001', isActive: false }),
                point({ id: 2, code: '002', isActive: false }),
            ],
            [sequence({ emissionPoint: '002' })]
        )

        expect(rows.map((r) => r.emissionPoint)).toEqual(['002'])
    })

    it('keeps counters whose codes are no longer in the core', () => {
        const rows = sequenceRows([], [], [sequence({ establishment: '009' })])

        expect(rows).toEqual([
            expect.objectContaining({
                establishment: '009',
                branchName: null,
                nextSequence: 42,
            }),
        ])
    })

    it('numbers each document apart: a credit note never overwrites an invoice', () => {
        const sequences = [
            sequence({
                docType: '01',
                lastSequence: '000000041',
                nextSequence: 42,
            }),
            sequence({
                docType: '04',
                lastSequence: '000000003',
                nextSequence: 4,
            }),
        ]

        const invoices = sequenceRows([branch({})], [point({})], sequences)
        const creditNotes = sequenceRows(
            [branch({})],
            [point({})],
            sequences,
            '04'
        )

        expect(invoices.map((row) => row.nextSequence)).toEqual([42])
        expect(creditNotes.map((row) => row.nextSequence)).toEqual([4])
    })

    it('starts the credit notes from 1 when the point only issued invoices', () => {
        const rows = sequenceRows(
            [branch({})],
            [point({})],
            [sequence({ docType: '01' })],
            '04'
        )

        expect(rows[0]).toMatchObject({ lastSequence: null, nextSequence: 1 })
    })
})
