import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type { DataResponse } from '@/@types/api'

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

interface CertificatesResponse {
    data: Certificate[]
    meta: { requestId: string; timestamp: string }
}

class InvoicingService {
    private host: string

    constructor() {
        this.host = appConfig.invoicingApiHost || 'http://localhost:3173'
    }

    async getCertificates() {
        return ApiService.fetchData<CertificatesResponse>({
            url: `${this.host}/api/certificates`,
            method: 'get',
        })
    }

    async uploadCertificate(file: File, password: string) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('password', password)
        return ApiService.fetchData<DataResponse<Certificate>, unknown>({
            url: `${this.host}/api/certificates`,
            method: 'post',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    }

    async deleteCertificate(id: string) {
        return ApiService.fetchData({
            url: `${this.host}/api/certificates/${id}`,
            method: 'delete',
        })
    }

    async getCompanyConfig() {
        return ApiService.fetchData<DataResponse<CompanyConfig>>({
            url: `${this.host}/api/company-config`,
            method: 'get',
        })
    }

    async updateCompanyConfig(data: CompanyConfigInput) {
        return ApiService.fetchData<DataResponse<CompanyConfig>, unknown>({
            url: `${this.host}/api/company-config`,
            method: 'put',
            data,
        })
    }
}

export default new InvoicingService()
