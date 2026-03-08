import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import { useAdjustments } from '@/hooks/useAdjustments'
import { useWarehouses } from '@/hooks/useWarehouses'
import {
    ADJUSTMENT_STATUS_LABELS,
    ADJUSTMENT_STATUS_CLASSES,
    ADJUSTMENT_REASON_LABELS,
    type Adjustment,
    type AdjustmentQueryParams,
    type AdjustmentStatus,
} from '@/services/AdjustmentService'
import AdjustmentForm from './AdjustmentForm'
import { HiPlus, HiOutlineEye } from 'react-icons/hi'

const statusOptions = [
    { value: '', label: 'Todos' },
    ...Object.entries(ADJUSTMENT_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
    })),
]

const AdjustmentsView = () => {
    const navigate = useNavigate()
    const [isFormOpen, setIsFormOpen] = useState(false)

    const [statusFilter, setStatusFilter] = useState<string>('')
    const [warehouseFilter, setWarehouseFilter] = useState<string>('')
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const offset = (pageIndex - 1) * pageSize

    const { data: warehousesData } = useWarehouses({ limit: 100 })
    const warehouses = warehousesData?.items ?? []

    const warehouseOptions = [
        { value: '', label: 'Todos' },
        ...warehouses.map((w) => ({
            value: w.id.toString(),
            label: `${w.name} (${w.code})`,
        })),
    ]

    const queryParams: AdjustmentQueryParams = {
        status: statusFilter ? (statusFilter as AdjustmentStatus) : undefined,
        warehouseId: warehouseFilter ? parseInt(warehouseFilter) : undefined,
        limit: pageSize,
        offset,
    }

    const { data, isLoading } = useAdjustments(queryParams)
    const adjustments = data?.items ?? []
    const total = data?.pagination?.total ?? 0

    const handleReset = () => {
        setStatusFilter('')
        setWarehouseFilter('')
        setPageIndex(1)
    }

    const getWarehouseName = (warehouseId: number) => {
        const warehouse = warehouses.find((w) => w.id === warehouseId)
        return warehouse ? `${warehouse.name}` : `#${warehouseId}`
    }

    const handleCreated = (id: number) => {
        navigate(`/adjustments/${id}`)
    }

    const columns: ColumnDef<Adjustment>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (props) => (
                <span className="font-medium">#{props.row.original.id}</span>
            ),
        },
        {
            header: 'Almacén',
            accessorKey: 'warehouseId',
            cell: (props) => getWarehouseName(props.row.original.warehouseId),
        },
        {
            header: 'Motivo',
            accessorKey: 'reason',
            cell: (props) =>
                ADJUSTMENT_REASON_LABELS[props.row.original.reason] ||
                props.row.original.reason,
        },
        {
            header: 'Estado',
            accessorKey: 'status',
            cell: (props) => {
                const status = props.row.original.status
                return (
                    <Badge
                        content={ADJUSTMENT_STATUS_LABELS[status]}
                        className={ADJUSTMENT_STATUS_CLASSES[status]}
                    />
                )
            },
        },
        {
            header: 'Fecha',
            accessorKey: 'createdAt',
            cell: (props) => {
                const date = props.row.original.createdAt
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {date
                            ? new Date(date).toLocaleDateString('es-EC')
                            : '-'}
                    </span>
                )
            },
        },
        {
            header: 'Responsable',
            accessorKey: 'adjustedBy',
            cell: (props) => props.row.original.adjustedBy || '-',
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: (props) => (
                <Button
                    size="sm"
                    variant="plain"
                    icon={<HiOutlineEye />}
                    onClick={() =>
                        navigate(`/adjustments/${props.row.original.id}`)
                    }
                />
            ),
        },
    ]

    return (
        <>
            <Card className="mb-4">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Estado
                            </label>
                            <Select
                                placeholder="Filtrar por estado"
                                options={statusOptions}
                                value={statusOptions.find(
                                    (o) => o.value === statusFilter
                                )}
                                onChange={(option) => {
                                    setStatusFilter(option?.value || '')
                                    setPageIndex(1)
                                }}
                            />
                        </div>
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
                                onChange={(option) => {
                                    setWarehouseFilter(option?.value || '')
                                    setPageIndex(1)
                                }}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button variant="plain" onClick={handleReset}>
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="text-lg font-semibold">
                                Ajustes de Inventario
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona los ajustes de inventario
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={() => setIsFormOpen(true)}
                        >
                            Nuevo Ajuste
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={adjustments}
                        loading={isLoading}
                        pagingData={{ total, pageIndex, pageSize }}
                        onPaginationChange={setPageIndex}
                        onSelectChange={(size) => {
                            setPageSize(size)
                            setPageIndex(1)
                        }}
                    />
                </div>
            </Card>

            <AdjustmentForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onCreated={handleCreated}
            />
        </>
    )
}

export default AdjustmentsView
