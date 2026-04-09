import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import InvoicingService, {
    CompanyConfigInput,
} from '@/services/InvoicingService'

export function useCertificates() {
    return useQuery({
        queryKey: ['invoicing', 'certificates'],
        queryFn: async () => {
            const response = await InvoicingService.getCertificates()
            return response.data.data
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
            const response = await InvoicingService.uploadCertificate(
                file,
                password
            )
            return response.data.data
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
        mutationFn: (id: string) => InvoicingService.deleteCertificate(id),
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
            const response = await InvoicingService.getCompanyConfig()
            return response.data.data
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
            const response = await InvoicingService.updateCompanyConfig(data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['invoicing', 'company-config'],
            })
        },
    })
}
