import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useCreateUnitOfMeasure,
    useUpdateUnitOfMeasure,
} from '@/hooks/useUnitsOfMeasure'
import type {
    UnitOfMeasure,
    UnitOfMeasureInput,
} from '@/services/UnitOfMeasureService'

interface UnitOfMeasureFormProps {
    open: boolean
    onClose: () => void
    unitOfMeasure: UnitOfMeasure | null
}

const UnitOfMeasureForm = ({
    open,
    onClose,
    unitOfMeasure,
}: UnitOfMeasureFormProps) => {
    const [formData, setFormData] = useState<UnitOfMeasureInput>({
        name: '',
        symbol: '',
        description: '',
        isActive: true,
    })

    const createUnit = useCreateUnitOfMeasure()
    const updateUnit = useUpdateUnitOfMeasure()

    const isEdit = !!unitOfMeasure

    useEffect(() => {
        if (unitOfMeasure) {
            setFormData({
                name: unitOfMeasure.name,
                symbol: unitOfMeasure.symbol,
                description: unitOfMeasure.description || '',
                isActive: unitOfMeasure.isActive,
            })
        } else {
            setFormData({
                name: '',
                symbol: '',
                description: '',
                isActive: true,
            })
        }
    }, [unitOfMeasure, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEdit && unitOfMeasure) {
                await updateUnit.mutateAsync({
                    id: unitOfMeasure.id,
                    data: formData,
                })
            } else {
                await createUnit.mutateAsync(formData)
            }

            toast.push(
                <Notification
                    title={isEdit ? 'Unidad actualizada' : 'Unidad creada'}
                    type="success"
                >
                    {isEdit
                        ? 'La unidad de medida se actualizó correctamente'
                        : 'La unidad de medida se creó correctamente'}
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                error.message ||
                'Error al guardar la unidad de medida'

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const isPending = createUnit.isPending || updateUnit.isPending

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
                    {isEdit
                        ? 'Editar Unidad de Medida'
                        : 'Nueva Unidad de Medida'}
                </h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="text"
                                placeholder="Ej: Kilogramo"
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
                                Símbolo <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="text"
                                placeholder="Ej: kg"
                                value={formData.symbol}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        symbol: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Descripción
                            </label>
                            <Input
                                textArea
                                placeholder="Descripción de la unidad"
                                value={formData.description || ''}
                                style={{ minHeight: '80px' }}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                            />
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

export default UnitOfMeasureForm
