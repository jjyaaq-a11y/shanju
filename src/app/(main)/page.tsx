import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { SectionRoutes } from "@/components/home/SectionRoutes";
import { SectionWhy } from "@/components/home/SectionWhy";
import { SectionJournal } from "@/components/home/SectionJournal";
import { SectionAbout } from "@/components/home/SectionAbout";
import { Footer } from "@/components/layout/Footer";
import { getRoutes } from "@/lib/routes";
import { getSiteSettings } from "@/lib/site-settings";
import { getJournals } from "@/lib/journals";
import { getLocaleFromRequest } from "@/lib/locale-server";

export default async function HomePage() {
  const locale = await getLocaleFromRequest();

  const [routes, siteSettings, journalsResult] = await Promise.all([
    getRoutes(locale),
    getSiteSettings(locale),
    getJournals(locale, 3, 1),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero siteHero={siteSettings.hero} />
        <SectionRoutes routes={routes} />
        <SectionWhy siteWhy={siteSettings.why} />
        <SectionJournal journals={journalsResult.docs} siteJournal={siteSettings.journal} />
        <SectionAbout siteAbout={siteSettings.about} />
        <Footer siteFooter={siteSettings.footer} />
      </main>
    </>
  );
}
