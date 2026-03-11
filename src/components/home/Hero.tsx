"use client";

import Image from "next/image";
import { ImageDebug } from "@/components/ui/ImageDebug";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { heroImage } from "@/lib/images";

export function Hero() {
  const { t } = useLocale();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt={t.hero.altImage}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized
        />
        <ImageDebug label="Hero" src={heroImage} className="z-[1]" />
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
          {t.hero.title}
        </motion.h1>
        <motion.p
          className="font-serif text-cream/90 text-xl sm:text-2xl md:text-3xl font-normal tracking-wider leading-relaxed max-w-3xl mx-auto opacity-95"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {t.hero.tagline}
        </motion.p>
        <motion.p
          className="font-serif uppercase text-base sm:text-lg tracking-[0.15em] text-cream/60 mt-4 mb-16 opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t.hero.regionSub}
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
            <a href="#routes">{t.hero.ctaRoutes}</a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="min-w-[160px] border-cream/50 text-cream hover:bg-cream/20 hover:text-cream font-medium"
            asChild
          >
            <a href="#contact">{t.hero.ctaContact}</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
