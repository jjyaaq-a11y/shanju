"use client";

import Link from "next/link";
import { ImageDebug } from "@/components/ui/ImageDebug";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CmsImage } from "@/components/ui/CmsImage";
import { useLocale } from "@/contexts/LocaleContext";
import type { Route } from "@/lib/routes";
import { cn } from "@/lib/utils";

type SectionRoutesProps = { routes: Route[] };

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function SectionRoutes({ routes }: SectionRoutesProps) {
  const { t, locale } = useLocale();
  const localeKey = locale as "zh" | "en";

  return (
    <section id="routes" className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink mb-3">
            {t.routes.sectionTitle}
          </h2>
          <p className="text-ink/80 max-w-xl mx-auto">
            {t.routes.sectionDesc}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {routes.map((route) => (
            <motion.div key={route.id} variants={item}>
              <Card
                className={cn(
                  "group overflow-hidden border-rock/15 h-full flex flex-col",
                  "hover:shadow-xl hover:shadow-rock/10 transition-all duration-500 hover:scale-[1.02]"
                )}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-rock/10">
                  {route.image.url && (
                    <>
                      <CmsImage
                        src={route.image.url}
                        alt={route.name[localeKey]}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        rotation={route.image.rotation}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized
                      />
                      <ImageDebug label={`route:${route.id}`} src={route.image.url} />
                    </>
                  )}
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-serif text-lg font-semibold text-ink mb-1 group-hover:text-plateau transition-colors">
                    {route.name[localeKey]}
                  </h3>
                  <p className="text-ink/80 text-sm mb-4">
                    {route.days[localeKey]} · {t.form.guestsRange}
                  </p>
                  <Button
                    variant="wheat"
                    className="mt-auto w-full"
                    asChild
                  >
                    <Link href={`/routes/${route.id}`} prefetch={true}>
                      {t.form.viewRoute}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
