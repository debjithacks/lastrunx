const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@lastrunx.in' }
    })

    let admin
    if (existingUser) {
      // Update existing user
      admin = await prisma.user.update({
        where: { email: 'admin@lastrunx.in' },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      })
      console.log('✅ Admin user updated successfully!')
    } else {
      // Create new admin user
      admin = await prisma.user.create({
        data: {
          email: 'admin@lastrunx.in',
          username: 'superadmin',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      })
      console.log('✅ Admin user created successfully!')
    }

    console.log('\n📧 Email:', admin.email)
    console.log('🔑 Password: admin123')
    console.log('👤 Role:', admin.role)
    console.log('👤 Username:', admin.username)
    console.log('\n🌐 Login at: http://localhost:3000/admin/login')
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
