import ApiService from '@/services/ApiService'
import appConfig from '@/configs/app.config'
import type { DataResponse } from '@/@types/api'
import type {
    POSSale,
    POSSaleItem,
    POSPayment,
    CreateSaleInput,
    QuickSaleInput,
    AddSaleItemInput,
    UpdateSaleItemInput,
    SaleDiscountInput,
    PriceOverrideInput,
    PaymentInput,
    Receipt,
    ListResponse,
} from './POSTypes'

class POSSaleService {
    private host = appConfig.posApiHost || 'http://localhost:3000/api/pos'

    async createSale(data: CreateSaleInput) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.host}/sales`,
            method: 'post',
            data,
        })
    }

    async quickSale(data: QuickSaleInput) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.host}/sales/quick`,
            method: 'post',
            data,
        })
    }

    async getSale(id: number) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.host}/sales/${id}`,
            method: 'get',
        })
    }

    async addSaleItem(saleId: number, data: AddSaleItemInput) {
        return ApiService.fetchData<DataResponse<POSSaleItem>>({
            url: `${this.host}/sales/${saleId}/items`,
            method: 'post',
            data,
        })
    }

    async getSaleItems(saleId: number) {
        return ApiService.fetchData<ListResponse<POSSaleItem>>({
            url: `${this.host}/sales/${saleId}/items`,
            method: 'get',
        })
    }

    async updateSaleItem(
        saleId: number,
        itemId: number,
        data: UpdateSaleItemInput
    ) {
        return ApiService.fetchData<DataResponse<POSSaleItem>>({
            url: `${this.host}/sales/${saleId}/items/${itemId}`,
            method: 'put',
            data,
        })
    }

    async deleteSaleItem(saleId: number, itemId: number) {
        return ApiService.fetchData<void>({
            url: `${this.host}/sales/${saleId}/items/${itemId}`,
            method: 'delete',
        })
    }

    async confirmSale(saleId: number) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.host}/sales/${saleId}/confirm`,
            method: 'post',
        })
    }

    async cancelSale(saleId: number, reason?: string) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.host}/sales/${saleId}/cancel`,
            method: 'post',
            data: reason ? { reason } : undefined,
        })
    }

    async parkSale(saleId: number, reason?: string) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.host}/sales/${saleId}/park`,
            method: 'post',
            data: reason ? { reason } : undefined,
        })
    }

    async resumeSale(saleId: number) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.host}/sales/${saleId}/resume`,
            method: 'post',
        })
    }

    async getParkedSales() {
        return ApiService.fetchData<ListResponse<POSSale>>({
            url: `${this.host}/sales/parked`,
            method: 'get',
        })
    }

    async applySaleDiscount(saleId: number, data: SaleDiscountInput) {
        return ApiService.fetchData<DataResponse<POSSale>>({
            url: `${this.host}/sales/${saleId}/discount`,
            method: 'post',
            data,
        })
    }

    async addPayment(saleId: number, data: PaymentInput) {
        return ApiService.fetchData<DataResponse<POSPayment>>({
            url: `${this.host}/sales/${saleId}/payments`,
            method: 'post',
            data,
        })
    }

    async getSalePayments(saleId: number) {
        return ApiService.fetchData<ListResponse<POSPayment>>({
            url: `${this.host}/sales/${saleId}/payments`,
            method: 'get',
        })
    }

    async overrideItemPrice(
        saleId: number,
        itemId: number,
        data: PriceOverrideInput
    ) {
        return ApiService.fetchData<DataResponse<POSSaleItem>>({
            url: `${this.host}/sales/${saleId}/items/${itemId}/price`,
            method: 'put',
            data,
        })
    }

    async getReceipt(saleId: number) {
        return ApiService.fetchData<DataResponse<Receipt>>({
            url: `${this.host}/sales/${saleId}/receipt`,
            method: 'get',
        })
    }
}

export default new POSSaleService()
