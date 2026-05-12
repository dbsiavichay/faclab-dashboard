import { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import { formatCurrency, formatDate, formatDatetime } from '@shared/lib/format'
import { useWarehousesList } from '@features/warehouses'
import { useProducts } from '@/hooks/useProducts'
import {
    useValuation,
    useRotation,
    useMovementHistory,
    useWarehouseSummary,
} from '../hooks/useReports'
import type {
    ValuationItem,
    ProductRotation,
    MovementHistoryItem,
    WarehouseSummary,
    MovementHistoryParams,
} from '../model/types'

const { TabList, TabNav, TabContent } = Tabs

const movementTypeOptions = [
    { value: '', label: 'Todos' },
    { value: 'in', label: 'Entrada' },
    { value: 'out', label: 'Salida' },
]

const referenceTypeLabels: Record<string, string> = {
    sale: 'Venta',
    purchase_order: 'Orden de Compra',
    adjustment: 'Ajuste',
    transfer: 'Transferencia',
}

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('valuation')

    // Valuation filters
    const [valuationWarehouse, setValuationWarehouse] = useState('')
    const [valuationDate, setValuationDate] = useState('')

    // Rotation filters
    const [rotationWarehouse, setRotationWarehouse] = useState('')
    const [rotationFromDate, setRotationFromDate] = useState('')
    const [rotationToDate, setRotationToDate] = useState('')

    // Movements filters + pagination
    const [movWarehouse, setMovWarehouse] = useState('')
    const [movProduct, setMovProduct] = useState('')
    const [movType, setMovType] = useState('')
    const [movFromDate, setMovFromDate] = useState('')
    const [movToDate, setMovToDate] = useState('')
    const [movPageIndex, setMovPageIndex] = useState(1)
    const [movPageSize, setMovPageSize] = useState(50)

    // Summary filter
    const [summaryWarehouse, setSummaryWarehouse] = useState('')

    const { data: warehousesData } = useWarehousesList({ limit: 100 })
    const warehouses = warehousesData?.items ?? []
    const warehouseOptions = [
        { value: '', label: 'Todos los almacenes' },
        ...warehouses.map((w) => ({
            value: w.id.toString(),
            label: `${w.name} (${w.code})`,
        })),
    ]

    const { data: productsData } = useProducts({ limit: 200 })
    const products = productsData?.items ?? []
    const productOptions = [
        { value: '', label: 'Todos los productos' },
        ...products.map((p) => ({
            value: p.id.toString(),
            label: `${p.name} (${p.sku})`,
        })),
    ]

    const { data: valuation, isLoading: loadingValuation } = useValuation({
        warehouseId: valuationWarehouse
            ? parseInt(valuationWarehouse)
            : undefined,
        asOfDate: valuationDate || undefined,
    })

    const { data: rotation = [], isLoading: loadingRotation } = useRotation({
        warehouseId: rotationWarehouse
            ? parseInt(rotationWarehouse)
            : undefined,
        fromDate: rotationFromDate || undefined,
        toDate: rotationToDate || undefined,
    })

    const movOffset = (movPageIndex - 1) * movPageSize
    const movParams: MovementHistoryParams = {
        limit: movPageSize,
        offset: movOffset,
        warehouseId: movWarehouse ? parseInt(movWarehouse) : undefined,
        productId: movProduct ? parseInt(movProduct) : undefined,
        type: movType ? (movType as 'in' | 'out') : undefined,
        fromDate: movFromDate || undefined,
        toDate: movToDate || undefined,
    }
    const { data: movData, isLoading: loadingMovements } =
        useMovementHistory(movParams)
    const movements = movData?.items ?? []
    const movTotal = movData?.pagination?.total ?? 0

    const { data: summary = [], isLoading: loadingSummary } =
        useWarehouseSummary({
            warehouseId: summaryWarehouse
                ? parseInt(summaryWarehouse)
                : undefined,
        })

    const valuationColumns: ColumnDef<ValuationItem>[] = [
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
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                    {props.row.original.sku}
                </span>
            ),
        },
        {
            header: 'Cantidad',
            accessorKey: 'quantity',
            cell: (props) => (
                <span className="font-medium">
                    {props.row.original.quantity}
                </span>
            ),
        },
        {
            header: 'Costo Promedio',
            accessorKey: 'averageCost',
            cell: (props) => formatCurrency(props.row.original.averageCost),
        },
        {
            header: 'Valor Total',
            accessorKey: 'totalValue',
            cell: (props) => (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(props.row.original.totalValue)}
                </span>
            ),
        },
    ]

    const rotationColumns: ColumnDef<ProductRotation>[] = [
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
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                    {props.row.original.sku}
                </span>
            ),
        },
        {
            header: 'Entradas',
            accessorKey: 'totalIn',
            cell: (props) => (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    +{props.row.original.totalIn}
                </span>
            ),
        },
        {
            header: 'Salidas',
            accessorKey: 'totalOut',
            cell: (props) => (
                <span className="text-red-600 dark:text-red-400 font-medium">
                    -{props.row.original.totalOut}
                </span>
            ),
        },
        {
            header: 'Stock Actual',
            accessorKey: 'currentStock',
            cell: (props) => (
                <span className="font-medium">
                    {props.row.original.currentStock}
                </span>
            ),
        },
        {
            header: 'Tasa de Rotación',
            accessorKey: 'turnoverRate',
            cell: (props) => {
                const rate = props.row.original.turnoverRate
                const isHigh = rate >= 2
                const isMed = rate >= 1
                return (
                    <Badge
                        content={rate.toFixed(2)}
                        className={
                            isHigh
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : isMed
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
                        }
                    />
                )
            },
        },
        {
            header: 'Días de Stock',
            accessorKey: 'daysOfStock',
            cell: (props) => {
                const d = props.row.original.daysOfStock
                if (d === null) return <span className="text-gray-400">-</span>
                const isLow = d <= 7
                return (
                    <span
                        className={
                            isLow
                                ? 'text-red-600 dark:text-red-400 font-medium'
                                : 'text-gray-700 dark:text-gray-300'
                        }
                    >
                        {d} días
                    </span>
                )
            },
        },
    ]

    const movementColumns: ColumnDef<MovementHistoryItem>[] = [
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
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                    {props.row.original.sku}
                </span>
            ),
        },
        {
            header: 'Tipo',
            accessorKey: 'type',
            cell: (props) => {
                const type = props.row.original.type
                return (
                    <Badge
                        content={type === 'in' ? 'Entrada' : 'Salida'}
                        className={
                            type === 'in'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                        }
                    />
                )
            },
        },
        {
            header: 'Cantidad',
            accessorKey: 'quantity',
            cell: (props) => {
                const { type, quantity } = props.row.original
                return (
                    <span
                        className={
                            type === 'in'
                                ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                : 'text-red-600 dark:text-red-400 font-medium'
                        }
                    >
                        {type === 'in' ? '+' : '-'}
                        {quantity}
                    </span>
                )
            },
        },
        {
            header: 'Referencia',
            accessorKey: 'referenceType',
            cell: (props) => {
                const { referenceType, referenceId } = props.row.original
                if (!referenceType)
                    return <span className="text-gray-400">-</span>
                return (
                    <span className="text-sm">
                        {referenceTypeLabels[referenceType] ?? referenceType}
                        {referenceId ? ` #${referenceId}` : ''}
                    </span>
                )
            },
        },
        {
            header: 'Razón',
            accessorKey: 'reason',
            cell: (props) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {props.row.original.reason ?? '-'}
                </span>
            ),
        },
        {
            header: 'Fecha',
            accessorKey: 'date',
            cell: (props) => {
                const date = props.row.original.date
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {date ? formatDatetime(date) : '-'}
                    </span>
                )
            },
        },
    ]

    const summaryColumns: ColumnDef<WarehouseSummary>[] = [
        {
            header: 'Almacén',
            accessorKey: 'warehouseName',
            cell: (props) => (
                <span className="font-medium">
                    {props.row.original.warehouseName}
                </span>
            ),
        },
        {
            header: 'Código',
            accessorKey: 'warehouseCode',
            cell: (props) => (
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                    {props.row.original.warehouseCode}
                </span>
            ),
        },
        {
            header: 'Productos',
            accessorKey: 'totalProducts',
            cell: (props) => (
                <span className="font-medium">
                    {props.row.original.totalProducts}
                </span>
            ),
        },
        {
            header: 'Cantidad Total',
            accessorKey: 'totalQuantity',
            cell: (props) => (
                <span className="font-medium">
                    {props.row.original.totalQuantity}
                </span>
            ),
        },
        {
            header: 'Reservado',
            accessorKey: 'reservedQuantity',
            cell: (props) => (
                <span className="text-amber-600 dark:text-amber-400">
                    {props.row.original.reservedQuantity}
                </span>
            ),
        },
        {
            header: 'Disponible',
            accessorKey: 'availableQuantity',
            cell: (props) => (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {props.row.original.availableQuantity}
                </span>
            ),
        },
        {
            header: 'Valor Total',
            accessorKey: 'totalValue',
            cell: (props) => (
                <span className="font-semibold">
                    {formatCurrency(props.row.original.totalValue)}
                </span>
            ),
        },
    ]

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <TabList>
                        <TabNav value="valuation">Valorización</TabNav>
                        <TabNav value="rotation">Rotación</TabNav>
                        <TabNav value="movements">Movimientos</TabNav>
                        <TabNav value="summary">Resumen por Almacén</TabNav>
                    </TabList>

                    <div className="mt-4">
                        <TabContent value="valuation">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Almacén
                                    </label>
                                    <Select
                                        placeholder="Todos los almacenes"
                                        options={warehouseOptions}
                                        value={warehouseOptions.find(
                                            (o) =>
                                                o.value === valuationWarehouse
                                        )}
                                        onChange={(option) =>
                                            setValuationWarehouse(
                                                option?.value || ''
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Fecha histórica
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                        value={valuationDate}
                                        onChange={(e) =>
                                            setValuationDate(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {valuation && (
                                <div className="flex items-center justify-between mb-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                            Valor Total del Inventario
                                        </p>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                                            Al {formatDate(valuation.asOfDate)}
                                        </p>
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(valuation.totalValue)}
                                    </p>
                                </div>
                            )}

                            <DataTable
                                columns={valuationColumns}
                                data={valuation?.items ?? []}
                                loading={loadingValuation}
                                pagingData={{
                                    total: valuation?.items?.length ?? 0,
                                    pageIndex: 1,
                                    pageSize: valuation?.items?.length || 10,
                                }}
                            />
                        </TabContent>

                        <TabContent value="rotation">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Almacén
                                    </label>
                                    <Select
                                        placeholder="Todos los almacenes"
                                        options={warehouseOptions}
                                        value={warehouseOptions.find(
                                            (o) => o.value === rotationWarehouse
                                        )}
                                        onChange={(option) =>
                                            setRotationWarehouse(
                                                option?.value || ''
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Desde
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                        value={rotationFromDate}
                                        onChange={(e) =>
                                            setRotationFromDate(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Hasta
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                        value={rotationToDate}
                                        onChange={(e) =>
                                            setRotationToDate(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <DataTable
                                columns={rotationColumns}
                                data={rotation}
                                loading={loadingRotation}
                                pagingData={{
                                    total: rotation.length,
                                    pageIndex: 1,
                                    pageSize: rotation.length || 10,
                                }}
                            />
                        </TabContent>

                        <TabContent value="movements">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Almacén
                                    </label>
                                    <Select
                                        placeholder="Todos"
                                        options={warehouseOptions}
                                        value={warehouseOptions.find(
                                            (o) => o.value === movWarehouse
                                        )}
                                        onChange={(option) => {
                                            setMovWarehouse(option?.value || '')
                                            setMovPageIndex(1)
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Producto
                                    </label>
                                    <Select
                                        placeholder="Todos"
                                        options={productOptions}
                                        value={productOptions.find(
                                            (o) => o.value === movProduct
                                        )}
                                        onChange={(option) => {
                                            setMovProduct(option?.value || '')
                                            setMovPageIndex(1)
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Tipo
                                    </label>
                                    <Select
                                        placeholder="Todos"
                                        options={movementTypeOptions}
                                        value={movementTypeOptions.find(
                                            (o) => o.value === movType
                                        )}
                                        onChange={(option) => {
                                            setMovType(option?.value || '')
                                            setMovPageIndex(1)
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Desde
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                        value={movFromDate}
                                        onChange={(e) => {
                                            setMovFromDate(e.target.value)
                                            setMovPageIndex(1)
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Hasta
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                        value={movToDate}
                                        onChange={(e) => {
                                            setMovToDate(e.target.value)
                                            setMovPageIndex(1)
                                        }}
                                    />
                                </div>
                            </div>

                            <DataTable
                                columns={movementColumns}
                                data={movements}
                                loading={loadingMovements}
                                pagingData={{
                                    total: movTotal,
                                    pageIndex: movPageIndex,
                                    pageSize: movPageSize,
                                }}
                                onPaginationChange={setMovPageIndex}
                                onSelectChange={(size) => {
                                    setMovPageSize(size)
                                    setMovPageIndex(1)
                                }}
                            />
                        </TabContent>

                        <TabContent value="summary">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Almacén
                                    </label>
                                    <Select
                                        placeholder="Todos los almacenes"
                                        options={warehouseOptions}
                                        value={warehouseOptions.find(
                                            (o) => o.value === summaryWarehouse
                                        )}
                                        onChange={(option) =>
                                            setSummaryWarehouse(
                                                option?.value || ''
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <DataTable
                                columns={summaryColumns}
                                data={summary}
                                loading={loadingSummary}
                                pagingData={{
                                    total: summary.length,
                                    pageIndex: 1,
                                    pageSize: summary.length || 10,
                                }}
                            />
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default ReportsPage
