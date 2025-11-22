"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import { cn } from "@/lib/utils"

// Chart configuration type
export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
  }
}

// Chart container component
export interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactNode
  className?: string
}

export function ChartContainer({
  config,
  children,
  className,
}: ChartContainerProps) {
  const id = React.useId()
  const uniqueId = React.useMemo(() => `chart-${id}`, [id])

  return (
    <div
      style={
        {
          "--color-desktop": config.desktop?.color || "hsl(var(--chart-1))",
          "--color-mobile": config.mobile?.color || "hsl(var(--chart-2))",
          "--color-value": config.value?.color || "#E01E1F",
          "--color-grossSale": config.grossSale?.color || "#E01E1F",
          "--color-revenue": config.revenue?.color || "#3B82F6",
        } as React.CSSProperties
      }
      className={cn("w-full", className)}
      id={uniqueId}
    >
      {children}
    </div>
  )
}

// Chart tooltip component
export interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  cursor?: boolean | object
  content?: React.ReactNode
  hideLabel?: boolean
}

export function ChartTooltip({
  active,
  payload,
  label,
  cursor = true,
  content,
  hideLabel = false,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  if (content) {
    return <>{content}</>
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      {!hideLabel && label && (
        <div className="mb-2 font-medium">{label}</div>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Chart tooltip content component
export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
}: {
  active?: boolean
  payload?: any[]
  label?: string
  hideLabel?: boolean
}) {
  return (
    <ChartTooltip
      active={active}
      payload={payload}
      label={label}
      hideLabel={hideLabel}
    />
  )
}

