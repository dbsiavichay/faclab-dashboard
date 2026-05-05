import { useMemo, useContext, useCallback } from 'react'
import classNames from 'classnames'
import RadioGroupContext from './context'
import { useConfig } from '../ConfigProvider'
import type { CommonProps } from '../@types/common'
import type { InputHTMLAttributes, Ref } from 'react'

export interface RadioProps
    extends CommonProps,
        Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    checked?: boolean
    color?: string
    defaultChecked?: boolean
    disabled?: boolean
    labelRef?: Ref<HTMLLabelElement>
    name?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange?: (value: any, e: MouseEvent) => void
    ref?: Ref<HTMLInputElement>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any
    vertical?: boolean
    readOnly?: boolean
}

const Radio = (props: RadioProps) => {
    const {
        name: nameContext,
        disabled: disabledContext,
        value: groupValue,
        onChange: onGroupChange,
        color: colorContext,
        vertical: verticalContext,
        radioGutter,
    } = useContext(RadioGroupContext)

    const {
        children,
        className,
        checked: checkedProp,
        color,
        defaultChecked,
        disabled = disabledContext,
        labelRef,
        name = nameContext,
        onChange,
        readOnly,
        ref,
        value,
        vertical = verticalContext,
        ...rest
    } = props

    const { themeColor, primaryColorLevel } = useConfig()

    const getChecked = () => {
        return typeof groupValue !== 'undefined'
            ? groupValue === value
            : checkedProp
    }

    const radioChecked = getChecked()

    const radioColor =
        color || colorContext || `${themeColor}-${primaryColorLevel}`

    const controlProps = useMemo(() => {
        if (typeof groupValue !== 'undefined') {
            return { checked: radioChecked }
        }
        return { checked: checkedProp, defaultChecked }
    }, [radioChecked, checkedProp, defaultChecked, groupValue])

    const onRadioChange = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => {
            if (disabled || readOnly) {
                return
            }
            onGroupChange?.(value, e)
            onChange?.(value, e)
        },
        [disabled, onChange, value, onGroupChange, readOnly]
    )

    const radioDefaultClass = `radio text-${radioColor}`
    const radioColorClass = disabled && 'disabled'
    const labelDisabledClass = disabled && 'disabled'

    const radioClass = classNames(radioDefaultClass, radioColorClass)
    const labelClass = classNames(
        'radio-label',
        labelDisabledClass,
        className,
        `${'inline-flex'}`,
        `${radioGutter ? 'm' + (vertical ? 'b-' : 'r-') + radioGutter : ''}`
    )

    return (
        <label ref={labelRef} className={labelClass}>
            <input
                ref={ref}
                type="radio"
                className={radioClass}
                disabled={disabled}
                value={value}
                name={name}
                readOnly={readOnly}
                onChange={onRadioChange}
                {...controlProps}
                {...rest}
            />
            {children ? (
                <span
                    className={classNames(
                        'ltr:ml-2 rtl:mr-2',
                        disabled ? 'opacity-50' : ''
                    )}
                >
                    {children}
                </span>
            ) : null}
        </label>
    )
}

Radio.displayName = 'Radio'

export default Radio
