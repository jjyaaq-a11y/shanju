"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarDays, ArrowRight } from "lucide-react";

const COUNTRY_CODES = ["+86", "+1", "+44", "+81", "+82", "+33", "+49", "+61", "+65", "+852"] as const;
const TRAVELER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const PREFERENCE_KEYS = [
  "photography",
  "cultural",
  "adventure",
  "family",
  "luxury",
  "offGrid",
] as const;
const NATIONALITIES = [
  "China", "USA", "Japan", "Korea", "UK", "Australia", "Germany", "France", "Other",
] as const;

export const inquiryFormSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  countryCode: z.string().min(1, "Country code is required"),
  phone: z.string().min(1, "Phone is required"),
  travelers: z.number().min(1).max(10),
  departureDate: z.string().min(1, "Departure date is required"),
  preferences: z.array(z.string()).optional(),
  specialRequirements: z.string().optional(),
  nationality: z.string().optional(),
  budgetPerPerson: z.string().optional(),
  howFound: z.string().optional(),
  additionalMessage: z.string().optional(),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Privacy Policy" }),
  }),
});

export type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

const defaultValues: InquiryFormValues = {
  fullName: "",
  email: "",
  countryCode: "+86",
  phone: "",
  travelers: 1,
  departureDate: "",
  preferences: [],
  specialRequirements: "",
  nationality: "",
  budgetPerPerson: "",
  howFound: "",
  additionalMessage: "",
  privacyAccepted: false as InquiryFormValues["privacyAccepted"],
};

export type InquiryFormProps = {
  className?: string;
  daysCount?: number;
  routeName?: string;
};

function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-wheat mt-1" role="alert">
      {message}
    </p>
  );
}

/** 根据出发日期和天数计算返回日期 */
function calcEndDate(departureDateStr: string, daysCount: number): Date | null {
  if (!departureDateStr || daysCount < 1) return null;
  const start = new Date(departureDateStr + "T00:00:00");
  if (isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + daysCount - 1);
  return end;
}

