"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

function isMobileLike(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px), (hover: none) and (pointer: coarse)").matches;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEventLike | null>(null);
  const [showChromeInstall, setShowChromeInstall] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  const dismissIos = useCallback(() => {
    try {
      sessionStorage.setItem("consultech-pwa-ios-hint", "1");
    } catch {
    }
    setShowIosHint(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEventLike);
      if (isMobileLike()) setShowChromeInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIos() && !isStandalone() && isMobileLike()) {
      try {
        if (!sessionStorage.getItem("consultech-pwa-ios-hint")) {
          setShowIosHint(true);
        }
      } catch {
        setShowIosHint(true);
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const onInstallClick = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
    }
    setDeferred(null);
    setShowChromeInstall(false);
  };

  if (!showChromeInstall && !showIosHint) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-[var(--surface)] p-4 shadow-lg dark:border-neutral-700 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm sm:rounded-xl sm:border"
      role="region"
      aria-label="Instalar aplicativo"
    >
      {showChromeInstall && deferred && (
        <div className="flex flex-col gap-3">
          <p className="text-body text-[var(--text-primary)]">
            Instale o app para acesso rápido aos formulários neste dispositivo.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="primary" size="sm" onClick={onInstallClick}>
              Instalar app
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowChromeInstall(false)}>
              Agora não
            </Button>
          </div>
        </div>
      )}
      {showIosHint && !showChromeInstall && (
        <div className="flex gap-3">
          <p className="flex-1 text-small text-[var(--text-primary)]">
            No Safari, toque em Compartilhar e em seguida em Adicionar à Tela de Início para instalar.
          </p>
          <button
            type="button"
            onClick={dismissIos}
            className="shrink-0 rounded-lg p-1 text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
            aria-label="Fechar dica de instalação"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
