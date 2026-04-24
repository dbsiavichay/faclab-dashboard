import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useAddCashMovement } from '@/hooks/usePOS'
import { useShift } from './useShift'
import type { CashMovementType } from '@/services/pos/POSTypes'

interface CashMovementDialogProps {
    isOpen: boolean
    onClose: () => void
}

const CashMovementDialog = ({ isOpen, onClose }: CashMovementDialogProps) => {
    const shift = useShift()
    const addCashMovement = useAddCashMovement()

    const [type, setType] = useState<CashMovementType>('IN')
    const [amount, setAmount] = useState<string>('')
    const [reason, setReason] = useState('')

    const handleSubmit = async () => {
        const numAmount = Number(amount)
        if (numAmount <= 0) return

        try {
            await addCashMovement.mutateAsync({
                shiftId: shift.id,
                data: {
                    type,
                    amount: numAmount,
                    reason: reason || undefined,
                },
            })
            toast.push(
                <Notification type="success" title="Movimiento registrado" />,
                { placement: 'top-end' }
            )
            resetForm()
            onClose()
        } catch {
            toast.push(
                <Notification
                    type="danger"
                    title="Error al registrar movimiento"
                />,
                { placement: 'top-end' }
            )
        }
    }

    const resetForm = () => {
        setType('IN')
        setAmount('')
        setReason('')
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            width={400}
            overlayClassName="!z-[60]"
            onClose={handleClose}
        >
            <h4 className="text-lg font-bold mb-4">Movimiento de Caja</h4>

            <div className="flex gap-2 mb-4">
                <Button
                    block
                    variant={type === 'IN' ? 'solid' : 'default'}
                    className={
                        type === 'IN'
                            ? '!bg-emerald-500 !border-emerald-500 text-white'
                            : ''
                    }
                    onClick={() => setType('IN')}
                >
                    Entrada
                </Button>
                <Button
                    block
                    variant={type === 'OUT' ? 'solid' : 'default'}
                    className={
                        type === 'OUT'
                            ? '!bg-red-500 !border-red-500 text-white'
                            : ''
                    }
                    onClick={() => setType('OUT')}
                >
                    Salida
                </Button>
            </div>

            <div>
                <label
                    htmlFor="cash-amount"
                    className="block text-sm font-medium mb-1"
                >
                    Monto
                </label>
                <Input
                    id="cash-amount"
                    type="number"
                    prefix="$"
                    value={amount}
                    placeholder="0.00"
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>

            <div className="mt-3">
                <label
                    htmlFor="cash-reason"
                    className="block text-sm font-medium mb-1"
                >
                    Razon (opcional)
                </label>
                <Input
                    id="cash-reason"
                    value={reason}
                    placeholder="Razon del movimiento"
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>

            <div className="flex gap-2 mt-6">
                <Button block variant="default" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button
                    block
                    variant="solid"
                    loading={addCashMovement.isPending}
                    disabled={!amount || Number(amount) <= 0}
                    onClick={handleSubmit}
                >
                    Registrar
                </Button>
            </div>
        </Dialog>
    )
}

export default CashMovementDialog
