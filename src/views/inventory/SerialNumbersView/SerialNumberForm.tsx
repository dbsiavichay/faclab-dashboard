import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateSerialNumber } from '@/hooks/useSerialNumbers'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { SerialNumberInput } from '@/services/SerialNumberService'

interface SerialNumberFormProps {
    open: boolean
    onClose: () => void
}

const SerialNumberForm = ({ open, onClose }: SerialNumberFormProps) => {
    const [formData, setFormData] = useState<SerialNumberInput>({
        serialNumber: '',
        productId: 0,
        lotId: undefined,
        notes: '',
    })

    const createSerialNumber = useCreateSerialNumber()

    useEffect(() => {
        if (open) {
            setFormData({
                serialNumber: '',
                productId: 0,
                lotId: undefined,
                notes: '',
            })
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const submitData: SerialNumberInput = {
            serialNumber: formData.serialNumber,
            productId: formData.productId,
            lotId: formData.lotId || undefined,
            notes: formData.notes || undefined,
        }

        try {
            await createSerialNumber.mutateAsync(submitData)

            toast.push(
                <Notification title="Número de serie creado" type="success">
                    El número de serie se creó correctamente
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(
                error,
                'Error al crear el número de serie'
            )

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const isPending = createSerialNumber.isPending

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
                <h5 className="mb-4">Nuevo Número de Serie</h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
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
                            Crear
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default SerialNumberForm
