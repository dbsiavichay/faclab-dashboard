import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { ControlledSwitcher } from '@/components/ui/Form/controlled'
import {
    priceListSchema,
    type PriceListFormValues,
} from '../model/priceList.schema'
import type { PriceList, PriceListInput } from '../model/types'

interface PriceListFormProps {
    formId: string
    priceList: PriceList | null
    isSubmitting?: boolean
    onSubmit: (data: PriceListInput) => void
}

const PriceListForm = ({
    formId,
    priceList,
    isSubmitting = false,
    onSubmit,
}: PriceListFormProps) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<PriceListFormValues>({
        resolver: zodResolver(priceListSchema),
        defaultValues: {
            name: priceList?.name ?? '',
            description: priceList?.description ?? '',
            isActive: priceList?.isActive ?? true,
            validFrom: priceList?.validFrom ?? '',
            validTo: priceList?.validTo ?? '',
        },
    })
    // La general siempre rige: solo cambian su nombre y su descripción
    const isDefault = priceList?.isDefault ?? false

    return (
        <form
            id={formId}
            onSubmit={handleSubmit((values) =>
                onSubmit({
                    name: values.name,
                    description: values.description || null,
                    isActive: isDefault ? true : values.isActive,
                    validFrom: isDefault ? null : values.validFrom || null,
                    validTo: isDefault ? null : values.validTo || null,
                })
            )}
        >
            <FormContainer>
                <FormItem
                    asterisk
                    htmlFor="priceList-name"
                    label="Nombre"
                    invalid={!!errors.name}
                    errorMessage={errors.name?.message}
                >
                    <Input
                        id="priceList-name"
                        placeholder="Ej: Mayorista"
                        disabled={isSubmitting}
                        invalid={!!errors.name}
                        {...register('name')}
                    />
                </FormItem>
                <FormItem
                    htmlFor="priceList-description"
                    label="Descripción"
                    invalid={!!errors.description}
                    errorMessage={errors.description?.message}
                >
                    <Input
                        id="priceList-description"
                        placeholder="Ej: Maestros y constructores"
                        disabled={isSubmitting}
                        invalid={!!errors.description}
                        {...register('description')}
                    />
                </FormItem>
                {isDefault ? (
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        La lista general rige siempre: su precio base es el de
                        cada producto y aquí solo se agregan escalas por
                        volumen.
                    </p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                            <FormItem
                                htmlFor="priceList-validFrom"
                                label="Rige desde"
                                invalid={!!errors.validFrom}
                                errorMessage={errors.validFrom?.message}
                            >
                                <Input
                                    id="priceList-validFrom"
                                    type="date"
                                    disabled={isSubmitting}
                                    {...register('validFrom')}
                                />
                            </FormItem>
                            <FormItem
                                htmlFor="priceList-validTo"
                                label="Rige hasta"
                                invalid={!!errors.validTo}
                                errorMessage={errors.validTo?.message}
                            >
                                <Input
                                    id="priceList-validTo"
                                    type="date"
                                    disabled={isSubmitting}
                                    invalid={!!errors.validTo}
                                    {...register('validTo')}
                                />
                            </FormItem>
                        </div>
                        <FormItem htmlFor="priceList-isActive" label="Activa">
                            <ControlledSwitcher
                                name="isActive"
                                control={control}
                                disabled={isSubmitting}
                            />
                        </FormItem>
                    </>
                )}
            </FormContainer>
        </form>
    )
}

export default PriceListForm
