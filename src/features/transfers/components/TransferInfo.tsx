import Card from '@/components/ui/Card'
import { formatDatetime } from '@shared/lib/format'
import type { Transfer } from '../model/types'

type Props = {
    transfer: Transfer
    sourceName: string
    destinationName: string
}

export const TransferInfo = ({
    transfer,
    sourceName,
    destinationName,
}: Props) => (
    <Card>
        <h5 className="mb-4">Información de la Transferencia</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <p className="text-sm text-gray-500">Ubicación Origen</p>
                <p className="font-medium">{sourceName}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Ubicación Destino</p>
                <p className="font-medium">{destinationName}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Solicitado por</p>
                <p className="font-medium">{transfer.requestedBy || '-'}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Fecha de Creación</p>
                <p className="font-medium">
                    {transfer.createdAt
                        ? formatDatetime(transfer.createdAt)
                        : '-'}
                </p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Fecha de Transferencia</p>
                <p className="font-medium">
                    {transfer.transferDate
                        ? formatDatetime(transfer.transferDate)
                        : '-'}
                </p>
            </div>
        </div>
        {transfer.notes && (
            <div className="mt-4">
                <p className="text-sm text-gray-500">Notas</p>
                <p className="font-medium">{transfer.notes}</p>
            </div>
        )}
    </Card>
)
