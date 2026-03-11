"use client";

import Link from "next/link";
import Image from "next/image";
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

const SEASON_FACTORS = {
  spring: 1.0,
  summer: 1.0,
  autumn: 1.2,
  winter: 0.8,
} as const;

/** 2 人 10% off，3 人 15% off，4 人 20% off，5 人 25% off；最多 5 人。基础价按路线 route.basePricePerPersonPerDay 美金/人/天 */
function groupDiscountMult(people: number): number {
  if (people <= 1) return 1;
  return 1 - people * 0.05; // 2→0.9, 3→0.85, 4→0.8, 5→0.75
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

  // 人数不足时若选的是需 3+ 的车辆（两种 Business Van），自动切到默认车辆
  useEffect(() => {
    const current = addonsConfig.vehicle.find((v) => v.key === vehicle);
    if (current?.minPeople && (people ?? 1) < current.minPeople) {
      setValue("vehicle", defaultVehicle);
    }
  }, [people, vehicle, defaultVehicle, setValue]);

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
      // could toast error
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

      <div className="mx-auto max-w-3xl px-4 py-8 pb-16">
        {route.image && (
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-rock/10 mb-8">
            <Image
              src={route.image}
              alt={route.name[localeKey]}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized
            />
            <ImageDebug label="定制页头图" src={route.image} />
          </div>
        )}
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-ink mb-1">
          {route.name[localeKey]}
        </h1>
        <p className="text-ink/85 mb-8">{route.days[localeKey]}</p>

        {/* 每日行程 */}
        {route.dayDescriptions?.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-xl font-semibold text-ink mb-6">
              {t.form.dailyItinerary}
            </h2>
            <div className="space-y-5">
              {route.dayDescriptions.map((desc, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-rock/20 bg-white/80 p-5 shadow-sm"
                >
                  <h3 className="font-medium text-ink mb-2">
                    {t.form.dayLabel.replace("{n}", String(i + 1))}
                  </h3>
                  <p className="text-ink/90 leading-relaxed">
                    {desc[localeKey] || desc.zh || desc.en}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 定制选项 */}
        <h2 className="font-serif text-xl font-semibold text-ink mb-6">
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
                {Array.from({ length: 6 }, (_, i) => i + 1).map(
                  (n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  )
                )}
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
                <SelectItem value="spring">{t.form.seasonSpring}</SelectItem>
                <SelectItem value="summer">{t.form.seasonSummer}</SelectItem>
                <SelectItem value="autumn">{t.form.seasonAutumn}</SelectItem>
                <SelectItem value="winter">{t.form.seasonWinter}</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-ink">
              {t.form.hotelLabel}
            </h2>
            <div className="space-y-3">
              {addonsConfig.hotel.map((item) => {
                const { label, desc } = getAddonLocale(addonsLocale, item.labelKey);
                return (
                  <AddonOptionBlock
                    key={item.key}
                    item={item}
                    price={item.pricePerDay * daysCount}
                    label={label}
                    desc={desc}
                    type="radio"
                    name="hotel"
                    checked={(hotel ?? defaultHotel) === item.key}
                    onChecked={() => setValue("hotel", item.key)}
                  />
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-ink">
              {t.form.vehicleLabel}
            </h2>
            <p className="text-sm text-ink/80">{t.form.vehicleDesc}</p>
            <div className="space-y-3">
              {addonsConfig.vehicle.map((item) => {
                const { label, desc } = getAddonLocale(addonsLocale, item.labelKey);
                const minPeople = item.minPeople ?? 0;
                const disabled = minPeople > 0 && (people ?? 1) < minPeople;
                return (
                  <AddonOptionBlock
                    key={item.key}
                    item={item}
                    price={item.pricePerDay * daysCount}
                    label={label}
                    desc={desc}
                    type="radio"
                    name="vehicle"
                    checked={(vehicle ?? defaultVehicle) === item.key}
                    onChecked={() => setValue("vehicle", item.key)}
                    disabled={disabled}
                    hint={disabled ? t.form.vehicleMinPeople : undefined}
                  />
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-ink">
              {t.form.photographyLabel}
            </h2>
            <div className="space-y-3">
              {addonsConfig.photography.map((item) => {
                const { label, desc } = getAddonLocale(addonsLocale, item.labelKey);
                return (
                  <AddonOptionBlock
                    key={item.key}
                    item={item}
                    price={item.pricePerDay * daysCount}
                    label={label}
                    desc={desc}
                    type="checkbox"
                    checked={(photography ?? []).includes(item.key)}
                    onChecked={(checked) => togglePhotography(item.key, checked)}
                    showImage={false}
                  />
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-ink">
              {t.form.guideLabel}
            </h2>
            <div className="space-y-3">
              {addonsConfig.guide.map((item) => {
                const { label, desc } = getAddonLocale(addonsLocale, item.labelKey);
                return (
                  <AddonOptionBlock
                    key={item.key}
                    item={item}
                    price={item.pricePerDay * daysCount}
                    label={label}
                    desc={desc}
                    type="radio"
                    name="guide"
                    checked={(guide ?? defaultGuide) === item.key}
                    onChecked={() => setValue("guide", item.key)}
                    showImage={false}
                  />
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="notes">{t.form.notes}</Label>
            <Textarea
              id="notes"
              placeholder={t.form.notesPlaceholder}
              {...register("notes")}
              rows={4}
              className="resize-none"
            />
          </section>

          <Card className="bg-white/90 border-rock/20 shadow-sm">
            <CardContent className="py-5">
              <p className="text-sm font-medium text-ink/85 mb-1">
                {t.form.budget}
              </p>
              <p className="font-serif text-xl text-plateau">{budgetLabel}</p>
              <p className="text-xs text-ink/80 mt-2">{t.form.budgetNote}</p>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            variant="default"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.form.submitting : t.form.submit}
          </Button>
        </form>

        <InquiryForm className="mt-10" />
      </div>
    </div>
  );
}
