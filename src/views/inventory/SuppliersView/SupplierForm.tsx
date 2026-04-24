import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import { supplierSchema } from '@/schemas'
import type {
    Supplier,
    SupplierInput,
    TaxType,
} from '@/services/SupplierService'
import { TAX_TYPE_LABELS } from '@/services/SupplierService'

interface SupplierFormProps {
    formId: string
    supplier?: Supplier | null
    isSubmitting?: boolean
    onSubmit: (data: SupplierInput) => void
}

const taxTypeOptions = [
    { value: 1, label: TAX_TYPE_LABELS[1] },
    { value: 2, label: TAX_TYPE_LABELS[2] },
    { value: 3, label: TAX_TYPE_LABELS[3] },
    { value: 4, label: TAX_TYPE_LABELS[4] },
]

const emptyValues: SupplierInput = {
    name: '',
    taxId: '',
    taxType: 1,
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    paymentTerms: undefined,
    leadTimeDays: undefined,
    notes: '',
    isActive: true,
}

const SupplierForm = ({
    formId,
    supplier,
    isSubmitting = false,
    onSubmit,
}: SupplierFormProps) => {
    const initialValues: SupplierInput = supplier
        ? {
              name: supplier.name,
              taxId: supplier.taxId,
              taxType: supplier.taxType,
              email: supplier.email || '',
              phone: supplier.phone || '',
              address: supplier.address || '',
              city: supplier.city || '',
              country: supplier.country || '',
              paymentTerms: supplier.paymentTerms || undefined,
              leadTimeDays: supplier.leadTimeDays || undefined,
              notes: supplier.notes || '',
              isActive: supplier.isActive,
          }
        : emptyValues

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={supplierSchema}
            onSubmit={(values) => onSubmit(values)}
        >
            {({ touched, errors, values, setFieldValue, setFieldTouched }) => (
                <Form id={formId}>
                    <FormContainer>
                        <h6 className="mb-3 text-sm font-semibold">
                            Información Básica
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <FormItem
                                    asterisk
                                    label="Nombre"
                                    invalid={!!(errors.name && touched.name)}
                                    errorMessage={errors.name}
                                >
                                    <Field
                                        name="name"
                                        type="text"
                                        placeholder="Nombre del proveedor"
                                        component={Input}
                                        disabled={isSubmitting}
                                    />
                                </FormItem>
                            </div>

                            <FormItem
                                asterisk
                                label="Tax ID"
                                invalid={!!(errors.taxId && touched.taxId)}
                                errorMessage={errors.taxId}
                            >
                                <Field
                                    name="taxId"
                                    type="text"
                                    placeholder="RUC, Cédula, Pasaporte..."
                                    component={Input}
                                    disabled={isSubmitting}
                                />
                            </FormItem>

                            <FormItem
                                asterisk
                                label="Tipo de ID"
                                invalid={!!(errors.taxType && touched.taxType)}
                                errorMessage={errors.taxType as string}
                            >
                                <Select
                                    isDisabled={isSubmitting}
                                    value={taxTypeOptions.find(
                                        (opt) => opt.value === values.taxType
                                    )}
                                    options={taxTypeOptions}
                                    onChange={(option) =>
                                        setFieldValue(
                                            'taxType',
                                            option?.value as TaxType
                                        )
                                    }
                                    onBlur={() =>
                                        setFieldTouched('taxType', true)
                                    }
                                />
                            </FormItem>
                        </div>

                        <h6 className="mb-3 text-sm font-semibold">
                            Información de Contacto
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem
                                label="Email"
                                invalid={!!(errors.email && touched.email)}
                                errorMessage={errors.email}
                            >
                                <Field
                                    name="email"
                                    type="email"
                                    placeholder="email@ejemplo.com"
                                    component={Input}
                                    disabled={isSubmitting}
                                />
                            </FormItem>

                            <FormItem
                                label="Teléfono"
                                invalid={!!(errors.phone && touched.phone)}
                                errorMessage={errors.phone}
                            >
                                <Field
                                    name="phone"
                                    type="text"
                                    placeholder="0987654321"
                                    component={Input}
                                    disabled={isSubmitting}
                                />
                            </FormItem>
                        </div>

                        <h6 className="mb-3 text-sm font-semibold">
                            Dirección
                        </h6>
                        <div className="space-y-4">
                            <FormItem
                                label="Dirección"
                                invalid={!!(errors.address && touched.address)}
                                errorMessage={errors.address}
                            >
                                <Field
                                    name="address"
                                    type="text"
                                    placeholder="Calle principal 123"
                                    component={Input}
                                    disabled={isSubmitting}
                                />
                            </FormItem>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormItem
                                    label="Ciudad"
                                    invalid={!!(errors.city && touched.city)}
                                    errorMessage={errors.city}
                                >
                                    <Field
                                        name="city"
                                        type="text"
                                        placeholder="Quito"
                                        component={Input}
                                        disabled={isSubmitting}
                                    />
                                </FormItem>

                                <FormItem
                                    label="País"
                                    invalid={
                                        !!(errors.country && touched.country)
                                    }
                                    errorMessage={errors.country}
                                >
                                    <Field
                                        name="country"
                                        type="text"
                                        placeholder="Ecuador"
                                        component={Input}
                                        disabled={isSubmitting}
                                    />
                                </FormItem>
                            </div>
                        </div>

                        <h6 className="mb-3 text-sm font-semibold">
                            Información Financiera y de Abastecimiento
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem
                                label="Términos de Pago (días)"
                                invalid={
                                    !!(
                                        errors.paymentTerms &&
                                        touched.paymentTerms
                                    )
                                }
                                errorMessage={errors.paymentTerms as string}
                            >
                                <Input
                                    type="number"
                                    placeholder="30"
                                    value={values.paymentTerms ?? ''}
                                    min="0"
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFieldValue(
                                            'paymentTerms',
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined
                                        )
                                    }
                                    onBlur={() =>
                                        setFieldTouched('paymentTerms', true)
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Tiempo de Entrega (días)"
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
                                    placeholder="7"
                                    value={values.leadTimeDays ?? ''}
                                    min="0"
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFieldValue(
                                            'leadTimeDays',
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined
                                        )
                                    }
                                    onBlur={() =>
                                        setFieldTouched('leadTimeDays', true)
                                    }
                                />
                            </FormItem>
                        </div>

                        <FormItem
                            label="Notas"
                            invalid={!!(errors.notes && touched.notes)}
                            errorMessage={errors.notes}
                        >
                            <Field
                                textArea
                                name="notes"
                                placeholder="Notas adicionales sobre el proveedor..."
                                component={Input}
                                disabled={isSubmitting}
                            />
                        </FormItem>

                        <FormItem label="Estado">
                            <Switcher
                                checked={values.isActive}
                                onChange={(checked) =>
                                    setFieldValue('isActive', checked)
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {values.isActive
                                    ? 'Proveedor activo'
                                    : 'Proveedor inactivo'}
                            </p>
                        </FormItem>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default SupplierForm
