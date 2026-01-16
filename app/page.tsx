import { HeroSection } from '@/components/HeroSection'
import { StatsSection } from '@/components/StatsSection'
import { GamesShowcase } from '@/components/GamesShowcase'
import { FeaturesSection } from '@/components/FeaturesSection'
import { CTASection } from '@/components/CTASection'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <GamesShowcase />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
