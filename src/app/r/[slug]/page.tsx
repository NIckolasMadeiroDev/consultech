"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ShortLinkPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/forms/by-slug/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) {
          router.replace("/");
          return;
        }
        return res.json();
      })
      .then((form) => {
        if (form?.id) {
          router.replace(`/forms/${form.id}/respond`);
        } else {
          router.replace("/");
        }
      })
      .catch(() => router.replace("/"));
  }, [slug, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-4">
      <p className="text-body text-[var(--text-secondary)]">Redirecionando...</p>
      <div className="mt-3 h-1 w-24 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary-500" />
      </div>
    </div>
  );
}
