import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useChangeSerialNumberStatus } from '@/hooks/useSerialNumbers'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { SerialNumber, SerialStatus } from '@/services/SerialNumberService'
import { SERIAL_STATUS_LABELS } from '@/services/SerialNumberService'

interface StatusChangeDialogProps {
    open: boolean
    onClose: () => void
    serialNumber: SerialNumber | null
}

const statusOptions = (Object.keys(SERIAL_STATUS_LABELS) as SerialStatus[]).map(
    (key) => ({
        value: key,
        label: SERIAL_STATUS_LABELS[key],
    })
)

const StatusChangeDialog = ({
    open,
    onClose,
    serialNumber,
}: StatusChangeDialogProps) => {
    const [newStatus, setNewStatus] = useState<SerialStatus>('AVAILABLE')
    const changeStatus = useChangeSerialNumberStatus()

    useEffect(() => {
        if (serialNumber) {
            setNewStatus(serialNumber.status)
        }
    }, [serialNumber, open])

    const handleSubmit = async () => {
        if (!serialNumber) return

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

    return (
        <Dialog
            isOpen={open}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <h5 className="mb-4">Cambiar Estado</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Serial: <strong>{serialNumber?.serialNumber}</strong>
            </p>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                    Nuevo Estado
                </label>
                <Select
                    options={statusOptions}
                    value={statusOptions.find((o) => o.value === newStatus)}
                    onChange={(option) =>
                        setNewStatus(
                            (option as { value: SerialStatus })?.value ||
                                'AVAILABLE'
                        )
                    }
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button
                    variant="plain"
                    disabled={changeStatus.isPending}
                    onClick={handleClose}
                >
                    Cancelar
                </Button>
                <Button
                    variant="solid"
                    loading={changeStatus.isPending}
                    onClick={handleSubmit}
                >
                    Cambiar Estado
                </Button>
            </div>
        </Dialog>
    )
}

export default StatusChangeDialog
