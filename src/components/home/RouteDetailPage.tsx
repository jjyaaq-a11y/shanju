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

  return (
    <div className="min-h-screen bg-cream">
      {/* 顶部返回栏 */}
      <div className="border-b border-rock/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/#routes"
            className="inline-flex items-center gap-1 text-sm text-ink/80 hover:text-plateau"
          >
            <ChevronLeft className="h-4 w-4" />
            {t.routes.sectionTitle}
          </Link>
        </div>
      </div>

      {/* 主体内容：桌面左右两栏，手机单栏 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start">

          {/* ── 左栏：路线内容 ── */}
          <div>
            {/* 头图 */}
            {route.image.url && (
              <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-rock/10 mb-8">
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
              <section className="mb-12">
                <h2 className="font-serif text-xl font-semibold text-ink mb-6">
                  {t.form.dailyItinerary}
                </h2>
                <div className="space-y-8">
                  {route.dayDescriptions.map((desc, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-rock/20 bg-white/90 overflow-hidden shadow-sm"
                    >
                      {(route.dayImages[i] ?? []).map((img, j) => (
                        <div
                          key={`${img.url}-${j}`}
                          className="relative aspect-[21/9] sm:aspect-[3/1] bg-rock/10"
                        >
                          <CmsImage
                            src={img.url}
                            alt={locale === "zh" ? `第 ${i + 1} 天` : `Day ${i + 1}`}
                            fill
                            className="object-cover"
                            rotation={img.rotation}
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 65vw, 800px"
                            unoptimized
                          />
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
            <section className="mb-12">
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

            {/* 行程包含（我们提供） */}
            {route.whatsIncluded[localeKey]?.length > 0 && (
              <section className="mb-12">
                <h2 className="font-serif text-xl font-semibold text-ink mb-5">
                  {locale === "zh" ? "行程包含" : "What's Included"}
                </h2>
                <div className="rounded-xl border border-rock/20 bg-white/90 p-5 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {route.whatsIncluded[localeKey].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-plateau mt-0.5 shrink-0" />
                        <span className="text-ink/90 text-sm leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 旅游注意事项 */}
            {route.travelTips[localeKey] && (
              <section className="mb-12">
                <h2 className="font-serif text-xl font-semibold text-ink mb-5">
                  {locale === "zh" ? "旅游注意事项" : "Travel Tips"}
                </h2>
                <div className="rounded-xl border border-ochre/25 bg-ochre/5 p-5 shadow-sm">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-ochre mt-0.5 shrink-0" />
                    <p className="text-ink/90 text-sm leading-relaxed whitespace-pre-line">
                      {route.travelTips[localeKey]}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* 手机端：表单在最下方 */}
            <div className="lg:hidden">
              <InquiryForm daysCount={route.daysCount} routeName={route.name[localeKey]} />
            </div>
          </div>

          {/* ── 右栏：吸附表单（仅桌面显示） ── */}
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
