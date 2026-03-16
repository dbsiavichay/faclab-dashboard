import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { usePOSStore } from '@/stores/usePOSStore'
import { usePOSCustomerSearch, useQuickCreateCustomer } from '@/hooks/usePOS'
import { HiOutlineUser } from 'react-icons/hi'

const CustomerSelector = () => {
    const { customerId, customerName, setCustomer } = usePOSStore()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [taxId, setTaxId] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newName, setNewName] = useState('')
    const [newTaxId, setNewTaxId] = useState('')
    const [newTaxType, setNewTaxType] = useState('RUC')

    const { data: foundCustomer, isLoading: searching } =
        usePOSCustomerSearch(taxId)
    const quickCreate = useQuickCreateCustomer()

    const handleSelectCustomer = (id: number, name: string) => {
        setCustomer(id, name)
        setDialogOpen(false)
        resetForm()
    }

    const handleClearCustomer = () => {
        setCustomer(null, null)
    }

    const handleCreateCustomer = async () => {
        try {
            const customer = await quickCreate.mutateAsync({
                name: newName,
                taxId: newTaxId,
                taxType: newTaxType,
            })
            handleSelectCustomer(customer.id, customer.name)
            toast.push(<Notification type="success" title="Cliente creado" />, {
                placement: 'top-end',
            })
        } catch {
            toast.push(
                <Notification type="danger" title="Error al crear cliente" />,
                { placement: 'top-end' }
            )
        }
    }

    const resetForm = () => {
        setTaxId('')
        setShowCreateForm(false)
        setNewName('')
        setNewTaxId('')
        setNewTaxType('RUC')
    }

    const handleClose = () => {
        setDialogOpen(false)
        resetForm()
    }

    return (
        <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <HiOutlineUser className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {customerName || 'Consumidor Final'}
                            </p>
                            {customerId && (
                                <button
                                    className="text-xs text-red-500 hover:underline"
                                    onClick={handleClearCustomer}
                                >
                                    Quitar
                                </button>
                            )}
                        </div>
                    </div>
                    <Button
                        size="xs"
                        variant="twoTone"
                        onClick={() => setDialogOpen(true)}
                    >
                        {customerId ? 'Cambiar' : 'Buscar'}
                    </Button>
                </div>
            </div>

            <Dialog
                isOpen={dialogOpen}
                width={400}
                overlayClassName="!z-[60]"
                onClose={handleClose}
            >
                <h4 className="text-lg font-bold mb-4">Buscar Cliente</h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            RUC / Cedula
                        </label>
                        <Input
                            value={taxId}
                            placeholder="Ingrese RUC o cedula..."
                            onChange={(e) => setTaxId(e.target.value)}
                        />
                    </div>

                    {searching && (
                        <p className="text-sm text-gray-500">Buscando...</p>
                    )}

                    {foundCustomer && (
                        <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-medium">
                                    {foundCustomer.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {foundCustomer.taxType}:{' '}
                                    {foundCustomer.taxId}
                                </p>
                            </div>
                            <Button
                                size="xs"
                                variant="solid"
                                onClick={() =>
                                    handleSelectCustomer(
                                        foundCustomer.id,
                                        foundCustomer.name
                                    )
                                }
                            >
                                Seleccionar
                            </Button>
                        </div>
                    )}

                    {taxId.length >= 5 && !searching && !foundCustomer && (
                        <div className="text-center py-3">
                            <p className="text-sm text-gray-500 mb-2">
                                No se encontro cliente
                            </p>
                            {!showCreateForm && (
                                <Button
                                    size="sm"
                                    variant="twoTone"
                                    onClick={() => {
                                        setShowCreateForm(true)
                                        setNewTaxId(taxId)
                                    }}
                                >
                                    Crear cliente rapido
                                </Button>
                            )}
                        </div>
                    )}

                    {showCreateForm && (
                        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h5 className="text-sm font-bold">Nuevo Cliente</h5>
                            <Input
                                value={newName}
                                placeholder="Nombre completo"
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <Input
                                value={newTaxId}
                                placeholder="RUC / Cedula"
                                onChange={(e) => setNewTaxId(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={
                                        newTaxType === 'RUC'
                                            ? 'solid'
                                            : 'default'
                                    }
                                    onClick={() => setNewTaxType('RUC')}
                                >
                                    RUC
                                </Button>
                                <Button
                                    size="sm"
                                    variant={
                                        newTaxType === 'CEDULA'
                                            ? 'solid'
                                            : 'default'
                                    }
                                    onClick={() => setNewTaxType('CEDULA')}
                                >
                                    Cedula
                                </Button>
                            </div>
                            <Button
                                block
                                size="sm"
                                variant="solid"
                                loading={quickCreate.isPending}
                                disabled={!newName || !newTaxId}
                                onClick={handleCreateCustomer}
                            >
                                Crear y Seleccionar
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-6">
                    <Button block variant="default" onClick={handleClose}>
                        Cancelar
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default CustomerSelector
