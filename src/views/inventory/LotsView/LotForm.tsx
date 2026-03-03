import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateLot, useUpdateLot } from '@/hooks/useLots'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { Lot, LotInput } from '@/services/LotService'

interface LotFormProps {
    open: boolean
    onClose: () => void
    lot: Lot | null
}

const LotForm = ({ open, onClose, lot }: LotFormProps) => {
    const [formData, setFormData] = useState<LotInput>({
        lotNumber: '',
        productId: 0,
        initialQuantity: 0,
        manufactureDate: '',
        expirationDate: '',
        notes: '',
    })

    const createLot = useCreateLot()
    const updateLot = useUpdateLot()

    const isEdit = !!lot

    useEffect(() => {
        if (lot) {
            setFormData({
                lotNumber: lot.lotNumber,
                productId: lot.productId,
                initialQuantity: lot.initialQuantity,
                manufactureDate: lot.manufactureDate || '',
                expirationDate: lot.expirationDate || '',
                notes: lot.notes || '',
            })
        } else {
            setFormData({
                lotNumber: '',
                productId: 0,
                initialQuantity: 0,
                manufactureDate: '',
                expirationDate: '',
                notes: '',
            })
        }
    }, [lot, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const submitData: LotInput = {
            ...formData,
            manufactureDate: formData.manufactureDate || undefined,
            expirationDate: formData.expirationDate || undefined,
            notes: formData.notes || undefined,
        }

        try {
            if (isEdit && lot) {
                await updateLot.mutateAsync({
                    id: lot.id,
                    data: submitData,
                })
            } else {
                await createLot.mutateAsync(submitData)
            }

            toast.push(
                <Notification
                    title={isEdit ? 'Lote actualizado' : 'Lote creado'}
                    type="success"
                >
                    {isEdit
                        ? 'El lote se actualizó correctamente'
                        : 'El lote se creó correctamente'}
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(
                error,
                'Error al guardar el lote'
            )

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const isPending = createLot.isPending || updateLot.isPending

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
                    {isEdit ? 'Editar Lote' : 'Nuevo Lote'}
                </h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Número de Lote{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="text"
                                    placeholder="Ej: LOT-001"
                                    value={formData.lotNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            lotNumber: e.target.value,
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
                                Cantidad Inicial{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0"
                                value={formData.initialQuantity || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        initialQuantity:
                                            parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Fecha de Manufactura
                                </label>
                                <Input
                                    type="date"
                                    value={formData.manufactureDate || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            manufactureDate: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Fecha de Vencimiento
                                </label>
                                <Input
                                    type="date"
                                    value={formData.expirationDate || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            expirationDate: e.target.value,
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
                                placeholder="Notas adicionales sobre el lote"
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

export default LotForm
