import appConfig from '@/configs/app.config'
import { httpClient } from '@shared/lib/http/httpClient'
import type { DataResponse } from '@/@types/api'
import type { XReport, ZReport, DailyReport, CashSummary } from './POSTypes'

const HOST = appConfig.posApiHost || 'http://localhost:3000/api/pos'

export const getCashSummary = (shiftId: number) =>
    httpClient.get<DataResponse<CashSummary>>(
        `${HOST}/shifts/${shiftId}/cash-summary`
    )

export const getXReport = (shiftId: number) =>
    httpClient.get<DataResponse<XReport>>(`${HOST}/reports/x-report`, {
        params: { shiftId },
    })

export const getZReport = (shiftId: number) =>
    httpClient.get<DataResponse<ZReport>>(`${HOST}/reports/z-report`, {
        params: { shiftId },
    })

export const getDailyReport = (date: string) =>
    httpClient.get<DataResponse<DailyReport>>(`${HOST}/reports/daily`, {
        params: { date },
    })

export const getByPaymentMethod = (fromDate: string, toDate: string) =>
    httpClient.get<
        DataResponse<
            {
                paymentMethod: string
                count: number
                total: number
            }[]
        >
    >(`${HOST}/reports/by-payment-method`, { params: { fromDate, toDate } })
