import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { SectionRoutes } from "@/components/home/SectionRoutes";
import { SectionWhy } from "@/components/home/SectionWhy";
import { SectionJournal } from "@/components/home/SectionJournal";
import { SectionAbout } from "@/components/home/SectionAbout";
import { Footer } from "@/components/layout/Footer";
import { getRoutes } from "@/lib/routes";
import { getLocaleFromRequest } from "@/lib/locale-server";

export default async function HomePage() {
  const locale = await getLocaleFromRequest();
  const routes = await getRoutes(locale);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SectionRoutes routes={routes} />
        <SectionWhy />
        <SectionJournal />
        <SectionAbout />
        <Footer />
      </main>
    </>
  );
}
