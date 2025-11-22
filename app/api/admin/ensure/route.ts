import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

// Idempotent runtime fallback to ensure admin user exists
export async function POST(request: NextRequest) {
  const token = request.headers.get('x-ensure-token') || ''
  const expected = process.env.ENSURE_ADMIN_TOKEN || ''

  if (!expected) {
    return NextResponse.json({ ok: false, error: 'ENSURE_ADMIN_TOKEN not configured' }, { status: 500 })
  }

  if (token !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dronalogitech.cloud'
  const adminPassword = process.env.ADMIN_PASSWORD || 'drona@12345'

  try {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: hashedPassword, role: 'admin' },
      create: { email: adminEmail, password: hashedPassword, role: 'admin' },
    })

    return NextResponse.json({ ok: true, email: user.email, role: user.role })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  // Disallow GET to avoid accidental invocation
  return NextResponse.json({ ok: false, error: 'Method Not Allowed' }, { status: 405 })
}
