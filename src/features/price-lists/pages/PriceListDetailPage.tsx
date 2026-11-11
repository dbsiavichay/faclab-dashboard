import { useNavigate, useParams } from 'react-router-dom'
import {
    HiOutlineArrowLeft,
    HiOutlinePencil,
    HiOutlineTrash,
    HiPlus,
} from 'react-icons/hi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import DataTable, { type ColumnDef } from '@/components/shared/DataTable'
import {
    DeleteConfirmDialog,
    EmptyState,
    ErrorState,
    FormModal,
} from '@/components/shared'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge, { ActiveBadge } from '@/components/shared/StatusBadge'
import useCrudOperations from '@shared/hooks/useCrudOperations'
import { formatCurrency } from '@shared/lib/format'
import { formatQuantity } from '@shared/lib/quantity'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { PERMISSION } from '@/constants/permissions.constant'
import { useCan } from '@/stores'
import { isApiError } from '@/utils/errors/ApiError'
import {
    usePriceList,
    usePriceListItemMutations,
    usePriceListItems,
} from '../hooks/usePriceLists'
import PriceListItemForm from '../components/PriceListItemForm'
import { validityLabel } from '../model/validity'
import {
    PRICE_LIST_ERROR_MESSAGES,
    type PriceListItem,
    type PriceListItemCreateInput,
    type PriceListItemUpdateInput,
} from '../model/types'

const FORM_ID = 'price-list-item-form'
const LISTS_PATH = '/catalog/price-lists'

const PriceListDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const priceListId = Number(id) || 0
    const canWrite = useCan(PERMISSION.PRODUCT_WRITE)
    const crud = useCrudOperations<PriceListItem>()

    const priceList = usePriceList(priceListId)
    const items = usePriceListItems(priceListId, {
        limit: crud.pageSize,
        offset: (crud.pageIndex - 1) * crud.pageSize,
    })
    const {
        create,
        update,
        delete: remove,
    } = usePriceListItemMutations(priceListId)
    const isSaving = create.isPending || update.isPending

    const handleCreate = async (values: PriceListItemCreateInput) => {
        try {
            await create.mutateAsync(values)
            notifySuccess('Precio agregado')
            crud.closeAll()
        } catch (err) {
            notifyError(err, 'No se pudo agregar el precio', {
                messages: PRICE_LIST_ERROR_MESSAGES,
            })
        }
    }

    const handleUpdate = async (values: PriceListItemUpdateInput) => {
        if (!crud.selectedItem) return
        try {
            await update.mutateAsync({
                itemId: crud.selectedItem.id,
                data: values,
            })
            notifySuccess('Precio actualizado')
            crud.closeAll()
        } catch (err) {
            notifyError(err, 'No se pudo actualizar el precio', {
                messages: PRICE_LIST_ERROR_MESSAGES,
            })
        }
    }

    const handleDelete = async () => {
        if (!crud.selectedItem) return
        try {
            await remove.mutateAsync(crud.selectedItem.id)
            notifySuccess('Precio eliminado')
            crud.closeAll()
        } catch (err) {
            notifyError(err, 'No se pudo eliminar el precio')
        }
    }

    if (priceList.isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Spinner size={40} />
            </div>
        )
    }

    if (!priceList.data) {
        return priceList.error &&
            !(
                isApiError(priceList.error) &&
                priceList.error.code === 'NOT_FOUND'
            ) ? (
            <ErrorState
                error={priceList.error}
                onRetry={() => priceList.refetch()}
            />
        ) : (
            <EmptyState
                className="min-h-[24rem]"
                title="Lista no encontrada"
                action={
                    <Button
                        size="sm"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate(LISTS_PATH)}
                    >
                        Volver a Listas de precios
                    </Button>
                }
            />
        )
    }

    const list = priceList.data

    const columns: ColumnDef<PriceListItem>[] = [
        {
            header: 'Producto',
            accessorKey: 'productName',
            cell: (props) => (
                <div>
                    <p className="font-medium">
                        {props.row.original.productName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {props.row.original.productSku}
                    </p>
                </div>
            ),
        },
        {
            header: 'Presentación',
            accessorKey: 'presentationName',
            cell: (props) => {
                const item = props.row.original
                return item.isBasePresentation || item.unitFactor === null
                    ? item.presentationName
                    : `${item.presentationName} · x${formatQuantity(
                          item.unitFactor
                      )}`
            },
        },
        {
            header: 'Desde',
            accessorKey: 'minQuantity',
            cell: (props) =>
                props.row.original.minQuantity > 0
                    ? formatQuantity(props.row.original.minQuantity)
                    : 'Cualquier cantidad',
        },
        {
            header: 'Precio',
            accessorKey: 'price',
            cell: (props) => (
                <span className="font-semibold">
                    {formatCurrency(props.row.original.price)}
                </span>
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
                        aria-label={`Editar precio de ${props.row.original.productName}`}
                        icon={<HiOutlinePencil />}
                        onClick={() => crud.openEdit(props.row.original)}
                    />
                    <Button
                        size="sm"
                        variant="plain"
                        aria-label={`Eliminar precio de ${props.row.original.productName}`}
                        icon={<HiOutlineTrash />}
                        onClick={() => crud.openDelete(props.row.original)}
                    />
                </div>
            ),
        })
    }

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                className="!mb-1"
                title={list.name}
                badge={
                    <>
                        {list.isDefault && (
                            <StatusBadge tone="info">General</StatusBadge>
                        )}
                        <ActiveBadge active={list.isActive} />
                    </>
                }
                description={
                    list.isDefault
                        ? 'El precio base es el de cada producto: aquí van las escalas por volumen para todos'
                        : `${
                              list.description || 'Sin descripción'
                          } · Vigencia: ${validityLabel(list)}`
                }
                actions={
                    canWrite && (
                        <Button
                            size="sm"
                            variant="solid"
                            icon={<HiPlus />}
                            onClick={crud.openCreate}
                        >
                            Agregar precio
                        </Button>
                    )
                }
                onBack={() => navigate(LISTS_PATH)}
            />

            <Card bodyClass="p-0">
                <DataTable
                    columns={columns}
                    data={items.data?.items ?? []}
                    loading={items.isLoading}
                    error={items.error}
                    pagingData={{
                        total: items.data?.pagination?.total ?? 0,
                        pageIndex: crud.pageIndex,
                        pageSize: crud.pageSize,
                    }}
                    onRetry={() => items.refetch()}
                    onPaginationChange={(page) =>
                        crud.onPaginationChange(page, crud.pageSize)
                    }
                    onSelectChange={(size) => crud.onPaginationChange(1, size)}
                />
            </Card>

            <FormModal
                formId={FORM_ID}
                isOpen={crud.isCreateOpen || crud.isEditOpen}
                title={crud.isEditOpen ? 'Editar precio' : 'Agregar precio'}
                isSubmitting={isSaving}
                onClose={crud.closeAll}
            >
                <PriceListItemForm
                    formId={FORM_ID}
                    item={crud.isEditOpen ? crud.selectedItem : null}
                    isDefault={list.isDefault}
                    isSubmitting={isSaving}
                    onCreate={handleCreate}
                    onUpdate={handleUpdate}
                />
            </FormModal>

            <DeleteConfirmDialog
                isOpen={crud.isDeleteOpen}
                itemName={
                    crud.selectedItem
                        ? `${crud.selectedItem.productName} · ${crud.selectedItem.presentationName}`
                        : undefined
                }
                isDeleting={remove.isPending}
                onClose={crud.closeAll}
                onConfirm={handleDelete}
            />
        </div>
    )
}

export default PriceListDetailPage
