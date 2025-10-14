import { REVENUE_SLABS } from './slabs'

export function computeRevenueMarginal(grossSale: number): number {
  if (grossSale <= 0) return 0
  
  const amountInCrores = grossSale / 10000000 // Convert to crores
  let totalRevenue = 0
  
  for (const slab of REVENUE_SLABS) {
    if (amountInCrores <= slab.min) break
    
    const slabAmount = Math.min(
      amountInCrores - slab.min,
      slab.max ? slab.max - slab.min : amountInCrores - slab.min
    )
    
    if (slabAmount > 0) {
      const slabRevenue = (slabAmount * slab.rate) / 100
      totalRevenue += slabRevenue
    }
  }
  
  return totalRevenue * 10000000 // Convert back to rupees
}

export function computeRevenueFlat(grossSale: number): number {
  if (grossSale <= 0) return 0
  
  const amountInCrores = grossSale / 10000000 // Convert to crores
  
  for (const slab of REVENUE_SLABS) {
    if (amountInCrores >= slab.min && (slab.max === null || amountInCrores < slab.max)) {
      return (grossSale * slab.rate) / 100
    }
  }
  
  // Fallback to last slab rate
  const lastSlab = REVENUE_SLABS[REVENUE_SLABS.length - 1]
  return (grossSale * lastSlab.rate) / 100
}

export function computeMonthlyRevenue(grossSale: number): {
  marginal: number
  flat: number
} {
  return {
    marginal: computeRevenueMarginal(grossSale),
    flat: computeRevenueFlat(grossSale)
  }
}

// Helper function to get revenue breakdown for display
export function getRevenueBreakdown(grossSale: number): Array<{
  slab: string
  amount: number
  rate: number
  revenue: number
}> {
  if (grossSale <= 0) return []
  
  const amountInCrores = grossSale / 10000000
  const breakdown: Array<{
    slab: string
    amount: number
    rate: number
    revenue: number
  }> = []
  
  for (const slab of REVENUE_SLABS) {
    if (amountInCrores <= slab.min) break
    
    const slabAmount = Math.min(
      amountInCrores - slab.min,
      slab.max ? slab.max - slab.min : amountInCrores - slab.min
    )
    
    if (slabAmount > 0) {
      const slabRevenue = (slabAmount * slab.rate) / 100
      breakdown.push({
        slab: `${slab.min}-${slab.max || '∞'} cr`,
        amount: slabAmount,
        rate: slab.rate,
        revenue: slabRevenue
      })
    }
  }
  
  return breakdown
}
