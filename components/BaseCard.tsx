'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface BaseCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
  borderColor?: string
  shadowColor?: string
}

export function BaseCard({
  children,
  className = '',
  onClick,
  hover = true,
  padding = 'md',
  borderColor,
  shadowColor,
}: BaseCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const hoverClasses = hover
    ? 'transition-all duration-300 transform hover:-translate-y-1 cursor-pointer'
    : ''

  const cardStyle = {
    boxShadow: shadowColor
      ? `0 25px 50px -12px ${shadowColor}`
      : '0 25px 50px -12px rgba(224, 30, 31, 0.25)',
    border: borderColor
      ? `1px solid ${borderColor}`
      : '1px solid rgba(224, 30, 31, 0.5)',
  }

  return (
    <div
      className={cn(
        'rounded-2xl bg-white',
        paddingClasses[padding],
        hoverClasses,
        'relative overflow-hidden group shadow-2xl',
        className
      )}
      style={cardStyle}
      onClick={onClick}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}

