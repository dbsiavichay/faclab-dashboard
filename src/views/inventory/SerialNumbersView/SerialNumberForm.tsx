import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import type { SerialNumberInput } from '@/services/SerialNumberService'

interface SerialNumberFormProps {
    formId: string
    isSubmitting?: boolean
    onSubmit: (data: SerialNumberInput) => void
}

const SerialNumberForm = ({ formId, onSubmit }: SerialNumberFormProps) => {
    const [formData, setFormData] = useState<SerialNumberInput>({
        serialNumber: '',
        productId: 0,
        lotId: undefined,
        notes: '',
    })

    useEffect(() => {
        setFormData({
            serialNumber: '',
            productId: 0,
            lotId: undefined,
            notes: '',
        })
    }, [formId])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            serialNumber: formData.serialNumber,
            productId: formData.productId,
            lotId: formData.lotId || undefined,
            notes: formData.notes || undefined,
        })
    }

    return (
        <form id={formId} onSubmit={handleSubmit}>
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
                            ID Producto <span className="text-red-500">*</span>
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
                                    productId: parseInt(e.target.value) || 0,
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
        </form>
    )
}

export default SerialNumberForm
