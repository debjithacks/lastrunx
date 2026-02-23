import { HeroSection } from '@/components/HeroSection'
import { StatsSection } from '@/components/StatsSection'
import { GamesShowcase } from '@/components/GamesShowcase'
import { FeaturesSection } from '@/components/FeaturesSection'
import { CTASection } from '@/components/CTASection'
import AdCarousel from '@/components/AdCarousel'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      
      {/* Promotional Ads Carousel */}
      <section className="container mx-auto px-4 py-8">
        <AdCarousel 
          placement="HERO" 
          autoSlide={true} 
          interval={5000}
          className="shadow-2xl"
        />
      </section>

      <StatsSection />
      <GamesShowcase />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
