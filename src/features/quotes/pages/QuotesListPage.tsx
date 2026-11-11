import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineEye, HiPlus } from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import LabeledField from '@/components/shared/LabeledField'
import ListSearchInput from '@shared/ui/ListSearchInput'
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue'
import { CustomerSelect } from '@features/customers'
import { PERMISSION } from '@/constants/permissions.constant'
import { useActiveBranch, useCan } from '@/stores'
import { formatCurrency } from '@shared/lib/format'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { useCreateQuote, useQuotes } from '../hooks/useQuotes'
import { QuoteCreateForm } from '../components/QuoteForm'
import { formatDay } from '../model/days'
import {
    isExpired,
    localDay,
    QUOTE_ERROR_MESSAGES,
    QUOTE_STATUS_LABELS,
    QUOTE_STATUS_TONES,
    type QuoteStatus,
    type QuoteSummary,
} from '../model/types'

const statusOptions = [
    { value: '', label: 'Todos' },
    ...Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
    })),
]

const QuotesListPage = () => {
    const navigate = useNavigate()
    const canWrite = useCan(PERMISSION.SALE_WRITE)
    const branch = useActiveBranch()
    const createQuote = useCreateQuote()
    const [creating, setCreating] = useState(false)
    const [status, setStatus] = useState('')
    const [customerId, setCustomerId] = useState<number | null>(null)
    const [number, setNumber] = useState('')
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const numberTerm = useDebouncedValue(number.trim())
    const today = localDay()

    const { data, isLoading, error, refetch } = useQuotes({
        status: (status || undefined) as QuoteStatus | undefined,
        customerId: customerId ?? undefined,
        number: numberTerm || undefined,
        limit: pageSize,
        offset: (pageIndex - 1) * pageSize,
    })

    const handleCreate = async (values: {
        customerId: number | null
        validUntil: string
        notes?: string
    }) => {
        if (!branch) return
        try {
            const quote = await createQuote.mutateAsync({
                branchId: branch.id,
                customerId: values.customerId,
                validUntil: values.validUntil,
                notes: values.notes || null,
            })
            notifySuccess('Cotización creada', quote.number ?? undefined)
            setCreating(false)
            navigate(`/quotes/${quote.id}`)
        } catch (err) {
            notifyError(err, 'No se pudo crear la cotización', {
                messages: QUOTE_ERROR_MESSAGES,
            })
        }
    }

    const columns: ColumnDef<QuoteSummary>[] = [
        {
            header: 'Número',
            accessorKey: 'number',
            cell: (props) => (
                <span className="font-medium">{props.row.original.number}</span>
            ),
        },
        {
            header: 'Cliente',
            accessorKey: 'customerName',
            cell: (props) =>
                props.row.original.customerName ?? 'Consumidor final',
        },
        {
            header: 'Estado',
            accessorKey: 'status',
            cell: (props) => {
                const quote = props.row.original
                const shown = isExpired(quote, today) ? 'EXPIRED' : quote.status
                return (
                    <StatusBadge tone={QUOTE_STATUS_TONES[shown]}>
                        {QUOTE_STATUS_LABELS[shown]}
                    </StatusBadge>
                )
            },
        },
        {
            header: 'Válida hasta',
            accessorKey: 'validUntil',
            cell: (props) => formatDay(props.row.original.validUntil),
        },
        {
            header: 'Total',
            accessorKey: 'total',
            cell: (props) => (
                <span className="font-medium">
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
                    aria-label={`Ver cotización ${props.row.original.number}`}
                    icon={<HiOutlineEye />}
                    onClick={() => navigate(`/quotes/${props.row.original.id}`)}
                />
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Cotizaciones"
                description="Proformas con vigencia, a los precios de las listas del cliente"
                actions={
                    canWrite && (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            disabled={!branch}
                            onClick={() => setCreating(true)}
                        >
                            Nueva cotización
                        </Button>
                    )
                }
            />
            <Card className="mb-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    <LabeledField label="Cliente">
                        <CustomerSelect
                            isClearable
                            placeholder="Todos"
                            value={customerId}
                            onChange={(value) => {
                                setCustomerId(value)
                                setPageIndex(1)
                            }}
                        />
                    </LabeledField>
                    <LabeledField label="Número de cotización">
                        <ListSearchInput
                            placeholder="Buscar por número"
                            value={number}
                            onChange={(value) => {
                                setNumber(value)
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
                        total: data?.pagination.total ?? 0,
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
            <QuoteCreateForm
                open={creating}
                branch={branch}
                isSubmitting={createQuote.isPending}
                onClose={() => setCreating(false)}
                onSubmit={handleCreate}
            />
        </>
    )
}

export default QuotesListPage
