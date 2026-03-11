"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { ImageDebug } from "@/components/ui/ImageDebug";
import { InquiryForm } from "@/components/home/InquiryForm";
import type { Route } from "@/lib/routes";
import { ChevronLeft } from "lucide-react";

type RouteDetailPageProps = { route: Route };

export function RouteDetailPage({ route }: RouteDetailPageProps) {
  const { t, locale } = useLocale();
  const localeKey = locale as "zh" | "en";

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-rock/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link
            href="/#routes"
            className="inline-flex items-center gap-1 text-sm text-ink/80 hover:text-plateau"
          >
            <ChevronLeft className="h-4 w-4" />
            {t.routes.sectionTitle}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 pb-16">
        {route.image && (
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-rock/10 mb-8">
            <Image
              src={route.image}
              alt={route.name[localeKey]}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized
            />
            <ImageDebug label="头图" src={route.image} />
          </div>
        )}
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-ink mb-1">
          {route.name[localeKey]}
        </h1>
        <p className="text-ink/85 mb-6">{route.days[localeKey]}</p>

        {/* 路线介绍 */}
        {route.overview[localeKey] && (
          <section className="mb-10">
            <p className="text-ink/90 leading-relaxed whitespace-pre-line">
              {route.overview[localeKey]}
            </p>
          </section>
        )}

        {/* 每日行程 */}
        {route.dayDescriptions?.length > 0 && (
          <section>
            <h2 className="font-serif text-xl font-semibold text-ink mb-6">
              {t.form.dailyItinerary}
            </h2>
            <div className="space-y-8">
              {route.dayDescriptions.map((desc, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-rock/20 bg-white/90 overflow-hidden shadow-sm"
                >
                  {(route.dayImages[i] ?? []).map((imgUrl, j) => (
                      <div
                        key={j}
                        className="relative aspect-[21/9] sm:aspect-[3/1] bg-rock/10"
                      >
                        <Image
                          src={imgUrl}
                          alt={locale === "zh" ? `第 ${i + 1} 天` : `Day ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 672px"
                          unoptimized
                        />
                        <ImageDebug label={`Day ${i + 1}-${j + 1}`} src={imgUrl} />
                      </div>
                    ))}
                  <div className="p-5">
                    <h3 className="font-medium text-ink mb-3">
                      {t.form.dayLabel.replace("{n}", String(i + 1))}
                    </h3>
                    {(desc.zh || desc.en) && (
                      <p className="text-ink/90 leading-relaxed">
                        {desc[localeKey] || desc.zh || desc.en}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 人均报价 */}
        <section className="mt-12">
          <h2 className="font-serif text-xl font-semibold text-ink mb-4">
            {t.form.priceTable}
          </h2>
          <div className="rounded-xl border border-rock/20 bg-white/90 p-5 shadow-sm">
            <p className="text-sm text-ink/80 mb-4">
              {locale === "zh" ? "每人" : "Per person"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {([2, 3, 4, 5, 6] as const).map((n) => {
                const perPerson = route.pricePerGroup[n];
                if (perPerson == null || perPerson <= 0) return null;
                return (
                  <div
                    key={n}
                    className="flex justify-between items-baseline border-b border-rock/10 pb-3 last:border-0"
                  >
                    <span className="text-ink/85">
                      {locale === "zh" ? `${n} 人` : `${n} guests`}
                    </span>
                    <span className="font-semibold text-plateau">
                      ${perPerson.toLocaleString("en-US")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <InquiryForm className="mt-12" />
      </div>
    </div>
  );
}
