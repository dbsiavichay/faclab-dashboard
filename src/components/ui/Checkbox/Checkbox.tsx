import { useContext, useCallback, useState } from 'react'
import classNames from 'classnames'
import CheckboxGroupContext from './context'
import { useConfig } from '../ConfigProvider'
import type { CommonProps } from '../@types/common'
import type { CheckboxValue } from './context'
import type { ChangeEvent, Ref } from 'react'

export interface CheckboxProps extends CommonProps {
    checked?: boolean
    color?: string
    defaultChecked?: boolean
    disabled?: boolean
    labelRef?: Ref<HTMLLabelElement>
    name?: string
    onChange?: (values: boolean, e: ChangeEvent<HTMLInputElement>) => void
    readOnly?: boolean
    ref?: Ref<HTMLInputElement>
    value?: CheckboxValue
}

const Checkbox = (props: CheckboxProps) => {
    const {
        name: nameContext,
        value: groupValue,
        onChange: onGroupChange,
        color: colorContext,
    } = useContext(CheckboxGroupContext)

    const {
        color,
        className,
        onChange,
        children,
        disabled,
        readOnly,
        name = nameContext,
        defaultChecked,
        value,
        checked: controlledChecked,
        labelRef,
        ref,
        ...rest
    } = props

    const { themeColor, primaryColorLevel } = useConfig()

    const isChecked = useCallback(() => {
        if (typeof groupValue !== 'undefined' && typeof value !== 'undefined') {
            return groupValue.some((i) => i === value)
        }
        return controlledChecked || defaultChecked
    }, [controlledChecked, groupValue, value, defaultChecked])

    const [checkboxChecked, setCheckboxChecked] = useState(isChecked())

    const getControlProps = () => {
        let groupChecked = { checked: checkboxChecked }
        const singleChecked: {
            defaultChecked?: boolean
            checked?: boolean
        } = {}

        if (typeof controlledChecked !== 'undefined') {
            singleChecked.checked = controlledChecked
        }

        if (typeof groupValue !== 'undefined') {
            groupChecked = { checked: groupValue.includes(value as never) }
        }

        if (defaultChecked) {
            singleChecked.defaultChecked = defaultChecked
        }
        return typeof groupValue !== 'undefined' ? groupChecked : singleChecked
    }

    const controlProps = getControlProps()

    const onCheckboxChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            let nextChecked = !checkboxChecked

            if (typeof groupValue !== 'undefined') {
                nextChecked = !groupValue.includes(value as never)
            }

            if (disabled || readOnly) {
                return
            }

            setCheckboxChecked(nextChecked)
            onChange?.(nextChecked, e)
            onGroupChange?.(value as CheckboxValue, nextChecked, e)
        },
        [
            checkboxChecked,
            disabled,
            readOnly,
            setCheckboxChecked,
            onChange,
            value,
            onGroupChange,
            groupValue,
        ]
    )

    const checkboxColor =
        color || colorContext || `${themeColor}-${primaryColorLevel}`

    const checkboxDefaultClass = `checkbox text-${checkboxColor}`
    const checkboxColorClass = disabled && 'disabled'
    const labelDefaultClass = `checkbox-label`
    const labelDisabledClass = disabled && 'disabled'

    const checkBoxClass = classNames(checkboxDefaultClass, checkboxColorClass)

    const labelClass = classNames(
        labelDefaultClass,
        labelDisabledClass,
        className
    )

    return (
        <label ref={labelRef} className={labelClass}>
            <input
                ref={ref}
                className={checkBoxClass}
                type="checkbox"
                disabled={disabled}
                readOnly={readOnly}
                name={name}
                onChange={onCheckboxChange}
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

Checkbox.displayName = 'Checkbox'

export default Checkbox
