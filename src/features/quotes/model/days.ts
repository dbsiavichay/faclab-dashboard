import { formatDate } from '@shared/lib/format'

/** A `YYYY-MM-DD` day as the local date it names (not UTC midnight) */
export const formatDay = (value: string): string =>
    formatDate(new Date(`${value}T00:00:00`))
