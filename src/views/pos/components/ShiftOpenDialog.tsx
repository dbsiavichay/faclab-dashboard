import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useOpenShift } from '@/hooks/usePOS'
import { useAuthStore } from '@/stores/useAuthStore'

const ShiftOpenDialog = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const openShift = useOpenShift()

    const [cashierName, setCashierName] = useState(user?.userName || '')
    const [openingBalance, setOpeningBalance] = useState<string>('0')
    const [notes, setNotes] = useState('')

    const handleSubmit = async () => {
        await openShift.mutateAsync({
            cashierName,
            openingBalance: Number(openingBalance),
            notes: notes || undefined,
        })
    }

    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-6 text-center">
                    Abrir Turno
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Debe abrir un turno para usar el POS
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Nombre del cajero
                        </label>
                        <Input
                            value={cashierName}
                            placeholder="Nombre del cajero"
                            onChange={(e) => setCashierName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Saldo inicial
                        </label>
                        <Input
                            type="number"
                            value={openingBalance}
                            prefix="$"
                            onChange={(e) => setOpeningBalance(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Notas (opcional)
                        </label>
                        <Input
                            value={notes}
                            placeholder="Notas opcionales"
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <Button
                        block
                        variant="default"
                        onClick={() => navigate('/home')}
                    >
                        Volver al Dashboard
                    </Button>
                    <Button
                        block
                        variant="solid"
                        loading={openShift.isPending}
                        disabled={!cashierName}
                        onClick={handleSubmit}
                    >
                        Abrir Turno
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ShiftOpenDialog
