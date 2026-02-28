import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateLocation, useUpdateLocation } from '@/hooks/useLocations'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { useWarehouses } from '@/hooks/useWarehouses'
import type {
    Location,
    LocationInput,
    LocationType,
} from '@/services/LocationService'

interface LocationFormProps {
    open: boolean
    onClose: () => void
    location: Location | null
}

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
    { value: 'STORAGE', label: 'Almacenamiento' },
    { value: 'RECEIVING', label: 'Recepción' },
    { value: 'SHIPPING', label: 'Despacho' },
    { value: 'RETURN', label: 'Devolución' },
]

const LocationForm = ({ open, onClose, location }: LocationFormProps) => {
    const [formData, setFormData] = useState<LocationInput>({
        warehouseId: 0,
        name: '',
        code: '',
        type: 'STORAGE',
        isActive: true,
        capacity: null,
    })

    const createLocation = useCreateLocation()
    const updateLocation = useUpdateLocation()
    const { data: warehouses = [] } = useWarehouses({ isActive: true })

    const isEdit = !!location

    const warehouseOptions = warehouses.map((w) => ({
        value: w.id,
        label: w.name,
    }))

    useEffect(() => {
        if (location) {
            setFormData({
                warehouseId: location.warehouseId,
                name: location.name,
                code: location.code,
                type: location.type,
                isActive: location.isActive,
                capacity: location.capacity ?? null,
            })
        } else {
            setFormData({
                warehouseId: 0,
                name: '',
                code: '',
                type: 'STORAGE',
                isActive: true,
                capacity: null,
            })
        }
    }, [location, open])

    const handleSubmit = async (e: React.FormEvent) => {
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

        try {
            const dataToSend = {
                ...formData,
                capacity: formData.capacity || null,
            }

            if (isEdit && location) {
                await updateLocation.mutateAsync({
                    id: location.id,
                    data: dataToSend,
                })
            } else {
                await createLocation.mutateAsync(dataToSend)
            }

            toast.push(
                <Notification
                    title={
                        isEdit ? 'Ubicación actualizada' : 'Ubicación creada'
                    }
                    type="success"
                >
                    {isEdit
                        ? 'La ubicación se actualizó correctamente'
                        : 'La ubicación se creó correctamente'}
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(
                error,
                'Error al guardar la ubicación'
            )

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const isPending = createLocation.isPending || updateLocation.isPending

    const handleClose = () => {
        if (!isPending) {
            onClose()
        }
    }

    return (
        <Dialog
            isOpen={open}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">
                    {isEdit ? 'Editar Ubicación' : 'Nueva Ubicación'}
                </h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Bodega <span className="text-red-500">*</span>
                            </label>
                            <Select
                                placeholder="Seleccione una bodega"
                                value={
                                    warehouseOptions.find(
                                        (opt) =>
                                            opt.value === formData.warehouseId
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
                                    Nombre{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="text"
                                    placeholder="Ej: Estante A1"
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
                                    placeholder="Ej: EST-A1"
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

export default LocationForm
