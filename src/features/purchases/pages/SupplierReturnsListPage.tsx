import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import LabeledField from '@/components/shared/LabeledField'
import { SupplierSelect } from '@features/suppliers'
import { formatCurrency, formatDate } from '@shared/lib/format'
import { HiOutlineEye } from 'react-icons/hi'
import { useSupplierReturns } from '../hooks/useSupplierReturns'
import {
    SUPPLIER_RETURN_STATUS_LABELS,
    SUPPLIER_RETURN_STATUS_TONES,
    SUPPLIER_RETURN_STATUSES,
    type SupplierReturn,
    type SupplierReturnStatus,
} from '../model/types'

const statusOptions = [
    { value: '', label: 'Todos' },
    ...SUPPLIER_RETURN_STATUSES.map((value) => ({
        value,
        label: SUPPLIER_RETURN_STATUS_LABELS[value],
    })),
]

/** Supplier returns (S5.7): they start on a received purchase order */
const SupplierReturnsListPage = () => {
    const navigate = useNavigate()
    const [status, setStatus] = useState('')
    const [supplierId, setSupplierId] = useState<number | null>(null)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { data, isLoading, error, refetch } = useSupplierReturns({
        status: (status || undefined) as SupplierReturnStatus | undefined,
        supplierId: supplierId ?? undefined,
        limit: pageSize,
        offset: (pageIndex - 1) * pageSize,
    })

    const columns: ColumnDef<SupplierReturn>[] = [
        {
            header: 'Número',
            accessorKey: 'number',
            cell: (props) => (
                <span className="font-medium">
                    {props.row.original.number ?? `#${props.row.original.id}`}
                </span>
            ),
        },
        {
            header: 'Proveedor',
            accessorKey: 'supplierName',
            cell: (props) => props.row.original.supplierName ?? '-',
        },
        {
            header: 'Orden',
            accessorKey: 'orderNumber',
            cell: (props) => props.row.original.orderNumber ?? '-',
        },
        {
            header: 'Estado',
            accessorKey: 'status',
            cell: (props) => (
                <StatusBadge
                    tone={
                        SUPPLIER_RETURN_STATUS_TONES[props.row.original.status]
                    }
                >
                    {SUPPLIER_RETURN_STATUS_LABELS[props.row.original.status]}
                </StatusBadge>
            ),
        },
        {
            header: 'Total',
            accessorKey: 'total',
            cell: (props) => formatCurrency(props.row.original.total),
        },
        {
            header: 'Por reembolsar',
            accessorKey: 'refundDue',
            cell: (props) => {
                const { status: s, refundDue } = props.row.original
                return s === 'confirmed' && refundDue > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {formatCurrency(refundDue)}
                    </span>
                ) : (
                    '-'
                )
            },
        },
        {
            header: 'Fecha',
            accessorKey: 'createdAt',
            cell: (props) => {
                const date =
                    props.row.original.confirmedAt ??
                    props.row.original.createdAt
                return date ? formatDate(date) : '-'
            },
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: (props) => (
                <Button
                    size="sm"
                    variant="plain"
                    aria-label="Ver detalle"
                    icon={<HiOutlineEye />}
                    onClick={() =>
                        navigate(`/supplier-returns/${props.row.original.id}`)
                    }
                />
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Devoluciones a Proveedor"
                description="Mercadería recibida que vuelve al proveedor. Se crean desde una orden de compra recibida."
            />
            <Card className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <LabeledField label="Estado">
                        <Select
                            options={statusOptions}
                            value={statusOptions.find(
                                (o) => o.value === status
                            )}
                            onChange={(option) => {
                                setStatus(option?.value ?? '')
                                setPageIndex(1)
                            }}
                        />
                    </LabeledField>
                    <LabeledField label="Proveedor">
                        <SupplierSelect
                            isClearable
                            placeholder="Todos"
                            value={supplierId}
                            onChange={(id) => {
                                setSupplierId(id)
                                setPageIndex(1)
                            }}
                        />
                    </LabeledField>
                </div>
            </Card>
            <Card bodyClass="p-0">
                <DataTable
                    columns={columns}
                    data={data?.items ?? []}
                    loading={isLoading}
                    error={error}
                    pagingData={{
                        total: data?.pagination?.total ?? 0,
                        pageIndex,
                        pageSize,
                    }}
                    onRetry={refetch}
                    onPaginationChange={setPageIndex}
                    onSelectChange={(size) => {
                        setPageSize(size)
                        setPageIndex(1)
                    }}
                />
            </Card>
        </>
    )
}

export default SupplierReturnsListPage
