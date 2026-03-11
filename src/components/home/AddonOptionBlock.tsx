"use client";

import Image from "next/image";
import { ImageDebug } from "@/components/ui/ImageDebug";
import type { AddonItem } from "@/lib/addons";
import { cn } from "@/lib/utils";

function formatPrice(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

type AddonOptionBlockProps = {
  item: AddonItem;
  price: number;
  label: string;
  desc: string;
  type: "radio" | "checkbox";
  checked: boolean;
  onChecked: (checked: boolean) => void;
  name?: string;
  id?: string;
  /** 不可选时展示说明（如 "3 人以上可选"） */
  disabled?: boolean;
  hint?: string;
  /** 是否显示预览图（如英语导游不显示图片） */
  showImage?: boolean;
};

export function AddonOptionBlock({
  item,
  price,
  label,
  desc,
  type,
  checked,
  onChecked,
  name,
  id,
  disabled,
  hint,
  showImage = true,
}: AddonOptionBlockProps) {
  const inputId = id ?? item.key;
  const hasImage = showImage && item.previewImage;

  const content = (
    <>
      <div className="flex items-start gap-3 shrink-0">
        {!disabled && (
          type === "radio" ? (
            <input
              type="radio"
              name={name}
              id={inputId}
              checked={checked}
              onChange={() => onChecked(true)}
              className="mt-1 h-4 w-4 border-rock/40 text-plateau focus:ring-plateau"
            />
          ) : (
            <input
              type="checkbox"
              id={inputId}
              checked={checked}
              onChange={(e) => onChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-rock/40 text-plateau focus:ring-plateau"
            />
          )
        )}
        {disabled && <span className="mt-1 w-4 h-4 shrink-0" aria-hidden />}
        {hasImage && (
          <div className="relative w-[240px] h-[160px] rounded-lg overflow-hidden bg-rock/10 shrink-0">
            <Image
              src={item.previewImage}
              alt=""
              fill
              className="object-cover"
              sizes="240px"
              unoptimized
            />
            <ImageDebug label={`addon:${item.key}`} src={item.previewImage} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">
          {label}
          {price > 0 && (
            <span className="text-ink/80 font-normal ml-2">
              +{formatPrice(price)}
            </span>
          )}
          {disabled && hint && (
            <span className="text-ink/70 font-normal ml-2 text-sm">
              ({hint})
            </span>
          )}
        </p>
        <p className="text-sm text-ink/85 leading-relaxed mt-1">{desc}</p>
      </div>
    </>
  );

  if (disabled) {
    return (
      <div
        className={cn(
          "flex gap-4 p-4 rounded-xl border border-rock/15 bg-rock/5 opacity-70"
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <label
      className={cn(
        "flex gap-4 p-4 rounded-xl border cursor-pointer transition-colors",
        "hover:bg-rock/5",
        checked
          ? "border-plateau/50 bg-plateau/5"
          : "border-rock/15 bg-cream"
      )}
    >
      {content}
    </label>
  );
}
