import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    username: string
    role: string
    walletBalance: string
    requires2FA?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      username: string
      role: string
      walletBalance: string
      requires2FA?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    role: string
    walletBalance: string
    requires2FA?: boolean
  }
}
