import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    useSuppliers,
    useDeleteSupplier,
    useActivateSupplier,
    useDeactivateSupplier,
} from '@/hooks'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import type { Supplier } from '@/services/SupplierService'
import { TAX_TYPE_LABELS } from '@/services/SupplierService'
import { getErrorMessage } from '@/utils/getErrorMessage'
import SupplierForm from './SupplierForm'
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineEye,
} from 'react-icons/hi'

const { Tr, Th, Td, THead, TBody } = Table

const SuppliersView = () => {
    const navigate = useNavigate()
    const { data: suppliers = [], isLoading } = useSuppliers()
    const deleteSupplier = useDeleteSupplier()
    const activateSupplier = useActivateSupplier()
    const deactivateSupplier = useDeactivateSupplier()

    const [formOpen, setFormOpen] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
        null
    )
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
        null
    )

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier)
        setFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedSupplier(null)
        setFormOpen(true)
    }

    const handleCloseForm = () => {
        setFormOpen(false)
        setSelectedSupplier(null)
    }

    const handleDeleteClick = (supplier: Supplier) => {
        setSupplierToDelete(supplier)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!supplierToDelete) return

        try {
            await deleteSupplier.mutateAsync(supplierToDelete.id)
            toast.push(
                <Notification title="Proveedor eliminado" type="success">
                    El proveedor se eliminó correctamente
                </Notification>,
                { placement: 'top-center' }
            )
            setDeleteDialogOpen(false)
            setSupplierToDelete(null)
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al eliminar el proveedor')}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleToggleStatus = async (supplier: Supplier) => {
        try {
            if (supplier.isActive) {
                await deactivateSupplier.mutateAsync(supplier.id)
                toast.push(
                    <Notification title="Proveedor desactivado" type="info">
                        El proveedor se desactivó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                await activateSupplier.mutateAsync(supplier.id)
                toast.push(
                    <Notification title="Proveedor activado" type="success">
                        El proveedor se activó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            }
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(
                        error,
                        'Error al cambiar el estado del proveedor'
                    )}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3>Proveedores</h3>
                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={handleCreate}
                >
                    Nuevo Proveedor
                </Button>
            </div>

            <Card>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <div>Cargando...</div>
                    </div>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Nombre</Th>
                                <Th>Tax ID</Th>
                                <Th>Tipo</Th>
                                <Th>Email</Th>
                                <Th>Teléfono</Th>
                                <Th>Ciudad</Th>
                                <Th>Estado</Th>
                                <Th>Acciones</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {suppliers.length === 0 ? (
                                <Tr>
                                    <Td
                                        colSpan={9}
                                        className="text-center py-8"
                                    >
                                        No hay proveedores registrados
                                    </Td>
                                </Tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <Tr key={supplier.id}>
                                        <Td>{supplier.id}</Td>
                                        <Td>{supplier.name}</Td>
                                        <Td>{supplier.taxId}</Td>
                                        <Td>
                                            {TAX_TYPE_LABELS[supplier.taxType]}
                                        </Td>
                                        <Td>{supplier.email || '-'}</Td>
                                        <Td>{supplier.phone || '-'}</Td>
                                        <Td>{supplier.city || '-'}</Td>
                                        <Td>
                                            <Badge
                                                content={
                                                    supplier.isActive
                                                        ? 'Activo'
                                                        : 'Inactivo'
                                                }
                                                className={
                                                    supplier.isActive
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
                                                }
                                            />
                                        </Td>
                                        <Td>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={<HiOutlineEye />}
                                                    onClick={() =>
                                                        navigate(
                                                            `/suppliers/${supplier.id}`
                                                        )
                                                    }
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={<HiOutlinePencil />}
                                                    onClick={() =>
                                                        handleEdit(supplier)
                                                    }
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={
                                                        supplier.isActive ? (
                                                            <HiOutlineXCircle />
                                                        ) : (
                                                            <HiOutlineCheckCircle />
                                                        )
                                                    }
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            supplier
                                                        )
                                                    }
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={<HiOutlineTrash />}
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            supplier
                                                        )
                                                    }
                                                />
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </TBody>
                    </Table>
                )}
            </Card>

            {/* Form Modal */}
            <SupplierForm
                open={formOpen}
                supplier={selectedSupplier}
                onClose={handleCloseForm}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <h5 className="mb-4">Confirmar eliminación</h5>
                <p className="mb-6">
                    ¿Está seguro que desea eliminar el proveedor{' '}
                    <strong>{supplierToDelete?.name}</strong>? Esta acción no se
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
                        loading={deleteSupplier.isPending}
                        onClick={handleDeleteConfirm}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default SuppliersView
