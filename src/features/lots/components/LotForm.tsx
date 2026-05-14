import Input from '@/components/ui/Input'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { makeNumberRegister } from '@/components/ui/Form/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    lotCreateSchema,
    lotUpdateSchema,
    type LotCreateFormValues,
    type LotUpdateFormValues,
} from '../model/lot.schema'
import type { Lot, LotInput, LotUpdateInput } from '../model/types'

interface LotCreateFormProps {
    formId: string
    isSubmitting?: boolean
    onSubmit: (data: LotInput) => void
}

const LotCreateForm = ({
    formId,
    isSubmitting = false,
    onSubmit,
}: LotCreateFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LotCreateFormValues>({
        resolver: zodResolver(lotCreateSchema),
        defaultValues: {
            lotNumber: '',
            initialQuantity: 1,
            manufactureDate: '',
            expirationDate: '',
            notes: '',
        },
    })

    const numberRegister = makeNumberRegister(register)

    const onFormSubmit = (values: LotCreateFormValues) => {
        onSubmit({
            lotNumber: values.lotNumber,
            productId: values.productId,
            initialQuantity: values.initialQuantity,
            manufactureDate: values.manufactureDate || undefined,
            expirationDate: values.expirationDate || undefined,
            notes: values.notes || undefined,
        })
    }

    return (
        <form id={formId} onSubmit={handleSubmit(onFormSubmit)}>
            <FormContainer>
                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        asterisk
                        htmlFor="lotNumber"
                        label="Número de Lote"
                        invalid={!!errors.lotNumber}
                        errorMessage={errors.lotNumber?.message}
                    >
                        <Input
                            id="lotNumber"
                            placeholder="Ej: LOT-001"
                            disabled={isSubmitting}
                            invalid={!!errors.lotNumber}
                            {...register('lotNumber')}
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
                    asterisk
                    htmlFor="initialQuantity"
                    label="Cantidad Inicial"
                    invalid={!!errors.initialQuantity}
                    errorMessage={errors.initialQuantity?.message}
                >
                    <Input
                        id="initialQuantity"
                        type="number"
                        min={1}
                        placeholder="1"
                        disabled={isSubmitting}
                        invalid={!!errors.initialQuantity}
                        {...numberRegister('initialQuantity', {
                            integer: true,
                        })}
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        htmlFor="manufactureDate"
                        label="Fecha de Manufactura"
                        invalid={!!errors.manufactureDate}
                        errorMessage={errors.manufactureDate?.message}
                    >
                        <Input
                            id="manufactureDate"
                            type="date"
                            disabled={isSubmitting}
                            {...register('manufactureDate')}
                        />
                    </FormItem>

                    <FormItem
                        htmlFor="expirationDate"
                        label="Fecha de Vencimiento"
                        invalid={!!errors.expirationDate}
                        errorMessage={errors.expirationDate?.message}
                    >
                        <Input
                            id="expirationDate"
                            type="date"
                            disabled={isSubmitting}
                            {...register('expirationDate')}
                        />
                    </FormItem>
                </div>

                <FormItem
                    htmlFor="notes"
                    label="Notas"
                    invalid={!!errors.notes}
                    errorMessage={errors.notes?.message}
                >
                    <Input
                        textArea
                        id="notes"
                        placeholder="Notas adicionales sobre el lote"
                        disabled={isSubmitting}
                        {...register('notes')}
                    />
                </FormItem>
            </FormContainer>
        </form>
    )
}

interface LotUpdateFormProps {
    formId: string
    lot: Lot
    isSubmitting?: boolean
    onSubmit: (data: LotUpdateInput) => void
}

const LotUpdateForm = ({
    formId,
    lot,
    isSubmitting = false,
    onSubmit,
}: LotUpdateFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LotUpdateFormValues>({
        resolver: zodResolver(lotUpdateSchema),
        defaultValues: {
            currentQuantity: lot.currentQuantity,
            manufactureDate: lot.manufactureDate || '',
            expirationDate: lot.expirationDate || '',
            notes: lot.notes || '',
        },
    })

    const numberRegister = makeNumberRegister(register)

    const onFormSubmit = (values: LotUpdateFormValues) => {
        onSubmit({
            currentQuantity: values.currentQuantity,
            manufactureDate: values.manufactureDate || undefined,
            expirationDate: values.expirationDate || undefined,
            notes: values.notes || undefined,
        })
    }

    return (
        <form id={formId} onSubmit={handleSubmit(onFormSubmit)}>
            <FormContainer>
                <FormItem
                    asterisk
                    htmlFor="currentQuantity"
                    label="Cantidad Actual"
                    invalid={!!errors.currentQuantity}
                    errorMessage={errors.currentQuantity?.message}
                >
                    <Input
                        id="currentQuantity"
                        type="number"
                        min={0}
                        placeholder="0"
                        disabled={isSubmitting}
                        invalid={!!errors.currentQuantity}
                        {...numberRegister('currentQuantity', {
                            integer: true,
                            emptyValue: 0,
                        })}
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        htmlFor="manufactureDate"
                        label="Fecha de Manufactura"
                        invalid={!!errors.manufactureDate}
                        errorMessage={errors.manufactureDate?.message}
                    >
                        <Input
                            id="manufactureDate"
                            type="date"
                            disabled={isSubmitting}
                            {...register('manufactureDate')}
                        />
                    </FormItem>

                    <FormItem
                        htmlFor="expirationDate"
                        label="Fecha de Vencimiento"
                        invalid={!!errors.expirationDate}
                        errorMessage={errors.expirationDate?.message}
                    >
                        <Input
                            id="expirationDate"
                            type="date"
                            disabled={isSubmitting}
                            {...register('expirationDate')}
                        />
                    </FormItem>
                </div>

                <FormItem
                    htmlFor="notes"
                    label="Notas"
                    invalid={!!errors.notes}
                    errorMessage={errors.notes?.message}
                >
                    <Input
                        textArea
                        id="notes"
                        placeholder="Notas adicionales sobre el lote"
                        disabled={isSubmitting}
                        {...register('notes')}
                    />
                </FormItem>
            </FormContainer>
        </form>
    )
}

interface LotFormProps {
    formId: string
    lot: Lot | null
    isSubmitting?: boolean
    onSubmit: (data: LotInput | LotUpdateInput) => void
}

export const LotForm = ({
    formId,
    lot,
    isSubmitting,
    onSubmit,
}: LotFormProps) =>
    lot ? (
        <LotUpdateForm
            formId={formId}
            lot={lot}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
        />
    ) : (
        <LotCreateForm
            formId={formId}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
        />
    )
