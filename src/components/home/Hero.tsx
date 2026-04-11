"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CmsImage } from "@/components/ui/CmsImage";
import type { SiteHero } from "@/lib/site-settings";

type HeroProps = { siteHero: SiteHero };

export function Hero({ siteHero }: HeroProps) {
  const heroImages = useMemo(
    () => siteHero.heroImages.filter((image) => image.url),
    [siteHero.heroImages]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    if (activeIndex >= heroImages.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, heroImages.length]);

  const currentImage = heroImages[activeIndex];

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {currentImage?.url && (
            <motion.div
              key={`${currentImage.url}-${activeIndex}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <CmsImage
                src={currentImage.url}
                alt={siteHero.altImage}
                fill
                className="object-cover"
                rotation={currentImage.rotation}
                priority
                sizes="100vw"
                unoptimized
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/30 to-ink/60"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <motion.h1
          className="mb-6 font-serif text-5xl font-bold tracking-[-0.02em] text-cream drop-shadow-md sm:text-6xl md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {siteHero.title}
        </motion.h1>
        <motion.p
          className="mx-auto max-w-3xl font-serif text-xl font-normal leading-relaxed tracking-wider text-cream/90 opacity-95 sm:text-2xl md:text-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {siteHero.tagline}
        </motion.p>
        <motion.p
          className="mb-16 mt-4 font-serif text-base uppercase tracking-[0.15em] text-cream/60 opacity-80 sm:text-lg"
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
        {heroImages.length > 1 && (
          <motion.div
            className="mt-10 flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
          >
            {heroImages.map((image, index) => (
              <button
                key={image.url || index}
                type="button"
                aria-label={`Slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? "w-8 bg-cream" : "w-2.5 bg-cream/45 hover:bg-cream/70"
                }`}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
