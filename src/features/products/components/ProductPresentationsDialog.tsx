import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import { FormModal, DeleteConfirmDialog } from '@/components/shared'
import { ActiveBadge } from '@/components/shared/StatusBadge'
import { notifyError, notifySuccess } from '@shared/ui/notify'
import { formatCurrency } from '@shared/lib/format'
import { formatQuantity } from '@shared/lib/quantity'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi'
import {
    useProductPresentationMutations,
    useProductPresentations,
} from '../hooks/useProducts'
import type { ProductPresentationFormValues } from '../model/productPresentation.schema'
import type { Product, ProductPresentation } from '../model/types'
import { ProductPresentationForm } from './ProductPresentationForm'

const { Tr, Th, Td, THead, TBody } = Table

interface ProductPresentationsDialogProps {
    product: Product | null
    onClose: () => void
}

type Editing = { presentation: ProductPresentation | null } | null

/**
 * Las presentaciones de un producto (S5.2): su unidad base y las cajas, rollos
 * o paquetes en que se compra o se vende, cada una con su factor, su código de
 * barras y su precio.
 */
export const ProductPresentationsDialog = ({
    product,
    onClose,
}: ProductPresentationsDialogProps) => {
    const productId = product?.id ?? 0
    const { data: presentations = [], isLoading } = useProductPresentations(
        productId || undefined
    )
    const mutations = useProductPresentationMutations(productId)
    const [editing, setEditing] = useState<Editing>(null)
    const [deleting, setDeleting] = useState<ProductPresentation | null>(null)
    const isSaving = mutations.create.isPending || mutations.update.isPending

    const handleSubmit = async (values: ProductPresentationFormValues) => {
        const current = editing?.presentation ?? null
        // Of the base only the barcode changes: the rest goes as it is
        const data = current?.isBase
            ? {
                  name: current.name,
                  factor: 1,
                  barcode: values.barcode ?? null,
                  salePrice: null,
                  purchasePrice: null,
                  isActive: true,
              }
            : values
        try {
            if (current) {
                await mutations.update.mutateAsync({ id: current.id, data })
                notifySuccess('Presentación actualizada')
            } else {
                await mutations.create.mutateAsync(data)
                notifySuccess('Presentación agregada')
            }
            setEditing(null)
        } catch (error: unknown) {
            notifyError(error, 'Error al guardar la presentación')
        }
    }

    const handleDelete = async () => {
        if (!deleting) return
        try {
            await mutations.delete.mutateAsync(deleting.id)
            notifySuccess('Presentación eliminada')
            setDeleting(null)
        } catch (error: unknown) {
            notifyError(
                error,
                'No se pudo eliminar: si ya se usó en ventas o compras, desactívela'
            )
        }
    }

    return (
        <>
            <Dialog
                isOpen={!!product}
                width={820}
                contentLabel="Presentaciones"
                onClose={onClose}
                onRequestClose={onClose}
            >
                <div className="flex items-center justify-between mb-4 pr-8">
                    <div>
                        <h4>Presentaciones</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {product?.name} · el stock se lleva en{' '}
                            {product?.unitSymbol ?? 'unidades'}
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="solid"
                        icon={<HiPlus />}
                        onClick={() => setEditing({ presentation: null })}
                    >
                        Agregar
                    </Button>
                </div>
                {isLoading ? (
                    <div className="py-8 text-center">Cargando...</div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>Presentación</Th>
                                    <Th>Trae</Th>
                                    <Th>Código de barras</Th>
                                    <Th>Costo</Th>
                                    <Th>Precio</Th>
                                    <Th>Estado</Th>
                                    <Th>Acciones</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {presentations.map((p) => (
                                    <Tr key={p.id}>
                                        <Td>
                                            <span className="font-semibold">
                                                {p.name}
                                            </span>
                                            {p.isBase && (
                                                <span className="ml-2 text-xs text-gray-500">
                                                    (base)
                                                </span>
                                            )}
                                        </Td>
                                        <Td>
                                            {formatQuantity(
                                                p.factor,
                                                product?.unitSymbol
                                            )}
                                        </Td>
                                        <Td className="font-mono text-sm">
                                            {p.barcode ?? '-'}
                                        </Td>
                                        <Td>
                                            <PriceCell
                                                value={p.effectivePurchasePrice}
                                                own={p.purchasePrice != null}
                                                isBase={p.isBase}
                                            />
                                        </Td>
                                        <Td>
                                            <PriceCell
                                                value={p.effectiveSalePrice}
                                                own={p.salePrice != null}
                                                isBase={p.isBase}
                                            />
                                        </Td>
                                        <Td>
                                            <ActiveBadge active={p.isActive} />
                                        </Td>
                                        <Td>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    aria-label={`Editar ${p.name}`}
                                                    icon={<HiOutlinePencil />}
                                                    onClick={() =>
                                                        setEditing({
                                                            presentation: p,
                                                        })
                                                    }
                                                />
                                                {!p.isBase && (
                                                    <Button
                                                        size="sm"
                                                        variant="plain"
                                                        aria-label={`Eliminar ${p.name}`}
                                                        icon={
                                                            <HiOutlineTrash />
                                                        }
                                                        onClick={() =>
                                                            setDeleting(p)
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                )}
            </Dialog>

            {product && (
                <FormModal
                    formId="product-presentation-form"
                    width={560}
                    isOpen={!!editing}
                    title={
                        editing?.presentation
                            ? 'Editar presentación'
                            : 'Nueva presentación'
                    }
                    isSubmitting={isSaving}
                    onClose={() => setEditing(null)}
                >
                    <ProductPresentationForm
                        key={editing?.presentation?.id ?? 'new'}
                        formId="product-presentation-form"
                        product={product}
                        presentation={editing?.presentation ?? null}
                        isSubmitting={isSaving}
                        onSubmit={handleSubmit}
                    />
                </FormModal>
            )}

            <DeleteConfirmDialog
                isOpen={!!deleting}
                itemName={deleting?.name}
                isDeleting={mutations.delete.isPending}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
            />
        </>
    )
}

function PriceCell({
    value,
    own,
    isBase,
}: {
    value: number | null
    own: boolean
    isBase: boolean
}) {
    if (value == null) return <span className="text-gray-400">-</span>
    return (
        <span className="font-mono text-sm">
            {formatCurrency(value)}
            {!own && !isBase && (
                <span
                    className="ml-1 text-xs text-gray-400"
                    title="Factor × el precio del producto"
                >
                    calc.
                </span>
            )}
        </span>
    )
}
