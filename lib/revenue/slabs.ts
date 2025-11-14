export interface RevenueSlab {
  min: number // in crores
  max: number | null // in crores (null for last slab)
  rate: number // percentage
}

export const REVENUE_SLABS: RevenueSlab[] = [
  { min: 0, max: 5, rate: 1.75 },
    { min: 5, max: 8, rate: 1.69 },
  { min: 8, max: 11, rate: 1.57 },
  { min: 11, max: 14, rate: 1.47 },
  { min: 14, max: 17, rate: 1.39 },
  { min: 17, max: null, rate: 1.39 }, // Above 17 cr
]

export function getSlabForAmount(amount: number): RevenueSlab {
  const amountInCrores = amount / 10000000 // Convert to crores
  
  for (const slab of REVENUE_SLABS) {
    if (amountInCrores >= slab.min && (slab.max === null || amountInCrores < slab.max)) {
      return slab
    }
  }
  
  // Fallback to last slab if amount exceeds all defined slabs
  return REVENUE_SLABS[REVENUE_SLABS.length - 1]
}
