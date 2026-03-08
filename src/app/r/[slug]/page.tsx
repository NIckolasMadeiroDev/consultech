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
    <div className="flex min-h-screen items-center justify-center p-4">
      <p className="text-slate-600">Redirecionando...</p>
    </div>
  );
}
