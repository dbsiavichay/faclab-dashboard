import { describe, expect, it } from 'vitest'
import {
    emailQuoteSchema,
    quoteCreateSchema,
    quoteItemCreateSchema,
    renewQuoteSchema,
} from '../quote.schema'
import { quoteAbilities } from '../abilities'
import { addDays, isExpired, localDay } from '../types'

const TODAY = '2026-11-11'

describe('quoteCreateSchema', () => {
    it('takes a customer or the final consumer and a validity from today', () => {
        const schema = quoteCreateSchema(TODAY)

        expect(
            schema.safeParse({ customerId: 6, validUntil: '2026-11-26' })
                .success
        ).toBe(true)
        expect(
            schema.safeParse({ customerId: null, validUntil: TODAY }).success
        ).toBe(true)
        const past = schema.safeParse({
            customerId: null,
            validUntil: '2026-11-10',
        })
        expect(past.success).toBe(false)
        expect(past.error?.issues[0].message).toBe(
            'Debe ser hoy o una fecha posterior'
        )
    })

    it('renews only to today or later', () => {
        expect(
            renewQuoteSchema(TODAY).safeParse({ validUntil: '2026-12-01' })
                .success
        ).toBe(true)
        expect(
            renewQuoteSchema(TODAY).safeParse({ validUntil: '' }).success
        ).toBe(false)
    })
})

describe('quoteItemCreateSchema', () => {
    it('needs a product and a discount from 0 to 100', () => {
        const valid = { productId: 3, quantity: 2, discount: 5 }
        expect(quoteItemCreateSchema.safeParse(valid).success).toBe(true)
        expect(
            quoteItemCreateSchema.safeParse({ ...valid, discount: 101 }).success
        ).toBe(false)
        expect(
            quoteItemCreateSchema.safeParse({ ...valid, productId: undefined })
                .success
        ).toBe(false)
    })
})

describe('emailQuoteSchema', () => {
    it('needs a valid address', () => {
        expect(emailQuoteSchema.safeParse({ to: 'a@b.ec' }).success).toBe(true)
        expect(emailQuoteSchema.safeParse({ to: 'no' }).success).toBe(false)
    })
})

describe('dates', () => {
    it('adds days to a local day and formats today', () => {
        expect(addDays('2026-11-25', 15)).toBe('2026-12-10')
        expect(localDay(new Date(2026, 0, 5))).toBe('2026-01-05')
    })

    it('treats an open quote past its date as expired', () => {
        expect(
            isExpired({ status: 'SENT', validUntil: '2026-11-10' }, TODAY)
        ).toBe(true)
        expect(isExpired({ status: 'SENT', validUntil: TODAY }, TODAY)).toBe(
            false
        )
        expect(
            isExpired({ status: 'CONVERTED', validUntil: '2026-11-01' }, TODAY)
        ).toBe(false)
        expect(isExpired({ status: 'EXPIRED', validUntil: TODAY }, TODAY)).toBe(
            true
        )
    })
})

describe('quoteAbilities', () => {
    const items = [{} as never]
    const all = { canWrite: true, canCharge: true }

    it('edits a draft and sends, accepts or charges one with items in force', () => {
        const can = quoteAbilities(
            { status: 'DRAFT', validUntil: TODAY, items },
            TODAY,
            all
        )

        expect(can).toMatchObject({
            expired: false,
            edit: true,
            send: true,
            email: true,
            accept: true,
            renew: false,
            charge: true,
        })
    })

    it('only renews an expired one', () => {
        const can = quoteAbilities(
            { status: 'SENT', validUntil: '2026-11-01', items },
            TODAY,
            all
        )

        expect(can).toMatchObject({
            expired: true,
            send: false,
            email: false,
            accept: false,
            renew: true,
            charge: false,
        })
    })

    it('needs items and the permissions', () => {
        expect(
            quoteAbilities(
                { status: 'DRAFT', validUntil: TODAY, items: [] },
                TODAY,
                all
            ).send
        ).toBe(false)
        const reader = quoteAbilities(
            { status: 'ACCEPTED', validUntil: TODAY, items },
            TODAY,
            { canWrite: false, canCharge: false }
        )
        expect(Object.values(reader).filter(Boolean)).toEqual([])
    })
})
