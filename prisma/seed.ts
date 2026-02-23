import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create Admin Users
  console.log('👤 Creating admin users...')
  
  const adminPassword = await bcrypt.hash('admin123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@lastrunx.in' },
    update: {},
    create: {
      email: 'admin@lastrunx.in',
      username: 'superadmin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      phoneVerified: true,
    },
  })
  console.log('✅ Created Super Admin:', superAdmin.email)

  const tournamentManager = await prisma.user.upsert({
    where: { email: 'manager@lastrunx.in' },
    update: {},
    create: {
      email: 'manager@lastrunx.in',
      username: 'manager',
      password: managerPassword,
      role: 'TOURNAMENT_MANAGER',
      isActive: true,
      phoneVerified: true,
    },
  })
  console.log('✅ Created Tournament Manager:', tournamentManager.email)

  // Create some test users
  console.log('👥 Creating test users...')
  
  const testPassword = await bcrypt.hash('test123', 10)
  
  for (let i = 1; i <= 5; i++) {
    await prisma.user.upsert({
      where: { email: `user${i}@test.com` },
      update: {},
      create: {
        email: `user${i}@test.com`,
        username: `testuser${i}`,
        password: testPassword,
        role: 'USER',
        isActive: true,
        walletBalance: 1000,
      },
    })
  }
  console.log('✅ Created 5 test users')

  // Create sample tournament
  console.log('🏆 Creating sample tournament...')
  
  const tournament = await prisma.tournament.upsert({
    where: { id: 'sample-tournament-1' },
    update: {},
    create: {
      id: 'sample-tournament-1',
      title: 'BGMI Championship 2026',
      game: 'BGMI',
      description: 'Join the biggest BGMI tournament of the year! Compete for amazing prizes.',
      image: '/images/tournaments/bgmi-banner.jpg',
      entryFee: 100,
      prizePool: 50000,
      maxPlayers: 100,
      minPlayers: 10,
      mode: 'SOLO',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours after start
      status: 'UPCOMING',
      rules: JSON.stringify({
        teamSize: 1,
        map: 'Erangel',
        mode: 'TPP',
        rounds: 3,
      }),
      prizeDistribution: JSON.stringify([
        { position: 1, amount: 25000 },
        { position: 2, amount: 15000 },
        { position: 3, amount: 10000 },
      ]),
    },
  })
  console.log('✅ Created sample tournament:', tournament.title)

  // Create sample ads
  console.log('📢 Creating sample ads...')
  
  const ads = [
    {
      id: 'hero-ad-1',
      title: 'BGMI Championship 2026 - Register Now',
      mediaUrl: '/ads/bgmi-hero.webp',
      mediaType: 'IMAGE',
      placement: 'HERO',
      redirectUrl: '/tournaments/bgmi-championship-2026',
      priority: 1,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
      id: 'banner-ad-1',
      title: 'Get 50% OFF on First Entry',
      mediaUrl: '/ads/promo-banner.webp',
      mediaType: 'IMAGE',
      placement: 'BANNER',
      redirectUrl: '/tournaments',
      priority: 1,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      deviceTarget: 'ALL',
    },
  ]

  for (const ad of ads) {
    await prisma.ad.upsert({
      where: { id: ad.id },
      update: {},
      create: ad as any,
    })
    console.log(`✅ Created ad: ${ad.title}`)
  }

  console.log('🎉 Seeding completed successfully!')
  console.log('\n📋 Admin Credentials:')
  console.log('   Email: admin@lastrunx.in')
  console.log('   Password: admin123')
  console.log('   Role: SUPER_ADMIN')
  console.log('\n📋 Manager Credentials:')
  console.log('   Email: manager@lastrunx.in')
  console.log('   Password: manager123')
  console.log('   Role: TOURNAMENT_MANAGER')
  console.log('\n📋 Test User Credentials:')
  console.log('   Email: user1@test.com - user5@test.com')
  console.log('   Password: test123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
