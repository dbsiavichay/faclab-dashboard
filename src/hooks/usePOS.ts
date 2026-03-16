import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import POSService from '@/services/POSService'
import type {
    OpenShiftInput,
    CloseShiftInput,
    QuickSaleInput,
    CreateSaleInput,
    AddSaleItemInput,
    UpdateSaleItemInput,
    SaleDiscountInput,
    PriceOverrideInput,
    PaymentInput,
    CreateRefundInput,
    ProcessRefundInput,
    CashMovementInput,
    QuickCustomerInput,
} from '@/services/POSService'

// === QUERIES ===

export function useActiveShift() {
    return useQuery({
        queryKey: ['pos', 'activeShift'],
        queryFn: async () => {
            const response = await POSService.getActiveShift()
            return response.data.data
        },
    })
}

export function usePOSProducts() {
    return useQuery({
        queryKey: ['pos', 'products'],
        queryFn: async () => {
            const response = await POSService.getProducts()
            return response.data.data
        },
    })
}

export function usePOSSearchProducts(term: string) {
    return useQuery({
        queryKey: ['pos', 'products', 'search', term],
        queryFn: async () => {
            const response = await POSService.searchProducts(term)
            return response.data.data
        },
        enabled: term.length >= 2,
    })
}

export function useParkedSales() {
    return useQuery({
        queryKey: ['pos', 'parkedSales'],
        queryFn: async () => {
            const response = await POSService.getParkedSales()
            return response.data.data
        },
    })
}

export function useReceipt(saleId: number) {
    return useQuery({
        queryKey: ['pos', 'receipt', saleId],
        queryFn: async () => {
            const response = await POSService.getReceipt(saleId)
            return response.data.data
        },
        enabled: saleId > 0,
    })
}

export function useCashSummary(shiftId: number) {
    return useQuery({
        queryKey: ['pos', 'cashSummary', shiftId],
        queryFn: async () => {
            const response = await POSService.getCashSummary(shiftId)
            return response.data.data
        },
        enabled: shiftId > 0,
    })
}

export function useXReport(shiftId: number) {
    return useQuery({
        queryKey: ['pos', 'xReport', shiftId],
        queryFn: async () => {
            const response = await POSService.getXReport(shiftId)
            return response.data.data
        },
        enabled: shiftId > 0,
    })
}

export function usePOSCustomerSearch(taxId: string) {
    return useQuery({
        queryKey: ['pos', 'customers', 'search', taxId],
        queryFn: async () => {
            const response = await POSService.searchCustomerByTaxId(taxId)
            return response.data.data
        },
        enabled: taxId.length >= 5,
    })
}

// === MUTATIONS ===

export function useOpenShift() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: OpenShiftInput) => {
            const response = await POSService.openShift(data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'activeShift'] })
        },
    })
}

export function useCloseShift() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            shiftId,
            data,
        }: {
            shiftId: number
            data: CloseShiftInput
        }) => {
            const response = await POSService.closeShift(shiftId, data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'activeShift'] })
        },
    })
}

export function useQuickSale() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: QuickSaleInput) => {
            const response = await POSService.quickSale(data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'products'] })
        },
    })
}

export function useCreateSale() {
    return useMutation({
        mutationFn: async (data: CreateSaleInput) => {
            const response = await POSService.createSale(data)
            return response.data.data
        },
    })
}

export function useAddSaleItem() {
    return useMutation({
        mutationFn: async ({
            saleId,
            data,
        }: {
            saleId: number
            data: AddSaleItemInput
        }) => {
            const response = await POSService.addSaleItem(saleId, data)
            return response.data.data
        },
    })
}

export function useUpdateSaleItem() {
    return useMutation({
        mutationFn: async ({
            saleId,
            itemId,
            data,
        }: {
            saleId: number
            itemId: number
            data: UpdateSaleItemInput
        }) => {
            const response = await POSService.updateSaleItem(
                saleId,
                itemId,
                data
            )
            return response.data.data
        },
    })
}

export function useDeleteSaleItem() {
    return useMutation({
        mutationFn: async ({
            saleId,
            itemId,
        }: {
            saleId: number
            itemId: number
        }) => {
            await POSService.deleteSaleItem(saleId, itemId)
        },
    })
}

export function useApplySaleDiscount() {
    return useMutation({
        mutationFn: async ({
            saleId,
            data,
        }: {
            saleId: number
            data: SaleDiscountInput
        }) => {
            const response = await POSService.applySaleDiscount(saleId, data)
            return response.data.data
        },
    })
}

export function useOverrideItemPrice() {
    return useMutation({
        mutationFn: async ({
            saleId,
            itemId,
            data,
        }: {
            saleId: number
            itemId: number
            data: PriceOverrideInput
        }) => {
            const response = await POSService.overrideItemPrice(
                saleId,
                itemId,
                data
            )
            return response.data.data
        },
    })
}

export function useConfirmSale() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (saleId: number) => {
            const response = await POSService.confirmSale(saleId)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'products'] })
        },
    })
}

export function useParkSale() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            saleId,
            reason,
        }: {
            saleId: number
            reason?: string
        }) => {
            const response = await POSService.parkSale(saleId, reason)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['pos', 'parkedSales'],
            })
        },
    })
}

export function useResumeSale() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (saleId: number) => {
            const response = await POSService.resumeSale(saleId)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['pos', 'parkedSales'],
            })
        },
    })
}

export function useCancelSale() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            saleId,
            reason,
        }: {
            saleId: number
            reason?: string
        }) => {
            const response = await POSService.cancelSale(saleId, reason)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'products'] })
            queryClient.invalidateQueries({
                queryKey: ['pos', 'parkedSales'],
            })
        },
    })
}

export function useAddPayment() {
    return useMutation({
        mutationFn: async ({
            saleId,
            data,
        }: {
            saleId: number
            data: PaymentInput
        }) => {
            const response = await POSService.addPayment(saleId, data)
            return response.data.data
        },
    })
}

export function useCreateRefund() {
    return useMutation({
        mutationFn: async (data: CreateRefundInput) => {
            const response = await POSService.createRefund(data)
            return response.data.data
        },
    })
}

export function useProcessRefund() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            refundId,
            data,
        }: {
            refundId: number
            data: ProcessRefundInput
        }) => {
            const response = await POSService.processRefund(refundId, data)
            return response.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'products'] })
        },
    })
}

export function useAddCashMovement() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            shiftId,
            data,
        }: {
            shiftId: number
            data: CashMovementInput
        }) => {
            const response = await POSService.addCashMovement(shiftId, data)
            return response.data.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['pos', 'cashSummary', variables.shiftId],
            })
        },
    })
}

export function useQuickCreateCustomer() {
    return useMutation({
        mutationFn: async (data: QuickCustomerInput) => {
            const response = await POSService.quickCreateCustomer(data)
            return response.data.data
        },
    })
}
