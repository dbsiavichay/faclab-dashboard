import { formatDate } from '@shared/lib/format'

/** A `YYYY-MM-DD` day as the local date it is, without the UTC shift of `new Date(day)` */
export const formatDueDay = (day: string) => formatDate(`${day}T00:00:00`)
