import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import { customerSchema } from '@/schemas'
import type {
    Customer,
    CustomerInput,
    TaxType,
} from '@/services/CustomerService'
import { TAX_TYPE_LABELS } from '@/services/CustomerService'

interface CustomerFormProps {
    formId: string
    customer?: Customer | null
    isSubmitting?: boolean
    onSubmit: (data: CustomerInput) => void
}

const taxTypeOptions = [
    { value: 1, label: TAX_TYPE_LABELS[1] },
    { value: 2, label: TAX_TYPE_LABELS[2] },
    { value: 3, label: TAX_TYPE_LABELS[3] },
    { value: 4, label: TAX_TYPE_LABELS[4] },
]

const emptyValues: CustomerInput = {
    name: '',
    taxId: '',
    taxType: 2,
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    creditLimit: undefined,
    paymentTerms: undefined,
    isActive: true,
}

const CustomerForm = ({
    formId,
    customer,
    isSubmitting = false,
    onSubmit,
}: CustomerFormProps) => {
    const initialValues: CustomerInput = customer
        ? {
              name: customer.name,
              taxId: customer.taxId,
              taxType: customer.taxType,
              email: customer.email || '',
              phone: customer.phone || '',
              address: customer.address || '',
              city: customer.city || '',
              state: customer.state || '',
              country: customer.country || '',
              creditLimit: customer.creditLimit || undefined,
              paymentTerms: customer.paymentTerms || undefined,
              isActive: customer.isActive,
          }
        : emptyValues

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={customerSchema}
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
                                        placeholder="Nombre del cliente"
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    label="Provincia/Estado"
                                    invalid={!!(errors.state && touched.state)}
                                    errorMessage={errors.state}
                                >
                                    <Field
                                        name="state"
                                        type="text"
                                        placeholder="Pichincha"
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
                            Información Financiera
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem
                                label="Límite de Crédito"
                                invalid={
                                    !!(
                                        errors.creditLimit &&
                                        touched.creditLimit
                                    )
                                }
                                errorMessage={errors.creditLimit as string}
                            >
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={values.creditLimit ?? ''}
                                    min="0"
                                    step="0.01"
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFieldValue(
                                            'creditLimit',
                                            e.target.value
                                                ? parseFloat(e.target.value)
                                                : undefined
                                        )
                                    }
                                    onBlur={() =>
                                        setFieldTouched('creditLimit', true)
                                    }
                                />
                            </FormItem>

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
                        </div>

                        <FormItem label="Estado">
                            <Switcher
                                checked={values.isActive}
                                onChange={(checked) =>
                                    setFieldValue('isActive', checked)
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {values.isActive
                                    ? 'Cliente activo'
                                    : 'Cliente inactivo'}
                            </p>
                        </FormItem>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default CustomerForm
