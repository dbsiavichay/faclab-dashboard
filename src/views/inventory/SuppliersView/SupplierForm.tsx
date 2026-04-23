import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
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

const SupplierForm = ({
    formId,
    supplier,
    isSubmitting = false,
    onSubmit,
}: SupplierFormProps) => {
    const [formData, setFormData] = useState<SupplierInput>({
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
    })

    const taxTypeOptions = [
        { value: 1, label: TAX_TYPE_LABELS[1] },
        { value: 2, label: TAX_TYPE_LABELS[2] },
        { value: 3, label: TAX_TYPE_LABELS[3] },
        { value: 4, label: TAX_TYPE_LABELS[4] },
    ]

    useEffect(() => {
        if (supplier) {
            setFormData({
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
            })
        } else {
            setFormData({
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
            })
        }
    }, [supplier])

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
                                placeholder="Nombre del proveedor"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Información Financiera y de Abastecimiento
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tiempo de Entrega (días)
                            </label>
                            <Input
                                type="number"
                                placeholder="7"
                                value={formData.leadTimeDays || ''}
                                min="0"
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        leadTimeDays: e.target.value
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
                        Notas
                    </label>
                    <Input
                        textArea
                        placeholder="Notas adicionales sobre el proveedor..."
                        value={formData.notes}
                        disabled={isSubmitting}
                        onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                        }
                    />
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
                            ? 'Proveedor activo'
                            : 'Proveedor inactivo'}
                    </p>
                </div>
            </div>
        </form>
    )
}

export default SupplierForm
