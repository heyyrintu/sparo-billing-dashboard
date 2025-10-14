import { computeRevenueMarginal, computeRevenueFlat } from '@/lib/revenue/calculator'

describe('Revenue Calculator', () => {
  describe('Marginal Revenue Calculation', () => {
    test('should calculate revenue for 9 crores correctly', () => {
      const grossSale = 9 * 10000000 // 9 crores in rupees
      const revenue = computeRevenueMarginal(grossSale)
      
      // Expected calculation:
      // 0-5 cr @ 1.75% = 5 * 1.75% = 0.0875 cr = 8.75 lakh
      // 5-8 cr @ 1.65% = 3 * 1.65% = 0.0495 cr = 4.95 lakh  
      // 8-9 cr @ 1.55% = 1 * 1.55% = 0.0155 cr = 1.55 lakh
      // Total = 15.25 lakh = 1,525,000 rupees
      const expectedRevenue = 1525000
      
      expect(revenue).toBeCloseTo(expectedRevenue, 0)
    })

    test('should calculate revenue for 5 crores exactly', () => {
      const grossSale = 5 * 10000000
      const revenue = computeRevenueMarginal(grossSale)
      
      // 0-5 cr @ 1.75% = 5 * 1.75% = 0.0875 cr = 8.75 lakh
      const expectedRevenue = 875000
      
      expect(revenue).toBeCloseTo(expectedRevenue, 0)
    })

    test('should calculate revenue for 20 crores', () => {
      const grossSale = 20 * 10000000
      const revenue = computeRevenueMarginal(grossSale)
      
      // All slabs applied
      const expectedRevenue = 5 * 0.0175 + 3 * 0.0165 + 3 * 0.0155 + 3 * 0.0145 + 3 * 0.0135 + 3 * 0.0125
      const expectedRevenueInRupees = expectedRevenue * 10000000
      
      expect(revenue).toBeCloseTo(expectedRevenueInRupees, 0)
    })

    test('should return 0 for zero or negative amounts', () => {
      expect(computeRevenueMarginal(0)).toBe(0)
      expect(computeRevenueMarginal(-1000)).toBe(0)
    })
  })

  describe('Flat Revenue Calculation', () => {
    test('should calculate flat revenue for 9 crores', () => {
      const grossSale = 9 * 10000000
      const revenue = computeRevenueFlat(grossSale)
      
      // Should use 8-11 cr slab rate: 1.55%
      const expectedRevenue = grossSale * 0.0155
      
      expect(revenue).toBeCloseTo(expectedRevenue, 0)
    })

    test('should calculate flat revenue for 5 crores', () => {
      const grossSale = 5 * 10000000
      const revenue = computeRevenueFlat(grossSale)
      
      // Should use 0-5 cr slab rate: 1.75%
      const expectedRevenue = grossSale * 0.0175
      
      expect(revenue).toBeCloseTo(expectedRevenue, 0)
    })

    test('should calculate flat revenue for 20 crores', () => {
      const grossSale = 20 * 10000000
      const revenue = computeRevenueFlat(grossSale)
      
      // Should use >20 cr slab rate: 1.15%
      const expectedRevenue = grossSale * 0.0115
      
      expect(revenue).toBeCloseTo(expectedRevenue, 0)
    })

    test('should return 0 for zero or negative amounts', () => {
      expect(computeRevenueFlat(0)).toBe(0)
      expect(computeRevenueFlat(-1000)).toBe(0)
    })
  })

  describe('Boundary Tests', () => {
    const boundaries = [
      { amount: 5, expectedMarginal: 5 * 0.0175, expectedFlat: 5 * 0.0175 },
      { amount: 8, expectedMarginal: 5 * 0.0175 + 3 * 0.0165, expectedFlat: 8 * 0.0165 },
      { amount: 11, expectedMarginal: 5 * 0.0175 + 3 * 0.0165 + 3 * 0.0155, expectedFlat: 11 * 0.0155 },
      { amount: 14, expectedMarginal: 5 * 0.0175 + 3 * 0.0165 + 3 * 0.0155 + 3 * 0.0145, expectedFlat: 14 * 0.0145 },
      { amount: 17, expectedMarginal: 5 * 0.0175 + 3 * 0.0165 + 3 * 0.0155 + 3 * 0.0145 + 3 * 0.0135, expectedFlat: 17 * 0.0135 },
      { amount: 20, expectedMarginal: 5 * 0.0175 + 3 * 0.0165 + 3 * 0.0155 + 3 * 0.0145 + 3 * 0.0135 + 3 * 0.0125, expectedFlat: 20 * 0.0125 },
    ]

    boundaries.forEach(({ amount, expectedMarginal, expectedFlat }) => {
      test(`should handle boundary at ${amount} crores correctly`, () => {
        const grossSale = amount * 10000000
        const marginalRevenue = computeRevenueMarginal(grossSale)
        const flatRevenue = computeRevenueFlat(grossSale)
        
        const expectedMarginalInRupees = expectedMarginal * 10000000
        const expectedFlatInRupees = expectedFlat * 10000000
        
        expect(marginalRevenue).toBeCloseTo(expectedMarginalInRupees, 0)
        expect(flatRevenue).toBeCloseTo(expectedFlatInRupees, 0)
      })
    })
  })
})
