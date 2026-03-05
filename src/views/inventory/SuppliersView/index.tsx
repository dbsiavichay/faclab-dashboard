import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    useSuppliers,
    useDeleteSupplier,
    useActivateSupplier,
    useDeactivateSupplier,
} from '@/hooks'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
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

const SuppliersView = () => {
    const navigate = useNavigate()
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

    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const offset = (pageIndex - 1) * pageSize

    const { data, isLoading } = useSuppliers({ limit: pageSize, offset })
    const suppliers = data?.items ?? []
    const total = data?.pagination?.total ?? 0

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

    const columns: ColumnDef<Supplier>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (props) => {
                const { row } = props
                return <span className="font-medium">#{row.original.id}</span>
            },
        },
        {
            header: 'Nombre',
            accessorKey: 'name',
            cell: (props) => {
                const { row } = props
                return (
                    <span className="font-semibold">{row.original.name}</span>
                )
            },
        },
        {
            header: 'Tax ID',
            accessorKey: 'taxId',
        },
        {
            header: 'Tipo',
            accessorKey: 'taxType',
            cell: ({ row }) => TAX_TYPE_LABELS[row.original.taxType],
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
            cell: ({ row }) => (
                <Badge
                    content={row.original.isActive ? 'Activo' : 'Inactivo'}
                    className={
                        row.original.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
                    }
                />
            ),
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<HiOutlineEye />}
                        onClick={() =>
                            navigate(`/suppliers/${row.original.id}`)
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
            ),
        },
    ]

    return (
        <>
            <Card>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="text-lg font-semibold">
                                Proveedores
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona los proveedores registrados
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiOutlinePlus />}
                            onClick={handleCreate}
                        >
                            Nuevo Proveedor
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={suppliers}
                        loading={isLoading}
                        pagingData={{ total, pageIndex, pageSize }}
                        onPaginationChange={setPageIndex}
                        onSelectChange={(size) => {
                            setPageSize(size)
                            setPageIndex(1)
                        }}
                    />
                </div>
            </Card>

            <SupplierForm
                open={formOpen}
                supplier={selectedSupplier}
                onClose={handleCloseForm}
            />

            <Dialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onRequestClose={() => setDeleteDialogOpen(false)}
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
        </>
    )
}

export default SuppliersView
