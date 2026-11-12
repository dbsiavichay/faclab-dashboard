import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { ControlledSelect } from '@/components/ui/Form/controlled'
import { PAYMENT_METHOD_LABELS } from '@features/sales'
import { formatCurrency } from '@shared/lib/format'
import { allocateFifo } from '../model/allocation'
import { formatDueDay } from '../model/days'
import {
    supplierPaymentSchema,
    type SupplierPaymentFormValues,
} from '../model/supplierPayment.schema'
import {
    SUPPLIER_PAYMENT_METHODS,
    type SupplierAccount,
    type SupplierPaymentInput,
} from '../model/types'

interface SupplierPaymentFormProps {
    formId: string
    account: SupplierAccount
    isSubmitting?: boolean
    onSubmit: (data: SupplierPaymentInput) => void
}

const methodOptions = SUPPLIER_PAYMENT_METHODS.map((value) => ({
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
 * Un pago a las cuentas abiertas del proveedor: por antigüedad (FIFO, como lo
 * aplica faclab-core sin indicación) o a mano por cuenta. No admite saldo a
 * favor: el monto no pasa lo que se le debe. Para otro proveedor se monta de
 * nuevo (`key`).
 */
const SupplierPaymentForm = ({
    formId,
    account,
    isSubmitting = false,
    onSubmit,
}: SupplierPaymentFormProps) => {
    const balances = Object.fromEntries(
        account.payables.map((p) => [p.id, p.balance])
    )
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SupplierPaymentFormValues>({
        resolver: zodResolver(
            supplierPaymentSchema({
                outstanding: account.outstanding,
                balances,
            })
        ),
        defaultValues: { paymentMethod: 'TRANSFER', mode: 'FIFO' },
    })

    const amount = useWatch({ control, name: 'amount' }) ?? 0
    const mode = useWatch({ control, name: 'mode' })
    const preview =
        mode === 'FIFO' ? allocateFifo(amount, account.payables) : []

    const submit = (values: SupplierPaymentFormValues) =>
        onSubmit({
            supplierId: account.supplierId,
            amount: values.amount,
            paymentMethod: values.paymentMethod,
            reference: values.reference || null,
            notes: values.notes || null,
            ...(values.mode === 'MANUAL'
                ? {
                      applications: Object.entries(values.applications ?? {})
                          .filter(([, value]) => value > 0)
                          .map(([id, value]) => ({
                              payableId: Number(id),
                              amount: value,
                          })),
                  }
                : {}),
        })

    const applicationsError =
        typeof errors.applications?.message === 'string'
            ? errors.applications.message
            : undefined

    return (
        <form id={formId} onSubmit={handleSubmit(submit)}>
            <FormContainer>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Se le debe {formatCurrency(account.outstanding)}
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
                            placeholder="N.º de transferencia o cheque"
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
                    {account.payables.map((payable) => {
                        const applied = preview.find(
                            (p) => p.payableId === payable.id
                        )
                        const label = payable.supplierInvoiceNumber
                            ? `Factura ${payable.supplierInvoiceNumber}`
                            : `${payable.orderNumber ?? 'Orden'} · recepción ${
                                  payable.purchaseReceiptId
                              }`
                        return (
                            <div
                                key={payable.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-600"
                            >
                                <div>
                                    <p className="font-medium">{label}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Saldo {formatCurrency(payable.balance)}{' '}
                                        · vence {formatDueDay(payable.dueOn)}
                                        {payable.daysOverdue > 0 &&
                                            ` (${payable.daysOverdue} días vencida)`}
                                    </p>
                                </div>
                                {mode === 'MANUAL' ? (
                                    <Input
                                        type="number"
                                        step="0.01"
                                        size="sm"
                                        prefix="$"
                                        className="w-32"
                                        aria-label={`Pago a ${label}`}
                                        disabled={isSubmitting}
                                        invalid={
                                            !!errors.applications?.[
                                                String(payable.id)
                                            ]
                                        }
                                        {...register(
                                            `applications.${payable.id}`,
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

export default SupplierPaymentForm
