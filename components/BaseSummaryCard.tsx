'use client'

import { ReactNode } from 'react'
import { BaseCard } from './BaseCard'

export interface BaseSummaryCardProps {
  label: string
  value: string | number
  description?: string
  icon?: string | ReactNode
  isLoading?: boolean
  color?: string
  formatValue?: (value: string | number) => string | number
  className?: string
}

export function BaseSummaryCard({
  label,
  value,
  description,
  icon,
  isLoading = false,
  color,
  formatValue,
  className = '',
}: BaseSummaryCardProps) {
  const defaultColor = 'rgba(224, 30, 31, 0.5)'

  const cardColor = color || defaultColor
  const displayValue = formatValue ? formatValue(value) : value

  const valueGradientClass = 'bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent'

  return (
    <BaseCard
      borderColor={cardColor}
      shadowColor={cardColor}
      className={className}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium mb-2 text-black">
            {label}
          </p>
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <p className={`text-4xl font-bold ${valueGradientClass}`}>
              {displayValue}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300 ml-4">
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs mt-4 relative z-10 text-gray-500">
          {description}
        </p>
      )}
    </BaseCard>
  )
}

