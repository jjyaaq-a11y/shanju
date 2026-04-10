"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CmsImage } from "@/components/ui/CmsImage";
import type { SiteHero } from "@/lib/site-settings";

type HeroProps = { siteHero: SiteHero };

export function Hero({ siteHero }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {siteHero.heroImage.url && (
          <CmsImage
            src={siteHero.heroImage.url}
            alt={siteHero.altImage}
            fill
            className="object-cover"
            rotation={siteHero.heroImage.rotation}
            priority
            sizes="100vw"
            unoptimized
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/30 to-ink/60"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <motion.h1
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[-0.02em] text-cream drop-shadow-md mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {siteHero.title}
        </motion.h1>
        <motion.p
          className="font-serif text-cream/90 text-xl sm:text-2xl md:text-3xl font-normal tracking-wider leading-relaxed max-w-3xl mx-auto opacity-95"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {siteHero.tagline}
        </motion.p>
        <motion.p
          className="font-serif uppercase text-base sm:text-lg tracking-[0.15em] text-cream/60 mt-4 mb-16 opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {siteHero.regionSub}
        </motion.p>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            size="lg"
            variant="wheat"
            className="min-w-[160px] font-medium"
            asChild
          >
            <a href="#routes">{siteHero.ctaRoutes}</a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="min-w-[160px] border-cream/50 text-cream hover:bg-cream/20 hover:text-cream font-medium"
            asChild
          >
            <a href="#contact">{siteHero.ctaContact}</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
