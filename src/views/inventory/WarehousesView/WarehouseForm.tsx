import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import type { Warehouse, WarehouseInput } from '@/services/WarehouseService'

interface WarehouseFormProps {
    formId: string
    warehouse: Warehouse | null
    isSubmitting?: boolean
    onSubmit: (data: WarehouseInput) => void
}

const WarehouseForm = ({
    formId,
    warehouse,
    isSubmitting = false,
    onSubmit,
}: WarehouseFormProps) => {
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

    useEffect(() => {
        setFormData(
            warehouse
                ? {
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
                  }
                : {
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
                  }
        )
    }, [warehouse])

    return (
        <form
            id={formId}
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(formData)
            }}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Nombre <span className="text-red-500">*</span>
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
                            Código <span className="text-red-500">*</span>
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
                            setFormData({ ...formData, email: e.target.value })
                        }
                    />
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Switcher
                            checked={formData.isActive}
                            disabled={isSubmitting}
                            onChange={(checked) =>
                                setFormData({ ...formData, isActive: !checked })
                            }
                        />
                        <label className="text-sm font-medium">Activo</label>
                    </div>

                    <div className="flex items-center gap-3">
                        <Switcher
                            checked={formData.isDefault}
                            disabled={isSubmitting}
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
        </form>
    )
}

export default WarehouseForm
