import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreateMovement } from '@/hooks/useMovements'
import type { MovementInput, MovementType } from '@/services/MovementService'

interface MovementFormProps {
    open: boolean
    onClose: () => void
}

const MovementForm = ({ open, onClose }: MovementFormProps) => {
    const [formData, setFormData] = useState<MovementInput>({
        productId: 0,
        quantity: 0,
        type: 'in',
        reason: '',
        date: '',
    })

    const createMovement = useCreateMovement()

    const typeOptions = [
        { value: 'in', label: 'Entrada' },
        { value: 'out', label: 'Salida' },
    ]

    useEffect(() => {
        if (open) {
            // Reset form when opening
            setFormData({
                productId: 0,
                quantity: 0,
                type: 'in',
                reason: '',
                date: '',
            })
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Client-side validation
        if (formData.productId <= 0) {
            toast.push(
                <Notification title="Error de validación" type="warning">
                    El ID del producto debe ser mayor a 0
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        if (formData.quantity === 0) {
            toast.push(
                <Notification title="Error de validación" type="warning">
                    La cantidad no puede ser cero
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        // Validate type and quantity relationship
        if (formData.type === 'in' && formData.quantity < 0) {
            toast.push(
                <Notification title="Error de validación" type="warning">
                    Para movimientos de entrada, la cantidad debe ser positiva
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        if (formData.type === 'out' && formData.quantity > 0) {
            toast.push(
                <Notification title="Error de validación" type="warning">
                    Para movimientos de salida, la cantidad debe ser negativa
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        try {
            await createMovement.mutateAsync(formData)

            toast.push(
                <Notification title="Movimiento creado" type="success">
                    El movimiento se registró correctamente
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                error.message ||
                'Error al crear el movimiento'

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )

            console.error('Error creating movement:', error)
        }
    }

    const handleClose = () => {
        if (!createMovement.isPending) {
            onClose()
        }
    }

    const handleTypeChange = (option: any) => {
        const newType = option?.value as MovementType
        setFormData({
            ...formData,
            type: newType,
            // Auto-adjust quantity sign based on type
            quantity: Math.abs(formData.quantity) * (newType === 'in' ? 1 : -1),
        })
    }

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value) || 0
        // Ensure quantity has correct sign based on type
        if (formData.type === 'out' && value > 0) {
            value = -value
        } else if (formData.type === 'in' && value < 0) {
            value = Math.abs(value)
        }
        setFormData({ ...formData, quantity: value })
    }

    return (
        <Dialog
            isOpen={open}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">Nuevo Movimiento</h5>

                <form onSubmit={handleSubmit} className="flex-1">
                    <div className="space-y-4">
                        {/* Product ID */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ID Producto{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                placeholder="ID del producto"
                                value={formData.productId || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        productId: parseInt(e.target.value) || 0,
                                    })
                                }
                                required
                                min="1"
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tipo <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={typeOptions.find(
                                    (opt) => opt.value === formData.type
                                )}
                                options={typeOptions}
                                onChange={handleTypeChange}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.type === 'in'
                                    ? 'Entrada: suma al inventario (cantidad positiva)'
                                    : 'Salida: resta del inventario (cantidad negativa)'}
                            </p>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Cantidad <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                placeholder={
                                    formData.type === 'in'
                                        ? 'Ej: 100'
                                        : 'Ej: -50'
                                }
                                value={formData.quantity || ''}
                                onChange={handleQuantityChange}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.type === 'in'
                                    ? 'Ingrese una cantidad positiva'
                                    : 'Ingrese una cantidad negativa'}
                            </p>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Motivo
                            </label>
                            <Input
                                textArea
                                placeholder="Motivo del movimiento (opcional)"
                                value={formData.reason}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        reason: e.target.value,
                                    })
                                }
                                style={{ minHeight: '80px' }}
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Fecha
                            </label>
                            <Input
                                type="datetime-local"
                                value={formData.date}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        date: e.target.value,
                                    })
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Opcional: si no se especifica, se usará la fecha
                                actual
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            onClick={handleClose}
                            disabled={createMovement.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={createMovement.isPending}
                        >
                            Crear
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default MovementForm
