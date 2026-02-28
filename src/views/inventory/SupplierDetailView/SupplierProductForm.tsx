import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useCreateSupplierProduct,
    useUpdateSupplierProduct,
} from '@/hooks/useSupplierProducts'
import { useProducts } from '@/hooks/useProducts'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type {
    SupplierProduct,
    SupplierProductInput,
} from '@/services/SupplierProductService'

interface SupplierProductFormProps {
    open: boolean
    onClose: () => void
    supplierId: number
    supplierProduct?: SupplierProduct | null
}

const SupplierProductForm = ({
    open,
    onClose,
    supplierId,
    supplierProduct,
}: SupplierProductFormProps) => {
    const [formData, setFormData] = useState<SupplierProductInput>({
        productId: 0,
        purchasePrice: 0,
        supplierSku: '',
        minOrderQuantity: undefined,
        leadTimeDays: undefined,
        isPreferred: false,
    })

    const createSupplierProduct = useCreateSupplierProduct()
    const updateSupplierProduct = useUpdateSupplierProduct()
    const { data: products = [] } = useProducts()

    const isEdit = !!supplierProduct

    useEffect(() => {
        if (supplierProduct) {
            setFormData({
                productId: supplierProduct.productId,
                purchasePrice: supplierProduct.purchasePrice,
                supplierSku: supplierProduct.supplierSku || '',
                minOrderQuantity: supplierProduct.minOrderQuantity ?? undefined,
                leadTimeDays: supplierProduct.leadTimeDays ?? undefined,
                isPreferred: supplierProduct.isPreferred,
            })
        } else {
            setFormData({
                productId: 0,
                purchasePrice: 0,
                supplierSku: '',
                minOrderQuantity: undefined,
                leadTimeDays: undefined,
                isPreferred: false,
            })
        }
    }, [supplierProduct, open])

    const productOptions = products.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.sku})`,
    }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEdit && supplierProduct) {
                await updateSupplierProduct.mutateAsync({
                    id: supplierProduct.id,
                    product: formData,
                })
            } else {
                await createSupplierProduct.mutateAsync({
                    supplierId,
                    product: formData,
                })
            }

            toast.push(
                <Notification
                    title={
                        isEdit ? 'Producto actualizado' : 'Producto agregado'
                    }
                    type="success"
                >
                    {isEdit
                        ? 'El producto se actualizó correctamente'
                        : 'El producto se agregó correctamente'}
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(
                error,
                'Error al guardar el producto del proveedor'
            )

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleClose = () => {
        if (
            !createSupplierProduct.isPending &&
            !updateSupplierProduct.isPending
        ) {
            onClose()
        }
    }

    return (
        <Dialog
            isOpen={open}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">
                    {isEdit
                        ? 'Editar Producto del Proveedor'
                        : 'Agregar Producto al Proveedor'}
                </h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Product */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Producto <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={productOptions}
                                value={
                                    productOptions.find(
                                        (p) => p.value === formData.productId
                                    ) || null
                                }
                                placeholder="Seleccionar producto..."
                                isDisabled={isEdit}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        productId:
                                            (
                                                option as {
                                                    value: number
                                                    label: string
                                                }
                                            )?.value || 0,
                                    })
                                }
                            />
                        </div>

                        {/* Purchase Price */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Precio de Compra{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.purchasePrice || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        purchasePrice:
                                            parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>

                        {/* Supplier SKU */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                SKU del Proveedor
                            </label>
                            <Input
                                type="text"
                                placeholder="Código del proveedor"
                                value={formData.supplierSku}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        supplierSku: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Min Order Quantity & Lead Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Cantidad Mín. de Pedido
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    value={formData.minOrderQuantity ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            minOrderQuantity: e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tiempo de Entrega (días)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={formData.leadTimeDays ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            leadTimeDays: e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* Is Preferred */}
                        <div className="flex items-center gap-3">
                            <Switcher
                                checked={formData.isPreferred}
                                onChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        isPreferred: !checked,
                                    })
                                }
                            />
                            <label className="text-sm font-medium">
                                Proveedor preferido para este producto
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={
                                createSupplierProduct.isPending ||
                                updateSupplierProduct.isPending
                            }
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={
                                createSupplierProduct.isPending ||
                                updateSupplierProduct.isPending
                            }
                        >
                            {isEdit ? 'Actualizar' : 'Agregar'}
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default SupplierProductForm
