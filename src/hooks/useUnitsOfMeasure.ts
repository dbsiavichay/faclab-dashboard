import { useUnitOfMeasureMutations } from '@features/unitsOfMeasure'

export {
    useUnitsOfMeasureList as useUnitsOfMeasure,
    useUnitOfMeasure,
} from '@features/unitsOfMeasure'

export const useCreateUnitOfMeasure = () => useUnitOfMeasureMutations().create
export const useUpdateUnitOfMeasure = () => useUnitOfMeasureMutations().update
export const useDeleteUnitOfMeasure = () => useUnitOfMeasureMutations().delete
