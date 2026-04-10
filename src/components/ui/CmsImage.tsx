"use client";

import Image, { type ImageProps } from "next/image";

type CmsImageProps = ImageProps & {
  rotation?: number;
};

export function CmsImage({ rotation = 0, style, ...props }: CmsImageProps) {
  const transform = rotation ? `rotate(${rotation}deg)` : undefined;

  return (
    <Image
      {...props}
      style={{
        ...style,
        transform: [style?.transform, transform].filter(Boolean).join(" ") || undefined,
        transformOrigin: rotation ? "center center" : style?.transformOrigin,
      }}
    />
  );
}
