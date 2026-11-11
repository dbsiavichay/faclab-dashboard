import { Link } from 'react-router-dom'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge, { ActiveBadge } from '@/components/shared/StatusBadge'
import { DeleteConfirmDialog, FormModal } from '@/components/shared'
import useCrudOperations from '@shared/hooks/useCrudOperations'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { PERMISSION } from '@/constants/permissions.constant'
import { useCan } from '@/stores'
import {
    usePriceListMutations,
    usePriceListsList,
} from '../hooks/usePriceLists'
import PriceListForm from '../components/PriceListForm'
import { validityLabel } from '../model/validity'
import {
    PRICE_LIST_ERROR_MESSAGES,
    type PriceList,
    type PriceListInput,
} from '../model/types'

const FORM_ID = 'price-list-form'

const PriceListsPage = () => {
    const canWrite = useCan(PERMISSION.PRODUCT_WRITE)
    const crud = useCrudOperations<PriceList>()
    const { data, isLoading, error, refetch } = usePriceListsList({
        limit: crud.pageSize,
        offset: (crud.pageIndex - 1) * crud.pageSize,
    })
    const { create, update, delete: remove } = usePriceListMutations()
    const isSaving = create.isPending || update.isPending

    const handleSubmit = async (values: PriceListInput) => {
        try {
            if (crud.isEditOpen && crud.selectedItem) {
                await update.mutateAsync({
                    id: crud.selectedItem.id,
                    data: values,
                })
                notifySuccess('Lista actualizada')
            } else {
                await create.mutateAsync(values)
                notifySuccess('Lista creada')
            }
            crud.closeAll()
        } catch (err) {
            notifyError(err, 'No se pudo guardar la lista', {
                messages: PRICE_LIST_ERROR_MESSAGES,
            })
        }
    }

    const handleDelete = async () => {
        if (!crud.selectedItem) return
        try {
            await remove.mutateAsync(crud.selectedItem.id)
            notifySuccess('Lista eliminada')
            crud.closeAll()
        } catch (err) {
            notifyError(err, 'No se pudo eliminar la lista', {
                messages: PRICE_LIST_ERROR_MESSAGES,
            })
        }
    }

    const columns: ColumnDef<PriceList>[] = [
        {
            header: 'Nombre',
            accessorKey: 'name',
            cell: (props) => (
                <span className="flex items-center gap-2">
                    <Link
                        className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
                        to={`/catalog/price-lists/${props.row.original.id}`}
                    >
                        {props.row.original.name}
                    </Link>
                    {props.row.original.isDefault && (
                        <StatusBadge tone="info">General</StatusBadge>
                    )}
                </span>
            ),
        },
        {
            header: 'Descripción',
            accessorKey: 'description',
            cell: (props) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {props.row.original.description || '-'}
                </span>
            ),
        },
        {
            header: 'Vigencia',
            id: 'validity',
            cell: (props) => (
                <span className="text-sm">
                    {validityLabel(props.row.original)}
                </span>
            ),
        },
        {
            header: 'Estado',
            accessorKey: 'isActive',
            cell: (props) => (
                <ActiveBadge active={props.row.original.isActive} />
            ),
        },
    ]

    if (canWrite) {
        columns.push({
            header: 'Acciones',
            id: 'actions',
            cell: (props) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="plain"
                        aria-label={`Editar ${props.row.original.name}`}
                        icon={<HiOutlinePencil />}
                        onClick={() => crud.openEdit(props.row.original)}
                    />
                    {!props.row.original.isDefault && (
                        <Button
                            size="sm"
                            variant="plain"
                            aria-label={`Eliminar ${props.row.original.name}`}
                            icon={<HiOutlineTrash />}
                            onClick={() => crud.openDelete(props.row.original)}
                        />
                    )}
                </div>
            ),
        })
    }

    return (
        <>
            <PageHeader
                title="Listas de precios"
                description="Precios por cliente o por sucursal: una venta toma la lista del cliente, la de su sucursal y al final la general"
                actions={
                    canWrite && (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={crud.openCreate}
                        >
                            Nueva lista
                        </Button>
                    )
                }
            />
            <Card bodyClass="p-0">
                <DataTable
                    columns={columns}
                    data={data?.items ?? []}
                    loading={isLoading}
                    error={error}
                    pagingData={{
                        total: data?.pagination?.total ?? 0,
                        pageIndex: crud.pageIndex,
                        pageSize: crud.pageSize,
                    }}
                    onRetry={refetch}
                    onPaginationChange={(page) =>
                        crud.onPaginationChange(page, crud.pageSize)
                    }
                    onSelectChange={(size) => crud.onPaginationChange(1, size)}
                />
            </Card>

            <FormModal
                formId={FORM_ID}
                isOpen={crud.isCreateOpen || crud.isEditOpen}
                title={crud.isEditOpen ? 'Editar lista' : 'Nueva lista'}
                isSubmitting={isSaving}
                onClose={crud.closeAll}
            >
                <PriceListForm
                    formId={FORM_ID}
                    priceList={crud.isEditOpen ? crud.selectedItem : null}
                    isSubmitting={isSaving}
                    onSubmit={handleSubmit}
                />
            </FormModal>

            <DeleteConfirmDialog
                isOpen={crud.isDeleteOpen}
                itemName={crud.selectedItem?.name}
                isDeleting={remove.isPending}
                onClose={crud.closeAll}
                onConfirm={handleDelete}
            />
        </>
    )
}

export default PriceListsPage
