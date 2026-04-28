import classNames from 'classnames'
import Tag from '@/components/ui/Tag'
import { HiArrowUp, HiArrowDown } from 'react-icons/hi'
import growShrinkColor from '@/utils/growShrinkColor'
import type { ReactNode, Ref } from 'react'

type GrowShrinkTagProps = {
    value?: number
    showIcon?: boolean
    prefix?: ReactNode | string
    suffix?: ReactNode | string
    className?: string
    ref?: Ref<HTMLDivElement>
}

const GrowShrinkTag = (props: GrowShrinkTagProps) => {
    const { value = 0, className, prefix, ref, suffix, showIcon = true } = props

    return (
        <Tag
            ref={ref}
            className={classNames(
                'gap-1 font-bold border-0',
                growShrinkColor(value, 'text'),
                growShrinkColor(value, 'bg'),
                className
            )}
        >
            {value !== 0 && (
                <span>
                    {showIcon && (value > 0 ? <HiArrowUp /> : <HiArrowDown />)}
                </span>
            )}
            <span>
                {prefix}
                {value}
                {suffix}
            </span>
        </Tag>
    )
}

GrowShrinkTag.displayName = 'GrowShrinkTag'

export default GrowShrinkTag
