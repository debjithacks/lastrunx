import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  )
}
