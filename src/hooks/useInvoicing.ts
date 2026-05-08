import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getInvoicesBySale,
    getCertificates,
    uploadCertificate,
    deleteCertificate,
    getCompanyConfig,
    updateCompanyConfig,
    type CompanyConfigInput,
} from '@/services/InvoicingService'

export function useInvoicesBySale(saleId: string | number | undefined) {
    return useQuery({
        queryKey: ['invoicing', 'invoices', 'by-sale', saleId],
        queryFn: async () => {
            const response = await getInvoicesBySale(saleId as string | number)
            return response.data
        },
        enabled: saleId != null,
    })
}

export function useCertificates() {
    return useQuery({
        queryKey: ['invoicing', 'certificates'],
        queryFn: async () => {
            const response = await getCertificates()
            return response.data
        },
    })
}

export function useUploadCertificate() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            file,
            password,
        }: {
            file: File
            password: string
        }) => {
            const response = await uploadCertificate(file, password)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['invoicing', 'certificates'],
            })
        },
    })
}

export function useDeleteCertificate() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteCertificate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['invoicing', 'certificates'],
            })
        },
    })
}

export function useCompanyConfig() {
    return useQuery({
        queryKey: ['invoicing', 'company-config'],
        queryFn: async () => {
            const response = await getCompanyConfig()
            return response.data
        },
        retry: (failureCount, error: unknown) => {
            const axiosError = error as { response?: { status?: number } }
            if (axiosError?.response?.status === 404) return false
            return failureCount < 2
        },
    })
}

export function useUpdateCompanyConfig() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: CompanyConfigInput) => {
            const response = await updateCompanyConfig(data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['invoicing', 'company-config'],
            })
        },
    })
}
