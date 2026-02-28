import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSupplier } from '@/hooks/useSuppliers'
import {
    useSupplierContacts,
    useDeleteSupplierContact,
} from '@/hooks/useSupplierContacts'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TAX_TYPE_LABELS } from '@/services/SupplierService'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { SupplierContact } from '@/services/SupplierContactService'
import ContactForm from './ContactForm'
import {
    HiOutlineArrowLeft,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
} from 'react-icons/hi'

const { Tr, Th, Td, THead, TBody } = Table

const SupplierDetailView = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const supplierId = parseInt(id || '0')

    const { data: supplier, isLoading: supplierLoading } =
        useSupplier(supplierId)
    const { data: contacts = [], isLoading: contactsLoading } =
        useSupplierContacts(supplierId)
    const deleteContact = useDeleteSupplierContact()

    const [contactFormOpen, setContactFormOpen] = useState(false)
    const [selectedContact, setSelectedContact] =
        useState<SupplierContact | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [contactToDelete, setContactToDelete] =
        useState<SupplierContact | null>(null)

    const handleCreateContact = () => {
        setSelectedContact(null)
        setContactFormOpen(true)
    }

    const handleEditContact = (contact: SupplierContact) => {
        setSelectedContact(contact)
        setContactFormOpen(true)
    }

    const handleCloseContactForm = () => {
        setContactFormOpen(false)
        setSelectedContact(null)
    }

    const handleDeleteClick = (contact: SupplierContact) => {
        setContactToDelete(contact)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!contactToDelete) return

        try {
            await deleteContact.mutateAsync({
                id: contactToDelete.id,
                supplierId: supplierId,
            })
            toast.push(
                <Notification title="Contacto eliminado" type="success">
                    El contacto se eliminó correctamente
                </Notification>,
                { placement: 'top-center' }
            )
            setDeleteDialogOpen(false)
            setContactToDelete(null)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al eliminar el contacto')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    if (supplierLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div>Cargando...</div>
            </div>
        )
    }

    if (!supplier) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h4 className="mb-4">Proveedor no encontrado</h4>
                <Button
                    variant="solid"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/suppliers')}
                >
                    Volver a Proveedores
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/suppliers')}
                    />
                    <h3>{supplier.name}</h3>
                    <Badge
                        content={supplier.isActive ? 'Activo' : 'Inactivo'}
                        className={
                            supplier.isActive
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
                        }
                    />
                </div>
            </div>

            {/* Supplier Information */}
            <Card>
                <h5 className="mb-4">Información del Proveedor</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Tax ID</p>
                        <p className="font-medium">{supplier.taxId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tipo de ID</p>
                        <p className="font-medium">
                            {TAX_TYPE_LABELS[supplier.taxType]}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{supplier.email || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium">{supplier.phone || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Ciudad</p>
                        <p className="font-medium">{supplier.city || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Provincia/Estado
                        </p>
                        <p className="font-medium">{supplier.state || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">País</p>
                        <p className="font-medium">{supplier.country || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Límite de Crédito
                        </p>
                        <p className="font-medium">
                            {supplier.creditLimit
                                ? `$${supplier.creditLimit.toFixed(2)}`
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Términos de Pago
                        </p>
                        <p className="font-medium">
                            {supplier.paymentTerms
                                ? `${supplier.paymentTerms} días`
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Tiempo de Entrega
                        </p>
                        <p className="font-medium">
                            {supplier.leadTimeDays
                                ? `${supplier.leadTimeDays} días`
                                : '-'}
                        </p>
                    </div>
                </div>
                {supplier.address && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Dirección</p>
                        <p className="font-medium">{supplier.address}</p>
                    </div>
                )}
                {supplier.notes && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Notas</p>
                        <p className="font-medium">{supplier.notes}</p>
                    </div>
                )}
            </Card>

            {/* Contacts */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h5>Contactos ({contacts.length})</h5>
                    <Button
                        size="sm"
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        onClick={handleCreateContact}
                    >
                        Nuevo Contacto
                    </Button>
                </div>

                {contactsLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <div>Cargando contactos...</div>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay contactos registrados para este proveedor
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Nombre</Th>
                                <Th>Cargo</Th>
                                <Th>Email</Th>
                                <Th>Teléfono</Th>
                                <Th>Acciones</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {contacts.map((contact) => (
                                <Tr key={contact.id}>
                                    <Td>{contact.name}</Td>
                                    <Td>{contact.role || '-'}</Td>
                                    <Td>{contact.email || '-'}</Td>
                                    <Td>{contact.phone || '-'}</Td>
                                    <Td>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="plain"
                                                icon={<HiOutlinePencil />}
                                                onClick={() =>
                                                    handleEditContact(contact)
                                                }
                                            />
                                            <Button
                                                size="sm"
                                                variant="plain"
                                                icon={<HiOutlineTrash />}
                                                onClick={() =>
                                                    handleDeleteClick(contact)
                                                }
                                            />
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>

            {/* Contact Form Modal */}
            <ContactForm
                open={contactFormOpen}
                supplierId={supplierId}
                contact={selectedContact}
                onClose={handleCloseContactForm}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <h5 className="mb-4">Confirmar eliminación</h5>
                <p className="mb-6">
                    ¿Está seguro que desea eliminar el contacto{' '}
                    <strong>{contactToDelete?.name}</strong>? Esta acción no se
                    puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        onClick={() => setDeleteDialogOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={deleteContact.isPending}
                        onClick={handleDeleteConfirm}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default SupplierDetailView
