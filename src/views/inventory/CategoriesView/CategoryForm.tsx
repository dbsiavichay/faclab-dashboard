import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories'
import type { Category } from '@/services/CategoryService'

interface CategoryFormProps {
    open: boolean
    onClose: () => void
    category: Category | null
}

const CategoryForm = ({ open, onClose, category }: CategoryFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    })

    const createCategory = useCreateCategory()
    const updateCategory = useUpdateCategory()

    const isEditMode = !!category

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || '',
            })
        } else {
            setFormData({
                name: '',
                description: '',
            })
        }
    }, [category, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEditMode && category) {
                await updateCategory.mutateAsync({
                    id: category.id,
                    data: formData,
                })
            } else {
                await createCategory.mutateAsync(formData)
            }
            onClose()
        } catch (error) {
            console.error('Error saving category:', error)
        }
    }

    const isPending = createCategory.isPending || updateCategory.isPending

    return (
        <Dialog
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            shouldCloseOnEsc={!isPending}
            shouldCloseOnOverlayClick={!isPending}
        >
            <h5 className="mb-4">
                {isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
            </h5>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="Nombre de la categoría"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                            disabled={isPending}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Descripción
                        </label>
                        <Input
                            textArea
                            placeholder="Descripción de la categoría"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            style={{ minHeight: '80px' }}
                            disabled={isPending}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        type="button"
                        variant="plain"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" variant="solid" loading={isPending}>
                        {isEditMode ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Dialog>
    )
}

export default CategoryForm
