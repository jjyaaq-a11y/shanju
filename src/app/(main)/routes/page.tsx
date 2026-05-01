import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CmsImage } from "@/components/ui/CmsImage";
import { getLocaleFromRequest } from "@/lib/locale-server";
import { getRoutesPage } from "@/lib/routes";
import { getSiteSettings } from "@/lib/site-settings";

type RoutesListPageProps = {
  searchParams: Promise<{ page?: string }>;
};

function normalizePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export default async function RoutesListPage({ searchParams }: RoutesListPageProps) {
  const locale = await getLocaleFromRequest();
  const sp = await searchParams;
  const page = normalizePage(sp.page);

  const [routes, siteSettings] = await Promise.all([
    getRoutesPage(locale, 10, page),
    getSiteSettings(locale),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <header className="mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink">
              {locale === "zh" ? "精选路线" : "Featured Routes"}
            </h1>
            <p className="mt-3 text-ink/75 max-w-2xl">
              {locale === "zh"
                ? "展示所有可报名路线，支持分页浏览。"
                : "All available routes with paginated browsing."}
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {routes.docs.map((route) => {
              const routePath = `/routes/${route.slug || route.id}`;
              return (
                <article
                  key={route.id}
                  className="overflow-hidden rounded-2xl border border-rock/20 bg-white/90 shadow-sm"
                >
                  <Link href={routePath} className="block">
                    <div className="relative aspect-[16/10] bg-rock/10">
                      {route.image.url && (
                        <CmsImage
                          src={route.image.url}
                          alt={route.name[locale]}
                          fill
                          className="object-cover"
                          rotation={route.image.rotation}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          unoptimized
                        />
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <h2 className="font-serif text-xl text-ink font-semibold mb-2 line-clamp-2">
                      <Link href={routePath} className="hover:text-plateau transition-colors">
                        {route.name[locale]}
                      </Link>
                    </h2>
                    <p className="text-sm text-ink/65 mb-2">{route.days[locale]}</p>
                    {route.overview[locale] && (
                      <p className="text-sm text-ink/75 line-clamp-3 mb-4">{route.overview[locale]}</p>
                    )}
                    <Link
                      href={routePath}
                      className="inline-flex items-center text-sm font-medium text-plateau hover:text-wheat transition-colors"
                    >
                      {locale === "zh" ? "查看详情" : "View details"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {routes.totalDocs === 0 && (
            <div className="mt-10 rounded-xl border border-rock/20 bg-white/80 px-5 py-8 text-center text-ink/70">
              {locale === "zh" ? "暂时没有可展示路线。" : "No routes available yet."}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-4">
            {routes.hasPrevPage ? (
              <Link
                href={`/routes?page=${routes.page - 1}`}
                className="inline-flex items-center rounded-md border border-rock/25 px-4 py-2 text-sm text-ink/80 hover:text-plateau hover:border-plateau/40 transition-colors"
              >
                {locale === "zh" ? "上一页" : "Previous"}
              </Link>
            ) : (
              <span />
            )}

            <p className="text-sm text-ink/65">
              {locale === "zh"
                ? `第 ${routes.page} / ${routes.totalPages} 页`
                : `Page ${routes.page} / ${routes.totalPages}`}
            </p>

            {routes.hasNextPage ? (
              <Link
                href={`/routes?page=${routes.page + 1}`}
                className="inline-flex items-center rounded-md border border-rock/25 px-4 py-2 text-sm text-ink/80 hover:text-plateau hover:border-plateau/40 transition-colors"
              >
                {locale === "zh" ? "下一页" : "Next"}
              </Link>
            ) : (
              <span />
            )}
          </div>
        </section>
      </main>
      <Footer siteFooter={siteSettings.footer} />
    </>
  );
}
