import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    useCompanyConfig,
    useUpdateCompanyConfig,
    useCertificates,
} from '@/hooks/useInvoicing'
import { getErrorMessage } from '@/utils/getErrorMessage'
import type { CompanyConfigInput } from '@/services/InvoicingService'

const emptyForm: CompanyConfigInput = {
    taxId: '',
    name: '',
    tradeName: '',
    mainAddress: '',
    branchAddress: '',
    branchCode: '',
    salePointCode: '',
    specialTaxpayerResolution: '',
    withholdingAgentResolution: '',
    accountingRequired: false,
    environment: 1,
    emissionType: 1,
    invoiceSequence: undefined,
    signingCertId: '',
}

const CompanyConfigView = () => {
    const [formData, setFormData] = useState<CompanyConfigInput>(emptyForm)

    const { data: config, isLoading } = useCompanyConfig()
    const { data: certificates = [] } = useCertificates()
    const updateConfig = useUpdateCompanyConfig()

    useEffect(() => {
        if (config) {
            setFormData({
                taxId: config.taxId,
                name: config.name,
                tradeName: config.tradeName,
                mainAddress: config.mainAddress,
                branchAddress: config.branchAddress,
                branchCode: config.branchCode,
                salePointCode: config.salePointCode,
                specialTaxpayerResolution:
                    config.specialTaxpayerResolution ?? '',
                withholdingAgentResolution:
                    config.withholdingAgentResolution ?? '',
                accountingRequired: config.accountingRequired,
                environment: config.environment,
                emissionType: config.emissionType,
                invoiceSequence: config.invoiceSequence,
                signingCertId: config.signingCertId ?? '',
            })
        }
    }, [config])

    const set =
        (field: keyof CompanyConfigInput) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const value =
                e.target.type === 'checkbox'
                    ? (e.target as HTMLInputElement).checked
                    : e.target.value
            setFormData((prev) => ({ ...prev, [field]: value }))
        }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const payload: CompanyConfigInput = {
                ...formData,
                environment: Number(formData.environment) as 1 | 2,
                emissionType: 1,
                invoiceSequence: formData.invoiceSequence
                    ? Number(formData.invoiceSequence)
                    : undefined,
                specialTaxpayerResolution:
                    formData.specialTaxpayerResolution || undefined,
                withholdingAgentResolution:
                    formData.withholdingAgentResolution || undefined,
                signingCertId: formData.signingCertId || undefined,
            }
            await updateConfig.mutateAsync(payload)
            toast.push(
                <Notification title="Configuración guardada" type="success">
                    La configuración fiscal se guardó correctamente
                </Notification>,
                { placement: 'top-end' }
            )
        } catch (error: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getErrorMessage(
                        error,
                        'Error al guardar la configuración'
                    )}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    if (isLoading) {
        return (
            <Card>
                <div className="p-4 text-center text-gray-500">
                    Cargando configuración...
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="p-4">
                <div className="mb-6">
                    <h4 className="text-lg font-semibold">
                        Configuración Fiscal
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                        Datos fiscales de la empresa para la generación de
                        facturas electrónicas
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Datos de la empresa */}
                        <section>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                                Datos de la Empresa
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        RUC{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        placeholder="1792141001001"
                                        maxLength={13}
                                        value={formData.taxId}
                                        disabled={updateConfig.isPending}
                                        onChange={set('taxId')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Razón Social{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        placeholder="ACME SOLUTIONS S.A."
                                        value={formData.name}
                                        disabled={updateConfig.isPending}
                                        onChange={set('name')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Nombre Comercial{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        placeholder="ACME"
                                        value={formData.tradeName}
                                        disabled={updateConfig.isPending}
                                        onChange={set('tradeName')}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Dirección */}
                        <section>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                                Dirección
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Dirección Matriz{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        placeholder="Av. Principal 123, Quito"
                                        value={formData.mainAddress}
                                        disabled={updateConfig.isPending}
                                        onChange={set('mainAddress')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Dirección Sucursal{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        placeholder="Av. Secundaria 456, Quito"
                                        value={formData.branchAddress}
                                        disabled={updateConfig.isPending}
                                        onChange={set('branchAddress')}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Configuración SRI */}
                        <section>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                                Configuración SRI
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Código Establecimiento{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        placeholder="001"
                                        maxLength={4}
                                        value={formData.branchCode}
                                        disabled={updateConfig.isPending}
                                        onChange={set('branchCode')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Punto de Emisión{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        required
                                        placeholder="001"
                                        maxLength={4}
                                        value={formData.salePointCode}
                                        disabled={updateConfig.isPending}
                                        onChange={set('salePointCode')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Ambiente{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.environment}
                                        disabled={updateConfig.isPending}
                                        onChange={set('environment')}
                                    >
                                        <option value={1}>
                                            1 - Pruebas (Testing)
                                        </option>
                                        <option value={2}>
                                            2 - Producción
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Secuencia de Factura
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="1"
                                        value={formData.invoiceSequence ?? ''}
                                        disabled={updateConfig.isPending}
                                        onChange={set('invoiceSequence')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Resolución Contrib. Especial
                                    </label>
                                    <Input
                                        placeholder="Opcional"
                                        value={
                                            formData.specialTaxpayerResolution
                                        }
                                        disabled={updateConfig.isPending}
                                        onChange={set(
                                            'specialTaxpayerResolution'
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Resolución Agente Retención
                                    </label>
                                    <Input
                                        placeholder="Opcional"
                                        value={
                                            formData.withholdingAgentResolution
                                        }
                                        disabled={updateConfig.isPending}
                                        onChange={set(
                                            'withholdingAgentResolution'
                                        )}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        id="accountingRequired"
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-indigo-600"
                                        checked={formData.accountingRequired}
                                        disabled={updateConfig.isPending}
                                        onChange={set('accountingRequired')}
                                    />
                                    <label
                                        htmlFor="accountingRequired"
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        Obligado a llevar contabilidad
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Certificado de firma */}
                        <section>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                                Certificado de Firma
                            </h5>
                            <div className="max-w-md">
                                <label className="block text-sm font-medium mb-1">
                                    Certificado Digital (.p12)
                                </label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.signingCertId ?? ''}
                                    disabled={updateConfig.isPending}
                                    onChange={set('signingCertId')}
                                >
                                    <option value="">
                                        — Sin certificado —
                                    </option>
                                    {certificates.map((cert) => (
                                        <option key={cert.id} value={cert.id}>
                                            {cert.fileName} (
                                            {new Date(
                                                cert.validTo
                                            ).toLocaleDateString('es-EC')}
                                            )
                                        </option>
                                    ))}
                                </select>
                                {certificates.length === 0 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        No hay certificados disponibles. Sube
                                        uno en la sección de Certificados
                                        Digitales.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="flex justify-end mt-8">
                        <Button
                            type="submit"
                            variant="solid"
                            loading={updateConfig.isPending}
                        >
                            Guardar Configuración
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    )
}

export default CompanyConfigView
