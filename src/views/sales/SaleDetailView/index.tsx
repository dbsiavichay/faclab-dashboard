import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSale, useSaleItems, useSalePayments } from '@/hooks/useSales'
import { useProducts } from '@/hooks/useProducts'
import { useCustomers } from '@/hooks/useCustomers'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import Tabs from '@/components/ui/Tabs'
import {
    SALE_STATUS_LABELS,
    SALE_STATUS_CLASSES,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_CLASSES,
    PAYMENT_METHOD_LABELS,
} from '@/services/SaleService'
import { HiOutlineArrowLeft } from 'react-icons/hi'

const { Tr, Th, Td, THead, TBody, TFoot } = Table
const { TabList, TabNav, TabContent } = Tabs

const SaleDetailView = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const saleId = parseInt(id || '0')

    const [activeTab, setActiveTab] = useState('items')

    const { data: sale, isLoading: saleLoading } = useSale(saleId)
    const { data: items = [], isLoading: itemsLoading } = useSaleItems(saleId)
    const { data: payments = [], isLoading: paymentsLoading } =
        useSalePayments(saleId)

    const { data: productsData } = useProducts()
    const products = productsData?.items ?? []

    const { data: customersData } = useCustomers({ limit: 100 })
    const customers = customersData?.items ?? []

    const getProductName = (productId: number) => {
        const p = products.find((p) => p.id === productId)
        return p ? `${p.name} (${p.sku})` : `#${productId}`
    }

    const getCustomerName = (customerId: number) => {
        const c = customers.find((c) => c.id === customerId)
        return c ? c.name : `#${customerId}`
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD',
        }).format(value)
    }

    const formatDate = (date: string | null) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('es-EC')
    }

    const formatDateTime = (date: string | null) => {
        if (!date) return '-'
        return new Date(date).toLocaleString('es-EC')
    }

    if (saleLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div>Cargando...</div>
            </div>
        )
    }

    if (!sale) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h4 className="mb-4">Venta no encontrada</h4>
                <Button
                    variant="solid"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/sales')}
                >
                    Volver a Ventas
                </Button>
            </div>
        )
    }

    const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const paymentsTotal = payments.reduce((sum, p) => sum + p.amount, 0)

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="plain"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/sales')}
                />
                <h3>Venta #{sale.id}</h3>
                <Badge
                    content={SALE_STATUS_LABELS[sale.status]}
                    className={SALE_STATUS_CLASSES[sale.status]}
                />
                <Badge
                    content={PAYMENT_STATUS_LABELS[sale.paymentStatus]}
                    className={PAYMENT_STATUS_CLASSES[sale.paymentStatus]}
                />
            </div>

            {/* Sale Info */}
            <Card>
                <h5 className="mb-4">Información de la Venta</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Cliente</p>
                        <p className="font-medium">
                            {getCustomerName(sale.customerId)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fecha de Venta</p>
                        <p className="font-medium">
                            {formatDate(sale.saleDate)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Creado por</p>
                        <p className="font-medium">{sale.createdBy ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Fecha de Creación
                        </p>
                        <p className="font-medium">
                            {formatDateTime(sale.createdAt)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Última Actualización
                        </p>
                        <p className="font-medium">
                            {formatDateTime(sale.updatedAt)}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t dark:border-gray-600">
                    <div>
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="font-medium">
                            {formatCurrency(sale.subtotal)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Descuento</p>
                        <p className="font-medium">
                            {formatCurrency(sale.discount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Impuestos</p>
                        <p className="font-medium">
                            {formatCurrency(sale.tax)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-semibold">
                            {formatCurrency(sale.total)}
                        </p>
                    </div>
                </div>
                {sale.notes && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-600">
                        <p className="text-sm text-gray-500">Notas</p>
                        <p className="font-medium">{sale.notes}</p>
                    </div>
                )}
            </Card>

            {/* Items & Payments Tabs */}
            <Card>
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <TabList>
                        <TabNav value="items">Items ({items.length})</TabNav>
                        <TabNav value="payments">
                            Pagos ({payments.length})
                        </TabNav>
                    </TabList>
                    <div className="mt-4">
                        <TabContent value="items">
                            {itemsLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div>Cargando items...</div>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No hay items en esta venta
                                </div>
                            ) : (
                                <Table>
                                    <THead>
                                        <Tr>
                                            <Th>Producto</Th>
                                            <Th>Cantidad</Th>
                                            <Th>Precio Unitario</Th>
                                            <Th>Descuento (%)</Th>
                                            <Th>Subtotal</Th>
                                        </Tr>
                                    </THead>
                                    <TBody>
                                        {items.map((item) => (
                                            <Tr key={item.id}>
                                                <Td>
                                                    {getProductName(
                                                        item.productId
                                                    )}
                                                </Td>
                                                <Td>{item.quantity}</Td>
                                                <Td>
                                                    {formatCurrency(
                                                        item.unitPrice
                                                    )}
                                                </Td>
                                                <Td>
                                                    {item.discount > 0
                                                        ? `${item.discount}%`
                                                        : '-'}
                                                </Td>
                                                <Td className="font-medium">
                                                    {formatCurrency(
                                                        item.subtotal
                                                    )}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </TBody>
                                    <TFoot>
                                        <Tr>
                                            <Td
                                                colSpan={4}
                                                className="text-right font-medium"
                                            >
                                                Total Items
                                            </Td>
                                            <Td className="font-semibold">
                                                {formatCurrency(itemsTotal)}
                                            </Td>
                                        </Tr>
                                    </TFoot>
                                </Table>
                            )}
                        </TabContent>
                        <TabContent value="payments">
                            {paymentsLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div>Cargando pagos...</div>
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No hay pagos registrados
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <THead>
                                            <Tr>
                                                <Th>Método</Th>
                                                <Th>Monto</Th>
                                                <Th>Fecha de Pago</Th>
                                                <Th>Referencia</Th>
                                                <Th>Notas</Th>
                                            </Tr>
                                        </THead>
                                        <TBody>
                                            {payments.map((payment) => (
                                                <Tr key={payment.id}>
                                                    <Td>
                                                        {
                                                            PAYMENT_METHOD_LABELS[
                                                                payment
                                                                    .paymentMethod
                                                            ]
                                                        }
                                                    </Td>
                                                    <Td className="font-medium">
                                                        {formatCurrency(
                                                            payment.amount
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        {formatDate(
                                                            payment.paymentDate
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        {payment.reference ??
                                                            '-'}
                                                    </Td>
                                                    <Td>
                                                        {payment.notes ?? '-'}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </TBody>
                                        <TFoot>
                                            <Tr>
                                                <Td className="font-medium">
                                                    Total Pagado
                                                </Td>
                                                <Td className="font-semibold">
                                                    {formatCurrency(
                                                        paymentsTotal
                                                    )}
                                                </Td>
                                                <Td colSpan={3} />
                                            </Tr>
                                        </TFoot>
                                    </Table>
                                    {paymentsTotal < sale.total && (
                                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                                            Saldo pendiente:{' '}
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    sale.total - paymentsTotal
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default SaleDetailView
