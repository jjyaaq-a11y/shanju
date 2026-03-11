"use client";

import Image from "next/image";
import { ImageDebug } from "@/components/ui/ImageDebug";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { journalImages } from "@/lib/images";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function SectionJournal() {
  const { t } = useLocale();
  const posts = t.journal.posts.map((p, i) => ({ ...p, image: journalImages[i] }));

  return (
    <section id="journal" className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink mb-3">
              {t.journal.sectionTitle}
            </h2>
            <p className="text-ink/80 max-w-xl">
              {t.journal.sectionDesc}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="#">{t.journal.more}</Link>
          </Button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {posts.map((post, idx) => (
            <motion.div key={idx} variants={cardItem}>
              <Card className="overflow-hidden border-rock/15 h-full flex flex-col hover:shadow-lg transition-shadow">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                  <ImageDebug label={`journal:${idx}`} src={post.image} />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-xs">
                      {post.tag}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <span className="text-ink/65 text-xs mb-2">{post.date}</span>
                  <h3 className="font-serif text-lg font-semibold text-ink mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-ink/75 text-sm leading-relaxed line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="text-plateau -ml-2" asChild>
                    <Link href="#">{t.journal.readMore}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
