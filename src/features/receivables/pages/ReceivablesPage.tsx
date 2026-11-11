import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineEye } from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import PageHeader from '@/components/shared/PageHeader'
import { formatCurrency } from '@shared/lib/format'
import AgingCards from '../components/AgingCards'
import { useReceivablesAging } from '../hooks/useReceivables'
import { formatDueDay } from '../model/days'
import {
    AGING_BUCKET_LABELS,
    AGING_BUCKETS,
    type AgingBucket,
    type AgingRow,
} from '../model/types'

const money = (value: number) => (value > 0 ? formatCurrency(value) : '—')

/**
 * Cartera (S5.5): lo que debe cada cliente por días de vencido, a hoy. Cada
 * cuenta abierta cae en un solo tramo, así que los tramos suman el total.
 */
const ReceivablesPage = () => {
    const navigate = useNavigate()
    const { data, isLoading, error, refetch } = useReceivablesAging()
    const [bucket, setBucket] = useState<AgingBucket | null>(null)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const rows = (data?.customers ?? []).filter(
        (row) => bucket === null || row[bucket] > 0
    )
    const page = rows.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
    const open = (row: AgingRow) =>
        navigate(`/receivables/customers/${row.customerId}`)

    const columns: ColumnDef<AgingRow>[] = [
        {
            header: 'Cliente',
            accessorKey: 'customerName',
            cell: (props) => (
                <div>
                    <p className="font-medium">
                        {props.row.original.customerName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {props.row.original.customerTaxId} ·{' '}
                        {props.row.original.receivables} cuentas
                    </p>
                </div>
            ),
        },
        ...AGING_BUCKETS.map(
            (key): ColumnDef<AgingRow> => ({
                header: AGING_BUCKET_LABELS[key],
                accessorKey: key,
                cell: (props) => money(props.row.original[key]),
            })
        ),
        {
            header: 'Total',
            accessorKey: 'total',
            cell: (props) => (
                <span className="font-semibold">
                    {formatCurrency(props.row.original.total)}
                </span>
            ),
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: (props) => (
                <Button
                    size="sm"
                    variant="plain"
                    aria-label={`Ver la cuenta de ${props.row.original.customerName}`}
                    icon={<HiOutlineEye />}
                    onClick={() => open(props.row.original)}
                />
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Cartera"
                description={
                    data
                        ? `Saldos por cobrar por días de vencido, al ${formatDueDay(
                              data.asOf
                          )}`
                        : 'Saldos por cobrar por días de vencido'
                }
            />
            <AgingCards
                totals={data?.totals}
                loading={isLoading}
                selected={bucket}
                onSelect={(value) => {
                    setBucket(value)
                    setPageIndex(1)
                }}
            />
            <Card bodyClass="p-0">
                <DataTable
                    columns={columns}
                    data={page}
                    loading={isLoading}
                    error={error}
                    pagingData={{ total: rows.length, pageIndex, pageSize }}
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

export default ReceivablesPage
