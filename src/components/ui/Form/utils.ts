import type { FieldValues, Path, UseFormRegister } from 'react-hook-form'

export function makeNumberRegister<T extends FieldValues>(
    register: UseFormRegister<T>
) {
    return (
        name: Path<T>,
        opts: { integer?: boolean; emptyValue?: number | undefined } = {}
    ) => {
        const { integer = false, emptyValue = undefined } = opts
        return register(name, {
            setValueAs: (v) => {
                if (v === '' || v === null || v === undefined) return emptyValue
                const parsed = integer
                    ? parseInt(String(v), 10)
                    : parseFloat(String(v))
                return Number.isNaN(parsed) ? emptyValue : parsed
            },
        })
    }
}
