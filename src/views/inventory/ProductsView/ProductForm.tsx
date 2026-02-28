import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useCategories } from '@/hooks/useCategories'
import { useUnitsOfMeasure } from '@/hooks/useUnitsOfMeasure'
import type { Product, ProductInput } from '@/services/InventoryService'

interface ProductFormProps {
    open: boolean
    onClose: () => void
    product?: Product | null
}

const ProductForm = ({ open, onClose, product }: ProductFormProps) => {
    const [formData, setFormData] = useState<ProductInput>({
        name: '',
        sku: '',
        description: '',
        categoryId: undefined,
        unitOfMeasureId: undefined,
    })

    const createProduct = useCreateProduct()
    const updateProduct = useUpdateProduct()
    const { data: categories = [] } = useCategories()
    const { data: unitsOfMeasure = [] } = useUnitsOfMeasure()

    const isEdit = !!product

    // Create options for category select
    const categoryOptions = [
        { value: 0, label: 'Sin categoría' },
        ...categories.map((cat) => ({
            value: cat.id,
            label: cat.name,
        })),
    ]

    // Create options for unit of measure select
    const unitOptions = [
        { value: 0, label: 'Sin unidad' },
        ...unitsOfMeasure
            .filter((u) => u.isActive)
            .map((u) => ({
                value: u.id,
                label: `${u.name} (${u.symbol})`,
            })),
    ]

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                description: product.description || '',
                categoryId: product.categoryId || undefined,
                unitOfMeasureId: product.unitOfMeasureId || undefined,
            })
        } else {
            setFormData({
                name: '',
                sku: '',
                description: '',
                categoryId: undefined,
                unitOfMeasureId: undefined,
            })
        }
    }, [product, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEdit && product) {
                await updateProduct.mutateAsync({
                    id: product.id,
                    data: formData,
                })
            } else {
                await createProduct.mutateAsync(formData)
            }

            toast.push(
                <Notification
                    title={isEdit ? 'Producto actualizado' : 'Producto creado'}
                    type="success"
                >
                    {isEdit
                        ? 'El producto se actualizó correctamente'
                        : 'El producto se creó correctamente'}
                </Notification>,
                {
                    placement: 'top-center',
                }
            )

            onClose()
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(
                error,
                'Error al guardar el producto'
            )

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                {
                    placement: 'top-center',
                }
            )

            console.error('Error saving product:', error)
        }
    }

    const handleClose = () => {
        if (!createProduct.isPending && !updateProduct.isPending) {
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
                    {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
                </h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="text"
                                placeholder="Nombre del producto"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                SKU <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="text"
                                placeholder="SKU del producto"
                                value={formData.sku}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sku: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Descripción
                            </label>
                            <Input
                                textArea
                                placeholder="Descripción del producto"
                                value={formData.description}
                                style={{ minHeight: '80px' }}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Categoría
                            </label>
                            <Select
                                placeholder="Seleccione una categoría"
                                value={categoryOptions.find(
                                    (opt) =>
                                        opt.value === (formData.categoryId || 0)
                                )}
                                options={categoryOptions}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        categoryId:
                                            option?.value === 0
                                                ? undefined
                                                : option?.value,
                                    })
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Opcional: Seleccione la categoría del producto
                            </p>
                        </div>

                        {/* Unit of Measure */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Unidad de Medida
                            </label>
                            <Select
                                placeholder="Seleccione una unidad"
                                value={unitOptions.find(
                                    (opt) =>
                                        opt.value ===
                                        (formData.unitOfMeasureId || 0)
                                )}
                                options={unitOptions}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        unitOfMeasureId:
                                            option?.value === 0
                                                ? undefined
                                                : option?.value,
                                    })
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Opcional: Seleccione la unidad de medida del
                                producto
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={
                                createProduct.isPending ||
                                updateProduct.isPending
                            }
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={
                                createProduct.isPending ||
                                updateProduct.isPending
                            }
                        >
                            {isEdit ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default ProductForm
