import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { ControlledSelect } from '@/components/ui/Form/controlled'
import { PAYMENT_METHOD_LABELS } from '@features/sales'
import { formatCurrency } from '@shared/lib/format'
import { allocateFifo } from '../model/allocation'
import {
    customerPaymentSchema,
    type CustomerPaymentFormValues,
} from '../model/customerPayment.schema'
import {
    PAYMENT_ON_ACCOUNT_METHODS,
    type CustomerAccount,
    type CustomerPaymentInput,
} from '../model/types'
import { formatDueDay } from '../model/days'

interface CustomerPaymentFormProps {
    formId: string
    account: CustomerAccount
    isSubmitting?: boolean
    onSubmit: (data: CustomerPaymentInput) => void
}

const methodOptions = PAYMENT_ON_ACCOUNT_METHODS.map((value) => ({
    value,
    label: PAYMENT_METHOD_LABELS[value],
}))

const modeOptions = [
    { value: 'FIFO' as const, label: 'A la que vence primero' },
    { value: 'MANUAL' as const, label: 'Elegir las cuentas' },
]

const toNumber = (value: unknown) =>
    value === '' || value === null || value === undefined
        ? undefined
        : Number(value)

/**
 * Un abono a las cuentas abiertas del cliente: por antigüedad (FIFO, como lo
 * aplica faclab-core sin indicación) o a mano por cuenta. No admite saldo a
 * favor: el monto no pasa lo que el cliente debe. Para otro cliente se monta de
 * nuevo (`key`): un `reset` sin el monto deja de convertirlo a número.
 */
const CustomerPaymentForm = ({
    formId,
    account,
    isSubmitting = false,
    onSubmit,
}: CustomerPaymentFormProps) => {
    const balances = Object.fromEntries(
        account.receivables.map((r) => [r.id, r.balance])
    )
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CustomerPaymentFormValues>({
        resolver: zodResolver(
            customerPaymentSchema({
                outstanding: account.outstanding,
                balances,
            })
        ),
        defaultValues: { paymentMethod: 'CASH', mode: 'FIFO' },
    })

    const amount = useWatch({ control, name: 'amount' }) ?? 0
    const mode = useWatch({ control, name: 'mode' })
    const preview =
        mode === 'FIFO' ? allocateFifo(amount, account.receivables) : []

    const submit = (values: CustomerPaymentFormValues) =>
        onSubmit({
            customerId: account.customerId,
            amount: values.amount,
            paymentMethod: values.paymentMethod,
            reference: values.reference || null,
            notes: values.notes || null,
            ...(values.mode === 'MANUAL'
                ? {
                      applications: Object.entries(values.applications ?? {})
                          .filter(([, value]) => value > 0)
                          .map(([id, value]) => ({
                              receivableId: Number(id),
                              amount: value,
                          })),
                  }
                : {}),
        })

    // The sum's error is on `applications`; each receivable's, on its key
    const applicationsError =
        typeof errors.applications?.message === 'string'
            ? errors.applications.message
            : undefined

    return (
        <form id={formId} onSubmit={handleSubmit(submit)}>
            <FormContainer>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Debe {formatCurrency(account.outstanding)}
                    {account.overdue > 0 &&
                        `, ${formatCurrency(account.overdue)} vencido`}
                    .
                </p>
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                    <FormItem
                        asterisk
                        label="Monto"
                        invalid={!!errors.amount}
                        errorMessage={errors.amount?.message}
                    >
                        <Input
                            type="number"
                            step="0.01"
                            prefix="$"
                            autoComplete="off"
                            disabled={isSubmitting}
                            invalid={!!errors.amount}
                            {...register('amount', { setValueAs: toNumber })}
                        />
                    </FormItem>
                    <FormItem asterisk label="Medio de pago">
                        <ControlledSelect
                            name="paymentMethod"
                            control={control}
                            options={methodOptions}
                            isDisabled={isSubmitting}
                        />
                    </FormItem>
                    <FormItem
                        label="Referencia"
                        invalid={!!errors.reference}
                        errorMessage={errors.reference?.message}
                    >
                        <Input
                            autoComplete="off"
                            placeholder="Transferencia, cheque…"
                            disabled={isSubmitting}
                            {...register('reference')}
                        />
                    </FormItem>
                    <FormItem label="Aplicar">
                        <ControlledSelect
                            name="mode"
                            control={control}
                            options={modeOptions}
                            isDisabled={isSubmitting}
                        />
                    </FormItem>
                </div>
                <FormItem
                    label="Notas"
                    invalid={!!errors.notes}
                    errorMessage={errors.notes?.message}
                >
                    <Input
                        autoComplete="off"
                        disabled={isSubmitting}
                        {...register('notes')}
                    />
                </FormItem>

                <div className="space-y-2">
                    {account.receivables.map((receivable) => {
                        const applied = preview.find(
                            (p) => p.receivableId === receivable.id
                        )
                        const label = `${
                            receivable.saleNumber ??
                            `Venta ${receivable.saleId}`
                        }`
                        return (
                            <div
                                key={receivable.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-600"
                            >
                                <div>
                                    <p className="font-medium">{label}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Saldo{' '}
                                        {formatCurrency(receivable.balance)} ·
                                        vence {formatDueDay(receivable.dueOn)}
                                        {receivable.daysOverdue > 0 &&
                                            ` (${receivable.daysOverdue} días vencida)`}
                                    </p>
                                </div>
                                {mode === 'MANUAL' ? (
                                    <Input
                                        type="number"
                                        step="0.01"
                                        size="sm"
                                        prefix="$"
                                        className="w-32"
                                        aria-label={`Abono a ${label}`}
                                        disabled={isSubmitting}
                                        invalid={
                                            !!errors.applications?.[
                                                String(receivable.id)
                                            ]
                                        }
                                        {...register(
                                            `applications.${receivable.id}`,
                                            {
                                                setValueAs: (v) =>
                                                    toNumber(v) ?? 0,
                                            }
                                        )}
                                    />
                                ) : (
                                    <span className="text-sm font-medium">
                                        {applied
                                            ? formatCurrency(applied.amount)
                                            : '—'}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                    {mode === 'MANUAL' && applicationsError && (
                        <p className="text-sm text-red-500">
                            {applicationsError}
                        </p>
                    )}
                </div>
            </FormContainer>
        </form>
    )
}

export default CustomerPaymentForm
