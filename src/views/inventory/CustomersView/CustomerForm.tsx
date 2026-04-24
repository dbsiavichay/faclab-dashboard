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
                                    htmlFor="name"
                                    label="Nombre"
                                    invalid={!!(errors.name && touched.name)}
                                    errorMessage={errors.name}
                                >
                                    <Field
                                        id="name"
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
                                htmlFor="taxId"
                                label="Tax ID"
                                invalid={!!(errors.taxId && touched.taxId)}
                                errorMessage={errors.taxId}
                            >
                                <Field
                                    id="taxId"
                                    name="taxId"
                                    type="text"
                                    placeholder="RUC, Cédula, Pasaporte..."
                                    component={Input}
                                    disabled={isSubmitting}
                                />
                            </FormItem>

                            <FormItem
                                asterisk
                                htmlFor="taxType"
                                label="Tipo de ID"
                                invalid={!!(errors.taxType && touched.taxType)}
                                errorMessage={errors.taxType as string}
                            >
                                <Select
                                    inputId="taxType"
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
                                htmlFor="email"
                                label="Email"
                                invalid={!!(errors.email && touched.email)}
                                errorMessage={errors.email}
                            >
                                <Field
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="email@ejemplo.com"
                                    component={Input}
                                    disabled={isSubmitting}
                                />
                            </FormItem>

                            <FormItem
                                htmlFor="phone"
                                label="Teléfono"
                                invalid={!!(errors.phone && touched.phone)}
                                errorMessage={errors.phone}
                            >
                                <Field
                                    id="phone"
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
                                htmlFor="address"
                                label="Dirección"
                                invalid={!!(errors.address && touched.address)}
                                errorMessage={errors.address}
                            >
                                <Field
                                    id="address"
                                    name="address"
                                    type="text"
                                    placeholder="Calle principal 123"
                                    component={Input}
                                    disabled={isSubmitting}
                                />
                            </FormItem>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormItem
                                    htmlFor="city"
                                    label="Ciudad"
                                    invalid={!!(errors.city && touched.city)}
                                    errorMessage={errors.city}
                                >
                                    <Field
                                        id="city"
                                        name="city"
                                        type="text"
                                        placeholder="Quito"
                                        component={Input}
                                        disabled={isSubmitting}
                                    />
                                </FormItem>

                                <FormItem
                                    htmlFor="state"
                                    label="Provincia/Estado"
                                    invalid={!!(errors.state && touched.state)}
                                    errorMessage={errors.state}
                                >
                                    <Field
                                        id="state"
                                        name="state"
                                        type="text"
                                        placeholder="Pichincha"
                                        component={Input}
                                        disabled={isSubmitting}
                                    />
                                </FormItem>

                                <FormItem
                                    htmlFor="country"
                                    label="País"
                                    invalid={
                                        !!(errors.country && touched.country)
                                    }
                                    errorMessage={errors.country}
                                >
                                    <Field
                                        id="country"
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
                                htmlFor="creditLimit"
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
                                    id="creditLimit"
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
                                htmlFor="paymentTerms"
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
                                    id="paymentTerms"
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

                        <FormItem htmlFor="isActive" label="Estado">
                            <Switcher
                                id="isActive"
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
