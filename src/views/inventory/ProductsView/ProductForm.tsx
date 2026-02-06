import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
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
    })

    const createProduct = useCreateProduct()
    const updateProduct = useUpdateProduct()

    const isEdit = !!product

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                description: product.description || '',
                categoryId: product.categoryId || undefined,
            })
        } else {
            setFormData({
                name: '',
                sku: '',
                description: '',
                categoryId: undefined,
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
            onClose()
        } catch (error) {
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

                <form onSubmit={handleSubmit} className="flex-1">
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="Nombre del producto"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                SKU <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="SKU del producto"
                                value={formData.sku}
                                onChange={(e) =>
                                    setFormData({ ...formData, sku: e.target.value })
                                }
                                required
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
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                style={{ minHeight: '80px' }}
                            />
                        </div>

                        {/* Category ID */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ID de Categoría
                            </label>
                            <Input
                                type="number"
                                placeholder="ID de categoría (opcional)"
                                value={formData.categoryId || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        categoryId: e.target.value
                                            ? parseInt(e.target.value)
                                            : undefined,
                                    })
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Opcional: Ingrese el ID de la categoría
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            onClick={handleClose}
                            disabled={
                                createProduct.isPending || updateProduct.isPending
                            }
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={
                                createProduct.isPending || updateProduct.isPending
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
