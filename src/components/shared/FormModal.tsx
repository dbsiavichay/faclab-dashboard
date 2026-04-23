import type { ReactNode } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'

interface FormModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit?: () => void
    formId?: string
    title: string
    isSubmitting?: boolean
    children: ReactNode
}

const FormModal = ({
    isOpen,
    onClose,
    onSubmit,
    formId,
    title,
    isSubmitting = false,
    children,
}: FormModalProps) => (
    <Dialog
        isOpen={isOpen}
        shouldCloseOnEsc={!isSubmitting}
        shouldCloseOnOverlayClick={!isSubmitting}
        onClose={onClose}
        onRequestClose={onClose}
    >
        <div className="flex flex-col h-full justify-between">
            <h5 className="mb-4">{title}</h5>
            <div className="flex-1 max-h-[60vh] overflow-y-auto pr-1">
                {children}
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <Button
                    type="button"
                    variant="plain"
                    disabled={isSubmitting}
                    onClick={onClose}
                >
                    Cancelar
                </Button>
                {formId ? (
                    <Button
                        type="submit"
                        form={formId}
                        variant="solid"
                        loading={isSubmitting}
                    >
                        Guardar
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="solid"
                        loading={isSubmitting}
                        onClick={onSubmit}
                    >
                        Guardar
                    </Button>
                )}
            </div>
        </div>
    </Dialog>
)

export default FormModal
