import { z } from 'zod'
import { roundMoney } from '@shared/lib/money'
import { PAYMENT_ON_ACCOUNT_METHODS } from './types'

export const PAYMENT_MODES = ['FIFO', 'MANUAL'] as const

interface OpenBalances {
    /** Lo que debe el cliente */
    outstanding: number
    /** El saldo de cada cuenta abierta, por id */
    balances: Record<number, number>
}

const cents = (value: number) => Math.round(roundMoney(value) * 100)

/**
 * Un abono: no pasa lo que el cliente debe (no hay saldo a favor) y, aplicado
 * a mano, cada cuenta recibe hasta su saldo y lo aplicado suma el abono, como
 * lo exige faclab-core.
 */
export const customerPaymentSchema = ({
    outstanding,
    balances,
}: OpenBalances) =>
    z
        .object({
            amount: z
                .number({ error: 'Indica el monto' })
                .positive('Debe ser mayor que 0')
                .refine(
                    (value) => cents(value) <= cents(outstanding),
                    'Supera lo que debe el cliente'
                ),
            paymentMethod: z.enum(PAYMENT_ON_ACCOUNT_METHODS),
            reference: z.string().max(128, 'Máximo 128 caracteres').optional(),
            notes: z.string().max(512, 'Máximo 512 caracteres').optional(),
            mode: z.enum(PAYMENT_MODES),
            // Receivable id → what it pays of it, by hand
            applications: z.record(z.string(), z.number().min(0)).optional(),
        })
        .superRefine((values, ctx) => {
            if (values.mode !== 'MANUAL') return
            const entries = Object.entries(values.applications ?? {}).filter(
                ([, amount]) => amount > 0
            )
            for (const [id, amount] of entries) {
                if (cents(amount) > cents(balances[Number(id)] ?? 0)) {
                    ctx.addIssue({
                        code: 'custom',
                        path: ['applications', id],
                        message: 'Supera el saldo de la cuenta',
                    })
                }
            }
            const applied = entries.reduce(
                (sum, [, amount]) => sum + cents(amount),
                0
            )
            if (applied !== cents(values.amount)) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['applications'],
                    message: 'Lo aplicado debe sumar el monto del abono',
                })
            }
        })

export type CustomerPaymentFormValues = z.infer<
    ReturnType<typeof customerPaymentSchema>
>
