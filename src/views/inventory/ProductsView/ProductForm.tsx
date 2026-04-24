import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import { useCategories } from '@/hooks/useCategories'
import { useUnitsOfMeasure } from '@/hooks/useUnitsOfMeasure'
import { productSchema } from '@/schemas'
import type { Product, ProductInput } from '@/services/ProductService'

interface ProductFormProps {
    formId: string
    product?: Product | null
    isSubmitting?: boolean
    onSubmit: (data: ProductInput) => void
}

const emptyValues: ProductInput = {
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
}

const ProductForm = ({
    formId,
    product,
    isSubmitting = false,
    onSubmit,
}: ProductFormProps) => {
    const { data: categoriesData } = useCategories()
    const categories = categoriesData?.items ?? []
    const { data: unitsData } = useUnitsOfMeasure()
    const unitsOfMeasure = unitsData?.items ?? []

    const categoryOptions = [
        { value: 0, label: 'Sin categoría' },
        ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ]

    const unitOptions = [
        { value: 0, label: 'Sin unidad' },
        ...unitsOfMeasure
            .filter((u) => u.isActive)
            .map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` })),
    ]

    const initialValues: ProductInput = product
        ? {
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
          }
        : emptyValues

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={productSchema}
            onSubmit={(values) => onSubmit(values)}
        >
            {({ touched, errors, values, setFieldValue, setFieldTouched }) => (
                <Form id={formId}>
                    <FormContainer>
                        <FormItem
                            asterisk
                            label="Nombre"
                            invalid={!!(errors.name && touched.name)}
                            errorMessage={errors.name}
                        >
                            <Field
                                name="name"
                                type="text"
                                placeholder="Nombre del producto"
                                component={Input}
                                disabled={isSubmitting}
                            />
                        </FormItem>

                        <FormItem
                            asterisk
                            label="SKU"
                            invalid={!!(errors.sku && touched.sku)}
                            errorMessage={errors.sku}
                        >
                            <Field
                                name="sku"
                                type="text"
                                placeholder="SKU del producto"
                                component={Input}
                                disabled={isSubmitting}
                            />
                        </FormItem>

                        <FormItem
                            label="Descripción"
                            invalid={
                                !!(errors.description && touched.description)
                            }
                            errorMessage={errors.description as string}
                        >
                            <Field
                                textArea
                                name="description"
                                placeholder="Descripción del producto"
                                style={{ minHeight: '80px' }}
                                component={Input}
                                disabled={isSubmitting}
                            />
                        </FormItem>

                        <FormItem
                            label="Código de barras"
                            invalid={!!(errors.barcode && touched.barcode)}
                            errorMessage={errors.barcode as string}
                        >
                            <Field
                                name="barcode"
                                type="text"
                                placeholder="Ej: 7501234567890"
                                component={Input}
                                disabled={isSubmitting}
                            />
                        </FormItem>

                        <FormItem
                            label="Categoría"
                            invalid={
                                !!(errors.categoryId && touched.categoryId)
                            }
                            errorMessage={errors.categoryId as string}
                        >
                            <Select
                                placeholder="Seleccione una categoría"
                                isDisabled={isSubmitting}
                                value={categoryOptions.find(
                                    (opt) =>
                                        opt.value === (values.categoryId || 0)
                                )}
                                options={categoryOptions}
                                onChange={(option) =>
                                    setFieldValue(
                                        'categoryId',
                                        option?.value === 0
                                            ? undefined
                                            : option?.value
                                    )
                                }
                                onBlur={() =>
                                    setFieldTouched('categoryId', true)
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Opcional: Seleccione la categoría del producto
                            </p>
                        </FormItem>

                        <FormItem
                            label="Unidad de Medida"
                            invalid={
                                !!(
                                    errors.unitOfMeasureId &&
                                    touched.unitOfMeasureId
                                )
                            }
                            errorMessage={errors.unitOfMeasureId as string}
                        >
                            <Select
                                placeholder="Seleccione una unidad"
                                isDisabled={isSubmitting}
                                value={unitOptions.find(
                                    (opt) =>
                                        opt.value ===
                                        (values.unitOfMeasureId || 0)
                                )}
                                options={unitOptions}
                                onChange={(option) =>
                                    setFieldValue(
                                        'unitOfMeasureId',
                                        option?.value === 0
                                            ? undefined
                                            : option?.value
                                    )
                                }
                                onBlur={() =>
                                    setFieldTouched('unitOfMeasureId', true)
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Opcional: Seleccione la unidad de medida del
                                producto
                            </p>
                        </FormItem>

                        <div className="grid grid-cols-2 gap-4">
                            <FormItem
                                label="Precio de compra"
                                invalid={
                                    !!(
                                        errors.purchasePrice &&
                                        touched.purchasePrice
                                    )
                                }
                                errorMessage={errors.purchasePrice as string}
                            >
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={values.purchasePrice ?? ''}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFieldValue(
                                            'purchasePrice',
                                            e.target.value !== ''
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    onBlur={() =>
                                        setFieldTouched('purchasePrice', true)
                                    }
                                />
                            </FormItem>
                            <FormItem
                                label="Precio de venta"
                                invalid={
                                    !!(errors.salePrice && touched.salePrice)
                                }
                                errorMessage={errors.salePrice as string}
                            >
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={values.salePrice ?? ''}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFieldValue(
                                            'salePrice',
                                            e.target.value !== ''
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    onBlur={() =>
                                        setFieldTouched('salePrice', true)
                                    }
                                />
                            </FormItem>
                        </div>

                        <div className="flex gap-6">
                            <div className="flex items-center gap-3">
                                <Switcher
                                    checked={values.isActive}
                                    onChange={(checked) =>
                                        setFieldValue('isActive', checked)
                                    }
                                />
                                <label className="text-sm font-medium">
                                    Activo
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Switcher
                                    checked={values.isService}
                                    onChange={(checked) =>
                                        setFieldValue('isService', checked)
                                    }
                                />
                                <label className="text-sm font-medium">
                                    Es servicio
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormItem
                                label="Stock mínimo"
                                invalid={
                                    !!(errors.minStock && touched.minStock)
                                }
                                errorMessage={errors.minStock as string}
                            >
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={values.minStock ?? ''}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFieldValue(
                                            'minStock',
                                            e.target.value !== ''
                                                ? Number(e.target.value)
                                                : 0
                                        )
                                    }
                                    onBlur={() =>
                                        setFieldTouched('minStock', true)
                                    }
                                />
                            </FormItem>
                            <FormItem
                                label="Stock máximo"
                                invalid={
                                    !!(errors.maxStock && touched.maxStock)
                                }
                                errorMessage={errors.maxStock as string}
                            >
                                <Input
                                    type="number"
                                    placeholder="Sin límite"
                                    value={values.maxStock ?? ''}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFieldValue(
                                            'maxStock',
                                            e.target.value !== ''
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    onBlur={() =>
                                        setFieldTouched('maxStock', true)
                                    }
                                />
                            </FormItem>
                            <FormItem
                                label="Punto de reorden"
                                invalid={
                                    !!(
                                        errors.reorderPoint &&
                                        touched.reorderPoint
                                    )
                                }
                                errorMessage={errors.reorderPoint as string}
                            >
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={values.reorderPoint ?? ''}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFieldValue(
                                            'reorderPoint',
                                            e.target.value !== ''
                                                ? Number(e.target.value)
                                                : 0
                                        )
                                    }
                                    onBlur={() =>
                                        setFieldTouched('reorderPoint', true)
                                    }
                                />
                            </FormItem>
                            <FormItem
                                label="Tiempo de entrega (días)"
                                invalid={
                                    !!(
                                        errors.leadTimeDays &&
                                        touched.leadTimeDays
                                    )
                                }
                                errorMessage={errors.leadTimeDays as string}
                            >
                                <Input
                                    type="number"
                                    placeholder="Sin definir"
                                    value={values.leadTimeDays ?? ''}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFieldValue(
                                            'leadTimeDays',
                                            e.target.value !== ''
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    onBlur={() =>
                                        setFieldTouched('leadTimeDays', true)
                                    }
                                />
                            </FormItem>
                        </div>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default ProductForm
