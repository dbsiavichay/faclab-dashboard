import Input from '@/components/ui/Input'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import { categorySchema } from '@/schemas'
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
    const initialValues: CategoryFormData = category
        ? { name: category.name, description: category.description || '' }
        : { name: '', description: '' }

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={categorySchema}
            onSubmit={(values) => onSubmit(values)}
        >
            {({ touched, errors }) => (
                <Form id={formId}>
                    <FormContainer>
                        <FormItem
                            asterisk
                            htmlFor="name"
                            label="Nombre"
                            invalid={!!(errors.name && touched.name)}
                            errorMessage={errors.name}
                        >
                            <Field
                                id="name"
                                name="name"
                                placeholder="Nombre de la categoría"
                                component={Input}
                                disabled={isSubmitting}
                            />
                        </FormItem>

                        <FormItem
                            htmlFor="description"
                            label="Descripción"
                            invalid={
                                !!(errors.description && touched.description)
                            }
                            errorMessage={errors.description}
                        >
                            <Field
                                textArea
                                id="description"
                                name="description"
                                placeholder="Descripción de la categoría"
                                style={{ minHeight: '80px' }}
                                component={Input}
                                disabled={isSubmitting}
                            />
                        </FormItem>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default CategoryForm
