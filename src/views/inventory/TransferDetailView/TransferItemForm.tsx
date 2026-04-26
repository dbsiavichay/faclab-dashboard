import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useAddTransferItem, useUpdateTransferItem } from '@/hooks/useTransfers'
import { useProducts } from '@/hooks/useProducts'
import { useLots } from '@/hooks/useLots'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type {
    TransferItem,
    TransferItemInput,
    TransferItemUpdateInput,
} from '@/services/TransferService'

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
}: TransferItemFormProps) => {
    const [formData, setFormData] = useState<TransferItemInput>({
        productId: 0,
        quantity: 1,
        lotId: null,
        notes: '',
    })

    const [editData, setEditData] = useState<TransferItemUpdateInput>({
        quantity: 1,
        notes: '',
    })

    const addItem = useAddTransferItem()
    const updateItem = useUpdateTransferItem()

    const { data: productsData } = useProducts()
    const products = productsData?.items ?? []

    const selectedProductId = item ? item.productId : formData.productId
    const { data: lotsData } = useLots(
        selectedProductId
            ? { productId: selectedProductId, limit: 100 }
            : undefined
    )
    const lots = lotsData?.items ?? []

    const isEdit = !!item

    const productOptions = products.map((p) => ({
        value: p.id.toString(),
        label: `${p.name} (${p.sku})`,
    }))

    const lotOptions = [
        { value: '', label: 'Sin lote' },
        ...lots.map((l) => ({
            value: l.id.toString(),
            label: `${l.lotNumber}`,
        })),
    ]

    useEffect(() => {
        if (item) {
            setEditData({
                quantity: item.quantity,
                notes: item.notes || '',
            })
        } else {
            setFormData({
                productId: 0,
                quantity: 1,
                lotId: null,
                notes: '',
            })
        }
    }, [item, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEdit && item) {
                await updateItem.mutateAsync({
                    itemId: item.id,
                    transferId,
                    data: {
                        quantity: editData.quantity,
                        notes: editData.notes || undefined,
                    },
                })
            } else {
                await addItem.mutateAsync({
                    transferId,
                    data: {
                        productId: formData.productId,
                        quantity: formData.quantity,
                        lotId: formData.lotId || undefined,
                        notes: formData.notes || undefined,
                    },
                })
            }

            toast.push(
                <Notification
                    title={isEdit ? 'Item actualizado' : 'Item agregado'}
                    type="success"
                >
                    {isEdit
                        ? 'El item se actualizó correctamente'
                        : 'El item se agregó correctamente'}
                </Notification>,
                { placement: 'top-end' }
            )

            onClose()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al guardar el item')}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const isPending = addItem.isPending || updateItem.isPending

    const handleClose = () => {
        if (!isPending) {
            onClose()
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
                <h5 className="mb-4">
                    {isEdit ? 'Editar Item' : 'Agregar Item'}
                </h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        {isEdit ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Cantidad{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min={1}
                                        placeholder="1"
                                        value={editData.quantity ?? ''}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                quantity:
                                                    parseInt(e.target.value) ||
                                                    1,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Notas
                                    </label>
                                    <Input
                                        textArea
                                        placeholder="Observaciones del item"
                                        value={editData.notes || ''}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                notes: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Producto{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        placeholder="Seleccionar producto"
                                        options={productOptions}
                                        value={productOptions.find(
                                            (o) =>
                                                o.value ===
                                                formData.productId.toString()
                                        )}
                                        onChange={(option) =>
                                            setFormData({
                                                ...formData,
                                                productId: option
                                                    ? parseInt(option.value)
                                                    : 0,
                                                lotId: null,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Cantidad{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min={1}
                                        placeholder="1"
                                        value={formData.quantity || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                quantity:
                                                    parseInt(e.target.value) ||
                                                    1,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Lote (opcional)
                                    </label>
                                    <Select
                                        placeholder="Seleccionar lote"
                                        options={lotOptions}
                                        value={lotOptions.find(
                                            (o) =>
                                                o.value ===
                                                (formData.lotId?.toString() ||
                                                    '')
                                        )}
                                        onChange={(option) =>
                                            setFormData({
                                                ...formData,
                                                lotId:
                                                    option && option.value
                                                        ? parseInt(option.value)
                                                        : null,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Notas
                                    </label>
                                    <Input
                                        textArea
                                        placeholder="Observaciones del item"
                                        value={formData.notes || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                notes: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={isPending}
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isPending}
                        >
                            {isEdit ? 'Actualizar' : 'Agregar'}
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default TransferItemForm
