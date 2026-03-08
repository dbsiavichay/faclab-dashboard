import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useChangeSerialNumberStatus } from '@/hooks/useSerialNumbers'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { SerialNumber, SerialStatus } from '@/services/SerialNumberService'
import {
    SERIAL_STATUS_LABELS,
    VALID_TRANSITIONS,
} from '@/services/SerialNumberService'

interface StatusChangeDialogProps {
    open: boolean
    onClose: () => void
    serialNumber: SerialNumber | null
}

const StatusChangeDialog = ({
    open,
    onClose,
    serialNumber,
}: StatusChangeDialogProps) => {
    const [newStatus, setNewStatus] = useState<SerialStatus | ''>('')
    const changeStatus = useChangeSerialNumberStatus()

    const validTargets = serialNumber
        ? VALID_TRANSITIONS[serialNumber.status]
        : []

    const statusOptions = validTargets.map((s) => ({
        value: s,
        label: SERIAL_STATUS_LABELS[s],
    }))

    useEffect(() => {
        if (serialNumber) {
            const targets = VALID_TRANSITIONS[serialNumber.status]
            setNewStatus(targets.length > 0 ? targets[0] : '')
        } else {
            setNewStatus('')
        }
    }, [serialNumber, open])

    const handleSubmit = async () => {
        if (!serialNumber || !newStatus) return

        try {
            await changeStatus.mutateAsync({
                id: serialNumber.id,
                status: newStatus,
            })

            toast.push(
                <Notification title="Estado actualizado" type="success">
                    El estado se cambió a {SERIAL_STATUS_LABELS[newStatus]}
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(
                error,
                'Error al cambiar el estado'
            )

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleClose = () => {
        if (!changeStatus.isPending) {
            onClose()
        }
    }

    const noTransitions = validTargets.length === 0

    return (
        <Dialog
            isOpen={open}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <h5 className="mb-4">Cambiar Estado</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Serial: <strong>{serialNumber?.serialNumber}</strong>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Estado actual:{' '}
                <strong>
                    {serialNumber
                        ? SERIAL_STATUS_LABELS[serialNumber.status]
                        : ''}
                </strong>
            </p>

            {noTransitions ? (
                <p className="text-sm text-gray-500 mb-6">
                    Este serial se encuentra en estado final y no permite
                    transiciones.
                </p>
            ) : (
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                        Nuevo Estado
                    </label>
                    <Select
                        options={statusOptions}
                        value={statusOptions.find((o) => o.value === newStatus)}
                        onChange={(option) =>
                            setNewStatus(
                                (option as { value: SerialStatus })?.value || ''
                            )
                        }
                    />
                </div>
            )}

            <div className="flex justify-end gap-2">
                <Button
                    variant="plain"
                    disabled={changeStatus.isPending}
                    onClick={handleClose}
                >
                    Cancelar
                </Button>
                {!noTransitions && (
                    <Button
                        variant="solid"
                        loading={changeStatus.isPending}
                        disabled={!newStatus}
                        onClick={handleSubmit}
                    >
                        Cambiar Estado
                    </Button>
                )}
            </div>
        </Dialog>
    )
}

export default StatusChangeDialog
