import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateTransfer } from '@/hooks/useTransfers'
import { useLocations } from '@/hooks/useLocations'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { TransferInput } from '@/services/TransferService'

interface TransferFormProps {
    open: boolean
    onClose: () => void
    onCreated?: (id: number) => void
}

const TransferForm = ({ open, onClose, onCreated }: TransferFormProps) => {
    const [formData, setFormData] = useState<TransferInput>({
        sourceLocationId: 0,
        destinationLocationId: 0,
        notes: '',
        requestedBy: '',
    })

    const createTransfer = useCreateTransfer()
    const { data: locationsData } = useLocations({ limit: 100 })
    const locations = locationsData?.items ?? []

    const locationOptions = locations.map((l) => ({
        value: l.id.toString(),
        label: `${l.name} (${l.code})`,
    }))

    useEffect(() => {
        if (open) {
            setFormData({
                sourceLocationId: 0,
                destinationLocationId: 0,
                notes: '',
                requestedBy: '',
            })
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const submitData: TransferInput = {
                sourceLocationId: formData.sourceLocationId,
                destinationLocationId: formData.destinationLocationId,
                notes: formData.notes || undefined,
                requestedBy: formData.requestedBy || undefined,
            }
            const transfer = await createTransfer.mutateAsync(submitData)

            toast.push(
                <Notification title="Transferencia creada" type="success">
                    La transferencia se creó correctamente
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
            if (onCreated) {
                onCreated(transfer.id)
            }
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al crear la transferencia')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const isPending = createTransfer.isPending
    const isValid =
        formData.sourceLocationId > 0 &&
        formData.destinationLocationId > 0 &&
        formData.sourceLocationId !== formData.destinationLocationId

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
                <h5 className="mb-4">Nueva Transferencia</h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Ubicación Origen{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Select
                                placeholder="Seleccionar ubicación origen"
                                options={locationOptions}
                                value={locationOptions.find(
                                    (o) =>
                                        o.value ===
                                        formData.sourceLocationId.toString()
                                )}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        sourceLocationId: option
                                            ? parseInt(option.value)
                                            : 0,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Ubicación Destino{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Select
                                placeholder="Seleccionar ubicación destino"
                                options={locationOptions}
                                value={locationOptions.find(
                                    (o) =>
                                        o.value ===
                                        formData.destinationLocationId.toString()
                                )}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        destinationLocationId: option
                                            ? parseInt(option.value)
                                            : 0,
                                    })
                                }
                            />
                        </div>

                        {formData.sourceLocationId > 0 &&
                            formData.destinationLocationId > 0 &&
                            formData.sourceLocationId ===
                                formData.destinationLocationId && (
                                <p className="text-sm text-red-500">
                                    Las ubicaciones de origen y destino deben
                                    ser diferentes
                                </p>
                            )}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Solicitado por
                            </label>
                            <Input
                                type="text"
                                placeholder="Nombre del solicitante"
                                value={formData.requestedBy || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        requestedBy: e.target.value,
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
                                placeholder="Observaciones de la transferencia"
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
                            disabled={!isValid}
                        >
                            Crear
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default TransferForm
