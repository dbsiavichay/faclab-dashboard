import { useState, useRef } from 'react'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useCertificates,
    useUploadCertificate,
    useDeleteCertificate,
} from '@/hooks/useInvoicing'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { Certificate } from '@/services/InvoicingService'
import { HiOutlineTrash, HiOutlineUpload } from 'react-icons/hi'

const CertificatesView = () => {
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        cert: Certificate | null
    }>({ open: false, cert: null })
    const [password, setPassword] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data: certificates = [], isLoading } = useCertificates()
    const uploadCertificate = useUploadCertificate()
    const deleteCertificate = useDeleteCertificate()

    const handleUploadOpen = () => {
        setSelectedFile(null)
        setPassword('')
        setIsUploadDialogOpen(true)
    }

    const handleUploadClose = () => {
        if (uploadCertificate.isPending) return
        setIsUploadDialogOpen(false)
        setSelectedFile(null)
        setPassword('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile) return

        try {
            await uploadCertificate.mutateAsync({
                file: selectedFile,
                password,
            })
            toast.push(
                <Notification title="Certificado subido" type="success">
                    El certificado se subió correctamente
                </Notification>,
                { placement: 'top-end' }
            )
            handleUploadClose()
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al subir el certificado')}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.cert) return
        try {
            await deleteCertificate.mutateAsync(deleteDialog.cert.id)
            toast.push(
                <Notification title="Certificado eliminado" type="success">
                    El certificado se eliminó correctamente
                </Notification>,
                { placement: 'top-end' }
            )
            setDeleteDialog({ open: false, cert: null })
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(error, 'Error al eliminar el certificado')}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })

    const isExpired = (validTo: string) => new Date(validTo) < new Date()

    const columns: ColumnDef<Certificate>[] = [
        {
            header: 'Archivo',
            accessorKey: 'fileName',
            cell: (props) => (
                <span className="font-medium">
                    {props.row.original.fileName}
                </span>
            ),
        },
        {
            header: 'Sujeto',
            accessorKey: 'subject',
            cell: (props) => (
                <span className="text-sm">{props.row.original.subject}</span>
            ),
        },
        {
            header: 'Emisor',
            accessorKey: 'issuer',
            cell: (props) => (
                <span className="text-sm text-gray-500">
                    {props.row.original.issuer}
                </span>
            ),
        },
        {
            header: 'Válido desde',
            accessorKey: 'validFrom',
            cell: (props) => (
                <span className="text-sm">
                    {formatDate(props.row.original.validFrom)}
                </span>
            ),
        },
        {
            header: 'Válido hasta',
            accessorKey: 'validTo',
            cell: (props) => {
                const expired = isExpired(props.row.original.validTo)
                return (
                    <span
                        className={`inline-flex items-center gap-1 text-sm font-medium ${
                            expired ? 'text-red-500' : 'text-green-600'
                        }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${
                                expired ? 'bg-red-500' : 'bg-green-500'
                            }`}
                        />
                        {formatDate(props.row.original.validTo)}
                    </span>
                )
            },
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: (props) => (
                <Button
                    size="sm"
                    variant="plain"
                    icon={<HiOutlineTrash />}
                    onClick={() =>
                        setDeleteDialog({
                            open: true,
                            cert: props.row.original,
                        })
                    }
                />
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
                                Certificados Digitales
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestiona los certificados .p12 para firma de
                                facturas electrónicas
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiOutlineUpload />}
                            onClick={handleUploadOpen}
                        >
                            Subir Certificado
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={certificates}
                        loading={isLoading}
                        pagingData={{
                            total: certificates.length,
                            pageIndex: 1,
                            pageSize: certificates.length || 10,
                        }}
                    />
                </div>
            </Card>

            {/* Upload Dialog */}
            <Dialog
                isOpen={isUploadDialogOpen}
                shouldCloseOnEsc={!uploadCertificate.isPending}
                shouldCloseOnOverlayClick={!uploadCertificate.isPending}
                onClose={handleUploadClose}
                onRequestClose={handleUploadClose}
            >
                <div className="flex flex-col h-full justify-between">
                    <h5 className="mb-4">Subir Certificado Digital</h5>
                    <form className="flex-1" onSubmit={handleUploadSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Archivo .p12{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    ref={fileInputRef}
                                    required
                                    type="file"
                                    accept=".p12"
                                    disabled={uploadCertificate.isPending}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={(e) =>
                                        setSelectedFile(
                                            e.target.files?.[0] ?? null
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Contraseña{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    type="password"
                                    placeholder="Contraseña del certificado"
                                    value={password}
                                    disabled={uploadCertificate.isPending}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                type="button"
                                variant="plain"
                                disabled={uploadCertificate.isPending}
                                onClick={handleUploadClose}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="solid"
                                loading={uploadCertificate.isPending}
                                disabled={!selectedFile || !password}
                            >
                                Subir
                            </Button>
                        </div>
                    </form>
                </div>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, cert: null })}
                onRequestClose={() =>
                    setDeleteDialog({ open: false, cert: null })
                }
            >
                <h5 className="mb-4">Confirmar Eliminación</h5>
                <p className="mb-6">
                    ¿Estás seguro de que deseas eliminar el certificado{' '}
                    <strong>{deleteDialog.cert?.fileName}</strong>? Esta acción
                    no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        variant="plain"
                        disabled={deleteCertificate.isPending}
                        onClick={() =>
                            setDeleteDialog({ open: false, cert: null })
                        }
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        loading={deleteCertificate.isPending}
                        onClick={handleDeleteConfirm}
                    >
                        Eliminar
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default CertificatesView
