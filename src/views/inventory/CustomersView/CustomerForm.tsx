import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
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

const CustomerForm = ({
    formId,
    customer,
    isSubmitting = false,
    onSubmit,
}: CustomerFormProps) => {
    const [formData, setFormData] = useState<CustomerInput>({
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
    })

    const taxTypeOptions = [
        { value: 1, label: TAX_TYPE_LABELS[1] },
        { value: 2, label: TAX_TYPE_LABELS[2] },
        { value: 3, label: TAX_TYPE_LABELS[3] },
        { value: 4, label: TAX_TYPE_LABELS[4] },
    ]

    useEffect(() => {
        if (customer) {
            setFormData({
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
            })
        } else {
            setFormData({
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
            })
        }
    }, [customer])

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
                    <h6 className="mb-3 text-sm font-semibold">
                        Información Básica
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="text"
                                placeholder="Nombre del cliente"
                                value={formData.name}
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tax ID <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="text"
                                placeholder="RUC, Cédula, Pasaporte..."
                                value={formData.taxId}
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        taxId: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tipo de ID{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Select
                                isDisabled={isSubmitting}
                                value={taxTypeOptions.find(
                                    (opt) => opt.value === formData.taxType
                                )}
                                options={taxTypeOptions}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        taxType: option?.value as TaxType,
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h6 className="mb-3 text-sm font-semibold">
                        Información de Contacto
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="email@ejemplo.com"
                                value={formData.email}
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Teléfono
                            </label>
                            <Input
                                type="text"
                                placeholder="0987654321"
                                value={formData.phone}
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h6 className="mb-3 text-sm font-semibold">Dirección</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Dirección
                            </label>
                            <Input
                                type="text"
                                placeholder="Calle principal 123"
                                value={formData.address}
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        address: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Ciudad
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Quito"
                                    value={formData.city}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            city: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Provincia/Estado
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Pichincha"
                                    value={formData.state}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            state: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    País
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Ecuador"
                                    value={formData.country}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            country: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h6 className="mb-3 text-sm font-semibold">
                        Información Financiera
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Límite de Crédito
                            </label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.creditLimit || ''}
                                min="0"
                                step="0.01"
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        creditLimit: e.target.value
                                            ? parseFloat(e.target.value)
                                            : undefined,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Términos de Pago (días)
                            </label>
                            <Input
                                type="number"
                                placeholder="30"
                                value={formData.paymentTerms || ''}
                                min="0"
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        paymentTerms: e.target.value
                                            ? parseInt(e.target.value)
                                            : undefined,
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Estado
                    </label>
                    <Switcher
                        checked={formData.isActive}
                        onChange={(checked) =>
                            setFormData({ ...formData, isActive: checked })
                        }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.isActive
                            ? 'Cliente activo'
                            : 'Cliente inactivo'}
                    </p>
                </div>
            </div>
        </form>
    )
}

export default CustomerForm
