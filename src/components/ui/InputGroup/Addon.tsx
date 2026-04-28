import classNames from 'classnames'
import { useConfig } from '../ConfigProvider'
import { useForm } from '../Form/context'
import { useInputGroup } from '../InputGroup/context'
import { CONTROL_SIZES } from '../utils/constants'
import type { CommonProps, TypeAttributes } from '../@types/common'
import type { Ref } from 'react'

export interface AddonProps extends CommonProps {
    ref?: Ref<HTMLDivElement>
    size?: TypeAttributes.ControlSize
}

const Addon = (props: AddonProps) => {
    const { size, children, className, ref } = props

    const { controlSize } = useConfig()
    const formControlSize = useForm()?.size
    const inputGroupSize = useInputGroup()?.size

    const inputAddonSize =
        size || inputGroupSize || formControlSize || controlSize

    const addonClass = classNames(
        'input-addon',
        `input-addon-${inputAddonSize} h-${CONTROL_SIZES[inputAddonSize]}`,
        className
    )

    return (
        <div ref={ref} className={addonClass}>
            {children}
        </div>
    )
}

Addon.displayName = 'Addon'

export default Addon
