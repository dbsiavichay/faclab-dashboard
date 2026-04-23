import ConfirmDialog from './ConfirmDialog'

interface DeleteConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    itemName?: string
    isDeleting?: boolean
}

const DeleteConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    isDeleting = false,
}: DeleteConfirmDialogProps) => (
    <ConfirmDialog
        isOpen={isOpen}
        type="danger"
        title="Eliminar"
        cancelText="Cancelar"
        confirmText={isDeleting ? 'Eliminando...' : 'Eliminar'}
        confirmButtonColor="red-600"
        onClose={onClose}
        onCancel={onClose}
        onConfirm={onConfirm}
    >
        <p>
            ¿Eliminar
            {itemName ? ` "${itemName}"` : ' este elemento'}? Esta acción no se
            puede deshacer.
        </p>
    </ConfirmDialog>
)

export default DeleteConfirmDialog
