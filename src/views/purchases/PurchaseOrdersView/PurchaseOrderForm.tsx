import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useCreatePurchaseOrder } from '@/hooks/usePurchaseOrders'
import { useSuppliers } from '@/hooks/useSuppliers'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { PurchaseOrderInput } from '@/services/PurchaseOrderService'

interface PurchaseOrderFormProps {
    open: boolean
    onClose: () => void
    onCreated?: (id: number) => void
}

const PurchaseOrderForm = ({
    open,
    onClose,
    onCreated,
}: PurchaseOrderFormProps) => {
    const [formData, setFormData] = useState<PurchaseOrderInput>({
        supplierId: 0,
        notes: '',
        expectedDate: '',
    })

    const createOrder = useCreatePurchaseOrder()
    const { data: suppliersData } = useSuppliers({ limit: 100 })
    const suppliers = suppliersData?.items ?? []

    const supplierOptions = suppliers
        .filter((s) => s.isActive)
        .map((s) => ({
            value: s.id.toString(),
            label: s.name,
        }))

    useEffect(() => {
        if (open) {
            setFormData({
                supplierId: 0,
                notes: '',
                expectedDate: '',
            })
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const submitData: PurchaseOrderInput = {
                supplierId: formData.supplierId,
                notes: formData.notes || undefined,
                expectedDate: formData.expectedDate || undefined,
            }
            const order = await createOrder.mutateAsync(submitData)

            toast.push(
                <Notification title="Orden creada" type="success">
                    La orden de compra se creó correctamente
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
            if (onCreated) {
                onCreated(order.id)
            }
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(
                        error,
                        'Error al crear la orden de compra'
                    )}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const isPending = createOrder.isPending
    const isValid = formData.supplierId > 0

    const handleClose = () => {
        if (!isPending) {
            onClose()
        }
    }

    return (
        <Dialog
            isOpen={open}
            width={600}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">Nueva Orden de Compra</h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Proveedor{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Select
                                placeholder="Seleccionar proveedor"
                                options={supplierOptions}
                                value={supplierOptions.find(
                                    (o) =>
                                        o.value ===
                                        formData.supplierId.toString()
                                )}
                                onChange={(option) =>
                                    setFormData({
                                        ...formData,
                                        supplierId: option
                                            ? parseInt(option.value)
                                            : 0,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Fecha Esperada
                            </label>
                            <Input
                                type="date"
                                value={
                                    formData.expectedDate
                                        ? formData.expectedDate.split('T')[0]
                                        : ''
                                }
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        expectedDate: e.target.value
                                            ? `${e.target.value}T00:00:00Z`
                                            : '',
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
                                placeholder="Observaciones de la orden"
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

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={isPending}
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isPending}
                            disabled={!isValid}
                        >
                            Crear
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default PurchaseOrderForm
