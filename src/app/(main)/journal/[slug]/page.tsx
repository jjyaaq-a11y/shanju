import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JournalDetailPage } from "@/components/journal/JournalDetailPage";
import { getLocaleFromRequest } from "@/lib/locale-server";
import { getJournalBySlug } from "@/lib/journals";
import { getSiteSettings } from "@/lib/site-settings";

type Props = { params: Promise<{ slug: string }> };

export default async function JournalDetailServerPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocaleFromRequest();

  const [journal, siteSettings] = await Promise.all([
    getJournalBySlug(slug, locale),
    getSiteSettings(locale),
  ]);

  if (!journal) notFound();

  return (
    <>
      <Navbar />
      <main>
        <JournalDetailPage journal={journal} locale={locale} />
      </main>
      <Footer siteFooter={siteSettings.footer} />
    </>
  );
}
