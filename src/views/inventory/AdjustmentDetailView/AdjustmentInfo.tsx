import Card from '@/components/ui/Card'
import { formatDatetime } from '@shared/lib/format'
import { ADJUSTMENT_REASON_LABELS } from '@/services/AdjustmentService'
import type { Adjustment } from '@/services/AdjustmentService'

type Props = {
    adjustment: Adjustment
    warehouseName: string
}

export const AdjustmentInfo = ({ adjustment, warehouseName }: Props) => (
    <Card>
        <h5 className="mb-4">Información del Ajuste</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <p className="text-sm text-gray-500">Almacén</p>
                <p className="font-medium">{warehouseName}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Motivo</p>
                <p className="font-medium">
                    {ADJUSTMENT_REASON_LABELS[adjustment.reason]}
                </p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Responsable</p>
                <p className="font-medium">{adjustment.adjustedBy || '-'}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Fecha de Creación</p>
                <p className="font-medium">
                    {adjustment.createdAt
                        ? formatDatetime(adjustment.createdAt)
                        : '-'}
                </p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Fecha de Ajuste</p>
                <p className="font-medium">
                    {adjustment.adjustmentDate
                        ? formatDatetime(adjustment.adjustmentDate)
                        : '-'}
                </p>
            </div>
        </div>
        {adjustment.notes && (
            <div className="mt-4">
                <p className="text-sm text-gray-500">Notas</p>
                <p className="font-medium">{adjustment.notes}</p>
            </div>
        )}
    </Card>
)
