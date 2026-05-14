import Input from '@/components/ui/Input'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { ControlledSwitcher } from '@/components/ui/Form/controlled'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    unitOfMeasureSchema,
    type UnitOfMeasureFormValues,
} from '../model/unitOfMeasure.schema'
import type { UnitOfMeasure } from '../model/types'

interface UnitOfMeasureFormProps {
    formId: string
    unitOfMeasure: UnitOfMeasure | null
    isSubmitting?: boolean
    onSubmit: (data: UnitOfMeasureFormValues) => void
}

const emptyValues: UnitOfMeasureFormValues = {
    name: '',
    symbol: '',
    description: '',
    isActive: true,
}

export const UnitOfMeasureForm = ({
    formId,
    unitOfMeasure,
    isSubmitting = false,
    onSubmit,
}: UnitOfMeasureFormProps) => {
    const defaultValues: UnitOfMeasureFormValues = unitOfMeasure
        ? {
              name: unitOfMeasure.name,
              symbol: unitOfMeasure.symbol,
              description: unitOfMeasure.description ?? '',
              isActive: unitOfMeasure.isActive,
          }
        : emptyValues

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<UnitOfMeasureFormValues>({
        resolver: zodResolver(unitOfMeasureSchema),
        defaultValues,
    })

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <FormContainer>
                <FormItem
                    asterisk
                    htmlFor="name"
                    label="Nombre"
                    invalid={!!errors.name}
                    errorMessage={errors.name?.message}
                >
                    <Input
                        id="name"
                        placeholder="Ej: Kilogramo"
                        disabled={isSubmitting}
                        invalid={!!errors.name}
                        {...register('name')}
                    />
                </FormItem>

                <FormItem
                    asterisk
                    htmlFor="symbol"
                    label="Símbolo"
                    invalid={!!errors.symbol}
                    errorMessage={errors.symbol?.message}
                >
                    <Input
                        id="symbol"
                        placeholder="Ej: kg"
                        disabled={isSubmitting}
                        invalid={!!errors.symbol}
                        {...register('symbol')}
                    />
                </FormItem>

                <FormItem
                    htmlFor="description"
                    label="Descripción"
                    invalid={!!errors.description}
                    errorMessage={errors.description?.message}
                >
                    <Input
                        textArea
                        id="description"
                        placeholder="Descripción de la unidad"
                        style={{ minHeight: '80px' }}
                        disabled={isSubmitting}
                        invalid={!!errors.description}
                        {...register('description')}
                    />
                </FormItem>

                <div className="flex items-center gap-3">
                    <ControlledSwitcher
                        name="isActive"
                        control={control}
                        disabled={isSubmitting}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                        Activo
                    </label>
                </div>
            </FormContainer>
        </form>
    )
}
