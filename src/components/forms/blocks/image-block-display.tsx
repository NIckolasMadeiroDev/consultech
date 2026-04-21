"use client";

export type ImageBlockDisplayProps = {
  readonly imageUrl: string;
  readonly imageAlt?: string | null;
};

export function ImageBlockDisplay({ imageUrl, imageAlt }: ImageBlockDisplayProps) {
  const src = imageUrl.trim();
  if (!src) return null;
  return (
    <figure className="my-2">
      <img
        src={src}
        alt={imageAlt?.trim() || ""}
        className="max-h-[min(70vh,480px)] w-full rounded-lg object-contain"
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}
