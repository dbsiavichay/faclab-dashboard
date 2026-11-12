import { roundMoney } from '@shared/lib/money'
import type { Payable } from './types'

/*
 * Cómo reparte faclab-core un pago sin aplicación manual (FIFO): primero la
 * cuenta que vence antes y, a igual vencimiento, la más antigua. Sirve para
 * mostrar a qué cuentas irá antes de registrarlo.
 */

export interface PreviewedApplication {
    payableId: number
    amount: number
    /** El saldo que le quedará */
    balance: number
}

export function allocateFifo(
    amount: number,
    payables: Pick<Payable, 'id' | 'dueOn' | 'balance'>[]
): PreviewedApplication[] {
    const pending = [...payables]
        .filter((p) => p.balance > 0)
        .sort((a, b) =>
            a.dueOn === b.dueOn ? a.id - b.id : a.dueOn < b.dueOn ? -1 : 1
        )
    let left = roundMoney(amount)
    const applied: PreviewedApplication[] = []
    for (const payable of pending) {
        if (left <= 0) break
        const take = Math.min(left, payable.balance)
        applied.push({
            payableId: payable.id,
            amount: take,
            balance: roundMoney(payable.balance - take),
        })
        left = roundMoney(left - take)
    }
    return applied
}
