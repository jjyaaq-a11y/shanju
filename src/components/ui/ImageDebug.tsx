"use client";

/** 图片调试信息：显示 [label] 和 src URL，方便排查。上线前可移除或通过环境变量关闭。 */
export function ImageDebug({
  label,
  src,
  className = "",
}: {
  label: string;
  src: string | null | undefined;
  className?: string;
}) {
  if (process.env.NODE_ENV === "production") return null;

  const url = src?.trim() || "";
  const display = url ? (url.length > 60 ? url.slice(0, 57) + "…" : url) : "(empty)";
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-black/70 text-[10px] text-cream/90 font-mono px-2 py-1 truncate ${className}`}
      title={url || "(empty)"}
    >
      <span className="text-cream/60 mr-1">[{label}]</span>
      {display}
    </div>
  );
}
