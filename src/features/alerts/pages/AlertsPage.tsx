import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import {
    useLowStock,
    useOutOfStock,
    useReorderPoint,
    useExpiringLots,
} from '../hooks/useAlerts'
import { useWarehousesList } from '@features/warehouses'
import { type StockAlert } from '../model/types'

const { TabList, TabNav, TabContent } = Tabs

const AlertsPage = () => {
    const navigate = useNavigate()

    const location = useLocation()
    const initialTab =
        (location.state as { tab?: string } | null)?.tab ?? 'low_stock'
    const [activeTab, setActiveTab] = useState(initialTab)
    const [warehouseFilter, setWarehouseFilter] = useState<string>('')
    const [expiringDays, setExpiringDays] = useState<string>('30')

    const warehouseId = warehouseFilter ? parseInt(warehouseFilter) : undefined
    const days = expiringDays ? parseInt(expiringDays) : 30

    const { data: warehousesData } = useWarehousesList({ limit: 100 })
    const warehouses = warehousesData?.items ?? []

    const warehouseOptions = [
        { value: '', label: 'Todos los almacenes' },
        ...warehouses.map((w) => ({
            value: w.id.toString(),
            label: `${w.name} (${w.code})`,
        })),
    ]

    const { data: lowStock = [], isLoading: loadingLowStock } = useLowStock(
        warehouseId ? { warehouseId } : undefined
    )
    const { data: outOfStock = [], isLoading: loadingOutOfStock } =
        useOutOfStock(warehouseId ? { warehouseId } : undefined)
    const { data: reorderPoint = [], isLoading: loadingReorderPoint } =
        useReorderPoint(warehouseId ? { warehouseId } : undefined)
    const { data: expiringLots = [], isLoading: loadingExpiring } =
        useExpiringLots({ days })

    const getWarehouseName = (warehouseId: number | null) => {
        if (!warehouseId) return '-'
        const w = warehouses.find((w) => w.id === warehouseId)
        return w ? w.name : `#${warehouseId}`
    }

    const stockColumns: ColumnDef<StockAlert>[] = [
        {
            header: 'Producto',
            accessorKey: 'productName',
            cell: (props) => (
                <button
                    className="text-primary font-medium hover:underline text-left"
                    onClick={() => navigate(`/catalog/products`)}
                >
                    {props.row.original.productName}
                </button>
            ),
        },
        {
            header: 'SKU',
            accessorKey: 'sku',
            cell: (props) => (
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {props.row.original.sku}
                </span>
            ),
        },
        {
            header: 'Cantidad Actual',
            accessorKey: 'currentQuantity',
            cell: (props) => (
                <span className="font-semibold text-red-600 dark:text-red-400">
                    {props.row.original.currentQuantity}
                </span>
            ),
        },
        {
            header: 'Umbral',
            accessorKey: 'threshold',
            cell: (props) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {props.row.original.threshold}
                </span>
            ),
        },
        {
            header: 'Almacén',
            accessorKey: 'warehouseId',
            cell: (props) => getWarehouseName(props.row.original.warehouseId),
        },
    ]

    const expiringColumns: ColumnDef<StockAlert>[] = [
        {
            header: 'Producto',
            accessorKey: 'productName',
            cell: (props) => (
                <span className="font-medium">
                    {props.row.original.productName}
                </span>
            ),
        },
        {
            header: 'SKU',
            accessorKey: 'sku',
            cell: (props) => (
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {props.row.original.sku}
                </span>
            ),
        },
        {
            header: 'Lote',
            accessorKey: 'lotId',
            cell: (props) => {
                const lotId = props.row.original.lotId
                return lotId ? (
                    <button
                        className="text-primary hover:underline"
                        onClick={() => navigate(`/lots`)}
                    >
                        #{lotId}
                    </button>
                ) : (
                    '-'
                )
            },
        },
        {
            header: 'Cantidad',
            accessorKey: 'currentQuantity',
            cell: (props) => (
                <span className="font-medium">
                    {props.row.original.currentQuantity}
                </span>
            ),
        },
        {
            header: 'Días para Vencer',
            accessorKey: 'daysToExpiry',
            cell: (props) => {
                const d = props.row.original.daysToExpiry
                if (d === null) return '-'
                const isUrgent = d <= 7
                return (
                    <Badge
                        content={`${d} días`}
                        className={
                            isUrgent
                                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
                        }
                    />
                )
            },
        },
    ]

    const summaryCards = [
        {
            tab: 'low_stock',
            label: 'Stock Bajo',
            count: lowStock.length,
            colorClass:
                'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
            textClass: 'text-amber-700 dark:text-amber-300',
            countClass: 'text-amber-600 dark:text-amber-400',
        },
        {
            tab: 'out_of_stock',
            label: 'Sin Stock',
            count: outOfStock.length,
            colorClass:
                'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
            textClass: 'text-red-700 dark:text-red-300',
            countClass: 'text-red-600 dark:text-red-400',
        },
        {
            tab: 'reorder_point',
            label: 'Punto de Reorden',
            count: reorderPoint.length,
            colorClass:
                'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
            textClass: 'text-blue-700 dark:text-blue-300',
            countClass: 'text-blue-600 dark:text-blue-400',
        },
        {
            tab: 'expiring_soon',
            label: 'Por Vencer',
            count: expiringLots.length,
            colorClass:
                'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
            textClass: 'text-orange-700 dark:text-orange-300',
            countClass: 'text-orange-600 dark:text-orange-400',
        },
    ]

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryCards.map((card) => (
                    <button
                        key={card.tab}
                        className={`border rounded-lg p-4 text-left cursor-pointer transition-all hover:shadow-md ${
                            card.colorClass
                        } ${
                            activeTab === card.tab
                                ? 'ring-2 ring-offset-1 ring-current'
                                : ''
                        }`}
                        onClick={() => setActiveTab(card.tab)}
                    >
                        <p className={`text-sm font-medium ${card.textClass}`}>
                            {card.label}
                        </p>
                        <p
                            className={`text-3xl font-bold mt-1 ${card.countClass}`}
                        >
                            {card.count}
                        </p>
                    </button>
                ))}
            </div>

            <Card>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {activeTab !== 'expiring_soon' ? (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Almacén
                                </label>
                                <Select
                                    placeholder="Filtrar por almacén"
                                    options={warehouseOptions}
                                    value={warehouseOptions.find(
                                        (o) => o.value === warehouseFilter
                                    )}
                                    onChange={(option) =>
                                        setWarehouseFilter(option?.value || '')
                                    }
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Días para vencer
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    value={expiringDays}
                                    onChange={(e) =>
                                        setExpiringDays(e.target.value)
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <Card>
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <TabList>
                        <TabNav value="low_stock">
                            Stock Bajo ({lowStock.length})
                        </TabNav>
                        <TabNav value="out_of_stock">
                            Sin Stock ({outOfStock.length})
                        </TabNav>
                        <TabNav value="reorder_point">
                            Punto de Reorden ({reorderPoint.length})
                        </TabNav>
                        <TabNav value="expiring_soon">
                            Por Vencer ({expiringLots.length})
                        </TabNav>
                    </TabList>

                    <div className="mt-4">
                        <TabContent value="low_stock">
                            {lowStock.length === 0 && !loadingLowStock ? (
                                <div className="text-center py-8 text-gray-500">
                                    Sin alertas de stock bajo
                                </div>
                            ) : (
                                <DataTable
                                    columns={stockColumns}
                                    data={lowStock}
                                    loading={loadingLowStock}
                                    pagingData={{
                                        total: lowStock.length,
                                        pageIndex: 1,
                                        pageSize: lowStock.length || 10,
                                    }}
                                />
                            )}
                        </TabContent>

                        <TabContent value="out_of_stock">
                            {outOfStock.length === 0 && !loadingOutOfStock ? (
                                <div className="text-center py-8 text-gray-500">
                                    Sin productos sin stock
                                </div>
                            ) : (
                                <DataTable
                                    columns={stockColumns}
                                    data={outOfStock}
                                    loading={loadingOutOfStock}
                                    pagingData={{
                                        total: outOfStock.length,
                                        pageIndex: 1,
                                        pageSize: outOfStock.length || 10,
                                    }}
                                />
                            )}
                        </TabContent>

                        <TabContent value="reorder_point">
                            {reorderPoint.length === 0 &&
                            !loadingReorderPoint ? (
                                <div className="text-center py-8 text-gray-500">
                                    Sin alertas de punto de reorden
                                </div>
                            ) : (
                                <DataTable
                                    columns={stockColumns}
                                    data={reorderPoint}
                                    loading={loadingReorderPoint}
                                    pagingData={{
                                        total: reorderPoint.length,
                                        pageIndex: 1,
                                        pageSize: reorderPoint.length || 10,
                                    }}
                                />
                            )}
                        </TabContent>

                        <TabContent value="expiring_soon">
                            {expiringLots.length === 0 && !loadingExpiring ? (
                                <div className="text-center py-8 text-gray-500">
                                    Sin lotes próximos a vencer
                                </div>
                            ) : (
                                <DataTable
                                    columns={expiringColumns}
                                    data={expiringLots}
                                    loading={loadingExpiring}
                                    pagingData={{
                                        total: expiringLots.length,
                                        pageIndex: 1,
                                        pageSize: expiringLots.length || 10,
                                    }}
                                />
                            )}
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default AlertsPage
