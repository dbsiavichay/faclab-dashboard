import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useAddPurchaseOrderItem,
    useUpdatePurchaseOrderItem,
} from '@/hooks/usePurchaseOrders'
import { useProducts } from '@/hooks/useProducts'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type {
    PurchaseOrderItem,
    PurchaseOrderItemInput,
    PurchaseOrderItemUpdateInput,
} from '@/services/PurchaseOrderService'

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
}: PurchaseOrderItemFormProps) => {
    const [formData, setFormData] = useState<PurchaseOrderItemInput>({
        purchaseOrderId: orderId,
        productId: 0,
        quantityOrdered: 1,
        unitCost: 0,
    })

    const [editData, setEditData] = useState<PurchaseOrderItemUpdateInput>({
        quantityOrdered: 1,
        unitCost: 0,
    })

    const addItem = useAddPurchaseOrderItem()
    const updateItem = useUpdatePurchaseOrderItem()

    const { data: productsData } = useProducts()
    const products = productsData?.items ?? []

    const isEdit = !!item

    const productOptions = products.map((p) => ({
        value: p.id.toString(),
        label: `${p.name} (${p.sku})`,
    }))

    useEffect(() => {
        if (item) {
            setEditData({
                quantityOrdered: item.quantityOrdered,
                unitCost: item.unitCost,
            })
        } else {
            setFormData({
                purchaseOrderId: orderId,
                productId: 0,
                quantityOrdered: 1,
                unitCost: 0,
            })
        }
    }, [item, open, orderId])

    const subtotal = isEdit
        ? editData.quantityOrdered * editData.unitCost
        : formData.quantityOrdered * formData.unitCost

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEdit && item) {
                await updateItem.mutateAsync({
                    itemId: item.id,
                    orderId,
                    data: {
                        quantityOrdered: editData.quantityOrdered,
                        unitCost: editData.unitCost,
                    },
                })
            } else {
                await addItem.mutateAsync({
                    purchaseOrderId: orderId,
                    productId: formData.productId,
                    quantityOrdered: formData.quantityOrdered,
                    unitCost: formData.unitCost,
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD',
        }).format(value)
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
                                        value={editData.quantityOrdered}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                quantityOrdered:
                                                    parseInt(e.target.value) ||
                                                    1,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Costo Unitario{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        placeholder="0.00"
                                        value={editData.unitCost}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                unitCost:
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0,
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
                                        value={formData.quantityOrdered || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                quantityOrdered:
                                                    parseInt(e.target.value) ||
                                                    1,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Costo Unitario{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        placeholder="0.00"
                                        value={formData.unitCost || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                unitCost:
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0,
                                            })
                                        }
                                    />
                                </div>
                            </>
                        )}

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

export default PurchaseOrderItemForm
