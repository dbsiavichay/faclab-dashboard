import Select from '@/components/ui/Select'
import { usePriceListsList } from '../hooks/usePriceLists'

interface PriceListSelectProps {
    inputId?: string
    value: number | null
    isDisabled?: boolean
    /** What "no list" means where it is chosen */
    noneLabel?: string
    onChange: (priceListId: number | null) => void
}

type Option = { value: number | null; label: string }

/**
 * Elige la lista de un cliente o de una sucursal (S5.3). La general no se
 * asigna: sin lista, la venta ya la usa.
 */
const PriceListSelect = ({
    inputId,
    value,
    isDisabled,
    noneLabel = 'Ninguna (la general)',
    onChange,
}: PriceListSelectProps) => {
    const { data, isLoading } = usePriceListsList({ limit: 1000 })
    const options: Option[] = [
        { value: null, label: noneLabel },
        ...(data?.items ?? [])
            .filter((list) => !list.isDefault)
            .map((list) => ({
                value: list.id,
                label: list.isActive ? list.name : `${list.name} (inactiva)`,
            })),
    ]

    return (
        <Select<Option>
            inputId={inputId}
            options={options}
            value={options.find((o) => o.value === value) ?? null}
            isLoading={isLoading}
            isDisabled={isDisabled}
            onChange={(option) => onChange(option?.value ?? null)}
        />
    )
}

export default PriceListSelect
