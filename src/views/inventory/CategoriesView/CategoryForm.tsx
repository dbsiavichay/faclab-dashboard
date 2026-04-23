import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import type { Category } from '@/services/CategoryService'

interface CategoryFormData {
    name: string
    description: string
}

interface CategoryFormProps {
    formId: string
    category: Category | null
    isSubmitting?: boolean
    onSubmit: (data: CategoryFormData) => void
}

const CategoryForm = ({
    formId,
    category,
    isSubmitting = false,
    onSubmit,
}: CategoryFormProps) => {
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
    })

    useEffect(() => {
        setFormData(
            category
                ? {
                      name: category.name,
                      description: category.description || '',
                  }
                : { name: '', description: '' }
        )
    }, [category])

    return (
        <form
            id={formId}
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(formData)
            }}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <Input
                        required
                        placeholder="Nombre de la categoría"
                        value={formData.name}
                        disabled={isSubmitting}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Descripción
                    </label>
                    <Input
                        textArea
                        placeholder="Descripción de la categoría"
                        value={formData.description}
                        style={{ minHeight: '80px' }}
                        disabled={isSubmitting}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                    />
                </div>
            </div>
        </form>
    )
}

export default CategoryForm
