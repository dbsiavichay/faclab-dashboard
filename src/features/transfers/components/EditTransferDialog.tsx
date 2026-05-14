import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import type { TransferUpdateInput } from '../model/types'

type Props = {
    open: boolean
    editData: TransferUpdateInput
    isPending: boolean
    onClose: () => void
    onChange: (data: TransferUpdateInput) => void
    onSave: () => void
}

export const EditTransferDialog = ({
    open,
    editData,
    isPending,
    onClose,
    onChange,
    onSave,
}: Props) => (
    <Dialog
        isOpen={open}
        width={500}
        onClose={onClose}
        onRequestClose={onClose}
    >
        <h5 className="mb-4">Editar Transferencia</h5>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">
                    Solicitado por
                </label>
                <Input
                    type="text"
                    placeholder="Nombre del solicitante"
                    value={editData.requestedBy || ''}
                    onChange={(e) =>
                        onChange({ ...editData, requestedBy: e.target.value })
                    }
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <Input
                    textArea
                    placeholder="Observaciones"
                    value={editData.notes || ''}
                    onChange={(e) =>
                        onChange({ ...editData, notes: e.target.value })
                    }
                />
            </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
            <Button variant="plain" onClick={onClose}>
                Cancelar
            </Button>
            <Button variant="solid" loading={isPending} onClick={onSave}>
                Guardar
            </Button>
        </div>
    </Dialog>
)
