import { Controller } from 'react-hook-form'
import Switcher from '@/components/ui/Switcher'
import type { Control, FieldValues, Path } from 'react-hook-form'
import type { SwitcherProps } from '@/components/ui/Switcher/Switcher'

type Props<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues>
> = Omit<SwitcherProps, 'checked' | 'onChange' | 'name'> & {
    name: TName
    control: Control<TFieldValues>
}

const ControlledSwitcher = <
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues>
>({
    name,
    control,
    ...rest
}: Props<TFieldValues, TName>) => (
    <Controller
        name={name}
        control={control}
        render={({ field }) => (
            <Switcher
                checked={!!field.value}
                onChange={(checked) => field.onChange(checked)}
                {...rest}
            />
        )}
    />
)

export default ControlledSwitcher
