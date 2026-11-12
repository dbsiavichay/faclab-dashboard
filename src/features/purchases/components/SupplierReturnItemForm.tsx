import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import { makeNumberRegister } from '@/components/ui/Form/utils'
import { ControlledSelect } from '@/components/ui/Form/controlled'
import FormModal from '@/components/shared/FormModal'
import { useLocationsList } from '@features/locations'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { formatQuantity } from '@shared/lib/quantity'
import { formatProductLabel } from '@shared/lib/format'
import { useSupplierReturnItemMutations } from '../hooks/useSupplierReturns'
import {
    returnableOf,
    supplierReturnItemSchema,
    type SupplierReturnItemFormValues,
} from '../model/supplierReturnItem.schema'
import {
    SUPPLIER_RETURN_ERROR_MESSAGES,
    type PurchaseOrderItem,
    type SupplierReturnItem,
} from '../model/types'
import { LineTotals } from './LineTotals'

type Props = {
    open: boolean
    onClose: () => void
    supplierReturnId: number
    /** The lines of the return's order */
    orderItems: PurchaseOrderItem[]
    /** The draft's lines: what it already takes of each order line */
    lines: SupplierReturnItem[]
    /** The line being edited; none: a new one */
    line?: SupplierReturnItem | null
}

const FORM_ID = 'supplier-return-item-form'

const SupplierReturnItemForm = ({
    open,
    onClose,
    supplierReturnId,
    orderItems,
    lines,
    line,
}: Props) => {
    const mutations = useSupplierReturnItemMutations(supplierReturnId)
    const { data: locationsData } = useLocationsList({ limit: 100 })
    const locations = locationsData?.items ?? []
    const isEdit = !!line

    const candidates = orderItems.filter(
        (item) =>
            item.id === line?.purchaseOrderItemId ||
            returnableOf(item, lines) > 0
    )
    const returnable = useMemo(
        () =>
            Object.fromEntries(
                orderItems.map((item) => [
                    item.id,
                    returnableOf(item, lines, line?.id),
                ])
            ),
        [orderItems, lines, line]
    )

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<SupplierReturnItemFormValues>({
        resolver: zodResolver(supplierReturnItemSchema(returnable)),
        defaultValues: {
            purchaseOrderItemId: line?.purchaseOrderItemId ?? 0,
            quantity: line?.quantity ?? 1,
            locationId: line?.locationId ?? null,
        },
    })

    const [purchaseOrderItemId, quantity] = useWatch({
        control,
        name: ['purchaseOrderItemId', 'quantity'],
    })
    const orderItem = orderItems.find((i) => i.id === purchaseOrderItemId)

    useEffect(() => {
        if (open) {
            reset({
                purchaseOrderItemId: line?.purchaseOrderItemId ?? 0,
                quantity: line?.quantity ?? 1,
                locationId: line?.locationId ?? null,
            })
        }
    }, [open, line, reset])

    const lineOptions = candidates.map((item) => ({
        value: item.id,
        label: `${formatProductLabel(item)}${
            item.presentationName && (item.unitFactor ?? 1) !== 1
                ? ` · ${item.presentationName}`
                : ''
        } · ${formatQuantity(
            returnableOf(item, lines, line?.id)
        )} por devolver`,
    }))
    const locationOptions = [
        { value: null as number | null, label: 'Sin ubicación' },
        ...locations.map((l) => ({
            value: l.id as number | null,
            label: `${l.name} (${l.code})`,
        })),
    ]
    const numberRegister = makeNumberRegister(register)

    const onSubmit = async (values: SupplierReturnItemFormValues) => {
        try {
            if (line) {
                await mutations.update.mutateAsync({
                    itemId: line.id,
                    data: {
                        quantity: values.quantity,
                        locationId: values.locationId,
                    },
                })
                notifySuccess('Línea actualizada')
            } else {
                await mutations.add.mutateAsync({
                    purchaseOrderItemId: values.purchaseOrderItemId,
                    quantity: values.quantity,
                    locationId: values.locationId,
                })
                notifySuccess('Línea agregada')
            }
            onClose()
        } catch (error: unknown) {
            notifyError(error, 'Error al guardar la línea', {
                messages: SUPPLIER_RETURN_ERROR_MESSAGES,
            })
        }
    }

    return (
        <FormModal
            isOpen={open}
            formId={FORM_ID}
            title={isEdit ? 'Editar línea' : 'Agregar línea'}
            isSubmitting={isSubmitting}
            width={640}
            onClose={() => !isSubmitting && onClose()}
        >
            <form
                id={FORM_ID}
                className="space-y-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                <FormItem
                    asterisk
                    label="Línea de la orden"
                    invalid={!!errors.purchaseOrderItemId}
                    errorMessage={errors.purchaseOrderItemId?.message}
                >
                    <ControlledSelect
                        name="purchaseOrderItemId"
                        control={control}
                        options={lineOptions}
                        isDisabled={isEdit}
                        placeholder="Seleccione lo recibido"
                    />
                </FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem
                        asterisk
                        label={`Cantidad${
                            orderItem?.presentationName &&
                            (orderItem.unitFactor ?? 1) !== 1
                                ? ` (${orderItem.presentationName})`
                                : ''
                        }`}
                        invalid={!!errors.quantity}
                        errorMessage={errors.quantity?.message}
                        extra={
                            orderItem && (
                                <span className="text-xs text-gray-500">
                                    Hasta{' '}
                                    {formatQuantity(
                                        returnable[orderItem.id] ?? 0
                                    )}
                                </span>
                            )
                        }
                    >
                        <Input
                            type="number"
                            step="any"
                            min={0}
                            invalid={!!errors.quantity}
                            disabled={isSubmitting}
                            {...numberRegister('quantity', { emptyValue: 0 })}
                        />
                    </FormItem>
                    <FormItem label="Sale de">
                        <ControlledSelect
                            name="locationId"
                            control={control}
                            options={locationOptions}
                            placeholder="Ubicación"
                        />
                    </FormItem>
                </div>
                {orderItem && (
                    <LineTotals
                        subtotal={(quantity ?? 0) * orderItem.unitCost}
                        taxCode={orderItem.taxCode}
                    />
                )}
            </form>
        </FormModal>
    )
}

export default SupplierReturnItemForm
