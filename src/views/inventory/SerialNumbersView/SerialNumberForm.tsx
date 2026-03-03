import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useCreateSerialNumber,
    useUpdateSerialNumber,
} from '@/hooks/useSerialNumbers'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type {
    SerialNumber,
    SerialNumberInput,
    SerialStatus,
} from '@/services/SerialNumberService'
import { SERIAL_STATUS_LABELS } from '@/services/SerialNumberService'

interface SerialNumberFormProps {
    open: boolean
    onClose: () => void
    serialNumber: SerialNumber | null
}

const statusOptions = (Object.keys(SERIAL_STATUS_LABELS) as SerialStatus[]).map(
    (key) => ({
        value: key,
        label: SERIAL_STATUS_LABELS[key],
    })
)

const SerialNumberForm = ({
    open,
    onClose,
    serialNumber,
}: SerialNumberFormProps) => {
    const [formData, setFormData] = useState<SerialNumberInput>({
        serialNumber: '',
        productId: 0,
        status: 'AVAILABLE',
        lotId: undefined,
        locationId: undefined,
        notes: '',
    })

    const createSerialNumber = useCreateSerialNumber()
    const updateSerialNumber = useUpdateSerialNumber()

    const isEdit = !!serialNumber

    useEffect(() => {
        if (serialNumber) {
            setFormData({
                serialNumber: serialNumber.serialNumber,
                productId: serialNumber.productId,
                status: serialNumber.status,
                lotId: serialNumber.lotId || undefined,
                locationId: serialNumber.locationId || undefined,
                notes: serialNumber.notes || '',
            })
        } else {
            setFormData({
                serialNumber: '',
                productId: 0,
                status: 'AVAILABLE',
                lotId: undefined,
                locationId: undefined,
                notes: '',
            })
        }
    }, [serialNumber, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const submitData: SerialNumberInput = {
            ...formData,
            notes: formData.notes || undefined,
        }

        try {
            if (isEdit && serialNumber) {
                await updateSerialNumber.mutateAsync({
                    id: serialNumber.id,
                    data: submitData,
                })
            } else {
                await createSerialNumber.mutateAsync(submitData)
            }

            toast.push(
                <Notification
                    title={
                        isEdit
                            ? 'Número de serie actualizado'
                            : 'Número de serie creado'
                    }
                    type="success"
                >
                    {isEdit
                        ? 'El número de serie se actualizó correctamente'
                        : 'El número de serie se creó correctamente'}
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(
                error,
                'Error al guardar el número de serie'
            )

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const isPending =
        createSerialNumber.isPending || updateSerialNumber.isPending

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
                    {isEdit
                        ? 'Editar Número de Serie'
                        : 'Nuevo Número de Serie'}
                </h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Número de Serie{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="text"
                                    placeholder="Ej: SN-001-2024"
                                    value={formData.serialNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            serialNumber: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    ID Producto{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="number"
                                    min={1}
                                    placeholder="ID del producto"
                                    value={formData.productId || ''}
                                    disabled={isEdit}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            productId:
                                                parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Estado
                            </label>
                            <Select
                                options={statusOptions}
                                value={statusOptions.find(
                                    (o) => o.value === formData.status
                                )}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        status:
                                            (
                                                option as {
                                                    value: SerialStatus
                                                }
                                            )?.value || 'AVAILABLE',
                                    })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    ID Lote
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="ID del lote (opcional)"
                                    value={formData.lotId || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            lotId: e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    ID Ubicación
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="ID de ubicación (opcional)"
                                    value={formData.locationId || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            locationId: e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Notas
                            </label>
                            <Input
                                textArea
                                placeholder="Notas adicionales"
                                value={formData.notes || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notes: e.target.value,
                                    })
                                }
                            />
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

export default SerialNumberForm
