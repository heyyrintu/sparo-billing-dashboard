const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  // Create admin user from environment variables or defaults
  const adminEmail = process.env.ADMIN_EMAIL || 'drona_admin@spario.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  console.log(`Creating admin user: ${adminEmail}`)
  
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
