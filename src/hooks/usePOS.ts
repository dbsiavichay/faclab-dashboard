import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ShiftService from '@/services/pos/ShiftService'
import POSSaleService from '@/services/pos/POSSaleService'
import POSRefundService from '@/services/pos/POSRefundService'
import POSReportService from '@/services/pos/POSReportService'
import POSProductService from '@/services/pos/POSProductService'
import POSCustomerService from '@/services/pos/POSCustomerService'
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
} from '@/services/pos/POSTypes'

// === QUERIES ===

export function useActiveShift() {
    return useQuery({
        queryKey: ['pos', 'activeShift'],
        queryFn: async () => {
            const response = await ShiftService.getActiveShift()
            return response.data.data
        },
    })
}

export function usePOSProducts() {
    return useQuery({
        queryKey: ['pos', 'products'],
        queryFn: async () => {
            const response = await POSProductService.getProducts()
            return response.data.data
        },
    })
}

export function usePOSSearchProducts(term: string) {
    return useQuery({
        queryKey: ['pos', 'products', 'search', term],
        queryFn: async () => {
            const response = await POSProductService.searchProducts(term)
            return response.data.data
        },
        enabled: term.length >= 2,
    })
}

export function useParkedSales() {
    return useQuery({
        queryKey: ['pos', 'parkedSales'],
        queryFn: async () => {
            const response = await POSSaleService.getParkedSales()
            return response.data.data
        },
    })
}

export function useReceipt(saleId: number) {
    return useQuery({
        queryKey: ['pos', 'receipt', saleId],
        queryFn: async () => {
            const response = await POSSaleService.getReceipt(saleId)
            return response.data.data
        },
        enabled: saleId > 0,
    })
}

export function useCashSummary(shiftId: number) {
    return useQuery({
        queryKey: ['pos', 'cashSummary', shiftId],
        queryFn: async () => {
            const response = await POSReportService.getCashSummary(shiftId)
            return response.data.data
        },
        enabled: shiftId > 0,
    })
}

export function useXReport(shiftId: number) {
    return useQuery({
        queryKey: ['pos', 'xReport', shiftId],
        queryFn: async () => {
            const response = await POSReportService.getXReport(shiftId)
            return response.data.data
        },
        enabled: shiftId > 0,
    })
}

export function usePOSCustomerSearch(taxId: string) {
    return useQuery({
        queryKey: ['pos', 'customers', 'search', taxId],
        queryFn: async () => {
            const response = await POSCustomerService.searchCustomerByTaxId(
                taxId
            )
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
            const response = await ShiftService.openShift(data)
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
            const response = await ShiftService.closeShift(shiftId, data)
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
            const response = await POSSaleService.quickSale(data)
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
            const response = await POSSaleService.createSale(data)
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
            const response = await POSSaleService.addSaleItem(saleId, data)
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
            const response = await POSSaleService.updateSaleItem(
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
            await POSSaleService.deleteSaleItem(saleId, itemId)
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
            const response = await POSSaleService.applySaleDiscount(
                saleId,
                data
            )
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
            const response = await POSSaleService.overrideItemPrice(
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
            const response = await POSSaleService.confirmSale(saleId)
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
            const response = await POSSaleService.parkSale(saleId, reason)
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
            const response = await POSSaleService.resumeSale(saleId)
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
            const response = await POSSaleService.cancelSale(saleId, reason)
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
            const response = await POSSaleService.addPayment(saleId, data)
            return response.data.data
        },
    })
}

export function useCreateRefund() {
    return useMutation({
        mutationFn: async (data: CreateRefundInput) => {
            const response = await POSRefundService.createRefund(data)
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
            const response = await POSRefundService.processRefund(
                refundId,
                data
            )
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
            const response = await ShiftService.addCashMovement(shiftId, data)
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
            const response = await POSCustomerService.quickCreateCustomer(data)
            return response.data.data
        },
    })
}
