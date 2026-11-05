import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import LabeledField from '@/components/shared/LabeledField'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import PageHeader from '@/components/shared/PageHeader'
import { useBranchesList, useEmissionPointsList } from '@features/organization'
import { useSequences } from '../hooks/useInvoicing'
import { sequenceRows, type SequenceRow } from '../model/sequences'
import { VOUCHER_TYPE_LABELS, type VoucherType } from '../model/types'
import NextSequenceModal from '../components/NextSequenceModal'

// Una ferretería tiene pocas sucursales y puntos de emisión: se traen todos
const ALL = { limit: 1000 }

const DOC_TYPE_OPTIONS = Object.entries(VOUCHER_TYPE_LABELS).map(
    ([value, label]) => ({ value: value as VoucherType, label })
)

const SequencesPage = () => {
    const branches = useBranchesList(ALL)
    const emissionPoints = useEmissionPointsList(ALL)
    const sequences = useSequences()
    const [editing, setEditing] = useState<SequenceRow | null>(null)
    const [docType, setDocType] = useState<VoucherType>('01')

    const queries = [branches, emissionPoints, sequences]
    const rows =
        branches.data && emissionPoints.data && sequences.data
            ? sequenceRows(
                  branches.data.items,
                  emissionPoints.data.items,
                  sequences.data,
                  docType
              )
            : []

    const columns: ColumnDef<SequenceRow>[] = [
        {
            header: 'Establecimiento',
            accessorKey: 'establishment',
            cell: (props) => (
                <span>
                    <span className="font-mono">
                        {props.row.original.establishment}
                    </span>{' '}
                    <span className="text-gray-500 dark:text-gray-400">
                        {props.row.original.branchName ??
                            'No está en Sucursales'}
                    </span>
                </span>
            ),
        },
        {
            header: 'Punto de emisión',
            accessorKey: 'emissionPoint',
            cell: (props) => (
                <span>
                    <span className="font-mono">
                        {props.row.original.emissionPoint}
                    </span>{' '}
                    {props.row.original.emissionPointName && (
                        <span className="text-gray-500 dark:text-gray-400">
                            {props.row.original.emissionPointName}
                        </span>
                    )}
                </span>
            ),
        },
        {
            header: 'Último emitido',
            accessorKey: 'lastSequence',
            cell: (props) => (
                <span className="font-mono">
                    {props.row.original.lastSequence ?? '—'}
                </span>
            ),
        },
        {
            header: 'Siguiente',
            accessorKey: 'nextSequence',
            cell: (props) => (
                <span className="font-mono font-semibold">
                    {props.row.original.nextSequence}
                </span>
            ),
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: (props) => (
                <Button
                    size="xs"
                    variant="plain"
                    aria-label={`Ajustar secuencial ${props.row.original.establishment}-${props.row.original.emissionPoint}`}
                    onClick={() => setEditing(props.row.original)}
                >
                    Ajustar
                </Button>
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Secuenciales"
                description="Número del próximo comprobante de cada establecimiento y punto de emisión. Facturas y notas de crédito numeran aparte. Nunca retrocede."
            />
            <Card className="mb-4">
                <div className="p-4 max-w-xs">
                    <LabeledField label="Documento">
                        <Select
                            options={DOC_TYPE_OPTIONS}
                            value={DOC_TYPE_OPTIONS.find(
                                (option) => option.value === docType
                            )}
                            onChange={(option) => {
                                if (option) setDocType(option.value)
                            }}
                        />
                    </LabeledField>
                </div>
            </Card>
            <Card bodyClass="p-0">
                <DataTable
                    columns={columns}
                    data={rows}
                    loading={queries.some((q) => q.isLoading)}
                    error={queries.find((q) => q.error)?.error}
                    onRetry={() => queries.forEach((q) => q.refetch())}
                />
            </Card>
            {editing && (
                <NextSequenceModal
                    row={editing}
                    docType={docType}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    )
}

export default SequencesPage
