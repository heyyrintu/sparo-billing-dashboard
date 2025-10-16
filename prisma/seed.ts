import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create admin user from environment variables or defaults
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dronalogitech.cloud'
  const adminPassword = process.env.ADMIN_PASSWORD || 'drona@12345'
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('Admin user created:', adminUser.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
