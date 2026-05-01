"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { InquiryForm } from "@/components/home/InquiryForm";
import { CmsImage } from "@/components/ui/CmsImage";
import type { Route } from "@/lib/routes";
import { ChevronLeft, CheckCircle2, AlertTriangle } from "lucide-react";

type RouteDetailPageProps = { route: Route };

export function RouteDetailPage({ route }: RouteDetailPageProps) {
  const { t, locale } = useLocale();
  const localeKey = locale as "zh" | "en";

  const getSectionImageFrameClass = (imageIndex: number) =>
    imageIndex === 0 ? "aspect-[16/10] md:aspect-[16/9]" : "aspect-[4/3] md:aspect-[16/10]";

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-rock/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/#routes"
            className="inline-flex items-center gap-1 text-sm text-ink/80 hover:text-plateau"
          >
            <ChevronLeft className="h-4 w-4" />
            {t.routes.sectionTitle}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-12">
          <div>
            {route.image.url && (
              <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl bg-rock/10">
                <CmsImage
                  src={route.image.url}
                  alt={route.name[localeKey]}
                  fill
                  className="object-cover"
                  rotation={route.image.rotation}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 65vw, 800px"
                  unoptimized
                />
              </div>
            )}

            <h1 className="mb-1 font-serif text-2xl font-semibold text-ink md:text-3xl">
              {route.name[localeKey]}
            </h1>
            <p className="mb-6 text-ink/85">{route.days[localeKey]}</p>

            {route.overview[localeKey] && (
              <section className="mb-10">
                <p className="whitespace-pre-line leading-relaxed text-ink/90">
                  {route.overview[localeKey]}
                </p>
              </section>
            )}

            {route.daySections?.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-6 font-serif text-xl font-semibold text-ink">
                  {t.form.dailyItinerary}
                </h2>
                <div className="space-y-8">
                  {route.daySections.map((sections, i) => {
                    return (
                      <div
                        key={i}
                        className="overflow-hidden rounded-xl border border-rock/20 bg-white/90 shadow-sm"
                      >
                        <div className="p-5">
                          <h3 className="mb-4 font-medium text-ink">
                            {t.form.dayLabel.replace("{n}", String(i + 1))}
                          </h3>
                          <div className="space-y-8">
                            {sections.map((section, sectionIndex) => {
                              const title =
                                section.title[localeKey] ||
                                section.title.zh ||
                                section.title.en;
                              const description =
                                section.description[localeKey] ||
                                section.description.zh ||
                                section.description.en;
                              const images = section.images ?? [];
                              if (!title && !description && images.length === 0) return null;
                              return (
                                <div
                                  key={`${i}-${sectionIndex}`}
                                  className="space-y-4 border-t border-rock/10 pt-6 first:border-t-0 first:pt-0"
                                >
                                  {title && (
                                    <h4 className="font-medium text-ink/95">
                                      {sectionIndex + 1}. {title}
                                    </h4>
                                  )}
                                  {description && (
                                    <p className="whitespace-pre-line leading-relaxed text-ink/90">
                                      {description}
                                    </p>
                                  )}
                                  {images.length > 0 && (
                                    <div className="space-y-3">
                                      {images.map((img, imageIndex) => (
                                        <div
                                          key={`${img.url}-${imageIndex}`}
                                          className={`relative overflow-hidden rounded-lg bg-rock/10 ${getSectionImageFrameClass(
                                            imageIndex,
                                          )}`}
                                        >
                                          <CmsImage
                                            src={img.url}
                                            alt={
                                              locale === "zh"
                                                ? `第 ${i + 1} 天第 ${sectionIndex + 1} 段图片 ${imageIndex + 1}`
                                                : `Day ${i + 1} section ${sectionIndex + 1} image ${imageIndex + 1}`
                                            }
                                            fill
                                            className="object-cover"
                                            rotation={img.rotation}
                                            sizes="(max-width: 1280px) 100vw, 820px"
                                            unoptimized
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mb-12">
              <h2 className="mb-4 font-serif text-xl font-semibold text-ink">
                {t.form.priceTable}
              </h2>
              <div className="rounded-xl border border-rock/20 bg-white/90 p-5 shadow-sm">
                <p className="mb-4 text-sm text-ink/80">
                  {locale === "zh" ? "每人" : "Per person"}
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {([2, 3, 4, 5, 6] as const).map((n) => {
                    const perPerson = route.pricePerGroup[n];
                    if (perPerson == null || perPerson <= 0) return null;
                    return (
                      <div
                        key={n}
                        className="flex items-baseline justify-between border-b border-rock/10 pb-3 last:border-0"
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

            {route.whatsIncluded[localeKey]?.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-5 font-serif text-xl font-semibold text-ink">
                  {locale === "zh" ? "行程包含" : "What's Included"}
                </h2>
                <div className="rounded-xl border border-rock/20 bg-white/90 p-5 shadow-sm">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {route.whatsIncluded[localeKey].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-plateau" />
                        <span className="text-sm leading-relaxed text-ink/90">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {route.travelTips[localeKey] && (
              <section className="mb-12">
                <h2 className="mb-5 font-serif text-xl font-semibold text-ink">
                  {locale === "zh" ? "旅游注意事项" : "Travel Tips"}
                </h2>
                <div className="rounded-xl border border-ochre/25 bg-ochre/5 p-5 shadow-sm">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-ochre" />
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink/90">
                      {route.travelTips[localeKey]}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <div className="lg:hidden">
              <InquiryForm daysCount={route.daysCount} routeName={route.name[localeKey]} />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl">
              <InquiryForm daysCount={route.daysCount} routeName={route.name[localeKey]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
