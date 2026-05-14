export type {
    SerialNumber,
    SerialNumberInput,
    SerialNumberListParams,
    SerialStatus,
} from './model/types'

export { SERIAL_STATUS_LABELS, VALID_TRANSITIONS } from './model/types'

export {
    serialNumberSchema,
    type SerialNumberFormValues,
} from './model/serialNumber.schema'

export {
    serialStatusChangeSchema,
    type SerialStatusChangeFormValues,
} from './model/serialStatusChange.schema'

export {
    useSerialNumbersList,
    useSerialNumber,
    useSerialNumberMutations,
} from './hooks/useSerialNumbers'

export { serialNumbersRoutes } from './routes'
