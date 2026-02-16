const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function findAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    if (admins.length === 0) {
      console.log('❌ No admin users found in database')
    } else {
      console.log(`✅ Found ${admins.length} admin user(s):\n`)
      admins.forEach((admin, index) => {
        console.log(`Admin ${index + 1}:`)
        console.log(`  📧 Email: ${admin.email}`)
        console.log(`  👤 Username: ${admin.username}`)
        console.log(`  🎯 Role: ${admin.role}`)
        console.log(`  ✓ Active: ${admin.isActive}`)
        console.log(`  📅 Created: ${admin.createdAt}`)
        console.log('')
      })
      console.log('Note: The password is likely "admin123" (default from create-admin script)')
      console.log('🌐 Login at: http://localhost:3000/admin/login')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

findAdmins()
