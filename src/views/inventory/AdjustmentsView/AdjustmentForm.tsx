import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateAdjustment } from '@/hooks/useAdjustments'
import { useWarehouses } from '@/hooks/useWarehouses'
import { getErrorMessage } from '@/utils/getErrorMessage'
import {
    ADJUSTMENT_REASON_LABELS,
    type AdjustmentInput,
    type AdjustmentReason,
} from '@/services/AdjustmentService'

interface AdjustmentFormProps {
    open: boolean
    onClose: () => void
    onCreated?: (id: number) => void
}

const reasonOptions = Object.entries(ADJUSTMENT_REASON_LABELS).map(
    ([value, label]) => ({
        value,
        label,
    })
)

const AdjustmentForm = ({ open, onClose, onCreated }: AdjustmentFormProps) => {
    const [formData, setFormData] = useState<AdjustmentInput>({
        warehouseId: 0,
        reason: 'physical_count',
        notes: '',
        adjustedBy: '',
    })

    const createAdjustment = useCreateAdjustment()
    const { data: warehousesData } = useWarehouses({ limit: 100 })
    const warehouses = warehousesData?.items ?? []

    const warehouseOptions = warehouses.map((w) => ({
        value: w.id.toString(),
        label: `${w.name} (${w.code})`,
    }))

    useEffect(() => {
        if (open) {
            setFormData({
                warehouseId: 0,
                reason: 'physical_count',
                notes: '',
                adjustedBy: '',
            })
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const submitData: AdjustmentInput = {
                warehouseId: formData.warehouseId,
                reason: formData.reason,
                notes: formData.notes || undefined,
                adjustedBy: formData.adjustedBy || undefined,
            }
            const adjustment = await createAdjustment.mutateAsync(submitData)

            toast.push(
                <Notification title="Ajuste creado" type="success">
                    El ajuste se creó correctamente
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
            if (onCreated) {
                onCreated(adjustment.id)
            }
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al crear el ajuste')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const isPending = createAdjustment.isPending

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
                <h5 className="mb-4">Nuevo Ajuste de Inventario</h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Almacén <span className="text-red-500">*</span>
                            </label>
                            <Select
                                placeholder="Seleccionar almacén"
                                options={warehouseOptions}
                                value={warehouseOptions.find(
                                    (o) =>
                                        o.value ===
                                        formData.warehouseId.toString()
                                )}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        warehouseId: option
                                            ? parseInt(option.value)
                                            : 0,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Motivo <span className="text-red-500">*</span>
                            </label>
                            <Select
                                placeholder="Seleccionar motivo"
                                options={reasonOptions}
                                value={reasonOptions.find(
                                    (o) => o.value === formData.reason
                                )}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        reason: (option?.value ||
                                            'physical_count') as AdjustmentReason,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Responsable
                            </label>
                            <Input
                                type="text"
                                placeholder="Nombre del responsable"
                                value={formData.adjustedBy || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        adjustedBy: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Notas
                            </label>
                            <Input
                                textArea
                                placeholder="Observaciones del ajuste"
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
                            disabled={!formData.warehouseId}
                        >
                            Crear
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default AdjustmentForm
