'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  children,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gradient-to-r from-nightshade-600 to-purple-600 hover:from-nightshade-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 focus:ring-nightshade-500',
    secondary: 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white focus:ring-white/50',
    outline: 'border-2 border-nightshade-500 hover:bg-nightshade-500 text-nightshade-500 hover:text-white focus:ring-nightshade-500',
    ghost: 'hover:bg-white/10 text-white focus:ring-white/50',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg focus:ring-red-500'
  }

  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
    icon: 'p-2'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        loading && 'cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
