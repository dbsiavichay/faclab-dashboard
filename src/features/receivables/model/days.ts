import { formatDate } from '@shared/lib/format'

/** A `YYYY-MM-DD` day as the local date it is, without the UTC shift of `new Date(day)` */
export const formatDueDay = (day: string) => formatDate(`${day}T00:00:00`)

/** Hoy como `YYYY-MM-DD` local */
export const today = (date: Date = new Date()): string => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
    )}`
}
