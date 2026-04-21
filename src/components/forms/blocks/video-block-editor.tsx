"use client";

import { Input } from "@/components/ui/input";
import { isEmbeddableVideoPageUrl, toVideoEmbedSrc } from "@/lib/video-embed-url";

export type VideoBlockEditorProps = {
  readonly videoUrl: string;
  readonly onChange: (url: string) => void;
  readonly disabled?: boolean;
};

export function VideoBlockEditor({ videoUrl, onChange, disabled }: VideoBlockEditorProps) {
  const embed = videoUrl.trim() ? toVideoEmbedSrc(videoUrl) : null;
  const valid = videoUrl.trim() ? isEmbeddableVideoPageUrl(videoUrl) : true;
  return (
    <div className="space-y-3">
      <Input
        label="URL do YouTube ou Vimeo"
        type="url"
        value={videoUrl}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="https://www.youtube.com/watch?v=..."
      />
      {!valid ? (
        <p className="text-small text-error">Cole um link público do YouTube ou Vimeo.</p>
      ) : null}
      {embed ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
          <iframe
            title="Pré-visualização do vídeo"
            src={embed}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
    </div>
  );
}
