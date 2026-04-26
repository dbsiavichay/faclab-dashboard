import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useResetUserPassword } from '@/hooks/useAdminUsers'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { AdminUserResponse } from '@/@types/auth'

interface ResetPasswordModalProps {
    open: boolean
    onClose: () => void
    user: AdminUserResponse | null
}

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#%'

const generatePassword = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(12)))
        .map((b) => CHARS[b % CHARS.length])
        .join('')

const ResetPasswordModal = ({
    open,
    user,
    onClose,
}: ResetPasswordModalProps) => {
    const [password, setPassword] = useState('')
    const [done, setDone] = useState(false)
    const resetPassword = useResetUserPassword()

    useEffect(() => {
        if (open) {
            setPassword(generatePassword())
            setDone(false)
        }
    }, [open])

    const handleClose = () => {
        if (!resetPassword.isPending) {
            setDone(false)
            onClose()
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(password)
        toast.push(<Notification type="success" title="Contraseña copiada" />, {
            placement: 'top-end',
        })
    }

    const handleSubmit = async () => {
        if (!user) return
        try {
            await resetPassword.mutateAsync({
                id: user.id,
                newPassword: password,
            })
            setDone(true)
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={getErrorMessage(
                        err,
                        'Error al resetear la contraseña'
                    )}
                />,
                { placement: 'top-end' }
            )
        }
    }

    return (
        <Dialog
            isOpen={open}
            width={480}
            shouldCloseOnEsc={!resetPassword.isPending}
            shouldCloseOnOverlayClick={!resetPassword.isPending}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <h5 className="mb-1">Resetear contraseña</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Usuario:{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {user?.username}
                </span>
            </p>

            {!done ? (
                <>
                    <p className="text-sm mb-3">
                        Se generó una contraseña temporal. Puedes editarla antes
                        de confirmar.
                    </p>
                    <div className="flex gap-2 mb-6">
                        <Input
                            className="font-mono"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            variant="default"
                            type="button"
                            onClick={() => setPassword(generatePassword())}
                        >
                            Regenerar
                        </Button>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="plain"
                            disabled={resetPassword.isPending}
                            type="button"
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="solid"
                            loading={resetPassword.isPending}
                            disabled={password.length < 8}
                            type="button"
                            onClick={handleSubmit}
                        >
                            Resetear
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div className="p-3 mb-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-sm">
                        Comparte esta contraseña con el usuario por un canal
                        seguro. No la podrás ver de nuevo.
                    </div>
                    <div className="flex gap-2 mb-6">
                        <Input
                            readOnly
                            className="font-mono"
                            value={password}
                        />
                        <Button
                            variant="solid"
                            type="button"
                            onClick={handleCopy}
                        >
                            Copiar
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            variant="default"
                            type="button"
                            onClick={handleClose}
                        >
                            Cerrar
                        </Button>
                    </div>
                </>
            )}
        </Dialog>
    )
}

export default ResetPasswordModal
