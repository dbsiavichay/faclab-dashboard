import { useLotMutations } from '@features/lots'

export { useLotsList as useLots, useLot } from '@features/lots'

export const useCreateLot = () => useLotMutations().create
export const useUpdateLot = () => useLotMutations().update
