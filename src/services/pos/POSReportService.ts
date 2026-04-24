import ApiService from '@/services/ApiService'
import appConfig from '@/configs/app.config'
import type { DataResponse } from '@/@types/api'
import type { XReport, ZReport, DailyReport, CashSummary } from './POSTypes'

class POSReportService {
    private host = appConfig.posApiHost || 'http://localhost:3000/api/pos'

    async getCashSummary(shiftId: number) {
        return ApiService.fetchData<DataResponse<CashSummary>>({
            url: `${this.host}/shifts/${shiftId}/cash-summary`,
            method: 'get',
        })
    }

    async getXReport(shiftId: number) {
        return ApiService.fetchData<DataResponse<XReport>>({
            url: `${this.host}/reports/x-report?shiftId=${shiftId}`,
            method: 'get',
        })
    }

    async getZReport(shiftId: number) {
        return ApiService.fetchData<DataResponse<ZReport>>({
            url: `${this.host}/reports/z-report?shiftId=${shiftId}`,
            method: 'get',
        })
    }

    async getDailyReport(date: string) {
        return ApiService.fetchData<DataResponse<DailyReport>>({
            url: `${this.host}/reports/daily?date=${date}`,
            method: 'get',
        })
    }

    async getByPaymentMethod(fromDate: string, toDate: string) {
        return ApiService.fetchData<
            DataResponse<
                {
                    paymentMethod: string
                    count: number
                    total: number
                }[]
            >
        >({
            url: `${this.host}/reports/by-payment-method?fromDate=${fromDate}&toDate=${toDate}`,
            method: 'get',
        })
    }
}

export default new POSReportService()
