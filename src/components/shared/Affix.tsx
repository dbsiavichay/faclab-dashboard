import { useEffect, useRef } from 'react'
import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'

type AffixStyles = {
    position: string
    top: string
    width: string
}

interface AffixProps extends CommonProps {
    offset?: number
}

function Affix(props: AffixProps) {
    const { offset = 0, className, children } = props

    const ref = useRef<HTMLDivElement>(null)
    const prevStyleRef = useRef<AffixStyles>({
        position: '',
        top: '',
        width: '',
    })

    const checkPosition = (distanceToBody: number, width?: number) => {
        const scrollTop = window.scrollY

        if (ref.current) {
            if (distanceToBody - scrollTop < offset) {
                if (ref.current.style.position !== 'fixed') {
                    for (const key in prevStyleRef.current) {
                        prevStyleRef.current[key as keyof AffixStyles] =
                            ref.current.style[key as keyof AffixStyles]
                    }
                    ref.current.style.position = 'fixed'
                    ref.current.style.width = width + 'px'
                    ref.current.style.top = offset + 'px'
                }
            } else {
                for (const key in prevStyleRef.current) {
                    ref.current.style[key as keyof AffixStyles] =
                        prevStyleRef.current[key as keyof AffixStyles]
                }
            }
        }
    }

    useEffect(() => {
        if (typeof window.scrollY === 'undefined') {
            return
        }

        if (ref.current) {
            const distanceToBody =
                window.scrollY + ref.current.getBoundingClientRect().top
            const handleScroll = () => {
                if (!ref.current) {
                    return
                }

                requestAnimationFrame(() => {
                    checkPosition(distanceToBody, ref.current?.clientWidth)
                })
            }

            window.addEventListener('scroll', handleScroll)
            return () => {
                window.removeEventListener('scroll', handleScroll)
            }
        }
    })

    return (
        <div ref={ref} className={classNames('z-10', className)}>
            {children}
        </div>
    )
}

export default Affix
