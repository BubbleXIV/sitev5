'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef(({
  className,
  children,
  hover = false,
  padding = 'default',
  ...props
}, ref) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    default: 'p-6',
    large: 'p-8'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'glass-dark rounded-xl border border-white/10',
        hover && 'hover:bg-white/5 hover:transform hover:scale-105 transition-all duration-300 cursor-pointer',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card
