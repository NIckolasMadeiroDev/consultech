"use client";

import { toVideoEmbedSrc } from "@/lib/video-embed-url";

export type VideoBlockDisplayProps = {
  readonly videoUrl: string;
};

export function VideoBlockDisplay({ videoUrl }: VideoBlockDisplayProps) {
  const embed = toVideoEmbedSrc(videoUrl);
  if (!embed) return null;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
      <iframe
        title="Vídeo incorporado"
        src={embed}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
