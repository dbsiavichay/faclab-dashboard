import Input from '@/components/ui/Input'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { makeNumberRegister } from '@/components/ui/Form/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { serialNumberSchema, type SerialNumberFormValues } from '@/schemas'
import type { SerialNumberInput } from '@/services/SerialNumberService'

interface SerialNumberFormProps {
    formId: string
    isSubmitting?: boolean
    onSubmit: (data: SerialNumberInput) => void
}

const SerialNumberForm = ({
    formId,
    isSubmitting = false,
    onSubmit,
}: SerialNumberFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SerialNumberFormValues>({
        resolver: zodResolver(serialNumberSchema),
        defaultValues: {
            serialNumber: '',
            notes: '',
        },
    })

    const numberRegister = makeNumberRegister(register)

    const onFormSubmit = (values: SerialNumberFormValues) => {
        onSubmit({
            serialNumber: values.serialNumber,
            productId: values.productId,
            lotId: values.lotId,
            notes: values.notes || undefined,
        })
    }

    return (
        <form id={formId} onSubmit={handleSubmit(onFormSubmit)}>
            <FormContainer>
                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        asterisk
                        htmlFor="serialNumber"
                        label="Número de Serie"
                        invalid={!!errors.serialNumber}
                        errorMessage={errors.serialNumber?.message}
                    >
                        <Input
                            id="serialNumber"
                            placeholder="Ej: SN-001-2024"
                            disabled={isSubmitting}
                            invalid={!!errors.serialNumber}
                            {...register('serialNumber')}
                        />
                    </FormItem>

                    <FormItem
                        asterisk
                        htmlFor="productId"
                        label="ID Producto"
                        invalid={!!errors.productId}
                        errorMessage={errors.productId?.message}
                    >
                        <Input
                            id="productId"
                            type="number"
                            min={1}
                            placeholder="ID del producto"
                            disabled={isSubmitting}
                            invalid={!!errors.productId}
                            {...numberRegister('productId', { integer: true })}
                        />
                    </FormItem>
                </div>

                <FormItem
                    htmlFor="lotId"
                    label="ID Lote"
                    invalid={!!errors.lotId}
                    errorMessage={errors.lotId?.message}
                >
                    <Input
                        id="lotId"
                        type="number"
                        min={1}
                        placeholder="ID del lote (opcional)"
                        disabled={isSubmitting}
                        invalid={!!errors.lotId}
                        {...numberRegister('lotId', { integer: true })}
                    />
                </FormItem>

                <FormItem
                    htmlFor="notes"
                    label="Notas"
                    invalid={!!errors.notes}
                    errorMessage={errors.notes?.message}
                >
                    <Input
                        textArea
                        id="notes"
                        placeholder="Notas adicionales"
                        disabled={isSubmitting}
                        {...register('notes')}
                    />
                </FormItem>
            </FormContainer>
        </form>
    )
}

export default SerialNumberForm
