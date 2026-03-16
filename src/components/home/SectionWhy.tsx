"use client";

import { motion } from "framer-motion";
import type { SiteWhy } from "@/lib/site-settings";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const icons = [
  <path key="1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
  <path key="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.45-2.72A2 2 0 013 15.73V5.27a2 2 0 011.55-1.94L9 1m0 18l5.45-2.72A2 2 0 0021 15.73V5.27a2 2 0 00-1.55-1.94L9 1m0 18V1" />,
  <path key="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  <path key="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
];
const paymentIcon = (
  <path key="payment" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
);
const translationIcon = (
  <path key="translation" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
);

type SectionWhyProps = { siteWhy: SiteWhy };

export function SectionWhy({ siteWhy }: SectionWhyProps) {
  return (
    <section className="py-20 md:py-28 bg-[#F5F2ED]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink mb-3">
            {siteWhy.sectionTitle}
          </h2>
          <p className="text-ink/80 max-w-xl mx-auto">
            {siteWhy.sectionDesc}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={container}
          initial="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {siteWhy.items.map((r, i) => (
            <motion.div
              key={i}
              variants={item}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-plateau/10 text-plateau mb-5 group-hover:bg-plateau group-hover:text-cream transition-colors duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  {icons[i]}
                </svg>
              </div>
              <h3 className="font-serif text-xl font-semibold text-ink mb-2">
                {r.title}
              </h3>
              <p className="text-ink/75 text-sm leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <motion.div className="text-center" initial={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-plateau/10 text-plateau mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                {paymentIcon}
              </svg>
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink mb-2">
              {siteWhy.paymentTitle}
            </h3>
            <p className="text-ink/75 text-sm leading-relaxed">
              {siteWhy.paymentDesc}
            </p>
          </motion.div>
          <motion.div className="text-center" initial={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-plateau/10 text-plateau mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                {translationIcon}
              </svg>
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink mb-2">
              {siteWhy.translationTitle}
            </h3>
            <p className="text-ink/75 text-sm leading-relaxed">
              {siteWhy.translationDesc}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
