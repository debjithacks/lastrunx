const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@yourdomain.com' },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
      create: {
        email: 'admin@yourdomain.com',
        username: 'admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('\n📧 Email:', admin.email)
    console.log('🔑 Password: admin123')
    console.log('👤 Role:', admin.role)
    console.log('\n🌐 Login at: http://localhost:3000/admin/login')
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
