import Input from '@/components/ui/Input'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryFormValues } from '@/schemas'
import type { Category } from '@/services/CategoryService'

interface CategoryFormProps {
    formId: string
    category: Category | null
    isSubmitting?: boolean
    onSubmit: (data: CategoryFormValues) => void
}

const CategoryForm = ({
    formId,
    category,
    isSubmitting = false,
    onSubmit,
}: CategoryFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name ?? '',
            description: category?.description ?? '',
        },
    })

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <FormContainer>
                <FormItem
                    asterisk
                    htmlFor="name"
                    label="Nombre"
                    invalid={!!errors.name}
                    errorMessage={errors.name?.message}
                >
                    <Input
                        id="name"
                        placeholder="Nombre de la categoría"
                        disabled={isSubmitting}
                        invalid={!!errors.name}
                        {...register('name')}
                    />
                </FormItem>

                <FormItem
                    htmlFor="description"
                    label="Descripción"
                    invalid={!!errors.description}
                    errorMessage={errors.description?.message}
                >
                    <Input
                        textArea
                        id="description"
                        placeholder="Descripción de la categoría"
                        style={{ minHeight: '80px' }}
                        disabled={isSubmitting}
                        invalid={!!errors.description}
                        {...register('description')}
                    />
                </FormItem>
            </FormContainer>
        </form>
    )
}

export default CategoryForm
