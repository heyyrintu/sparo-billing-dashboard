import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({ 
      status: 'ok',
      message: 'Database connection successful',
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set'
    })
  } catch (error) {
    console.error('Database test error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
      suggestion: !process.env.DATABASE_URL 
        ? 'DATABASE_URL is not set. Please create a .env.local file with DATABASE_URL=postgresql://...'
        : 'Please check your DATABASE_URL and ensure PostgreSQL is running.'
    }, { status: 500 })
  }
}

