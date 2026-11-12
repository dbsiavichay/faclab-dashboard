import Card from '@/components/ui/Card'
import { TAX_CODE_LABELS } from '@/constants/tax.constant'
import { formatCurrency, formatDate, formatDatetime } from '@shared/lib/format'
import type { PurchaseOrder } from '../model/types'

type Props = {
    order: PurchaseOrder
    supplierName: string
}

export const PurchaseOrderInfo = ({ order, supplierName }: Props) => (
    <Card>
        <h5 className="mb-4">Información de la Orden</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <p className="text-sm text-gray-500">Proveedor</p>
                <p className="font-medium">{supplierName}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Número de Orden</p>
                <p className="font-medium">{order.orderNumber}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Fecha Esperada</p>
                <p className="font-medium">
                    {order.expectedDate ? formatDate(order.expectedDate) : '-'}
                </p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Fecha de Creación</p>
                <p className="font-medium">
                    {order.createdAt ? formatDatetime(order.createdAt) : '-'}
                </p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Última Actualización</p>
                <p className="font-medium">
                    {order.updatedAt ? formatDatetime(order.updatedAt) : '-'}
                </p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t dark:border-gray-600">
            <div>
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="font-medium">{formatCurrency(order.subtotal)}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">IVA</p>
                <p className="font-medium">{formatCurrency(order.tax)}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-lg font-semibold">
                    {formatCurrency(order.total)}
                </p>
            </div>
        </div>
        {order.taxes && order.taxes.length > 0 && (
            <div className="mt-4 pt-4 border-t dark:border-gray-600">
                <p className="text-sm text-gray-500 mb-2">IVA por tarifa</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {order.taxes.map((rate) => (
                        <div
                            key={rate.taxCode}
                            className="flex justify-between gap-4 text-sm"
                        >
                            <span>
                                {TAX_CODE_LABELS[rate.taxCode] ?? rate.taxCode}
                            </span>
                            <span>
                                Base {formatCurrency(rate.base)} · IVA{' '}
                                {formatCurrency(rate.tax)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {order.notes && (
            <div className="mt-4 pt-4 border-t dark:border-gray-600">
                <p className="text-sm text-gray-500">Notas</p>
                <p className="font-medium">{order.notes}</p>
            </div>
        )}
    </Card>
)
