"use client";

import { useState, type ReactNode, type Ref } from "react";
import type { FormThemeResponsive } from "@/types/form-theme";

export type PreviewDevice = "mobile" | "tablet" | "desktop";

type ResponsivePreviewProps = {
  readonly responsive: FormThemeResponsive;
  readonly children: ReactNode;
  readonly captureRootRef?: Ref<HTMLDivElement>;
};

const LABELS: Record<PreviewDevice, string> = {
  mobile: "Telemóvel",
  tablet: "Tablet",
  desktop: "Desktop",
};

export function ResponsivePreview({ responsive, children, captureRootRef }: ResponsivePreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const mobileW = responsive.mobileBreakpoint;
  const tabletW = responsive.tabletBreakpoint;

  const frameStyle =
    device === "mobile"
      ? { width: "100%", maxWidth: mobileW }
      : device === "tablet"
        ? { width: "100%", maxWidth: tabletW }
        : { width: "100%", maxWidth: "100%" };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Largura da pré-visualização">
        {(Object.keys(LABELS) as PreviewDevice[]).map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={device === d}
            className={`rounded-lg px-3 py-1.5 text-small font-medium ${
              device === d
                ? "bg-primary-600 text-white"
                : "border border-neutral-300 text-[var(--text-secondary)] hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
            }`}
            onClick={() => setDevice(d)}
          >
            {LABELS[d]}
          </button>
        ))}
      </div>
      <div
        ref={captureRootRef}
        className="mx-auto w-full transition-[max-width] duration-200 ease-out"
        style={frameStyle}
        data-preview-device={device}
      >
        <div className="touch-manipulation">{children}</div>
      </div>
    </div>
  );
}
