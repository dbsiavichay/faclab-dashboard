export const getDifferenceColor = (diff: number): string => {
    if (diff > 0) return 'text-emerald-600 dark:text-emerald-400'
    if (diff < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-500'
}

export const getDifferenceLabel = (diff: number): string => {
    if (diff > 0) return `+${diff}`
    return diff.toString()
}
