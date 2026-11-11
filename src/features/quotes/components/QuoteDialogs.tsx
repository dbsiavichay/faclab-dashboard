import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'
import FormModal from '@/components/shared/FormModal'
import {
    emailQuoteSchema,
    renewQuoteSchema,
    type EmailQuoteFormValues,
    type RenewQuoteFormValues,
} from '../model/quote.schema'
import { addDays, localDay, type Quote } from '../model/types'

interface DialogProps<T> {
    open: boolean
    quote: Quote
    isSubmitting: boolean
    onClose: () => void
    onSubmit: (values: T) => void
}

/** El PDF por correo: al del cliente o al que se escriba */
export const EmailQuoteDialog = ({
    open,
    quote,
    isSubmitting,
    onClose,
    onSubmit,
}: DialogProps<EmailQuoteFormValues>) => {
    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<EmailQuoteFormValues>({
        resolver: zodResolver(emailQuoteSchema),
    })

    useEffect(() => {
        if (open) reset({ to: quote.customerEmail ?? '' })
    }, [open, quote, reset])

    return (
        <FormModal
            isOpen={open}
            title={`Enviar ${quote.number} por correo`}
            formId="email-quote-form"
            isSubmitting={isSubmitting}
            onClose={onClose}
        >
            <form id="email-quote-form" onSubmit={handleSubmit(onSubmit)}>
                <FormContainer>
                    <FormItem
                        asterisk
                        label="Correo"
                        invalid={!!errors.to}
                        errorMessage={errors.to?.message}
                    >
                        <Input
                            type="email"
                            autoComplete="off"
                            disabled={isSubmitting}
                            invalid={!!errors.to}
                            {...register('to')}
                        />
                    </FormItem>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Se adjunta la cotización en PDF.
                        {quote.status === 'DRAFT' &&
                            ' Al enviarla queda como enviada.'}
                    </p>
                </FormContainer>
            </form>
        </FormModal>
    )
}

// Lo usual en una proforma de ferretería: quince días
const RENEWAL_DAYS = 15

/** Una vencida vuelve a regir: queda en borrador, con los precios de hoy */
export const RenewQuoteDialog = ({
    open,
    quote,
    isSubmitting,
    onClose,
    onSubmit,
}: DialogProps<RenewQuoteFormValues>) => {
    const today = localDay()
    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<RenewQuoteFormValues>({
        resolver: zodResolver(renewQuoteSchema(today)),
    })

    useEffect(() => {
        if (open) reset({ validUntil: addDays(today, RENEWAL_DAYS) })
    }, [open, reset, today])

    return (
        <FormModal
            isOpen={open}
            title={`Renovar ${quote.number}`}
            formId="renew-quote-form"
            isSubmitting={isSubmitting}
            onClose={onClose}
        >
            <form id="renew-quote-form" onSubmit={handleSubmit(onSubmit)}>
                <FormContainer>
                    <FormItem
                        asterisk
                        label="Válida hasta"
                        invalid={!!errors.validUntil}
                        errorMessage={errors.validUntil?.message}
                    >
                        <Input
                            type="date"
                            disabled={isSubmitting}
                            invalid={!!errors.validUntil}
                            {...register('validUntil')}
                        />
                    </FormItem>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Vuelve a borrador, emitida hoy, y sus ítems toman los
                        precios de hoy.
                    </p>
                </FormContainer>
            </form>
        </FormModal>
    )
}
