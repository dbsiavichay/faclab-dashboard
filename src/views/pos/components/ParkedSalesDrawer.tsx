import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useParkedSales, useResumeSale } from '@/hooks/usePOS'
import { usePOSStore } from '@/stores/usePOSStore'
import POSService from '@/services/POSService'

interface ParkedSalesDrawerProps {
    isOpen: boolean
    onClose: () => void
}

const ParkedSalesDrawer = ({ isOpen, onClose }: ParkedSalesDrawerProps) => {
    const { data: parkedSales, isLoading } = useParkedSales()
    const resumeSale = useResumeSale()
    const { clearCart, addItem } = usePOSStore()

    const handleResume = async (saleId: number) => {
        try {
            await resumeSale.mutateAsync(saleId)

            const itemsResponse = await POSService.getSaleItems(saleId)
            const saleItems = itemsResponse.data.data

            clearCart()
            for (const item of saleItems) {
                const productResponse = await POSService.getProduct(
                    item.productId
                )
                const product = productResponse.data.data
                addItem({
                    productId: product.id,
                    name: product.name,
                    sku: product.sku,
                    salePrice: item.unitPrice,
                })
                if (item.quantity > 1) {
                    usePOSStore
                        .getState()
                        .updateItemQuantity(product.id, item.quantity)
                }
            }

            toast.push(
                <Notification type="success" title="Venta reanudada" />,
                { placement: 'top-end' }
            )
            onClose()
        } catch {
            toast.push(
                <Notification
                    type="danger"
                    title="Error al reanudar la venta"
                />,
                { placement: 'top-end' }
            )
        }
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <Drawer
            isOpen={isOpen}
            title="Ventas Retenidas"
            width={400}
            overlayClassName="!z-[60]"
            onClose={onClose}
        >
            <div className="p-4">
                {isLoading && (
                    <div className="flex justify-center py-8">
                        <Spinner />
                    </div>
                )}

                {!isLoading && (!parkedSales || parkedSales.length === 0) && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No hay ventas retenidas
                    </p>
                )}

                {parkedSales && parkedSales.length > 0 && (
                    <div className="space-y-3">
                        {parkedSales.map((sale) => (
                            <div
                                key={sale.id}
                                className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">
                                            Venta #{sale.id}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(sale.parkedAt)}
                                        </p>
                                        {sale.parkReason && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {sale.parkReason}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">
                                            ${sale.total.toFixed(2)}
                                        </p>
                                        <Button
                                            size="xs"
                                            variant="solid"
                                            className="mt-1"
                                            loading={resumeSale.isPending}
                                            onClick={() =>
                                                handleResume(sale.id)
                                            }
                                        >
                                            Reanudar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Drawer>
    )
}

export default ParkedSalesDrawer
