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
