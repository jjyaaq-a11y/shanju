import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { RouteDetailPage } from "@/components/home/RouteDetailPage";
import { getRouteBySlug } from "@/lib/routes";
import { getLocaleFromRequest } from "@/lib/locale-server";

type Props = { params: Promise<{ id: string }> };

export default async function RouteDetailServerPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocaleFromRequest();
  const route = await getRouteBySlug(id, locale);
  if (!route) notFound();

  return (
    <>
      <Navbar />
      <main>
        <RouteDetailPage route={route} />
      </main>
    </>
  );
}
