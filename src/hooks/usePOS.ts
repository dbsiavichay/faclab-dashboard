import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getActiveShift,
    openShift,
    closeShift,
    addCashMovement,
} from '@/services/pos/ShiftService'
import {
    quickSale,
    createSale,
    addSaleItem,
    updateSaleItem,
    deleteSaleItem,
    applySaleDiscount,
    overrideItemPrice,
    confirmSale,
    parkSale,
    resumeSale,
    cancelSale,
    addPayment,
    getParkedSales,
    getReceipt,
} from '@/services/pos/POSSaleService'
import { createRefund, processRefund } from '@/services/pos/POSRefundService'
import { getCashSummary, getXReport } from '@/services/pos/POSReportService'
import { getProducts, searchProducts } from '@/services/pos/POSProductService'
import {
    searchCustomerByTaxId,
    quickCreateCustomer,
} from '@/services/pos/POSCustomerService'
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
            const response = await getActiveShift()
            return response.data
        },
    })
}

export function usePOSProducts() {
    return useQuery({
        queryKey: ['pos', 'products'],
        queryFn: async () => {
            const response = await getProducts()
            return response.data
        },
    })
}

export function usePOSSearchProducts(term: string) {
    return useQuery({
        queryKey: ['pos', 'products', 'search', term],
        queryFn: async () => {
            const response = await searchProducts(term)
            return response.data
        },
        enabled: term.length >= 2,
    })
}

export function useParkedSales() {
    return useQuery({
        queryKey: ['pos', 'parkedSales'],
        queryFn: async () => {
            const response = await getParkedSales()
            return response.data
        },
    })
}

export function useReceipt(saleId: number) {
    return useQuery({
        queryKey: ['pos', 'receipt', saleId],
        queryFn: async () => {
            const response = await getReceipt(saleId)
            return response.data
        },
        enabled: saleId > 0,
    })
}

export function useCashSummary(shiftId: number) {
    return useQuery({
        queryKey: ['pos', 'cashSummary', shiftId],
        queryFn: async () => {
            const response = await getCashSummary(shiftId)
            return response.data
        },
        enabled: shiftId > 0,
    })
}

export function useXReport(shiftId: number) {
    return useQuery({
        queryKey: ['pos', 'xReport', shiftId],
        queryFn: async () => {
            const response = await getXReport(shiftId)
            return response.data
        },
        enabled: shiftId > 0,
    })
}

export function usePOSCustomerSearch(taxId: string) {
    return useQuery({
        queryKey: ['pos', 'customers', 'search', taxId],
        queryFn: async () => {
            const response = await searchCustomerByTaxId(taxId)
            return response.data
        },
        enabled: taxId.length >= 5,
    })
}

// === MUTATIONS ===

export function useOpenShift() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: OpenShiftInput) => {
            const response = await openShift(data)
            return response.data
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
            const response = await closeShift(shiftId, data)
            return response.data
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
            const response = await quickSale(data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos', 'products'] })
        },
    })
}

export function useCreateSale() {
    return useMutation({
        mutationFn: async (data: CreateSaleInput) => {
            const response = await createSale(data)
            return response.data
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
            const response = await addSaleItem(saleId, data)
            return response.data
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
            const response = await updateSaleItem(saleId, itemId, data)
            return response.data
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
            await deleteSaleItem(saleId, itemId)
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
            const response = await applySaleDiscount(saleId, data)
            return response.data
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
            const response = await overrideItemPrice(saleId, itemId, data)
            return response.data
        },
    })
}

export function useConfirmSale() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (saleId: number) => {
            const response = await confirmSale(saleId)
            return response.data
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
            const response = await parkSale(saleId, reason)
            return response.data
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
            const response = await resumeSale(saleId)
            return response.data
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
            const response = await cancelSale(saleId, reason)
            return response.data
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
            const response = await addPayment(saleId, data)
            return response.data
        },
    })
}

export function useCreateRefund() {
    return useMutation({
        mutationFn: async (data: CreateRefundInput) => {
            const response = await createRefund(data)
            return response.data
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
            const response = await processRefund(refundId, data)
            return response.data
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
            const response = await addCashMovement(shiftId, data)
            return response.data
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
            const response = await quickCreateCustomer(data)
            return response.data
        },
    })
}
