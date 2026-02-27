import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers'
import type {
    Customer,
    CustomerInput,
    TaxType,
} from '@/services/CustomerService'
import { TAX_TYPE_LABELS } from '@/services/CustomerService'

interface CustomerFormProps {
    open: boolean
    onClose: () => void
    customer?: Customer | null
}

const CustomerForm = ({ open, onClose, customer }: CustomerFormProps) => {
    const [formData, setFormData] = useState<CustomerInput>({
        name: '',
        taxId: '',
        taxType: 2, // Default to Cédula
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

    const createCustomer = useCreateCustomer()
    const updateCustomer = useUpdateCustomer()

    const isEdit = !!customer

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
    }, [customer, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEdit && customer) {
                await updateCustomer.mutateAsync({
                    id: customer.id,
                    data: formData,
                })
            } else {
                await createCustomer.mutateAsync(formData)
            }

            toast.push(
                <Notification
                    title={isEdit ? 'Cliente actualizado' : 'Cliente creado'}
                    type="success"
                >
                    {isEdit
                        ? 'El cliente se actualizó correctamente'
                        : 'El cliente se creó correctamente'}
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                error.message ||
                'Error al guardar el cliente'

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )

            console.error('Error saving customer:', error)
        }
    }

    const handleClose = () => {
        if (!createCustomer.isPending && !updateCustomer.isPending) {
            onClose()
        }
    }

    return (
        <Dialog
            isOpen={open}
            width={800}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">
                    {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h5>

                <form
                    className="flex-1 overflow-y-auto"
                    onSubmit={handleSubmit}
                >
                    <div className="space-y-4">
                        {/* Basic Information */}
                        <div>
                            <h6 className="mb-3 text-sm font-semibold">
                                Información Básica
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">
                                        Nombre{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        type="text"
                                        placeholder="Nombre del cliente"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* Tax ID */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Tax ID{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        type="text"
                                        placeholder="RUC, Cédula, Pasaporte..."
                                        value={formData.taxId}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                taxId: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* Tax Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Tipo de ID{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={taxTypeOptions.find(
                                            (opt) =>
                                                opt.value === formData.taxType
                                        )}
                                        options={taxTypeOptions}
                                        onChange={(option) =>
                                            setFormData({
                                                ...formData,
                                                taxType:
                                                    option?.value as TaxType,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h6 className="mb-3 text-sm font-semibold">
                                Información de Contacto
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="email@ejemplo.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Teléfono
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="0987654321"
                                        value={formData.phone}
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

                        {/* Address */}
                        <div>
                            <h6 className="mb-3 text-sm font-semibold">
                                Dirección
                            </h6>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Dirección
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Calle principal 123"
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                address: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* City */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Ciudad
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Quito"
                                            value={formData.city}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    city: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* State */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Provincia/Estado
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Pichincha"
                                            value={formData.state}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    state: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            País
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Ecuador"
                                            value={formData.country}
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

                        {/* Financial Information */}
                        <div>
                            <h6 className="mb-3 text-sm font-semibold">
                                Información Financiera
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Credit Limit */}
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

                                {/* Payment Terms */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Términos de Pago (días)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="30"
                                        value={formData.paymentTerms || ''}
                                        min="0"
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

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Estado
                            </label>
                            <Switcher
                                checked={formData.isActive}
                                onChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        isActive: checked,
                                    })
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.isActive
                                    ? 'Cliente activo'
                                    : 'Cliente inactivo'}
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={
                                createCustomer.isPending ||
                                updateCustomer.isPending
                            }
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={
                                createCustomer.isPending ||
                                updateCustomer.isPending
                            }
                        >
                            {isEdit ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default CustomerForm
