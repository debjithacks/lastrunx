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

  // Create Demo User for testing
  console.log('👤 Creating demo user...')
  
  const demoPassword = await bcrypt.hash('demo123', 10)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@lastrunx.in' },
    update: {
      walletBalance: 10000, // Update balance if user exists
    },
    create: {
      email: 'demo@lastrunx.in',
      username: 'demouser',
      password: demoPassword,
      role: 'USER',
      isActive: true,
      phoneVerified: true,
      walletBalance: 10000, // ₹10,000 for testing
    },
  })
  console.log('✅ Created Demo User:', demoUser.email)

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

  // Create sample tournaments
  console.log('🏆 Creating sample tournaments...')
  
  const tournaments = [
    {
      id: 'sample-tournament-1',
      title: 'BGMI Championship 2026',
      game: 'BGMI',
      description: 'Join the biggest BGMI tournament of the year! Compete for amazing prizes.',
      image: '/images/games/bgmi.avif',
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
    {
      id: 'tournament-ff-2',
      title: 'Free Fire Max Squad Battle',
      game: 'Free Fire Max',
      description: 'Ultimate squad showdown! Form your team and dominate.',
      image: '/images/games/ff-max.jpg',
      entryFee: 50,
      prizePool: 25000,
      maxPlayers: 48,
      minPlayers: 12,
      mode: 'SQUAD',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: 'UPCOMING',
      rules: JSON.stringify({
        teamSize: 4,
        map: 'Bermuda',
        mode: 'Squad',
        rounds: 2,
      }),
      prizeDistribution: JSON.stringify([
        { position: 1, amount: 12000 },
        { position: 2, amount: 8000 },
        { position: 3, amount: 5000 },
      ]),
    },
    {
      id: 'tournament-cod-3',
      title: 'COD Mobile Battle Royale',
      game: 'COD Mobile',
      description: 'Intense battle royale action. Prove your skills!',
      image: '/images/games/codm.webp',
      entryFee: 75,
      prizePool: 35000,
      maxPlayers: 80,
      minPlayers: 20,
      mode: 'SOLO',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      status: 'UPCOMING',
      rules: JSON.stringify({
        teamSize: 1,
        map: 'Isolated',
        mode: 'BR',
        rounds: 3,
      }),
      prizeDistribution: JSON.stringify([
        { position: 1, amount: 18000 },
        { position: 2, amount: 10000 },
        { position: 3, amount: 7000 },
      ]),
    },
    {
      id: 'tournament-ml-4',
      title: 'Mobile Legends 5v5 Cup',
      game: 'Mobile Legends',
      description: '5v5 MOBA tournament. Strategy meets action!',
      image: '/images/games/mlbb.jpg',
      entryFee: 200,
      prizePool: 100000,
      maxPlayers: 10,
      minPlayers: 10,
      mode: 'SQUAD',
      startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      status: 'UPCOMING',
      rules: JSON.stringify({
        teamSize: 5,
        map: 'Classic',
        mode: '5v5',
        rounds: 1,
      }),
      prizeDistribution: JSON.stringify([
        { position: 1, amount: 60000 },
        { position: 2, amount: 40000 },
      ]),
    },
    {
      id: 'tournament-cr-5',
      title: 'Clash Royale 1v1 Arena',
      game: 'Clash Royale',
      description: 'Test your deck strategy in intense 1v1 matches.',
      image: '/images/games/clashroyale.webp',
      entryFee: 25,
      prizePool: 10000,
      maxPlayers: 32,
      minPlayers: 8,
      mode: 'SOLO',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: 'UPCOMING',
      rules: JSON.stringify({
        teamSize: 1,
        arenaLevel: '5000+',
        mode: '1v1',
        rounds: 'Best of 3',
      }),
      prizeDistribution: JSON.stringify([
        { position: 1, amount: 5000 },
        { position: 2, amount: 3000 },
        { position: 3, amount: 2000 },
      ]),
    },
    {
      id: 'tournament-bgmi-6',
      title: 'BGMI Quick Match',
      game: 'BGMI',
      description: 'Fast-paced BGMI action. Quick rewards!',
      image: '/images/games/bgmi.avif',
      entryFee: 30,
      prizePool: 8000,
      maxPlayers: 60,
      minPlayers: 20,
      mode: 'SOLO',
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
      status: 'UPCOMING',
      rules: JSON.stringify({
        teamSize: 1,
        map: 'Sanhok',
        mode: 'TPP',
        rounds: 1,
      }),
      prizeDistribution: JSON.stringify([
        { position: 1, amount: 4000 },
        { position: 2, amount: 2500 },
        { position: 3, amount: 1500 },
      ]),
    },
  ]

  for (const tournamentData of tournaments) {
    await prisma.tournament.upsert({
      where: { id: tournamentData.id },
      update: {
        image: tournamentData.image,
        title: tournamentData.title,
        description: tournamentData.description,
      },
      create: tournamentData as any,
    })
    console.log(`✅ Created/Updated tournament: ${tournamentData.title}`)
  }

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
  console.log('\n🎮 DEMO USER CREDENTIALS (For Testing):')
  console.log('   Email: demo@lastrunx.in')
  console.log('   Password: demo123')
  console.log('   Wallet Balance: ₹10,000')
  console.log('   Use this account to test tournament joining!')
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
