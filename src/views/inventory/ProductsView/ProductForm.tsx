import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useCategories } from '@/hooks/useCategories'
import { useUnitsOfMeasure } from '@/hooks/useUnitsOfMeasure'
import type { Product, ProductInput } from '@/services/ProductService'

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
        barcode: '',
        categoryId: undefined,
        unitOfMeasureId: undefined,
        purchasePrice: undefined,
        salePrice: undefined,
        isActive: true,
        isService: false,
        minStock: 0,
        maxStock: undefined,
        reorderPoint: 0,
        leadTimeDays: undefined,
    })

    const createProduct = useCreateProduct()
    const updateProduct = useUpdateProduct()
    const { data: categoriesData } = useCategories()
    const categories = categoriesData?.items ?? []
    const { data: unitsData } = useUnitsOfMeasure()
    const unitsOfMeasure = unitsData?.items ?? []

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
                barcode: product.barcode || '',
                categoryId: product.categoryId || undefined,
                unitOfMeasureId: product.unitOfMeasureId || undefined,
                purchasePrice: product.purchasePrice ?? undefined,
                salePrice: product.salePrice ?? undefined,
                isActive: product.isActive,
                isService: product.isService,
                minStock: product.minStock,
                maxStock: product.maxStock ?? undefined,
                reorderPoint: product.reorderPoint,
                leadTimeDays: product.leadTimeDays ?? undefined,
            })
        } else {
            setFormData({
                name: '',
                sku: '',
                description: '',
                barcode: '',
                categoryId: undefined,
                unitOfMeasureId: undefined,
                purchasePrice: undefined,
                salePrice: undefined,
                isActive: true,
                isService: false,
                minStock: 0,
                maxStock: undefined,
                reorderPoint: 0,
                leadTimeDays: undefined,
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
            width={640}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">
                    {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
                </h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
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
                                value={formData.description || ''}
                                style={{ minHeight: '80px' }}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Barcode */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Código de barras
                            </label>
                            <Input
                                type="text"
                                placeholder="Ej: 7501234567890"
                                value={formData.barcode || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        barcode: e.target.value || null,
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

                        {/* Prices */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Precio de compra
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.purchasePrice ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            purchasePrice:
                                                e.target.value !== ''
                                                    ? Number(e.target.value)
                                                    : undefined,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Precio de venta
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.salePrice ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            salePrice:
                                                e.target.value !== ''
                                                    ? Number(e.target.value)
                                                    : undefined,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-6">
                            <div className="flex items-center gap-3">
                                <Switcher
                                    checked={formData.isActive}
                                    onChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            isActive: checked,
                                        })
                                    }
                                />
                                <label className="text-sm font-medium">
                                    Activo
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Switcher
                                    checked={formData.isService}
                                    onChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            isService: checked,
                                        })
                                    }
                                />
                                <label className="text-sm font-medium">
                                    Es servicio
                                </label>
                            </div>
                        </div>

                        {/* Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Stock mínimo
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formData.minStock ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            minStock:
                                                e.target.value !== ''
                                                    ? Number(e.target.value)
                                                    : 0,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Stock máximo
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Sin límite"
                                    value={formData.maxStock ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            maxStock:
                                                e.target.value !== ''
                                                    ? Number(e.target.value)
                                                    : undefined,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Punto de reorden
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formData.reorderPoint ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            reorderPoint:
                                                e.target.value !== ''
                                                    ? Number(e.target.value)
                                                    : 0,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tiempo de entrega (días)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Sin definir"
                                    value={formData.leadTimeDays ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            leadTimeDays:
                                                e.target.value !== ''
                                                    ? Number(e.target.value)
                                                    : undefined,
                                        })
                                    }
                                />
                            </div>
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
