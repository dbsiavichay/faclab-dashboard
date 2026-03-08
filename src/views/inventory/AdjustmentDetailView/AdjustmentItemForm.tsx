import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useAddAdjustmentItem,
    useUpdateAdjustmentItem,
} from '@/hooks/useAdjustments'
import { useProducts } from '@/hooks/useProducts'
import { useLocations } from '@/hooks/useLocations'
import { useLots } from '@/hooks/useLots'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type {
    AdjustmentItem,
    AdjustmentItemInput,
    AdjustmentItemUpdateInput,
} from '@/services/AdjustmentService'

interface AdjustmentItemFormProps {
    open: boolean
    onClose: () => void
    adjustmentId: number
    warehouseId: number
    item: AdjustmentItem | null
}

const AdjustmentItemForm = ({
    open,
    onClose,
    adjustmentId,
    warehouseId,
    item,
}: AdjustmentItemFormProps) => {
    const [formData, setFormData] = useState<AdjustmentItemInput>({
        productId: 0,
        locationId: 0,
        actualQuantity: 0,
        lotId: null,
        notes: '',
    })

    const [editData, setEditData] = useState<AdjustmentItemUpdateInput>({
        actualQuantity: 0,
        notes: '',
    })

    const addItem = useAddAdjustmentItem()
    const updateItem = useUpdateAdjustmentItem()

    const { data: productsData } = useProducts()
    const products = productsData?.items ?? []

    const { data: locationsData } = useLocations({
        warehouseId,
        limit: 100,
    })
    const locations = locationsData?.items ?? []

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

    const locationOptions = locations.map((l) => ({
        value: l.id.toString(),
        label: `${l.name} (${l.code})`,
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
                actualQuantity: item.actualQuantity,
                notes: item.notes || '',
            })
        } else {
            setFormData({
                productId: 0,
                locationId: 0,
                actualQuantity: 0,
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
                    adjustmentId,
                    data: {
                        actualQuantity: editData.actualQuantity,
                        notes: editData.notes || undefined,
                    },
                })
            } else {
                await addItem.mutateAsync({
                    adjustmentId,
                    data: {
                        productId: formData.productId,
                        locationId: formData.locationId,
                        actualQuantity: formData.actualQuantity,
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
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al guardar el item')}
                </Notification>,
                { placement: 'top-center' }
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
                                        Cantidad Actual{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        value={editData.actualQuantity ?? ''}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                actualQuantity:
                                                    parseInt(e.target.value) ||
                                                    0,
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
                                        Ubicación{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        placeholder="Seleccionar ubicación"
                                        options={locationOptions}
                                        value={locationOptions.find(
                                            (o) =>
                                                o.value ===
                                                formData.locationId.toString()
                                        )}
                                        onChange={(option) =>
                                            setFormData({
                                                ...formData,
                                                locationId: option
                                                    ? parseInt(option.value)
                                                    : 0,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Cantidad Actual{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        value={formData.actualQuantity || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                actualQuantity:
                                                    parseInt(e.target.value) ||
                                                    0,
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

export default AdjustmentItemForm
