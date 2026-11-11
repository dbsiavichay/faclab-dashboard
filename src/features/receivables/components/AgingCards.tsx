import StatCard from '@/components/shared/StatCard'
import { formatCurrency } from '@shared/lib/format'
import {
    AGING_BUCKET_LABELS,
    AGING_BUCKET_TONES,
    AGING_BUCKETS,
    type AgingBucket,
    type AgingTotals,
} from '../model/types'

interface AgingCardsProps {
    totals?: AgingTotals
    loading?: boolean
    selected: AgingBucket | null
    onSelect: (bucket: AgingBucket | null) => void
}

/** Lo que se debe por días de vencido; cada tarjeta filtra los clientes */
const AgingCards = ({
    totals,
    loading,
    selected,
    onSelect,
}: AgingCardsProps) => (
    <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
            label="Total por cobrar"
            value={formatCurrency(totals?.total ?? 0)}
            loading={loading}
            selected={selected === null}
            onClick={() => onSelect(null)}
        />
        {AGING_BUCKETS.map((bucket) => (
            <StatCard
                key={bucket}
                label={AGING_BUCKET_LABELS[bucket]}
                value={formatCurrency(totals?.[bucket] ?? 0)}
                tone={AGING_BUCKET_TONES[bucket]}
                loading={loading}
                selected={selected === bucket}
                onClick={() => onSelect(selected === bucket ? null : bucket)}
            />
        ))}
    </div>
)

export default AgingCards
