import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { makeNumberRegister } from '@/components/ui/Form/utils'
import FormModal from '@/components/shared/FormModal'
import { ProductSelect, useProduct } from '@features/products'
import { formatQuantity } from '@shared/lib/quantity'
import {
    quoteItemCreateSchema,
    quoteItemUpdateSchema,
    type QuoteItemCreateFormValues,
    type QuoteItemUpdateFormValues,
} from '../model/quote.schema'
import type { QuoteItem } from '../model/types'

const FORM_ID = 'quote-item-form'
const PRICE_NOTE =
    'El precio lo ponen las listas del cliente y de la sucursal, como en una venta de hoy.'

// ─── Create ───────────────────────────────────────────────────────────────────

interface CreateProps {
    open: boolean
    isSubmitting: boolean
    onClose: () => void
    onSubmit: (values: QuoteItemCreateFormValues) => void
}

export const QuoteItemCreateForm = ({
    open,
    isSubmitting,
    onClose,
    onSubmit,
}: CreateProps) => {
    const {
        control,
        register,
        reset,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<QuoteItemCreateFormValues>({
        resolver: zodResolver(quoteItemCreateSchema),
    })
    const numberRegister = makeNumberRegister(register)

    const [productId, presentationId, quantity] = useWatch({
        control,
        name: ['productId', 'presentationId', 'quantity'],
    })

    // Its presentations (S5.2): quoted by the box, sold the same way
    const { data: product } = useProduct(productId ?? 0)
    const presentations = (product?.presentations ?? []).filter(
        (p) => p.isActive
    )
    const presentation = presentations.find((p) =>
        presentationId ? p.id === presentationId : p.isBase
    )
    const presentationOptions = presentations.map((p) => ({
        value: p.isBase ? null : p.id,
        label: p.isBase
            ? `${p.name} (unidad base)`
            : `${p.name} · ${formatQuantity(p.factor, product?.unitSymbol)}`,
    }))

    useEffect(() => {
        if (open) {
            reset({
                productId: undefined,
                presentationId: null,
                quantity: 1,
                discount: 0,
            })
        }
    }, [open, reset])

    return (
        <FormModal
            isOpen={open}
            title="Agregar ítem"
            formId={FORM_ID}
            isSubmitting={isSubmitting}
            onClose={onClose}
        >
            <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
                <FormContainer>
                    <FormItem
                        asterisk
                        htmlFor="quoteItem-productId"
                        label="Producto"
                        invalid={!!errors.productId}
                        errorMessage={errors.productId?.message}
                    >
                        <Controller
                            name="productId"
                            control={control}
                            render={({ field }) => (
                                <ProductSelect
                                    inputId="quoteItem-productId"
                                    value={field.value}
                                    isDisabled={isSubmitting}
                                    onChange={(value) => {
                                        field.onChange(value)
                                        setValue('presentationId', null)
                                    }}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                    </FormItem>

                    {presentations.length > 1 && (
                        <FormItem
                            htmlFor="quoteItem-presentationId"
                            label="Presentación"
                        >
                            <Controller
                                name="presentationId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        inputId="quoteItem-presentationId"
                                        options={presentationOptions}
                                        value={
                                            presentationOptions.find(
                                                (o) =>
                                                    o.value ===
                                                    (field.value ?? null)
                                            ) ?? null
                                        }
                                        isDisabled={isSubmitting}
                                        onChange={(option) =>
                                            field.onChange(
                                                option?.value ?? null
                                            )
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                    )}

                    <FormItem
                        asterisk
                        label={
                            presentation && !presentation.isBase
                                ? `Cantidad (${presentation.name})`
                                : 'Cantidad'
                        }
                        invalid={!!errors.quantity}
                        errorMessage={errors.quantity?.message}
                        extra={
                            presentation && !presentation.isBase ? (
                                <span className="ml-2 text-xs text-gray-500">
                                    ={' '}
                                    {formatQuantity(
                                        (quantity ?? 0) * presentation.factor,
                                        product?.unitSymbol
                                    )}
                                </span>
                            ) : undefined
                        }
                    >
                        <Input
                            type="number"
                            step="any"
                            min={0}
                            disabled={isSubmitting}
                            invalid={!!errors.quantity}
                            {...numberRegister('quantity', { emptyValue: 1 })}
                        />
                    </FormItem>

                    <FormItem
                        label="Descuento (%)"
                        invalid={!!errors.discount}
                        errorMessage={errors.discount?.message}
                    >
                        <Input
                            type="number"
                            step="any"
                            min={0}
                            max={100}
                            disabled={isSubmitting}
                            invalid={!!errors.discount}
                            {...numberRegister('discount', { emptyValue: 0 })}
                        />
                    </FormItem>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {PRICE_NOTE}
                    </p>
                </FormContainer>
            </form>
        </FormModal>
    )
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UpdateProps {
    open: boolean
    item: QuoteItem
    isSubmitting: boolean
    onClose: () => void
    onSubmit: (values: QuoteItemUpdateFormValues) => void
}

export const QuoteItemUpdateForm = ({
    open,
    item,
    isSubmitting,
    onClose,
    onSubmit,
}: UpdateProps) => {
    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<QuoteItemUpdateFormValues>({
        resolver: zodResolver(quoteItemUpdateSchema),
    })
    const numberRegister = makeNumberRegister(register)

    useEffect(() => {
        if (open) {
            reset({ quantity: item.quantity, discount: item.discount })
        }
    }, [open, item, reset])

    return (
        <FormModal
            isOpen={open}
            title={`Editar ${item.productName ?? 'ítem'}`}
            formId={FORM_ID}
            isSubmitting={isSubmitting}
            onClose={onClose}
        >
            <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
                <FormContainer>
                    <FormItem
                        asterisk
                        label={
                            item.presentationName && item.unitFactor !== 1
                                ? `Cantidad (${item.presentationName})`
                                : 'Cantidad'
                        }
                        invalid={!!errors.quantity}
                        errorMessage={errors.quantity?.message}
                    >
                        <Input
                            type="number"
                            step="any"
                            min={0}
                            disabled={isSubmitting}
                            invalid={!!errors.quantity}
                            {...numberRegister('quantity', { emptyValue: 1 })}
                        />
                    </FormItem>
                    <FormItem
                        label="Descuento (%)"
                        invalid={!!errors.discount}
                        errorMessage={errors.discount?.message}
                    >
                        <Input
                            type="number"
                            step="any"
                            min={0}
                            max={100}
                            disabled={isSubmitting}
                            invalid={!!errors.discount}
                            {...numberRegister('discount', { emptyValue: 0 })}
                        />
                    </FormItem>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Otra cantidad toma el precio de su escala.
                    </p>
                </FormContainer>
            </form>
        </FormModal>
    )
}
