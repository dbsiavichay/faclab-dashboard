import { roundMoney } from '@shared/lib/money'
import type { Receivable } from './types'

/*
 * Cómo reparte faclab-core un abono sin aplicación manual (FIFO): primero la
 * cuenta que vence antes y, a igual vencimiento, la más antigua. Sirve para
 * mostrar a qué cuentas irá antes de registrarlo.
 */

export interface PreviewedApplication {
    receivableId: number
    amount: number
    /** El saldo que le quedará */
    balance: number
}

export function allocateFifo(
    amount: number,
    receivables: Pick<Receivable, 'id' | 'dueOn' | 'balance'>[]
): PreviewedApplication[] {
    const pending = [...receivables]
        .filter((r) => r.balance > 0)
        .sort((a, b) =>
            a.dueOn === b.dueOn ? a.id - b.id : a.dueOn < b.dueOn ? -1 : 1
        )
    let left = roundMoney(amount)
    const applied: PreviewedApplication[] = []
    for (const receivable of pending) {
        if (left <= 0) break
        const take = Math.min(left, receivable.balance)
        applied.push({
            receivableId: receivable.id,
            amount: take,
            balance: roundMoney(receivable.balance - take),
        })
        left = roundMoney(left - take)
    }
    return applied
}
