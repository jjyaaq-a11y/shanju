"use client";

import { useState } from "react";
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
  "China",
  "USA",
  "Japan",
  "Korea",
  "UK",
  "Australia",
  "Germany",
  "France",
  "Other",
] as const;
const BUDGET_OPTIONS = ["0_500", "500_800", "800_1200", "1200_1800", "1800Plus"] as const;
const HOW_FOUND_OPTIONS = ["meta", "instagram", "google", "xiaohongshu", "referral", "other"] as const;

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
};

function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-wheat mt-1" role="alert">
      {message}
    </p>
  );
}

export function InquiryForm({ className }: InquiryFormProps) {
  const { t } = useLocale();
  const inquiry = t.inquiry as Record<string, string>;
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);

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
    console.log("Inquiry form data:", data);
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
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink mb-1">
          {inquiry.title}
        </h2>
        <p className="text-ink/80 text-sm md:text-base mb-6">{inquiry.subtitle}</p>

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <div>
                  <Label htmlFor="inquiry-departureDate">{inquiry.departureDate} *</Label>
                  <Input
                    id="inquiry-departureDate"
                    type="date"
                    {...register("departureDate")}
                    className="mt-1"
                  />
                  <FormMessage message={errors.departureDate?.message} />
                </div>
                <div>
                  <Label className="block mb-2">{inquiry.preferences}</Label>
                  <div className="flex flex-wrap gap-3">
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
                <div>
                  <Label htmlFor="inquiry-specialRequirements">{inquiry.specialRequirements}</Label>
                  <Textarea
                    id="inquiry-specialRequirements"
                    placeholder={inquiry.specialRequirementsPlaceholder}
                    {...register("specialRequirements")}
                    rows={4}
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

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={goPrev} className="sm:order-2">
                {inquiry.back}
              </Button>
            ) : (
              <span className="sm:order-2" />
            )}
            {step < 2 ? (
              <Button type="button" onClick={goNext} variant="default" className="sm:order-1 flex-1">
                {inquiry.next}
              </Button>
            ) : (
              <motion.div
                className="sm:order-1 flex-1"
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
        </form>
      </CardContent>
    </Card>
  );
}
