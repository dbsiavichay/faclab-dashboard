import { useState } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/shared/PageHeader'
import ErrorState from '@/components/shared/ErrorState'
import LabeledField from '@/components/shared/LabeledField'
import PayablesTable from '../components/PayablesTable'
import { usePayables } from '../hooks/usePayables'
import {
    PAYABLE_STATUSES,
    PAYABLE_STATUS_LABELS,
    type PayableStatus,
} from '../model/types'

const statusOptions = [
    { value: '', label: 'Todas' },
    ...PAYABLE_STATUSES.map((value) => ({
        value,
        label: PAYABLE_STATUS_LABELS[value],
    })),
]

/**
 * Cuentas por pagar (S5.7): lo que se le debe a cada proveedor por sus
 * entregas, la que vence antes primero. Cada proveedor lleva a su cuenta, donde
 * se registran los pagos.
 */
const PayablesPage = () => {
    const [status, setStatus] = useState<string>('OPEN')
    const [overdue, setOverdue] = useState(false)
    const { data, isLoading, error, refetch } = usePayables({
        status: (status || undefined) as PayableStatus | undefined,
        overdue: overdue || undefined,
        limit: 200,
    })

    return (
        <>
            <PageHeader
                title="Cuentas por pagar"
                description="Lo que se le debe a cada proveedor por lo recibido, con su IVA y vencimiento"
            />
            <Card className="mb-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <LabeledField label="Estado">
                        <Select
                            options={statusOptions}
                            value={statusOptions.find(
                                (o) => o.value === status
                            )}
                            onChange={(option) =>
                                setStatus(option?.value ?? '')
                            }
                        />
                    </LabeledField>
                    <div className="flex items-end gap-2 pb-2">
                        <Switcher
                            checked={overdue}
                            onChange={(checked) => setOverdue(checked)}
                        />
                        <span className="text-sm">Solo vencidas</span>
                    </div>
                </div>
            </Card>
            <Card>
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size={40} />
                    </div>
                ) : error ? (
                    <ErrorState onRetry={refetch} />
                ) : (
                    <PayablesTable
                        withSupplier
                        payables={data?.items ?? []}
                        emptyTitle="No hay cuentas por pagar"
                    />
                )}
            </Card>
        </>
    )
}

export default PayablesPage
