"use client";

import Link from "next/link";
import { ImageDebug } from "@/components/ui/ImageDebug";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale } from "@/contexts/LocaleContext";
import type { Route } from "@/lib/routes";
import { getAddonLocale, type AddonsConfig } from "@/lib/addons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddonOptionBlock } from "./AddonOptionBlock";
import { InquiryForm } from "./InquiryForm";
import { ChevronLeft } from "lucide-react";
import { CmsImage } from "@/components/ui/CmsImage";

const SEASON_FACTORS = {
  spring: 1.0,
  summer: 1.0,
  autumn: 1.2,
  winter: 0.8,
} as const;

function groupDiscountMult(people: number): number {
  if (people <= 1) return 1;
  return 1 - people * 0.05;
}

type SeasonKey = keyof typeof SEASON_FACTORS;

type CustomizeRoutePageProps = {
  route: Route;
  addonsConfig: AddonsConfig;
};

export function CustomizeRoutePage({ route, addonsConfig }: CustomizeRoutePageProps) {
  const { t, locale } = useLocale();
  const localeKey = locale as "zh" | "en";
  const daysCount = route.daysCount;
  const seasonLabels = {
    spring: t.form.seasonSpring,
    summer: t.form.seasonSummer,
    autumn: t.form.seasonAutumn,
    winter: t.form.seasonWinter,
  } as const;

  const schema = z.object({
    people: z.number().min(1).max(6),
    season: z.enum(["spring", "summer", "autumn", "winter"]),
    hotel: z.string(),
    vehicle: z.string(),
    photography: z.array(z.string()),
    guide: z.string(),
    notes: z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;

  const defaultHotel = addonsConfig.hotel[0]!.key;
  const defaultVehicle =
    addonsConfig.vehicle.find((v) => !v.minPeople)?.key ??
    addonsConfig.vehicle[1]!.key;
  const defaultGuide = addonsConfig.guide[0]!.key;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      people: 1,
      season: "autumn",
      hotel: defaultHotel,
      vehicle: defaultVehicle,
      photography: [],
      guide: defaultGuide,
      notes: "",
    },
  });

  const people = watch("people");
  const season = watch("season");
  const hotel = watch("hotel");
  const vehicle = watch("vehicle");
  const photography = watch("photography");
  const guide = watch("guide");

  useEffect(() => {
    const current = addonsConfig.vehicle.find((v) => v.key === vehicle);
    if (current?.minPeople && (people ?? 1) < current.minPeople) {
      setValue("vehicle", defaultVehicle);
    }
  }, [people, vehicle, defaultVehicle, setValue, addonsConfig.vehicle]);

  const budget = useMemo(() => {
    const p = people ?? 1;
    const pricePerDay = route.basePricePerPersonPerDay;
    const baseBeforeDiscount = pricePerDay * p * daysCount;
    const base = baseBeforeDiscount * groupDiscountMult(p);
    const factor = SEASON_FACTORS[(season ?? "autumn") as SeasonKey];
    const hotelItem = addonsConfig.hotel.find((a) => a.key === (hotel ?? defaultHotel));
    const vehicleItem = addonsConfig.vehicle.find((a) => a.key === (vehicle ?? defaultVehicle));
    const guideItem = addonsConfig.guide.find((a) => a.key === (guide ?? defaultGuide));
    const hotelPrice = hotelItem ? hotelItem.pricePerDay * daysCount : 0;
    const vehiclePrice = vehicleItem ? vehicleItem.pricePerDay * daysCount : 0;
    const guidePrice = guideItem ? guideItem.pricePerDay * daysCount : 0;
    const photoPrice = (photography ?? []).reduce((sum, key) => {
      const item = addonsConfig.photography.find((a) => a.key === key);
      return sum + (item ? item.pricePerDay * daysCount : 0);
    }, 0);
    const subtotal = base + hotelPrice + vehiclePrice + guidePrice + photoPrice;
    const total = subtotal * factor;
    const low = Math.round(total * 0.9);
    const high = Math.round(total * 1.1);
    return { low, high, total };
  }, [
    route.basePricePerPersonPerDay,
    daysCount,
    people,
    season,
    hotel,
    vehicle,
    photography,
    guide,
    defaultHotel,
    defaultVehicle,
    defaultGuide,
    addonsConfig,
  ]);

  const budgetLabel = t.form.budgetRange
    .replace("{min}", budget.low.toLocaleString("en-US"))
    .replace("{max}", budget.high.toLocaleString("en-US"));

  const togglePhotography = (key: string, checked: boolean) => {
    const next = checked
      ? [...(photography ?? []), key]
      : (photography ?? []).filter((x) => x !== key);
    setValue("photography", next);
  };

  const onSubmit = async (data: FormValues) => {
    const payload = {
      route: route.name[localeKey],
      people: data.people,
      season: data.season,
      hotel: data.hotel,
      vehicle: data.vehicle,
      photography: data.photography.join(", "),
      guide: data.guide,
      notes: data.notes || "",
      budgetMin: Math.round(budget.low),
      budgetMax: Math.round(budget.high),
    };
    try {
      const res = await fetch("https://formspree.io/f/YOUR_FORMSPREE_ID", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        window.location.href = "/#routes";
      }
    } catch {
      // no-op
    }
  };

  const addonsLocale = t.addons as Record<
    string,
    Record<string, { label: string; desc: string }>
  >;

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

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        {route.image.url && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl bg-rock/10">
            <CmsImage
              src={route.image.url}
              alt={route.name[localeKey]}
              fill
              className="object-cover"
              rotation={route.image.rotation}
              priority
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized
            />
            <ImageDebug label="定制页头图" src={route.image.url} />
          </div>
        )}
        <h1 className="mb-1 font-serif text-2xl font-semibold text-ink md:text-3xl">
          {route.name[localeKey]}
        </h1>
        <p className="mb-8 text-ink/85">{route.days[localeKey]}</p>

        {route.dayTextBlocks?.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 font-serif text-xl font-semibold text-ink">
              {t.form.dailyItinerary}
            </h2>
            <div className="space-y-5">
              {route.dayTextBlocks.map((blocks, i) => {
                const images = route.dayImages[i] ?? [];
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl border border-rock/20 bg-white/80 shadow-sm"
                  >
                    {images.length > 0 && (
                      <div className={`grid gap-2 bg-rock/10 p-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                        {images.map((img, j) => (
                          <div
                            key={`${img.url}-${j}`}
                            className={`relative overflow-hidden rounded-lg bg-rock/10 ${images.length === 1 ? "aspect-[16/9]" : "aspect-[4/3] sm:aspect-[2/1]"}`}
                          >
                            <CmsImage
                              src={img.url}
                              alt={locale === "zh" ? `第 ${i + 1} 天图片 ${j + 1}` : `Day ${i + 1} image ${j + 1}`}
                              fill
                              className="object-cover"
                              rotation={img.rotation}
                              sizes="(max-width: 640px) 100vw, 50vw"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-4 p-5">
                      <h3 className="font-medium text-ink">
                        {t.form.dayLabel.replace("{n}", String(i + 1))}
                      </h3>
                      {blocks.map((block, blockIndex) => {
                        const text = block[localeKey] || block.zh || block.en;
                        if (!text) return null;
                        return (
                          <p key={`${i}-${blockIndex}`} className="leading-relaxed text-ink/90 whitespace-pre-line">
                            {text}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <h2 className="mb-6 font-serif text-xl font-semibold text-ink">
          {t.form.customizeTitle}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <section className="space-y-2">
            <Label htmlFor="people">{t.form.people}</Label>
            <Select
              value={String(people ?? 1)}
              onValueChange={(v) => setValue("people", Number(v))}
            >
              <SelectTrigger id="people" className="max-w-[120px]">
                <SelectValue placeholder={t.form.peoplePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.people && (
              <p className="text-sm text-red-600">{errors.people.message}</p>
            )}
          </section>

          <section className="space-y-2">
            <Label htmlFor="season">{t.form.season}</Label>
            <Select
              value={season ?? "autumn"}
              onValueChange={(v) => setValue("season", v as SeasonKey)}
            >
              <SelectTrigger id="season" className="max-w-[180px]">
                <SelectValue placeholder={t.form.seasonPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {(["spring", "summer", "autumn", "winter"] as const).map((key) => (
                  <SelectItem key={key} value={key}>
                    {seasonLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-ink">{t.form.hotelLabel}</h3>
            <div className="space-y-3">
              {addonsConfig.hotel.map((item) => {
                const copy = getAddonLocale(addonsLocale, item.key);
                return (
                  <AddonOptionBlock
                    key={item.key}
                    item={item}
                    price={item.pricePerDay * daysCount}
                    label={copy.label}
                    desc={copy.desc}
                    type="radio"
                    checked={hotel === item.key}
                    onChecked={() => setValue("hotel", item.key)}
                    name="hotel"
                  />
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-ink">{t.form.vehicleLabel}</h3>
            <div className="space-y-3">
              {addonsConfig.vehicle.map((item) => {
                const copy = getAddonLocale(addonsLocale, item.key);
                const disabled = Boolean(item.minPeople && (people ?? 1) < item.minPeople);
                return (
                  <AddonOptionBlock
                    key={item.key}
                    item={item}
                    price={item.pricePerDay * daysCount}
                    label={copy.label}
                    desc={copy.desc}
                    type="radio"
                    checked={vehicle === item.key}
                    onChecked={() => setValue("vehicle", item.key)}
                    name="vehicle"
                    disabled={disabled}
                    hint={disabled ? t.form.vehicleMinPeople : undefined}
                  />
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-ink">{t.form.photographyLabel}</h3>
            <div className="space-y-3">
              {addonsConfig.photography.map((item) => {
                const copy = getAddonLocale(addonsLocale, item.key);
                return (
                  <AddonOptionBlock
                    key={item.key}
                    item={item}
                    price={item.pricePerDay * daysCount}
                    label={copy.label}
                    desc={copy.desc}
                    type="checkbox"
                    checked={(photography ?? []).includes(item.key)}
                    onChecked={(checked) => togglePhotography(item.key, checked)}
                  />
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-ink">{t.form.guideLabel}</h3>
            <div className="space-y-3">
              {addonsConfig.guide.map((item) => {
                const copy = getAddonLocale(addonsLocale, item.key);
                return (
                  <AddonOptionBlock
                    key={item.key}
                    item={item}
                    price={item.pricePerDay * daysCount}
                    label={copy.label}
                    desc={copy.desc}
                    type="radio"
                    checked={guide === item.key}
                    onChecked={() => setValue("guide", item.key)}
                    name="guide"
                    showImage={false}
                  />
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="notes">{t.form.notes}</Label>
            <Textarea id="notes" rows={5} {...register("notes")} />
          </section>

          <Card className="border-plateau/20 bg-white/90 shadow-sm">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm text-ink/70">{t.form.budget}</p>
              <p className="font-serif text-2xl font-semibold text-plateau">{budgetLabel}</p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" size="lg" variant="wheat" disabled={isSubmitting}>
              {t.form.submit}
            </Button>
            <div className="text-sm text-ink/65">
              {locale === "zh"
                ? "提交后我们会根据人数、季节与附加项给出正式报价。"
                : "After submission, we will send a formal quote based on group size, season, and selected add-ons."}
            </div>
          </div>
        </form>

        <div className="mt-12">
          <InquiryForm daysCount={route.daysCount} routeName={route.name[localeKey]} />
        </div>
      </div>
    </div>
  );
}
