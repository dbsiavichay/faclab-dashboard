import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LabeledField from '@/components/shared/LabeledField'
import { PERMISSION } from '@/constants/permissions.constant'
import { useCan } from '@/stores'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import {
    PRICE_LIST_ERROR_MESSAGES,
    PriceListSelect,
    usePriceList,
} from '@features/price-lists'
import { useCustomerMutations } from '../hooks/useCustomers'
import type { Customer } from '../model/types'

interface CustomerPriceListCardProps {
    customer: Customer
}

/**
 * La lista de precios con que compra el cliente (S5.3): la de un maestro o un
 * contratista. La cambia quien cambia precios (`product:write`), no quien edita
 * clientes, y queda en la bitácora.
 */
const CustomerPriceListCard = ({ customer }: CustomerPriceListCardProps) => {
    const canChange = useCan(PERMISSION.PRODUCT_WRITE)
    const current = customer.priceListId ?? null
    const [selected, setSelected] = useState<number | null>(current)
    const { data: list } = usePriceList(current ?? 0)
    const { setPriceList } = useCustomerMutations()

    const handleSave = async () => {
        try {
            await setPriceList.mutateAsync({
                id: customer.id,
                priceListId: selected,
            })
            notifySuccess('Lista de precios actualizada')
        } catch (err) {
            notifyError(err, 'No se pudo cambiar la lista de precios', {
                messages: PRICE_LIST_ERROR_MESSAGES,
            })
        }
    }

    return (
        <Card>
            <h5 className="mb-2">Lista de precios</h5>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Sin lista, compra con la de la sucursal o con la general.
            </p>
            {canChange ? (
                <div className="flex flex-wrap items-end gap-2">
                    <LabeledField label="Lista" className="w-full sm:w-72">
                        <PriceListSelect
                            value={selected}
                            isDisabled={setPriceList.isPending}
                            onChange={setSelected}
                        />
                    </LabeledField>
                    <Button
                        size="sm"
                        variant="solid"
                        disabled={selected === current}
                        loading={setPriceList.isPending}
                        onClick={handleSave}
                    >
                        Guardar
                    </Button>
                </div>
            ) : (
                <p className="font-medium">
                    {current ? list?.name ?? '…' : 'Ninguna (la general)'}
                </p>
            )}
        </Card>
    )
}

export default CustomerPriceListCard
