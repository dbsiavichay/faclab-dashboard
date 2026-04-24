import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import type { Lot, LotInput, LotUpdateInput } from '@/services/LotService'

interface LotFormProps {
    formId: string
    lot: Lot | null
    isSubmitting?: boolean
    onSubmit: (data: LotInput | LotUpdateInput) => void
}

const LotForm = ({ formId, lot, onSubmit }: LotFormProps) => {
    const [formData, setFormData] = useState<LotInput>({
        lotNumber: '',
        productId: 0,
        initialQuantity: 1,
        manufactureDate: '',
        expirationDate: '',
        notes: '',
    })

    const [editData, setEditData] = useState<LotUpdateInput>({
        currentQuantity: 0,
        manufactureDate: '',
        expirationDate: '',
        notes: '',
    })

    const isEdit = !!lot

    useEffect(() => {
        if (lot) {
            setEditData({
                currentQuantity: lot.currentQuantity,
                manufactureDate: lot.manufactureDate || '',
                expirationDate: lot.expirationDate || '',
                notes: lot.notes || '',
            })
        } else {
            setFormData({
                lotNumber: '',
                productId: 0,
                initialQuantity: 1,
                manufactureDate: '',
                expirationDate: '',
                notes: '',
            })
        }
    }, [lot])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isEdit) {
            const submitData: LotUpdateInput = {
                currentQuantity: editData.currentQuantity,
                manufactureDate: editData.manufactureDate || undefined,
                expirationDate: editData.expirationDate || undefined,
                notes: editData.notes || undefined,
            }
            onSubmit(submitData)
        } else {
            const submitData: LotInput = {
                ...formData,
                manufactureDate: formData.manufactureDate || undefined,
                expirationDate: formData.expirationDate || undefined,
                notes: formData.notes || undefined,
            }
            onSubmit(submitData)
        }
    }

    return (
        <form id={formId} onSubmit={handleSubmit}>
            <div className="space-y-4">
                {isEdit ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Cantidad Actual{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="number"
                                min={0}
                                placeholder="0"
                                value={editData.currentQuantity ?? ''}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        currentQuantity:
                                            parseInt(e.target.value) || 0,
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
                                    value={editData.manufactureDate || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
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
                                    value={editData.expirationDate || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
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
                                value={editData.notes || ''}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        notes: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </>
                ) : (
                    <>
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
                                min={1}
                                placeholder="1"
                                value={formData.initialQuantity || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        initialQuantity:
                                            parseInt(e.target.value) || 0,
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
                    </>
                )}
            </div>
        </form>
    )
}

export default LotForm
