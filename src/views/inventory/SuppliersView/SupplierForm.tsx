import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useSuppliers'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type {
    Supplier,
    SupplierInput,
    TaxType,
} from '@/services/SupplierService'
import { TAX_TYPE_LABELS } from '@/services/SupplierService'

interface SupplierFormProps {
    open: boolean
    onClose: () => void
    supplier?: Supplier | null
}

const SupplierForm = ({ open, onClose, supplier }: SupplierFormProps) => {
    const [formData, setFormData] = useState<SupplierInput>({
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
        leadTimeDays: undefined,
        notes: '',
        isActive: true,
    })

    const createSupplier = useCreateSupplier()
    const updateSupplier = useUpdateSupplier()

    const isEdit = !!supplier

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
                state: supplier.state || '',
                country: supplier.country || '',
                creditLimit: supplier.creditLimit || undefined,
                paymentTerms: supplier.paymentTerms || undefined,
                leadTimeDays: supplier.leadTimeDays || undefined,
                notes: supplier.notes || '',
                isActive: supplier.isActive,
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
                leadTimeDays: undefined,
                notes: '',
                isActive: true,
            })
        }
    }, [supplier, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEdit && supplier) {
                await updateSupplier.mutateAsync({
                    id: supplier.id,
                    data: formData,
                })
            } else {
                await createSupplier.mutateAsync(formData)
            }

            toast.push(
                <Notification
                    title={
                        isEdit ? 'Proveedor actualizado' : 'Proveedor creado'
                    }
                    type="success"
                >
                    {isEdit
                        ? 'El proveedor se actualizó correctamente'
                        : 'El proveedor se creó correctamente'}
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(
                error,
                'Error al guardar el proveedor'
            )

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )

            console.error('Error saving supplier:', error)
        }
    }

    const handleClose = () => {
        if (!createSupplier.isPending && !updateSupplier.isPending) {
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
                    {isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                                        placeholder="Nombre del proveedor"
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

                        {/* Financial & Supply Information */}
                        <div>
                            <h6 className="mb-3 text-sm font-semibold">
                                Información Financiera y de Abastecimiento
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                                {/* Lead Time Days */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Tiempo de Entrega (días)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="7"
                                        value={formData.leadTimeDays || ''}
                                        min="0"
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

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Notas
                            </label>
                            <Input
                                textArea
                                placeholder="Notas adicionales sobre el proveedor..."
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notes: e.target.value,
                                    })
                                }
                            />
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
                                    ? 'Proveedor activo'
                                    : 'Proveedor inactivo'}
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={
                                createSupplier.isPending ||
                                updateSupplier.isPending
                            }
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={
                                createSupplier.isPending ||
                                updateSupplier.isPending
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

export default SupplierForm
