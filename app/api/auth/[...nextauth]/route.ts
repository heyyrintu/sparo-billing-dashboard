import { NextResponse } from 'next/server'

// Explicitly block all NextAuth routes - authentication is disabled
export async function GET() {
  return NextResponse.json(
    { error: 'Authentication is disabled' },
    { status: 404 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'Authentication is disabled' },
    { status: 404 }
  )
}

