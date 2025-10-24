import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const disabled = process.env.DISABLE_AUTH === 'true'
    return NextResponse.json({ disableAuth: disabled })
  } catch (err: any) {
    return NextResponse.json({ disableAuth: false, error: err?.message || 'error' })
  }
}
