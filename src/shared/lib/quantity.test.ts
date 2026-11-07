import { describe, it, expect } from 'vitest'
import {
    decimalsHint,
    fitsDecimals,
    formatQuantity,
    parseQuantity,
    quantitySchema,
    roundQuantity,
} from './quantity'

describe('roundQuantity', () => {
    it('rounds half up and drops binary noise', () => {
        expect(roundQuantity(0.1 + 0.2)).toBe(0.3)
        expect(roundQuantity(2.5 - 1.25)).toBe(1.25)
        expect(roundQuantity(1.255, 2)).toBe(1.26)
        expect(roundQuantity(1.0000005)).toBe(1.000001)
    })
})

describe('fitsDecimals', () => {
    it('accepts what the unit allows', () => {
        expect(fitsDecimals(2.5, 2)).toBe(true)
        expect(fitsDecimals(3, 0)).toBe(true)
        expect(fitsDecimals(0.1 + 0.2, 1)).toBe(true)
    })

    it('rejects more decimals than the unit allows', () => {
        expect(fitsDecimals(1.5, 0)).toBe(false)
        expect(fitsDecimals(1.255, 2)).toBe(false)
    })
})

describe('formatQuantity', () => {
    it('writes a decimal comma without trailing zeros', () => {
        expect(formatQuantity(2.5)).toBe('2,5')
        expect(formatQuantity(10)).toBe('10')
        expect(formatQuantity(1234.5)).toBe('1234,5')
        expect(formatQuantity(0.1 + 0.2)).toBe('0,3')
    })

    it('adds the unit symbol', () => {
        expect(formatQuantity(2.5, 'm')).toBe('2,5 m')
        expect(formatQuantity(3, null)).toBe('3')
    })
})

describe('parseQuantity', () => {
    it('reads a comma or a dot', () => {
        expect(parseQuantity('2,5')).toBe(2.5)
        expect(parseQuantity(' 1.25 ')).toBe(1.25)
        expect(parseQuantity('3')).toBe(3)
    })

    it('rejects what is not a number', () => {
        expect(parseQuantity('')).toBeNull()
        expect(parseQuantity('2,5,1')).toBeNull()
        expect(parseQuantity('abc')).toBeNull()
    })
})

describe('decimalsHint', () => {
    it('says what the unit takes', () => {
        expect(decimalsHint(0)).toBe('Solo cantidades enteras')
        expect(decimalsHint(1)).toBe('Máximo 1 decimal')
        expect(decimalsHint(3)).toBe('Máximo 3 decimales')
    })
})

describe('quantitySchema', () => {
    it('takes decimals up to six', () => {
        expect(quantitySchema().safeParse(2.5).success).toBe(true)
        expect(quantitySchema().safeParse(0.000001).success).toBe(true)
        expect(quantitySchema().safeParse(1.1234567).success).toBe(false)
    })

    it('is positive unless zero is allowed', () => {
        expect(quantitySchema().safeParse(0).success).toBe(false)
        expect(quantitySchema({ allowZero: true }).safeParse(0).success).toBe(
            true
        )
        expect(quantitySchema({ allowZero: true }).safeParse(-1).success).toBe(
            false
        )
    })
})
