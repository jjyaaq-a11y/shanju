import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getLocaleFromRequest } from "@/lib/locale-server";
import { getJournals } from "@/lib/journals";
import { getSiteSettings } from "@/lib/site-settings";

type JournalListPageProps = {
  searchParams: Promise<{ page?: string }>;
};

function normalizePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export default async function JournalListPage({ searchParams }: JournalListPageProps) {
  const locale = await getLocaleFromRequest();
  const sp = await searchParams;
  const page = normalizePage(sp.page);

  const [journals, siteSettings] = await Promise.all([
    getJournals(locale, 10, page),
    getSiteSettings(locale),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <header className="mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink">
              {locale === "zh" ? "深度手记" : "Journal"}
            </h1>
            <p className="mt-3 text-ink/75 max-w-2xl">
              {locale === "zh"
                ? "记录川西秘境、人文与旅途故事。"
                : "Stories from Western Sichuan: landscapes, culture, and journeys."}
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {journals.docs.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-rock/20 bg-white/90 shadow-sm"
              >
                <Link href={`/journal/${post.slug}`} className="block">
                  <div className="relative aspect-[16/10] bg-rock/10">
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized
                      />
                    )}
                  </div>
                </Link>
                <div className="p-5">
                  {post.tag && (
                    <p className="text-xs font-medium text-plateau mb-2">{post.tag}</p>
                  )}
                  <h2 className="font-serif text-xl text-ink font-semibold mb-2 line-clamp-2">
                    <Link href={`/journal/${post.slug}`} className="hover:text-plateau transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  {post.date && <p className="text-xs text-ink/60 mb-2">{post.date}</p>}
                  {post.excerpt && (
                    <p className="text-sm text-ink/75 line-clamp-3">{post.excerpt}</p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {journals.totalDocs === 0 && (
            <div className="mt-10 rounded-xl border border-rock/20 bg-white/80 px-5 py-8 text-center text-ink/70">
              {locale === "zh" ? "暂时没有已发布手记。" : "No published journals yet."}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-4">
            {journals.hasPrevPage ? (
              <Link
                href={`/journal?page=${journals.page - 1}`}
                className="inline-flex items-center rounded-md border border-rock/25 px-4 py-2 text-sm text-ink/80 hover:text-plateau hover:border-plateau/40 transition-colors"
              >
                {locale === "zh" ? "上一页" : "Previous"}
              </Link>
            ) : (
              <span />
            )}

            <p className="text-sm text-ink/65">
              {locale === "zh"
                ? `第 ${journals.page} / ${journals.totalPages} 页`
                : `Page ${journals.page} / ${journals.totalPages}`}
            </p>

            {journals.hasNextPage ? (
              <Link
                href={`/journal?page=${journals.page + 1}`}
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
