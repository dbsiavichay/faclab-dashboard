import Input from '@/components/ui/Input'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { makeNumberRegister } from '@/components/ui/Form/utils'
import { ControlledSwitcher } from '@/components/ui/Form/controlled'
import { useForm, useWatch, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatCurrency } from '@shared/lib/format'
import { formatQuantity } from '@shared/lib/quantity'
import {
    productPresentationSchema,
    type ProductPresentationFormValues,
} from '../model/productPresentation.schema'
import type { Product, ProductPresentation } from '../model/types'

interface ProductPresentationFormProps {
    formId: string
    product: Product
    presentation: ProductPresentation | null
    isSubmitting?: boolean
    onSubmit: (data: ProductPresentationFormValues) => void
}

const emptyValues: DefaultValues<ProductPresentationFormValues> = {
    name: '',
    factor: undefined,
    barcode: '',
    salePrice: undefined,
    purchasePrice: undefined,
    isActive: true,
}

/** Lo que vale una presentación sin precio propio: factor × el del producto */
function byFactor(price: number | null, factor: number | undefined) {
    if (price == null || !factor || factor <= 0) return null
    return Math.round(price * factor * 100) / 100
}

/**
 * Una presentación del producto (S5.2). De la base, que es la unidad del
 * producto con sus precios, solo cambia el código de barras.
 */
export const ProductPresentationForm = ({
    formId,
    product,
    presentation,
    isSubmitting = false,
    onSubmit,
}: ProductPresentationFormProps) => {
    const isBase = presentation?.isBase ?? false
    const defaultValues: DefaultValues<ProductPresentationFormValues> =
        presentation
            ? {
                  name: presentation.name,
                  factor: presentation.factor,
                  barcode: presentation.barcode ?? '',
                  salePrice: presentation.salePrice ?? undefined,
                  purchasePrice: presentation.purchasePrice ?? undefined,
                  isActive: presentation.isActive,
              }
            : emptyValues

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ProductPresentationFormValues>({
        resolver: zodResolver(productPresentationSchema),
        defaultValues,
    })
    const numberRegister = makeNumberRegister(register)
    const factor = useWatch({ control, name: 'factor' })
    const fixed = isSubmitting || isBase
    const salePriceHint = byFactor(product.salePrice, factor)
    const purchasePriceHint = byFactor(product.purchasePrice, factor)

    return (
        <form
            id={formId}
            onSubmit={handleSubmit((values) =>
                onSubmit({
                    ...values,
                    barcode: values.barcode?.trim() || null,
                    salePrice: values.salePrice ?? null,
                    purchasePrice: values.purchasePrice ?? null,
                })
            )}
        >
            <FormContainer>
                {isBase && (
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Es la unidad del producto: lleva su nombre y sus
                        precios. Solo cambia su código de barras.
                    </p>
                )}
                <FormItem
                    asterisk
                    htmlFor="presentationName"
                    label="Nombre"
                    invalid={!!errors.name}
                    errorMessage={errors.name?.message}
                >
                    <Input
                        id="presentationName"
                        placeholder="Ej: Caja x100"
                        disabled={fixed}
                        invalid={!!errors.name}
                        {...register('name')}
                    />
                </FormItem>

                <FormItem
                    asterisk
                    htmlFor="factor"
                    label={`Unidades que trae${
                        product.unitSymbol ? ` (${product.unitSymbol})` : ''
                    }`}
                    invalid={!!errors.factor}
                    errorMessage={errors.factor?.message}
                >
                    <Input
                        id="factor"
                        type="number"
                        step="any"
                        min={0}
                        placeholder="Ej: 100"
                        disabled={fixed}
                        invalid={!!errors.factor}
                        {...numberRegister('factor')}
                    />
                    {!isBase && factor > 0 && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            1 de esta presentación ={' '}
                            {formatQuantity(factor, product.unitSymbol)}
                        </p>
                    )}
                </FormItem>

                <FormItem
                    htmlFor="presentationBarcode"
                    label="Código de barras"
                    invalid={!!errors.barcode}
                    errorMessage={errors.barcode?.message}
                >
                    <Input
                        id="presentationBarcode"
                        placeholder="Ej: 7861234567890"
                        disabled={isSubmitting}
                        invalid={!!errors.barcode}
                        {...register('barcode')}
                    />
                </FormItem>

                {!isBase && (
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem
                            htmlFor="presentationPurchasePrice"
                            label="Costo"
                            invalid={!!errors.purchasePrice}
                            errorMessage={errors.purchasePrice?.message}
                        >
                            <Input
                                id="presentationPurchasePrice"
                                type="number"
                                step="any"
                                placeholder={
                                    purchasePriceHint != null
                                        ? String(purchasePriceHint)
                                        : '0.00'
                                }
                                disabled={fixed}
                                invalid={!!errors.purchasePrice}
                                {...numberRegister('purchasePrice')}
                            />
                            {purchasePriceHint != null && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Vacío: {formatCurrency(purchasePriceHint)}
                                </p>
                            )}
                        </FormItem>
                        <FormItem
                            htmlFor="presentationSalePrice"
                            label="Precio de venta"
                            invalid={!!errors.salePrice}
                            errorMessage={errors.salePrice?.message}
                        >
                            <Input
                                id="presentationSalePrice"
                                type="number"
                                step="any"
                                placeholder={
                                    salePriceHint != null
                                        ? String(salePriceHint)
                                        : '0.00'
                                }
                                disabled={fixed}
                                invalid={!!errors.salePrice}
                                {...numberRegister('salePrice')}
                            />
                            {salePriceHint != null && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Vacío: {formatCurrency(salePriceHint)}
                                </p>
                            )}
                        </FormItem>
                    </div>
                )}

                {!isBase && (
                    <div className="flex items-center gap-3">
                        <ControlledSwitcher
                            name="isActive"
                            control={control}
                            disabled={fixed}
                        />
                        <label
                            htmlFor="isActive"
                            className="text-sm font-medium"
                        >
                            Activa
                        </label>
                    </div>
                )}
            </FormContainer>
        </form>
    )
}