/** 格式化日期为友好显示 */
function formatDateDisplay(date: Date, locale: string): string {
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function InquiryForm({ className, daysCount, routeName }: InquiryFormProps) {
  const { t, locale } = useLocale();
  const inquiry = t.inquiry as Record<string, string>;
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const privacyAccepted = watch("privacyAccepted");
  const departureDateValue = watch("departureDate");

  const endDate = useMemo(
    () => (daysCount ? calcEndDate(departureDateValue, daysCount) : null),
    [departureDateValue, daysCount]
  );

  const startDateDisplay = useMemo(() => {
    if (!departureDateValue) return null;
    const d = new Date(departureDateValue + "T00:00:00");
    return isNaN(d.getTime()) ? null : formatDateDisplay(d, locale);
  }, [departureDateValue, locale]);

  const endDateDisplay = useMemo(
    () => (endDate ? formatDateDisplay(endDate, locale) : null),
    [endDate, locale]
  );

  const goNext = async () => {
    if (step === 1) {
      const ok = await trigger(["fullName", "email", "countryCode", "phone", "travelers", "departureDate"]);
      if (ok) setStep(2);
    }
  };

  const goPrev = () => {
    if (step === 2) setStep(1);
  };

  const onSubmit = async (data: InquiryFormValues) => {
    setSubmitError(null);
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        routeName: routeName || "",
        daysCount: daysCount ?? undefined,
        locale,
      }),
    });

    if (!res.ok) {
      setSubmitError(locale === "zh" ? "提交失败，请稍后重试。" : "Submit failed. Please try again.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("rounded-xl border border-rock/20 bg-white/90 p-8 text-center shadow-sm", className)}
      >
        <h3 className="font-serif text-2xl font-semibold text-plateau mb-2">
          {inquiry.thankYouTitle}
        </h3>
        <p className="text-ink/85 mb-6">{inquiry.thankYouMessage}</p>
        <div className="h-32 rounded-lg bg-rock/10 flex items-center justify-center text-ink/60 text-sm">
          {inquiry.qrPlaceholder}
        </div>
      </motion.div>
    );
  }

  return (
    <Card className={cn("border-rock/20 bg-white/95 shadow-sm overflow-hidden", className)}>
      <CardContent className="p-6 md:p-8">
        <h2 className="font-serif text-xl md:text-2xl font-semibold text-ink mb-1">
          {routeName ? (locale === "zh" ? `定制 · ${routeName}` : `Book · ${routeName}`) : inquiry.title}
        </h2>
        <p className="text-ink/80 text-sm mb-6">{inquiry.subtitle}</p>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-ink/70 mb-1">
            <span>
              {inquiry.stepOf
                ?.replace("{current}", String(step))
                ?.replace("{total}", "2")}
            </span>
          </div>
          <Progress value={(step / 2) * 100} className="h-1.5" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* 姓名 */}
                <div>
                  <Label htmlFor="inquiry-fullName">{inquiry.fullName} *</Label>
                  <Input
                    id="inquiry-fullName"
                    placeholder={inquiry.fullNamePlaceholder}
                    {...register("fullName")}
                    className="mt-1"
                  />
                  <FormMessage message={errors.fullName?.message} />
                </div>

                {/* 邮箱 */}
                <div>
                  <Label htmlFor="inquiry-email">{inquiry.email} *</Label>
                  <Input
                    id="inquiry-email"
                    type="email"
                    placeholder={inquiry.emailPlaceholder}
                    {...register("email")}
                    className="mt-1"
                  />
                  <FormMessage message={errors.email?.message} />
                </div>

                {/* 电话 */}
                <div className="flex gap-2">
                  <div className="w-24 shrink-0">
                    <Label>{inquiry.countryCode} *</Label>
                    <Controller
                      name="countryCode"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRY_CODES.map((code) => (
                              <SelectItem key={code} value={code}>
                                {code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="inquiry-phone">{inquiry.phone} *</Label>
                    <Input
                      id="inquiry-phone"
                      type="tel"
                      placeholder={inquiry.phonePlaceholder}
                      {...register("phone")}
                      className="mt-1"
                    />
                    <FormMessage message={errors.phone?.message} />
                  </div>
                </div>

                {/* 人数 */}
                <div>
                  <Label>{inquiry.travelers} *</Label>
                  <Controller
                    name="travelers"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={inquiry.travelersPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {TRAVELER_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormMessage message={errors.travelers?.message} />
                </div>

                {/* 出发日期 + 自动结束日期 */}
                <div>
                  <Label htmlFor="inquiry-departureDate">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {inquiry.departureDate} *
                    </span>
                  </Label>
                  <Input
                    id="inquiry-departureDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    {...register("departureDate")}
                    className="mt-1"
                  />
                  <FormMessage message={errors.departureDate?.message} />

                  {/* 自动显示结束日期 */}
                  {startDateDisplay && endDateDisplay && daysCount && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-2 rounded-lg bg-plateau/10 border border-plateau/20 px-3 py-2 text-sm"
                    >
                      <span className="text-ink/70 shrink-0">
                        {locale === "zh" ? "行程" : "Trip"}
                      </span>
                      <span className="font-medium text-ink">{startDateDisplay}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-plateau shrink-0" />
                      <span className="font-medium text-ink">{endDateDisplay}</span>
                      <span className="ml-auto text-ink/50 shrink-0 text-xs">
                        {route_daysLabel(daysCount, locale)}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* 旅行偏好 */}
                <div>
                  <Label className="block mb-2">{inquiry.preferences}</Label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {PREFERENCE_KEYS.map((key) => (
                      <Controller
                        key={key}
                        name="preferences"
                        control={control}
                        render={({ field }) => {
                          const list = field.value ?? [];
                          const checked = list.includes(key);
                          return (
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-ink/90">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(c) =>
                                  field.onChange(
                                    c ? [...list, key] : list.filter((x) => x !== key)
                                  )
                                }
                              />
                              {inquiry[`preference${key.charAt(0).toUpperCase()}${key.slice(1)}`] ?? key}
                            </label>
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* 特殊需求 */}
                <div>
                  <Label htmlFor="inquiry-specialRequirements">{inquiry.specialRequirements}</Label>
                  <Textarea
                    id="inquiry-specialRequirements"
                    placeholder={inquiry.specialRequirementsPlaceholder}
                    {...register("specialRequirements")}
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <Label>{inquiry.nationality}</Label>
                  <Controller
                    name="nationality"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={inquiry.nationalityPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {NATIONALITIES.map((n) => (
                            <SelectItem key={n} value={n}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label>{inquiry.budgetPerPerson}</Label>
                  <Controller
                    name="budgetPerPerson"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={inquiry.budgetPerPersonPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0_500">{inquiry.budget0_500}</SelectItem>
                          <SelectItem value="500_800">{inquiry.budget500_800}</SelectItem>
                          <SelectItem value="800_1200">{inquiry.budget800_1200}</SelectItem>
                          <SelectItem value="1200_1800">{inquiry.budget1200_1800}</SelectItem>
                          <SelectItem value="1800Plus">{inquiry.budget1800Plus}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label>{inquiry.howFound}</Label>
                  <Controller
                    name="howFound"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={inquiry.howFoundPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meta">{inquiry.howFoundMeta}</SelectItem>
                          <SelectItem value="instagram">{inquiry.howFoundInstagram}</SelectItem>
                          <SelectItem value="google">{inquiry.howFoundGoogle}</SelectItem>
                          <SelectItem value="xiaohongshu">{inquiry.howFoundXiaohongshu}</SelectItem>
                          <SelectItem value="referral">{inquiry.howFoundReferral}</SelectItem>
                          <SelectItem value="other">{inquiry.howFoundOther}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="inquiry-additionalMessage">{inquiry.additionalMessage}</Label>
                  <Textarea
                    id="inquiry-additionalMessage"
                    placeholder={inquiry.additionalMessagePlaceholder}
                    {...register("additionalMessage")}
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>
                <div>
                  <Controller
                    name="privacyAccepted"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-start gap-2 cursor-pointer text-sm">
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={(c) => field.onChange(c === true)}
                          className="mt-0.5"
                        />
                        <span className="text-ink/90">
                          {inquiry.privacyLabel}{" "}
                          <a
                            href="/privacy"
                            className="text-plateau underline hover:text-wheat"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {inquiry.privacyLink}
                          </a>
                          *
                        </span>
                      </label>
                    )}
                  />
                  <FormMessage message={errors.privacyAccepted?.message} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-1">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={goPrev} className="shrink-0">
                {inquiry.back}
              </Button>
            )}
            {step < 2 ? (
              <Button type="button" onClick={goNext} variant="default" className="flex-1">
                {inquiry.next}
              </Button>
            ) : (
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  variant="wheat"
                  className="w-full"
                  disabled={isSubmitting || !privacyAccepted}
                >
                  {isSubmitting ? inquiry.submitting : inquiry.submitButton}
                </Button>
              </motion.div>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

/** 辅助：格式化天数标签 */
function route_daysLabel(daysCount: number, locale: string): string {
  const nights = Math.max(0, daysCount - 1);
  return locale === "zh" ? `${daysCount}天${nights}晚` : `${daysCount}D ${nights}N`;
}
