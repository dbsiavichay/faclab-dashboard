import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import type {
    UnitOfMeasure,
    UnitOfMeasureInput,
} from '@/services/UnitOfMeasureService'

interface UnitOfMeasureFormProps {
    formId: string
    unitOfMeasure: UnitOfMeasure | null
    isSubmitting?: boolean
    onSubmit: (data: UnitOfMeasureInput) => void
}

const UnitOfMeasureForm = ({
    formId,
    unitOfMeasure,
    isSubmitting = false,
    onSubmit,
}: UnitOfMeasureFormProps) => {
    const [formData, setFormData] = useState<UnitOfMeasureInput>({
        name: '',
        symbol: '',
        description: '',
        isActive: true,
    })

    useEffect(() => {
        setFormData(
            unitOfMeasure
                ? {
                      name: unitOfMeasure.name,
                      symbol: unitOfMeasure.symbol,
                      description: unitOfMeasure.description || '',
                      isActive: unitOfMeasure.isActive,
                  }
                : { name: '', symbol: '', description: '', isActive: true }
        )
    }, [unitOfMeasure])

    return (
        <form
            id={formId}
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(formData)
            }}
        >
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
                        disabled={isSubmitting}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
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
                        disabled={isSubmitting}
                        onChange={(e) =>
                            setFormData({ ...formData, symbol: e.target.value })
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                        onChange={(checked) =>
                            setFormData({ ...formData, isActive: checked })
                        }
                    />
                    <label className="text-sm font-medium">Activo</label>
                </div>
            </div>
        </form>
    )
}

export default UnitOfMeasureForm
