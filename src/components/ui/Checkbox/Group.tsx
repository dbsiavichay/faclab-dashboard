import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { CheckboxGroupContextProvider } from './context'
import cloneDeep from 'lodash/cloneDeep'
import remove from 'lodash/remove'
import shallowEqual from '../utils/shallowEqual'
import useControllableState from '../hooks/useControllableState'
import type { CommonProps } from '../@types/common'
import type { CheckboxGroupValue, CheckboxValue } from './context'
import type { Ref, SyntheticEvent } from 'react'

export interface CheckboxGroupProps extends CommonProps {
    color?: string
    name?: string
    onChange?: (value: CheckboxGroupValue, event: SyntheticEvent) => void
    ref?: Ref<HTMLDivElement>
    value?: CheckboxGroupValue
    vertical?: boolean
}

const Group = (props: CheckboxGroupProps) => {
    const {
        children,
        className,
        color,
        name,
        onChange,
        ref,
        value: valueProp,
        vertical,
        ...rest
    } = props

    const [value, setValue] = useControllableState<CheckboxGroupValue>({
        prop: valueProp,
        defaultProp: [],
    })

    const onCheckboxGroupChange = useCallback(
        (
            itemValue: CheckboxValue,
            itemChecked: boolean,
            event: SyntheticEvent
        ) => {
            const nextValue = cloneDeep(value) || []
            if (itemChecked) {
                nextValue.push(itemValue as never)
            } else {
                remove(nextValue as string[], (i) => shallowEqual(i, itemValue))
            }

            setValue(nextValue)
            onChange?.(nextValue, event)
        },
        [onChange, setValue, value]
    )

    const checkboxGroupDefaultClass = `inline-flex ${
        vertical ? 'flex-col gap-y-2' : ''
    }`

    const checkBoxGroupClass = classNames(checkboxGroupDefaultClass, className)

    const contextValue = useMemo(
        () => ({
            vertical,
            name,
            value,
            color,
            onChange: onCheckboxGroupChange,
        }),
        [vertical, onCheckboxGroupChange, name, color, value]
    )

    return (
        <CheckboxGroupContextProvider value={contextValue}>
            <div ref={ref} className={checkBoxGroupClass} {...rest}>
                {children}
            </div>
        </CheckboxGroupContextProvider>
    )
}

Group.displayName = 'CheckboxGroup'

export default Group
