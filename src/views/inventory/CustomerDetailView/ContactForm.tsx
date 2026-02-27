import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useCreateCustomerContact,
    useUpdateCustomerContact,
} from '@/hooks/useCustomerContacts'
import type {
    CustomerContact,
    CustomerContactInput,
} from '@/services/CustomerContactService'

interface ContactFormProps {
    open: boolean
    onClose: () => void
    customerId: number
    contact?: CustomerContact | null
}

const ContactForm = ({
    open,
    onClose,
    customerId,
    contact,
}: ContactFormProps) => {
    const [formData, setFormData] = useState<CustomerContactInput>({
        name: '',
        role: '',
        email: '',
        phone: '',
    })

    const createContact = useCreateCustomerContact()
    const updateContact = useUpdateCustomerContact()

    const isEdit = !!contact

    useEffect(() => {
        if (contact) {
            setFormData({
                name: contact.name,
                role: contact.role || '',
                email: contact.email || '',
                phone: contact.phone || '',
            })
        } else {
            setFormData({
                name: '',
                role: '',
                email: '',
                phone: '',
            })
        }
    }, [contact, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEdit && contact) {
                await updateContact.mutateAsync({
                    id: contact.id,
                    contact: formData,
                })
            } else {
                await createContact.mutateAsync({
                    customerId,
                    contact: formData,
                })
            }

            toast.push(
                <Notification
                    title={isEdit ? 'Contacto actualizado' : 'Contacto creado'}
                    type="success"
                >
                    {isEdit
                        ? 'El contacto se actualizó correctamente'
                        : 'El contacto se creó correctamente'}
                </Notification>,
                { placement: 'top-center' }
            )

            onClose()
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail ||
                error.message ||
                'Error al guardar el contacto'

            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )

            console.error('Error saving contact:', error)
        }
    }

    const handleClose = () => {
        if (!createContact.isPending && !updateContact.isPending) {
            onClose()
        }
    }

    return (
        <Dialog
            isOpen={open}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="flex flex-col h-full justify-between">
                <h5 className="mb-4">
                    {isEdit ? 'Editar Contacto' : 'Nuevo Contacto'}
                </h5>

                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="text"
                                placeholder="Nombre del contacto"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Cargo
                            </label>
                            <Input
                                type="text"
                                placeholder="Ej: Gerente de Compras"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        role: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="email@ejemplo.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Teléfono
                            </label>
                            <Input
                                type="text"
                                placeholder="0987654321"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="plain"
                            disabled={
                                createContact.isPending ||
                                updateContact.isPending
                            }
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={
                                createContact.isPending ||
                                updateContact.isPending
                            }
                        >
                            {isEdit ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default ContactForm
