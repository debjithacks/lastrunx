import { HeroSection } from '@/components/HeroSection'
import { StatsSection } from '@/components/StatsSection'
import { GamesShowcase } from '@/components/GamesShowcase'
import { FeaturesSection } from '@/components/FeaturesSection'
import { CTASection } from '@/components/CTASection'
import AdCarousel from '@/components/AdCarousel'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Promotional Ads Carousel - FIRST! */}
      <section className="container mx-auto px-4 pt-20 pb-8">
        <AdCarousel 
          placement="HERO" 
          autoSlide={true} 
          interval={5000}
          className="shadow-2xl"
        />
      </section>

      <HeroSection />
      <StatsSection />
      <GamesShowcase />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
