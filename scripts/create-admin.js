#!/usr/bin/env node

/**
 * Emergency Admin User Creation Script
 * 
 * This script creates the admin user directly in the database.
 * Use this if the automatic seeding during deployment fails.
 * 
 * Usage:
 *   1. Set your DATABASE_URL environment variable
 *   2. Run: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dronalogitech.cloud'
  const adminPassword = process.env.ADMIN_PASSWORD || 'drona@12345'
  
  console.log('================================================')
  console.log('🔧 Emergency Admin User Creation')
  console.log('================================================')
  console.log(`📧 Email: ${adminEmail}`)
  console.log(`🔐 Password: ${'*'.repeat(adminPassword.length)}`)
  console.log('================================================\n')
  
  try {
    console.log('🔍 Checking if admin user already exists...')
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists!')
      console.log('🔄 Updating password...')
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Password updated successfully!')
      console.log(`📧 Email: ${updatedUser.email}`)
      console.log(`🆔 ID: ${updatedUser.id}`)
      console.log(`👤 Role: ${updatedUser.role}`)
    } else {
      console.log('✨ Creating new admin user...')
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      
      const newUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        }
      })
      
      console.log('✅ Admin user created successfully!')
      console.log(`📧 Email: ${newUser.email}`)
      console.log(`🆔 ID: ${newUser.id}`)
      console.log(`👤 Role: ${newUser.role}`)
    }
    
    console.log('\n================================================')
    console.log('🎉 Success! You can now login with:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('================================================')
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:')
    console.error(error)
    
    if (error.code === 'P2002') {
      console.error('\n⚠️  User already exists with this email')
      console.error('💡 Try resetting the password instead')
    } else if (error.code === 'P2003') {
      console.error('\n⚠️  Database connection failed')
      console.error('💡 Check your DATABASE_URL environment variable')
    }
    
    process.exit(1)
  }
}

createAdmin()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
