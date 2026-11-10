import { useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem } from '@/components/ui/Form'
import { makeNumberRegister } from '@/components/ui/Form/utils'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    useAddPurchaseOrderItem,
    useUpdatePurchaseOrderItem,
} from '../hooks/usePurchaseOrders'
import { ProductSelect, useProduct } from '@features/products'
import Select from '@/components/ui/Select'
import { formatQuantity } from '@shared/lib/quantity'
import { notifySuccess, notifyError } from '@shared/ui/notify'
import { formatCurrency } from '@shared/lib/format'
import {
    purchaseOrderItemCreateSchema,
    purchaseOrderItemUpdateSchema,
    type PurchaseOrderItemCreateFormValues,
    type PurchaseOrderItemUpdateFormValues,
} from '../model/purchaseOrderItem.schema'
import type { PurchaseOrderItem } from '../model/types'

// ─── Create ───────────────────────────────────────────────────────────────────

interface CreateFormProps {
    open: boolean
    onClose: () => void
    orderId: number
}

const PurchaseOrderItemCreateForm = ({
    open,
    onClose,
    orderId,
}: CreateFormProps) => {
    const addItem = useAddPurchaseOrderItem()

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<PurchaseOrderItemCreateFormValues>({
        resolver: zodResolver(purchaseOrderItemCreateSchema),
        defaultValues: {
            productId: undefined,
            presentationId: null,
            quantityOrdered: 1,
            unitCost: 0,
        },
    })

    const numberRegister = makeNumberRegister(register)

    const [productId, presentationId, quantityOrdered, unitCost] = useWatch({
        control,
        name: ['productId', 'presentationId', 'quantityOrdered', 'unitCost'],
    })
    const subtotal = (quantityOrdered ?? 0) * (unitCost ?? 0)

    // Its presentations (S5.2): bought by the box, received in base units
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
                quantityOrdered: 1,
                unitCost: 0,
            })
        }
    }, [open, orderId, reset])

    // The cost of the chosen presentation: its own or factor × the product's
    useEffect(() => {
        if (!product) return
        const cost = presentation
            ? presentation.effectivePurchasePrice
            : product.purchasePrice
        if (cost != null) setValue('unitCost', cost)
    }, [product, presentation, setValue])

    const handleClose = () => {
        if (!isSubmitting) onClose()
    }

    const onSubmit = async (values: PurchaseOrderItemCreateFormValues) => {
        try {
            await addItem.mutateAsync({
                purchaseOrderId: orderId,
                productId: values.productId,
                presentationId: values.presentationId ?? undefined,
                quantityOrdered: values.quantityOrdered,
                unitCost: values.unitCost,
            })
            notifySuccess('Item agregado')
            onClose()
        } catch (error: unknown) {
            notifyError(error, 'Error al agregar el item')
        }
    }

    return (
        <Dialog
            isOpen={open}
            width={600}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">Agregar Item</h5>
                <form className="flex-1" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        <FormItem
                            asterisk
                            label="Producto"
                            invalid={!!errors.productId}
                            errorMessage={errors.productId?.message}
                        >
                            <Controller
                                name="productId"
                                control={control}
                                render={({ field }) => (
                                    <ProductSelect
                                        inputId="productId"
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
                            <FormItem label="Presentación">
                                <Controller
                                    name="presentationId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            inputId="presentationId"
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
                            invalid={!!errors.quantityOrdered}
                            errorMessage={errors.quantityOrdered?.message}
                            extra={
                                presentation && !presentation.isBase ? (
                                    <span className="text-xs text-gray-500 ml-2">
                                        ={' '}
                                        {formatQuantity(
                                            (quantityOrdered ?? 0) *
                                                presentation.factor,
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
                                placeholder="1"
                                disabled={isSubmitting}
                                invalid={!!errors.quantityOrdered}
                                {...numberRegister('quantityOrdered', {
                                    emptyValue: 1,
                                })}
                            />
                        </FormItem>

                        <FormItem
                            asterisk
                            label="Costo Unitario"
                            invalid={!!errors.unitCost}
                            errorMessage={errors.unitCost?.message}
                        >
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                disabled={isSubmitting}
                                invalid={!!errors.unitCost}
                                {...numberRegister('unitCost', {
                                    emptyValue: 0,
                                })}
                            />
                        </FormItem>

                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500">Subtotal</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(subtotal)}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={isSubmitting}
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isSubmitting}
                        >
                            Agregar
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UpdateFormProps {
    open: boolean
    onClose: () => void
    orderId: number
    item: PurchaseOrderItem
}

const PurchaseOrderItemUpdateForm = ({
    open,
    onClose,
    orderId,
    item,
}: UpdateFormProps) => {
    const updateItem = useUpdatePurchaseOrderItem()

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PurchaseOrderItemUpdateFormValues>({
        resolver: zodResolver(purchaseOrderItemUpdateSchema),
        defaultValues: {
            quantityOrdered: item.quantityOrdered,
            unitCost: item.unitCost,
        },
    })

    const numberRegister = makeNumberRegister(register)

    const [quantityOrdered, unitCost] = useWatch({
        control,
        name: ['quantityOrdered', 'unitCost'],
    })
    const subtotal = (quantityOrdered ?? 0) * (unitCost ?? 0)

    useEffect(() => {
        if (open) {
            reset({
                quantityOrdered: item.quantityOrdered,
                unitCost: item.unitCost,
            })
        }
    }, [open, item, reset])

    const handleClose = () => {
        if (!isSubmitting) onClose()
    }

    const onSubmit = async (values: PurchaseOrderItemUpdateFormValues) => {
        try {
            await updateItem.mutateAsync({
                itemId: item.id,
                orderId,
                data: values,
            })
            notifySuccess('Item actualizado')
            onClose()
        } catch (error: unknown) {
            notifyError(error, 'Error al actualizar el item')
        }
    }

    return (
        <Dialog
            isOpen={open}
            width={600}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">Editar Item</h5>
                <form className="flex-1" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        <FormItem
                            asterisk
                            label="Cantidad"
                            invalid={!!errors.quantityOrdered}
                            errorMessage={errors.quantityOrdered?.message}
                        >
                            <Input
                                type="number"
                                step="any"
                                min={0}
                                placeholder="1"
                                disabled={isSubmitting}
                                invalid={!!errors.quantityOrdered}
                                {...numberRegister('quantityOrdered', {
                                    emptyValue: 1,
                                })}
                            />
                        </FormItem>

                        <FormItem
                            asterisk
                            label="Costo Unitario"
                            invalid={!!errors.unitCost}
                            errorMessage={errors.unitCost?.message}
                        >
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                disabled={isSubmitting}
                                invalid={!!errors.unitCost}
                                {...numberRegister('unitCost', {
                                    emptyValue: 0,
                                })}
                            />
                        </FormItem>

                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500">Subtotal</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(subtotal)}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={isSubmitting}
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isSubmitting}
                        >
                            Actualizar
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

// ─── Wrapper ──────────────────────────────────────────────────────────────────

interface PurchaseOrderItemFormProps {
    open: boolean
    onClose: () => void
    orderId: number
    item: PurchaseOrderItem | null
}

const PurchaseOrderItemForm = ({
    open,
    onClose,
    orderId,
    item,
}: PurchaseOrderItemFormProps) =>
    item ? (
        <PurchaseOrderItemUpdateForm
            open={open}
            orderId={orderId}
            item={item}
            onClose={onClose}
        />
    ) : (
        <PurchaseOrderItemCreateForm
            open={open}
            orderId={orderId}
            onClose={onClose}
        />
    )

export default PurchaseOrderItemForm
