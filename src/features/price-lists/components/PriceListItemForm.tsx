import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { makeNumberRegister } from '@/components/ui/Form/utils'
import { ProductSelect, useProduct } from '@features/products'
import { formatCurrency } from '@shared/lib/format'
import { formatQuantity } from '@shared/lib/quantity'
import {
    priceListItemCreateSchema,
    priceListItemUpdateSchema,
    type PriceListItemCreateFormValues,
    type PriceListItemUpdateFormValues,
} from '../model/priceList.schema'
import type {
    PriceListItem,
    PriceListItemCreateInput,
    PriceListItemUpdateInput,
} from '../model/types'

const minQuantityHint = (isDefault: boolean) =>
    isDefault
        ? 'En la lista general, una escala: el precio rige desde esa cantidad.'
        : '0 es el precio de la lista para cualquier cantidad; más, una escala por volumen.'

// ─── Create ───────────────────────────────────────────────────────────────────

interface CreateFormProps {
    formId: string
    isDefault: boolean
    isSubmitting?: boolean
    onSubmit: (data: PriceListItemCreateInput) => void
}

const PriceListItemCreateForm = ({
    formId,
    isDefault,
    isSubmitting = false,
    onSubmit,
}: CreateFormProps) => {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<PriceListItemCreateFormValues>({
        resolver: zodResolver(priceListItemCreateSchema),
        defaultValues: {
            productId: undefined,
            presentationId: null,
            price: 0,
            // La general solo lleva escalas
            minQuantity: isDefault ? 1 : 0,
        },
    })
    const numberRegister = makeNumberRegister(register)
    const [productId, presentationId] = useWatch({
        control,
        name: ['productId', 'presentationId'],
    })

    // Sus presentaciones (S5.2): la caja sin precio en la lista toma el de la
    // unidad base × su factor
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
    const generalPrice = presentation
        ? presentation.effectiveSalePrice
        : product?.salePrice

    return (
        <form
            id={formId}
            onSubmit={handleSubmit((values) =>
                onSubmit({
                    productId: values.productId,
                    presentationId: values.presentationId ?? undefined,
                    price: values.price,
                    minQuantity: values.minQuantity,
                })
            )}
        >
            <FormContainer>
                <FormItem
                    asterisk
                    htmlFor="priceListItem-productId"
                    label="Producto"
                    invalid={!!errors.productId}
                    errorMessage={errors.productId?.message}
                >
                    <Controller
                        name="productId"
                        control={control}
                        render={({ field }) => (
                            <ProductSelect
                                inputId="priceListItem-productId"
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
                        htmlFor="priceListItem-presentationId"
                        label="Presentación"
                    >
                        <Controller
                            name="presentationId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    inputId="priceListItem-presentationId"
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
                                        field.onChange(option?.value ?? null)
                                    }
                                />
                            )}
                        />
                    </FormItem>
                )}

                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                    <FormItem
                        asterisk
                        htmlFor="priceListItem-minQuantity"
                        label={
                            presentation && !presentation.isBase
                                ? `Desde (${presentation.name})`
                                : 'Desde la cantidad'
                        }
                        invalid={!!errors.minQuantity}
                        errorMessage={errors.minQuantity?.message}
                    >
                        <Input
                            id="priceListItem-minQuantity"
                            type="number"
                            step="any"
                            min={0}
                            disabled={isSubmitting}
                            invalid={!!errors.minQuantity}
                            {...numberRegister('minQuantity', {
                                emptyValue: 0,
                            })}
                        />
                    </FormItem>
                    <FormItem
                        asterisk
                        htmlFor="priceListItem-price"
                        label="Precio"
                        invalid={!!errors.price}
                        errorMessage={errors.price?.message}
                    >
                        <Input
                            id="priceListItem-price"
                            type="number"
                            step="0.01"
                            min={0}
                            prefix="$"
                            disabled={isSubmitting}
                            invalid={!!errors.price}
                            {...numberRegister('price', { emptyValue: 0 })}
                        />
                    </FormItem>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {minQuantityHint(isDefault)}
                    {generalPrice != null &&
                        ` Precio general: ${formatCurrency(generalPrice)}.`}
                </p>
            </FormContainer>
        </form>
    )
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UpdateFormProps {
    formId: string
    item: PriceListItem
    isDefault: boolean
    isSubmitting?: boolean
    onSubmit: (data: PriceListItemUpdateInput) => void
}

const PriceListItemUpdateForm = ({
    formId,
    item,
    isDefault,
    isSubmitting = false,
    onSubmit,
}: UpdateFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PriceListItemUpdateFormValues>({
        resolver: zodResolver(priceListItemUpdateSchema),
        defaultValues: { price: item.price, minQuantity: item.minQuantity },
    })
    const numberRegister = makeNumberRegister(register)

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <FormContainer>
                <p className="mb-4 text-sm">
                    <span className="font-semibold">{item.productName}</span>
                    {item.presentationName && (
                        <span className="text-gray-500 dark:text-gray-400">
                            {' '}
                            · {item.presentationName}
                        </span>
                    )}
                </p>
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                    <FormItem
                        asterisk
                        htmlFor="priceListItem-minQuantity"
                        label="Desde la cantidad"
                        invalid={!!errors.minQuantity}
                        errorMessage={errors.minQuantity?.message}
                    >
                        <Input
                            id="priceListItem-minQuantity"
                            type="number"
                            step="any"
                            min={0}
                            disabled={isSubmitting}
                            invalid={!!errors.minQuantity}
                            {...numberRegister('minQuantity', {
                                emptyValue: 0,
                            })}
                        />
                    </FormItem>
                    <FormItem
                        asterisk
                        htmlFor="priceListItem-price"
                        label="Precio"
                        invalid={!!errors.price}
                        errorMessage={errors.price?.message}
                    >
                        <Input
                            id="priceListItem-price"
                            type="number"
                            step="0.01"
                            min={0}
                            prefix="$"
                            disabled={isSubmitting}
                            invalid={!!errors.price}
                            {...numberRegister('price', { emptyValue: 0 })}
                        />
                    </FormItem>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {minQuantityHint(isDefault)}
                </p>
            </FormContainer>
        </form>
    )
}

// ─── Wrapper ──────────────────────────────────────────────────────────────────

interface PriceListItemFormProps {
    formId: string
    item: PriceListItem | null
    isDefault: boolean
    isSubmitting?: boolean
    onCreate: (data: PriceListItemCreateInput) => void
    onUpdate: (data: PriceListItemUpdateInput) => void
}

/** El producto y la presentación de un precio no cambian: se borra y se crea otro */
const PriceListItemForm = ({
    formId,
    item,
    isDefault,
    isSubmitting,
    onCreate,
    onUpdate,
}: PriceListItemFormProps) =>
    item ? (
        <PriceListItemUpdateForm
            formId={formId}
            item={item}
            isDefault={isDefault}
            isSubmitting={isSubmitting}
            onSubmit={onUpdate}
        />
    ) : (
        <PriceListItemCreateForm
            formId={formId}
            isDefault={isDefault}
            isSubmitting={isSubmitting}
            onSubmit={onCreate}
        />
    )

export default PriceListItemForm
