#!/usr/bin/env node

// Postinstall script to generate Prisma client
// Uses a dummy DATABASE_URL if not set (for build-time generation)

const { execSync } = require('child_process');

// Set a dummy DATABASE_URL if not provided (needed for Prisma schema validation)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy?schema=public';
  console.log('⚠️  DATABASE_URL not set, using dummy URL for Prisma client generation');
  console.log('   Make sure to set DATABASE_URL in your deployment platform!');
}

try {
  console.log('🔧 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}

