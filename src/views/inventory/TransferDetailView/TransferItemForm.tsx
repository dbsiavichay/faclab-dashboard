import { useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormItem } from '@/components/ui/Form'
import { makeNumberRegister } from '@/components/ui/Form/utils'
import { ControlledSelect } from '@/components/ui/Form/controlled'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAddTransferItem, useUpdateTransferItem } from '@/hooks/useTransfers'
import { useProducts } from '@/hooks/useProducts'
import { useLots } from '@/hooks/useLots'
import { getErrorMessage } from '@/utils/getErrorMessage'
import {
    transferItemCreateSchema,
    transferItemUpdateSchema,
    type TransferItemCreateFormValues,
    type TransferItemUpdateFormValues,
} from '@/schemas'
import type { TransferItem } from '@/services/TransferService'

// ─── Create ───────────────────────────────────────────────────────────────────

interface CreateFormProps {
    open: boolean
    onClose: () => void
    transferId: number
}

const TransferItemCreateForm = ({
    open,
    onClose,
    transferId,
}: CreateFormProps) => {
    const addItem = useAddTransferItem()
    const { data: productsData } = useProducts()
    const products = productsData?.items ?? []

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TransferItemCreateFormValues>({
        resolver: zodResolver(transferItemCreateSchema),
        defaultValues: {
            productId: undefined,
            quantity: 1,
            lotId: null,
            notes: '',
        },
    })

    const numberRegister = makeNumberRegister(register)
    const selectedProductId = useWatch({ control, name: 'productId' })

    const { data: lotsData } = useLots(
        selectedProductId
            ? { productId: selectedProductId, limit: 100 }
            : undefined
    )
    const lots = lotsData?.items ?? []

    useEffect(() => {
        if (open) {
            reset({
                productId: undefined,
                quantity: 1,
                lotId: null,
                notes: '',
            })
        }
    }, [open, transferId, reset])

    useEffect(() => {
        setValue('lotId', null)
    }, [selectedProductId, setValue])

    const handleClose = () => {
        if (!isSubmitting) onClose()
    }

    const productOptions = products.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.sku})`,
    }))

    const lotOptions: { value: number | null; label: string }[] = [
        { value: null, label: 'Sin lote' },
        ...lots.map((l) => ({ value: l.id, label: l.lotNumber })),
    ]

    const onSubmit = async (values: TransferItemCreateFormValues) => {
        try {
            await addItem.mutateAsync({
                transferId,
                data: {
                    productId: values.productId,
                    quantity: values.quantity,
                    lotId: values.lotId,
                    notes: values.notes || undefined,
                },
            })
            toast.push(<Notification title="Item agregado" type="success" />, {
                placement: 'top-end',
            })
            onClose()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al agregar el item')}
                </Notification>,
                { placement: 'top-end' }
            )
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
                            <ControlledSelect
                                name="productId"
                                control={control}
                                options={productOptions}
                                placeholder="Seleccionar producto"
                                isDisabled={isSubmitting}
                            />
                        </FormItem>

                        <FormItem
                            asterisk
                            label="Cantidad"
                            invalid={!!errors.quantity}
                            errorMessage={errors.quantity?.message}
                        >
                            <Input
                                type="number"
                                min={1}
                                placeholder="1"
                                disabled={isSubmitting}
                                invalid={!!errors.quantity}
                                {...numberRegister('quantity', {
                                    integer: true,
                                    emptyValue: 1,
                                })}
                            />
                        </FormItem>

                        <FormItem
                            label="Lote (opcional)"
                            invalid={!!errors.lotId}
                            errorMessage={errors.lotId?.message}
                        >
                            <ControlledSelect
                                name="lotId"
                                control={control}
                                options={lotOptions}
                                placeholder="Seleccionar lote"
                                isDisabled={isSubmitting || !selectedProductId}
                            />
                        </FormItem>

                        <FormItem
                            label="Notas"
                            invalid={!!errors.notes}
                            errorMessage={errors.notes?.message}
                        >
                            <Input
                                textArea
                                placeholder="Observaciones del item"
                                disabled={isSubmitting}
                                invalid={!!errors.notes}
                                {...register('notes')}
                            />
                        </FormItem>
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
    transferId: number
    item: TransferItem
}

const TransferItemUpdateForm = ({
    open,
    onClose,
    transferId,
    item,
}: UpdateFormProps) => {
    const updateItem = useUpdateTransferItem()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TransferItemUpdateFormValues>({
        resolver: zodResolver(transferItemUpdateSchema),
        defaultValues: {
            quantity: item.quantity,
            notes: item.notes ?? '',
        },
    })

    const numberRegister = makeNumberRegister(register)

    useEffect(() => {
        if (open) {
            reset({
                quantity: item.quantity,
                notes: item.notes ?? '',
            })
        }
    }, [open, item, reset])

    const handleClose = () => {
        if (!isSubmitting) onClose()
    }

    const onSubmit = async (values: TransferItemUpdateFormValues) => {
        try {
            await updateItem.mutateAsync({
                itemId: item.id,
                transferId,
                data: {
                    quantity: values.quantity,
                    notes: values.notes || undefined,
                },
            })
            toast.push(
                <Notification title="Item actualizado" type="success" />,
                { placement: 'top-end' }
            )
            onClose()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al actualizar el item')}
                </Notification>,
                { placement: 'top-end' }
            )
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
                            invalid={!!errors.quantity}
                            errorMessage={errors.quantity?.message}
                        >
                            <Input
                                type="number"
                                min={1}
                                placeholder="1"
                                disabled={isSubmitting}
                                invalid={!!errors.quantity}
                                {...numberRegister('quantity', {
                                    integer: true,
                                    emptyValue: 1,
                                })}
                            />
                        </FormItem>

                        <FormItem
                            label="Notas"
                            invalid={!!errors.notes}
                            errorMessage={errors.notes?.message}
                        >
                            <Input
                                textArea
                                placeholder="Observaciones del item"
                                disabled={isSubmitting}
                                invalid={!!errors.notes}
                                {...register('notes')}
                            />
                        </FormItem>
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

interface TransferItemFormProps {
    open: boolean
    onClose: () => void
    transferId: number
    item: TransferItem | null
}

const TransferItemForm = ({
    open,
    onClose,
    transferId,
    item,
}: TransferItemFormProps) =>
    item ? (
        <TransferItemUpdateForm
            open={open}
            transferId={transferId}
            item={item}
            onClose={onClose}
        />
    ) : (
        <TransferItemCreateForm
            open={open}
            transferId={transferId}
            onClose={onClose}
        />
    )

export default TransferItemForm
