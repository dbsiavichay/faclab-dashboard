import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse } from '@/@types/api'

const HOST = appConfig.invoicingApiHost || 'http://localhost:3173'

export interface Certificate {
    id: string
    serialNumber: string
    subject: string
    issuer: string
    validFrom: string
    validTo: string
    fileName: string
    s3Url: string
    uploadedAt: string
}

export interface CompanyConfig {
    taxId: string
    name: string
    tradeName: string
    mainAddress: string
    branchAddress: string
    branchCode: string
    salePointCode: string
    specialTaxpayerResolution: string | null
    withholdingAgentResolution: string | null
    accountingRequired: boolean
    environment: 1 | 2
    emissionType: 1
    invoiceSequence: number
    signingCertId: string | null
    updatedAt: string
}

export interface CompanyConfigInput {
    taxId: string
    name: string
    tradeName: string
    mainAddress: string
    branchAddress: string
    branchCode: string
    salePointCode: string
    specialTaxpayerResolution?: string
    withholdingAgentResolution?: string
    accountingRequired?: boolean
    environment: 1 | 2
    emissionType: 1
    invoiceSequence?: number
    signingCertId?: string
}

export interface InvoiceStatusHistoryEntry {
    name: string
    statusDate: string
    description?: string
}

export type InvoiceStatus =
    | 'created'
    | 'signed'
    | 'sent'
    | 'authorized'
    | 'rejected'

export interface Invoice {
    id: string
    saleId: string
    accessCode: string
    status: InvoiceStatus
    signatureId: string
    statusHistory: InvoiceStatusHistoryEntry[]
}

interface CertificatesResponse {
    data: Certificate[]
    meta: { requestId: string; timestamp: string }
}

interface InvoicesResponse {
    data: Invoice[]
    meta: { requestId: string; timestamp: string }
}

export const getCertificates = () =>
    httpClient.get<CertificatesResponse>(`${HOST}/api/certificates`)

export const uploadCertificate = (file: File, password: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)
    return httpClient.post<DataResponse<Certificate>>(
        `${HOST}/api/certificates`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    )
}

export const deleteCertificate = (id: string) =>
    httpClient.delete(`${HOST}/api/certificates/${id}`)

export const getCompanyConfig = () =>
    httpClient.get<DataResponse<CompanyConfig>>(`${HOST}/api/company-config`)

export const updateCompanyConfig = (data: CompanyConfigInput) =>
    httpClient.put<DataResponse<CompanyConfig>>(
        `${HOST}/api/company-config`,
        data
    )

export const getInvoicesBySale = (saleId: string | number) =>
    httpClient.get<InvoicesResponse>(`${HOST}/api/invoices/by-sale/${saleId}`)
