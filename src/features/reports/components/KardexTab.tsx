import { useState } from 'react'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import EmptyState from '@/components/shared/EmptyState'
import ErrorState from '@/components/shared/ErrorState'
import LabeledField from '@/components/shared/LabeledField'
import StatCard from '@/components/shared/StatCard'
import { formatCost, formatCurrency, formatDatetime } from '@shared/lib/format'
import { formatQuantity } from '@shared/lib/quantity'
import { ProductSelect } from '@features/products'
import { useKardex } from '../hooks/useReports'
import {
    REFERENCE_TYPE_LABELS,
    type KardexBalance,
    type KardexEntry,
} from '../model/types'

type Option = { value: string; label: string }

type Props = {
    warehouseOptions: Option[]
}

const isoDate = (date: Date) => date.toLocaleDateString('en-CA')
const firstOfMonth = () => {
    const now = new Date()
    return isoDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

const balanceHint = (balance?: KardexBalance) =>
    balance
        ? `${formatQuantity(balance.quantity)} u.${
              balance.averageCost !== null
                  ? ` a ${formatCost(balance.averageCost)}`
                  : ''
          }`
        : undefined

const muted = (text: string) => (
    <span className="text-gray-400 dark:text-gray-500">{text}</span>
)

/** Kárdex valorizado de un producto (S5.6): saldo inicial, cada movimiento
 * con su costo y el saldo acumulado, y saldo final = inicial + entradas −
 * salidas, en cantidad y valor */
const KardexTab = ({ warehouseOptions }: Props) => {
    const [productId, setProductId] = useState<number | null>(null)
    const [warehouse, setWarehouse] = useState('')
    const [fromDate, setFromDate] = useState(firstOfMonth)
    const [toDate, setToDate] = useState(() => isoDate(new Date()))

    const {
        data: kardex,
        isLoading,
        isError,
        refetch,
    } = useKardex({
        productId: productId ?? undefined,
        warehouseId: warehouse ? parseInt(warehouse) : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
    })

    const columns: ColumnDef<KardexEntry>[] = [
        {
            header: 'Fecha',
            accessorKey: 'date',
            cell: (props) => {
                const { date } = props.row.original
                return (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {date ? formatDatetime(date) : '-'}
                    </span>
                )
            },
        },
        {
            header: 'Documento',
            accessorKey: 'referenceType',
            cell: (props) => {
                const { referenceType, referenceId, reason } =
                    props.row.original
                const label = referenceType
                    ? `${REFERENCE_TYPE_LABELS[referenceType] ?? referenceType}${
                          referenceId ? ` #${referenceId}` : ''
                      }`
                    : 'Movimiento manual'
                return (
                    <div className="text-sm">
                        <div>{label}</div>
                        {reason && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {reason}
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            header: 'Ubicación',
            accessorKey: 'locationName',
            cell: (props) =>
                props.row.original.locationName ?? muted('Sin ubicación'),
        },
        {
            header: 'Entrada',
            accessorKey: 'inQuantity',
            cell: (props) => {
                const { inQuantity } = props.row.original
                return inQuantity ? (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatQuantity(inQuantity)}
                    </span>
                ) : (
                    muted('-')
                )
            },
        },
        {
            header: 'Salida',
            accessorKey: 'outQuantity',
            cell: (props) => {
                const { outQuantity } = props.row.original
                return outQuantity ? (
                    <span className="font-medium text-red-600 dark:text-red-400">
                        {formatQuantity(outQuantity)}
                    </span>
                ) : (
                    muted('-')
                )
            },
        },
        {
            header: 'Costo unitario',
            accessorKey: 'unitCost',
            cell: (props) => formatCost(props.row.original.unitCost),
        },
        {
            header: 'Valor',
            accessorKey: 'value',
            cell: (props) => formatCurrency(props.row.original.value),
        },
        {
            header: 'Saldo',
            accessorKey: 'balanceQuantity',
            cell: (props) => (
                <span className="font-medium">
                    {formatQuantity(props.row.original.balanceQuantity)}
                </span>
            ),
        },
        {
            header: 'Saldo valorizado',
            accessorKey: 'balanceValue',
            cell: (props) => (
                <span className="font-medium">
                    {formatCurrency(props.row.original.balanceValue)}
                </span>
            ),
        },
        {
            header: 'Costo promedio',
            accessorKey: 'averageCost',
            cell: (props) => {
                const { averageCost } = props.row.original
                return averageCost !== null
                    ? formatCost(averageCost)
                    : muted('-')
            },
        },
    ]

    const entries = kardex?.entries ?? []

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <LabeledField label="Producto">
                    <ProductSelect
                        isClearable
                        placeholder="Buscar por nombre o SKU"
                        value={productId}
                        onChange={setProductId}
                    />
                </LabeledField>
                <LabeledField label="Almacén">
                    <Select
                        placeholder="Todos los almacenes"
                        options={warehouseOptions}
                        value={warehouseOptions.find(
                            (o) => o.value === warehouse
                        )}
                        onChange={(option) => setWarehouse(option?.value || '')}
                    />
                </LabeledField>
                <LabeledField label="Desde">
                    <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </LabeledField>
                <LabeledField label="Hasta">
                    <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </LabeledField>
            </div>

            {productId === null ? (
                <EmptyState
                    title="Elige un producto"
                    description="El kárdex muestra las entradas, salidas y saldos de un producto, en cantidad y valor, al costo promedio ponderado."
                />
            ) : isError ? (
                <ErrorState onRetry={() => refetch()} />
            ) : (
                <>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                        <StatCard
                            label="Saldo inicial"
                            value={formatCurrency(kardex?.opening.value ?? 0)}
                            hint={balanceHint(kardex?.opening)}
                            loading={isLoading}
                        />
                        <StatCard
                            label="Entradas"
                            value={formatCurrency(kardex?.totalIn.value ?? 0)}
                            hint={
                                kardex
                                    ? `${formatQuantity(kardex.totalIn.quantity)} u.`
                                    : undefined
                            }
                            tone="success"
                            loading={isLoading}
                        />
                        <StatCard
                            label="Salidas"
                            value={formatCurrency(kardex?.totalOut.value ?? 0)}
                            hint={
                                kardex
                                    ? `${formatQuantity(kardex.totalOut.quantity)} u.`
                                    : undefined
                            }
                            tone="danger"
                            loading={isLoading}
                        />
                        <StatCard
                            label="Saldo final"
                            value={formatCurrency(kardex?.closing.value ?? 0)}
                            hint={balanceHint(kardex?.closing)}
                            tone="info"
                            loading={isLoading}
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        data={entries}
                        loading={isLoading}
                        pagingData={{
                            total: entries.length,
                            pageIndex: 1,
                            pageSize: entries.length || 10,
                        }}
                    />
                </>
            )}
        </>
    )
}

export default KardexTab
