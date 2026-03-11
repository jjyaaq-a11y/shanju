"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";

export function SectionAbout() {
  const { t } = useLocale();

  return (
    <section id="about" className="py-20 md:py-28 bg-[#F5F2ED]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="font-serif text-3xl md:text-4xl font-semibold text-ink mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t.about.title}
        </motion.h2>
        <motion.p
          className="text-ink/85 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t.about.body}
        </motion.p>
      </div>
    </section>
  );
}
