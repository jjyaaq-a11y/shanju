import Link from "next/link";
import { CmsImage } from "@/components/ui/CmsImage";
import type { Journal } from "@/lib/journals";

type JournalDetailPageProps = {
  journal: Journal;
  locale: "zh" | "en";
};

export function JournalDetailPage({ journal, locale }: JournalDetailPageProps) {
  return (
    <article className="min-h-screen bg-cream pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/#journal"
          className="inline-flex items-center text-sm text-ink/70 hover:text-plateau transition-colors"
        >
          {locale === "zh" ? "返回深度手记" : "Back to Journal"}
        </Link>

        <header className="mt-5">
          {journal.tag && (
            <p className="text-sm text-plateau font-medium mb-2">
              {journal.tag}
            </p>
          )}
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
            {journal.title}
          </h1>
          {journal.date && (
            <p className="text-sm text-ink/60 mt-3">{journal.date}</p>
          )}
          {journal.excerpt && (
            <p className="text-ink/85 leading-relaxed mt-4 text-base md:text-lg">
              {journal.excerpt}
            </p>
          )}
        </header>

        {journal.image.url && (
          <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-rock/15 shadow-sm">
            <CmsImage
              src={journal.image.url}
              alt={journal.title}
              fill
              className="object-cover"
              rotation={journal.image.rotation}
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              unoptimized
            />
          </div>
        )}

        {journal.contentImages.length > 0 ? (
          <section className="mt-8 space-y-4">
            {journal.contentImages.map((img, idx) => (
              <div
                key={`${img.url}-${idx}`}
                className="relative w-full overflow-hidden rounded-xl border border-rock/15 bg-white/80"
              >
                <CmsImage
                  src={img.url}
                  alt={`${journal.title} ${idx + 1}`}
                  width={1200}
                  height={1800}
                  className="h-auto w-full object-contain"
                  rotation={img.rotation}
                  sizes="(max-width: 768px) 100vw, 768px"
                  unoptimized
                />
              </div>
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-xl border border-rock/20 bg-white/80 px-5 py-6">
            <p className="text-sm text-ink/70">
              {locale === "zh"
                ? "这篇手记暂未上传内容长截图。"
                : "Long-form content screenshots are not available yet."}
            </p>
          </section>
        )}
      </div>
    </article>
  );
}
