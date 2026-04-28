import classNames from 'classnames'
import { useConfig } from '../ConfigProvider'
import { useForm } from '../Form/context'
import { InputGroupContextProvider, InputGroupContextConsumer } from './context'

import type { CommonProps, TypeAttributes } from '../@types/common'
import type { Ref } from 'react'

export interface InputGroupProps extends CommonProps {
    ref?: Ref<HTMLDivElement>
    size?: TypeAttributes.ControlSize
}

const InputGroup = (props: InputGroupProps) => {
    const { children, className, ref, size } = props

    const { controlSize } = useConfig()
    const formControlSize = useForm()?.size

    const inputGroupSize = size || formControlSize || controlSize

    const inputGroupClass = classNames('input-group', className)

    const contextValue = {
        size: inputGroupSize,
    }
    return (
        <InputGroupContextProvider value={contextValue}>
            <InputGroupContextConsumer>
                {() => {
                    return (
                        <div ref={ref} className={inputGroupClass}>
                            {children}
                        </div>
                    )
                }}
            </InputGroupContextConsumer>
        </InputGroupContextProvider>
    )
}

InputGroup.displayName = 'InputGroup'

export default InputGroup
