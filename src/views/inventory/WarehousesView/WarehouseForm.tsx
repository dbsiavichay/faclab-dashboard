import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateWarehouse, useUpdateWarehouse } from '@/hooks/useWarehouses'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { Warehouse, WarehouseInput } from '@/services/WarehouseService'

interface WarehouseFormProps {
    open: boolean
    onClose: () => void
    warehouse: Warehouse | null
}

const WarehouseForm = ({ open, onClose, warehouse }: WarehouseFormProps) => {
    const [formData, setFormData] = useState<WarehouseInput>({
        name: '',
        code: '',
        address: '',
        city: '',
        country: '',
        isActive: true,
        isDefault: false,
        manager: '',
        phone: '',
        email: '',
    })

    const createWarehouse = useCreateWarehouse()
    const updateWarehouse = useUpdateWarehouse()

    const isEdit = !!warehouse

    useEffect(() => {
        if (warehouse) {
            setFormData({
                name: warehouse.name,
                code: warehouse.code,
                address: warehouse.address || '',
                city: warehouse.city || '',
                country: warehouse.country || '',
                isActive: warehouse.isActive,
                isDefault: warehouse.isDefault,
                manager: warehouse.manager || '',
                phone: warehouse.phone || '',
                email: warehouse.email || '',
            })
        } else {
            setFormData({
                name: '',
                code: '',
                address: '',
                city: '',
                country: '',
                isActive: true,
                isDefault: false,
                manager: '',
                phone: '',
                email: '',
            })
        }
    }, [warehouse, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEdit && warehouse) {
                await updateWarehouse.mutateAsync({
                    id: warehouse.id,
                    data: formData,
                })
            } else {
                await createWarehouse.mutateAsync(formData)
            }

            toast.push(
                <Notification
                    title={isEdit ? 'Bodega actualizada' : 'Bodega creada'}
                    type="success"
                >
                    {isEdit
                        ? 'La bodega se actualizó correctamente'
                        : 'La bodega se creó correctamente'}
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(
                error,
                'Error al guardar la bodega'
            )

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const isPending = createWarehouse.isPending || updateWarehouse.isPending

    const handleClose = () => {
        if (!isPending) {
            onClose()
        }
    }

    return (
        <Dialog
            isOpen={open}
            width={600}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">
                    {isEdit ? 'Editar Bodega' : 'Nueva Bodega'}
                </h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Nombre{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="text"
                                    placeholder="Ej: Bodega Principal"
                                    value={formData.name}
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
                                    Código{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="text"
                                    placeholder="Ej: BOD-001"
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            code: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Dirección
                            </label>
                            <Input
                                type="text"
                                placeholder="Dirección de la bodega"
                                value={formData.address || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        address: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Ciudad
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Ej: Quito"
                                    value={formData.city || ''}
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
                                    placeholder="Ej: Ecuador"
                                    value={formData.country || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            country: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Responsable
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Nombre del responsable"
                                    value={formData.manager || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            manager: e.target.value,
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
                                    placeholder="Ej: +593 99 999 9999"
                                    value={formData.phone || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="bodega@ejemplo.com"
                                value={formData.email || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <Switcher
                                    checked={formData.isActive}
                                    onChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            isActive: !checked,
                                        })
                                    }
                                />
                                <label className="text-sm font-medium">
                                    Activo
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <Switcher
                                    checked={formData.isDefault}
                                    onChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            isDefault: !checked,
                                        })
                                    }
                                />
                                <label className="text-sm font-medium">
                                    Por defecto
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={isPending}
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isPending}
                        >
                            {isEdit ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default WarehouseForm
