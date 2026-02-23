import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/admin/login')
  }
  
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'TOURNAMENT_MANAGER') {
    redirect('/admin/login?error=unauthorized')
  }
  
  return session
}

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/admin/login')
  }
  
  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin/dashboard?error=forbidden')
  }
  
  return session
}

export function isSuperAdmin(role?: string) {
  return role === 'SUPER_ADMIN'
}

export function canAccessSection(role: string | undefined, section: string): boolean {
  if (role === 'SUPER_ADMIN') return true
  
  if (role === 'TOURNAMENT_MANAGER') {
    const managerAccess = [
      'dashboard',
      'tournaments',
      'registrations',
    ]
    return managerAccess.includes(section)
  }
  
  return false
}

export function getAccessibleSections(role: string | undefined): string[] {
  if (role === 'SUPER_ADMIN') {
    return [
      'dashboard',
      'tournaments',
      'users',
      'withdrawals',
      'kyc',
      'coupons',
      'disputes',
      'notifications',
      'referrals',
      'logs',
      'settings',
      'ads', // Only SuperAdmin
    ]
  }
  
  if (role === 'TOURNAMENT_MANAGER') {
    return [
      'dashboard',
      'tournaments',
    ]
  }
  
  return []
}
