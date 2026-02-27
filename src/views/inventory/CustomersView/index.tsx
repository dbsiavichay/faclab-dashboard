import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    useCustomers,
    useDeleteCustomer,
    useActivateCustomer,
    useDeactivateCustomer,
} from '@/hooks'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import type { ColumnDef } from '@tanstack/react-table'
import type { Customer } from '@/services/CustomerService'
import { TAX_TYPE_LABELS } from '@/services/CustomerService'
import CustomerForm from './CustomerForm'
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineEye,
} from 'react-icons/hi'

const { Tr, Th, Td, THead, TBody } = Table

const CustomersView = () => {
    const navigate = useNavigate()
    const { data: customers = [], isLoading } = useCustomers()
    const deleteCustomer = useDeleteCustomer()
    const activateCustomer = useActivateCustomer()
    const deactivateCustomer = useDeactivateCustomer()

    const [formOpen, setFormOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null
    )
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
        null
    )

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer)
        setFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedCustomer(null)
        setFormOpen(true)
    }

    const handleCloseForm = () => {
        setFormOpen(false)
        setSelectedCustomer(null)
    }

    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!customerToDelete) return

        try {
            await deleteCustomer.mutateAsync(customerToDelete.id)
            toast.push(
                <Notification title="Cliente eliminado" type="success">
                    El cliente se eliminó correctamente
                </Notification>,
                { placement: 'top-center' }
            )
            setDeleteDialogOpen(false)
            setCustomerToDelete(null)
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.detail ||
                        'Error al eliminar el cliente'}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const handleToggleStatus = async (customer: Customer) => {
        try {
            if (customer.isActive) {
                await deactivateCustomer.mutateAsync(customer.id)
                toast.push(
                    <Notification title="Cliente desactivado" type="info">
                        El cliente se desactivó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            } else {
                await activateCustomer.mutateAsync(customer.id)
                toast.push(
                    <Notification title="Cliente activado" type="success">
                        El cliente se activó correctamente
                    </Notification>,
                    { placement: 'top-center' }
                )
            }
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.detail ||
                        'Error al cambiar el estado del cliente'}
                </Notification>,
                { placement: 'top-center' }
            )
        }
    }

    const columns: ColumnDef<Customer>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: 'Nombre',
            accessorKey: 'name',
        },
        {
            header: 'Tax ID',
            accessorKey: 'taxId',
        },
        {
            header: 'Tipo',
            accessorKey: 'taxType',
            cell: ({ row }) => {
                return TAX_TYPE_LABELS[row.original.taxType]
            },
        },
        {
            header: 'Email',
            accessorKey: 'email',
            cell: ({ row }) => row.original.email || '-',
        },
        {
            header: 'Teléfono',
            accessorKey: 'phone',
            cell: ({ row }) => row.original.phone || '-',
        },
        {
            header: 'Ciudad',
            accessorKey: 'city',
            cell: ({ row }) => row.original.city || '-',
        },
        {
            header: 'Estado',
            accessorKey: 'isActive',
            cell: ({ row }) => {
                return (
                    <Badge
                        content={row.original.isActive ? 'Activo' : 'Inactivo'}
                        className={
                            row.original.isActive
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
                        }
                    />
                )
            },
        },
        {
            header: 'Acciones',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlineEye />}
                            onClick={() =>
                                navigate(`/customers/${row.original.id}`)
                            }
                        />
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlinePencil />}
                            onClick={() => handleEdit(row.original)}
                        />
                        <Button
                            size="sm"
                            variant="plain"
                            icon={
                                row.original.isActive ? (
                                    <HiOutlineXCircle />
                                ) : (
                                    <HiOutlineCheckCircle />
                                )
                            }
                            onClick={() => handleToggleStatus(row.original)}
                        />
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlineTrash />}
                            onClick={() => handleDeleteClick(row.original)}
                        />
                    </div>
                )
            },
        },
    ]

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3>Clientes</h3>
                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={handleCreate}
                >
                    Nuevo Cliente
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
                                {columns.map((column) => (
                                    <Th key={column.header as string}>
                                        {column.header as string}
                                    </Th>
                                ))}
                            </Tr>
                        </THead>
                        <TBody>
                            {customers.length === 0 ? (
                                <Tr>
                                    <Td
                                        colSpan={columns.length}
                                        className="text-center py-8"
                                    >
                                        No hay clientes registrados
                                    </Td>
                                </Tr>
                            ) : (
                                customers.map((customer) => (
                                    <Tr key={customer.id}>
                                        <Td>{customer.id}</Td>
                                        <Td>{customer.name}</Td>
                                        <Td>{customer.taxId}</Td>
                                        <Td>
                                            {TAX_TYPE_LABELS[customer.taxType]}
                                        </Td>
                                        <Td>{customer.email || '-'}</Td>
                                        <Td>{customer.phone || '-'}</Td>
                                        <Td>{customer.city || '-'}</Td>
                                        <Td>
                                            <Badge
                                                content={customer.isActive ? 'Activo' : 'Inactivo'}
                                                className={
                                                    customer.isActive
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
                                                    icon={<HiOutlinePencil />}
                                                    onClick={() =>
                                                        handleEdit(customer)
                                                    }
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={
                                                        customer.isActive ? (
                                                            <HiOutlineXCircle />
                                                        ) : (
                                                            <HiOutlineCheckCircle />
                                                        )
                                                    }
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            customer
                                                        )
                                                    }
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    icon={<HiOutlineTrash />}
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            customer
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
            <CustomerForm
                open={formOpen}
                onClose={handleCloseForm}
                customer={selectedCustomer}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <h5 className="mb-4">Confirmar eliminación</h5>
                <p className="mb-6">
                    ¿Está seguro que desea eliminar el cliente{' '}
                    <strong>{customerToDelete?.name}</strong>? Esta acción no
                    se puede deshacer.
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
                        onClick={handleDeleteConfirm}
                        loading={deleteCustomer.isPending}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default CustomersView
