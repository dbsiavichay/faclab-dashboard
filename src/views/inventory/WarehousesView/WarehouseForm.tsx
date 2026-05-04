import Input from '@/components/ui/Input'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { ControlledSwitcher } from '@/components/ui/Form/controlled'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { warehouseSchema, type WarehouseFormValues } from '@/schemas'
import type { Warehouse } from '@/services/WarehouseService'

interface WarehouseFormProps {
    formId: string
    warehouse: Warehouse | null
    isSubmitting?: boolean
    onSubmit: (data: WarehouseFormValues) => void
}

const emptyValues: WarehouseFormValues = {
    name: '',
    code: '',
    address: '',
    city: '',
    country: '',
    manager: '',
    phone: '',
    email: '',
    isActive: true,
    isDefault: false,
}

const WarehouseForm = ({
    formId,
    warehouse,
    isSubmitting = false,
    onSubmit,
}: WarehouseFormProps) => {
    const defaultValues: WarehouseFormValues = warehouse
        ? {
              name: warehouse.name,
              code: warehouse.code,
              address: warehouse.address ?? '',
              city: warehouse.city ?? '',
              country: warehouse.country ?? '',
              manager: warehouse.manager ?? '',
              phone: warehouse.phone ?? '',
              email: warehouse.email ?? '',
              isActive: warehouse.isActive,
              isDefault: warehouse.isDefault,
          }
        : emptyValues

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<WarehouseFormValues>({
        resolver: zodResolver(warehouseSchema),
        defaultValues,
    })

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <FormContainer>
                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        asterisk
                        htmlFor="name"
                        label="Nombre"
                        invalid={!!errors.name}
                        errorMessage={errors.name?.message}
                    >
                        <Input
                            id="name"
                            placeholder="Ej: Bodega Principal"
                            disabled={isSubmitting}
                            invalid={!!errors.name}
                            {...register('name')}
                        />
                    </FormItem>

                    <FormItem
                        asterisk
                        htmlFor="code"
                        label="Código"
                        invalid={!!errors.code}
                        errorMessage={errors.code?.message}
                    >
                        <Input
                            id="code"
                            placeholder="Ej: BOD-001"
                            disabled={isSubmitting}
                            invalid={!!errors.code}
                            {...register('code')}
                        />
                    </FormItem>
                </div>

                <FormItem
                    htmlFor="address"
                    label="Dirección"
                    invalid={!!errors.address}
                    errorMessage={errors.address?.message}
                >
                    <Input
                        id="address"
                        placeholder="Dirección de la bodega"
                        disabled={isSubmitting}
                        invalid={!!errors.address}
                        {...register('address')}
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        htmlFor="city"
                        label="Ciudad"
                        invalid={!!errors.city}
                        errorMessage={errors.city?.message}
                    >
                        <Input
                            id="city"
                            placeholder="Ej: Quito"
                            disabled={isSubmitting}
                            invalid={!!errors.city}
                            {...register('city')}
                        />
                    </FormItem>

                    <FormItem
                        htmlFor="country"
                        label="País"
                        invalid={!!errors.country}
                        errorMessage={errors.country?.message}
                    >
                        <Input
                            id="country"
                            placeholder="Ej: Ecuador"
                            disabled={isSubmitting}
                            invalid={!!errors.country}
                            {...register('country')}
                        />
                    </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        htmlFor="manager"
                        label="Responsable"
                        invalid={!!errors.manager}
                        errorMessage={errors.manager?.message}
                    >
                        <Input
                            id="manager"
                            placeholder="Nombre del responsable"
                            disabled={isSubmitting}
                            invalid={!!errors.manager}
                            {...register('manager')}
                        />
                    </FormItem>

                    <FormItem
                        htmlFor="phone"
                        label="Teléfono"
                        invalid={!!errors.phone}
                        errorMessage={errors.phone?.message}
                    >
                        <Input
                            id="phone"
                            placeholder="Ej: +593 99 999 9999"
                            disabled={isSubmitting}
                            invalid={!!errors.phone}
                            {...register('phone')}
                        />
                    </FormItem>
                </div>

                <FormItem
                    htmlFor="email"
                    label="Email"
                    invalid={!!errors.email}
                    errorMessage={errors.email?.message}
                >
                    <Input
                        id="email"
                        type="email"
                        placeholder="bodega@ejemplo.com"
                        disabled={isSubmitting}
                        invalid={!!errors.email}
                        {...register('email')}
                    />
                </FormItem>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <ControlledSwitcher
                            name="isActive"
                            control={control}
                            disabled={isSubmitting}
                        />
                        <label
                            htmlFor="isActive"
                            className="text-sm font-medium"
                        >
                            Activo
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <ControlledSwitcher
                            name="isDefault"
                            control={control}
                            disabled={isSubmitting}
                        />
                        <label
                            htmlFor="isDefault"
                            className="text-sm font-medium"
                        >
                            Por defecto
                        </label>
                    </div>
                </div>
            </FormContainer>
        </form>
    )
}

export default WarehouseForm
