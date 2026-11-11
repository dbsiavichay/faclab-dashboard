import { useEffect } from 'react'
import {
    Controller,
    useForm,
    type Control,
    type FieldErrors,
    type UseFormRegister,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'
import FormModal from '@/components/shared/FormModal'
import { CustomerSelect } from '@features/customers'
import type { BranchSummary } from '@/@types/auth'
import {
    quoteCreateSchema,
    quoteUpdateSchema,
    type QuoteCreateFormValues,
    type QuoteUpdateFormValues,
} from '../model/quote.schema'
import { addDays, localDay, type Quote } from '../model/types'

const FORM_ID = 'quote-form'
// Lo usual en una proforma de ferretería: quince días
const DEFAULT_VALIDITY_DAYS = 15

interface FieldsProps {
    control: Control<QuoteCreateFormValues>
    register: UseFormRegister<QuoteCreateFormValues>
    errors: FieldErrors<QuoteCreateFormValues>
    disabled: boolean
    branchLabel: string
}

const QuoteFields = ({
    control,
    register,
    errors,
    disabled,
    branchLabel,
}: FieldsProps) => (
    <FormContainer>
        <FormItem label="Sucursal">
            <Input disabled readOnly value={branchLabel} />
        </FormItem>
        <FormItem
            htmlFor="quote-customerId"
            label="Cliente"
            invalid={!!errors.customerId}
            errorMessage={errors.customerId?.message}
        >
            <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                    <CustomerSelect
                        isClearable
                        inputId="quote-customerId"
                        placeholder="Consumidor final"
                        value={field.value}
                        isDisabled={disabled}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                    />
                )}
            />
        </FormItem>
        <FormItem
            asterisk
            label="Válida hasta"
            invalid={!!errors.validUntil}
            errorMessage={errors.validUntil?.message}
        >
            <Input
                type="date"
                disabled={disabled}
                invalid={!!errors.validUntil}
                {...register('validUntil')}
            />
        </FormItem>
        <FormItem
            label="Notas"
            invalid={!!errors.notes}
            errorMessage={errors.notes?.message}
        >
            <Input
                textArea
                placeholder="Se imprimen en la cotización (obra, condiciones de entrega)"
                disabled={disabled}
                invalid={!!errors.notes}
                {...register('notes')}
            />
        </FormItem>
    </FormContainer>
)

const branchLabel = (branch: {
    establishmentCode: string | null
    name: string | null
}) => `${branch.establishmentCode ?? ''} ${branch.name ?? ''}`.trim()

// ─── Create ───────────────────────────────────────────────────────────────────

interface CreateProps {
    open: boolean
    branch: BranchSummary | null
    isSubmitting: boolean
    onClose: () => void
    onSubmit: (values: QuoteCreateFormValues) => void
}

export const QuoteCreateForm = ({
    open,
    branch,
    isSubmitting,
    onClose,
    onSubmit,
}: CreateProps) => {
    const today = localDay()
    const {
        control,
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<QuoteCreateFormValues>({
        resolver: zodResolver(quoteCreateSchema(today)),
    })

    useEffect(() => {
        if (open) {
            reset({
                customerId: null,
                validUntil: addDays(today, DEFAULT_VALIDITY_DAYS),
                notes: '',
            })
        }
    }, [open, reset, today])

    return (
        <FormModal
            isOpen={open}
            title="Nueva cotización"
            formId={FORM_ID}
            isSubmitting={isSubmitting}
            onClose={onClose}
        >
            <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
                <QuoteFields
                    control={control}
                    register={register}
                    errors={errors}
                    disabled={isSubmitting}
                    branchLabel={
                        branch ? branchLabel(branch) : 'Sin sucursal activa'
                    }
                />
            </form>
        </FormModal>
    )
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UpdateProps {
    open: boolean
    quote: Quote
    isSubmitting: boolean
    onClose: () => void
    onSubmit: (values: QuoteUpdateFormValues) => void
}

export const QuoteUpdateForm = ({
    open,
    quote,
    isSubmitting,
    onClose,
    onSubmit,
}: UpdateProps) => {
    const today = localDay()
    const {
        control,
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<QuoteUpdateFormValues>({
        resolver: zodResolver(quoteUpdateSchema(today)),
    })

    useEffect(() => {
        if (open) {
            reset({
                customerId: quote.customerId,
                validUntil: quote.validUntil,
                notes: quote.notes ?? '',
            })
        }
    }, [open, quote, reset])

    return (
        <FormModal
            isOpen={open}
            title="Editar cotización"
            formId={FORM_ID}
            isSubmitting={isSubmitting}
            onClose={onClose}
        >
            <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
                <QuoteFields
                    control={control}
                    register={register}
                    errors={errors}
                    disabled={isSubmitting}
                    branchLabel={branchLabel({
                        establishmentCode: quote.establishmentCode,
                        name: quote.branchName,
                    })}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Con otro cliente, los ítems toman los precios de sus listas.
                </p>
            </form>
        </FormModal>
    )
}
