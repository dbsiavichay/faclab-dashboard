import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useWarehouses } from '@/hooks/useWarehouses'
import type {
    Location,
    LocationInput,
    LocationType,
} from '@/services/LocationService'

interface LocationFormProps {
    formId: string
    location: Location | null
    isSubmitting?: boolean
    onSubmit: (data: LocationInput) => void
}

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
    { value: 'STORAGE', label: 'Almacenamiento' },
    { value: 'RECEIVING', label: 'Recepción' },
    { value: 'SHIPPING', label: 'Despacho' },
    { value: 'RETURN', label: 'Devolución' },
]

const LocationForm = ({
    formId,
    location,
    isSubmitting = false,
    onSubmit,
}: LocationFormProps) => {
    const [formData, setFormData] = useState<LocationInput>({
        warehouseId: 0,
        name: '',
        code: '',
        type: 'STORAGE',
        isActive: true,
        capacity: null,
    })

    const { data: warehousesData } = useWarehouses({ isActive: true })
    const warehouses = warehousesData?.items ?? []
    const warehouseOptions = warehouses.map((w) => ({
        value: w.id,
        label: w.name,
    }))

    useEffect(() => {
        setFormData(
            location
                ? {
                      warehouseId: location.warehouseId,
                      name: location.name,
                      code: location.code,
                      type: location.type,
                      isActive: location.isActive,
                      capacity: location.capacity ?? null,
                  }
                : {
                      warehouseId: 0,
                      name: '',
                      code: '',
                      type: 'STORAGE',
                      isActive: true,
                      capacity: null,
                  }
        )
    }, [location])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.warehouseId) {
            toast.push(
                <Notification title="Error" type="danger">
                    Debe seleccionar una bodega
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }
        onSubmit({ ...formData, capacity: formData.capacity || null })
    }

    return (
        <form id={formId} onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Bodega <span className="text-red-500">*</span>
                    </label>
                    <Select
                        placeholder="Seleccione una bodega"
                        value={
                            warehouseOptions.find(
                                (opt) => opt.value === formData.warehouseId
                            ) || null
                        }
                        options={warehouseOptions}
                        onChange={(option) =>
                            setFormData({
                                ...formData,
                                warehouseId: option?.value || 0,
                            })
                        }
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="text"
                            placeholder="Ej: Estante A1"
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
                            Código <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="text"
                            placeholder="Ej: EST-A1"
                            value={formData.code}
                            disabled={isSubmitting}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    code: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tipo <span className="text-red-500">*</span>
                        </label>
                        <Select
                            placeholder="Seleccione un tipo"
                            value={
                                LOCATION_TYPES.find(
                                    (opt) => opt.value === formData.type
                                ) || null
                            }
                            options={LOCATION_TYPES}
                            onChange={(option) =>
                                setFormData({
                                    ...formData,
                                    type:
                                        (option?.value as LocationType) ||
                                        'STORAGE',
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Capacidad
                        </label>
                        <Input
                            type="number"
                            placeholder="Ej: 100"
                            value={formData.capacity ?? ''}
                            disabled={isSubmitting}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    capacity: e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                })
                            }
                        />
                    </div>
                </div>

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
            </div>
        </form>
    )
}

export default LocationForm
