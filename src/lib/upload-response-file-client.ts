import type { ResponseFileUploadApiResult } from "@/lib/map-response-file-upload";

function clientApiOrigin(): string {
  if (globalThis.window !== undefined) {
    return globalThis.window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function uploadResponseFileWithProgress(
  formId: string,
  questionId: string,
  file: File,
  onProgress: (ratio01: number) => void
): Promise<ResponseFileUploadApiResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("questionId", questionId);
  const url = `${clientApiOrigin()}/api/forms/${formId}/response-file`;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && ev.total > 0) {
        onProgress(Math.min(1, ev.loaded / ev.total));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const j = JSON.parse(xhr.responseText) as ResponseFileUploadApiResult;
          if (!j?.publicUrl || !j?.storagePath) {
            reject(new Error("Falha no envio do ficheiro"));
            return;
          }
          resolve(j);
        } catch {
          reject(new Error("Falha no envio do ficheiro"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(err.error ?? "Falha no envio do ficheiro"));
        } catch {
          reject(new Error("Falha no envio do ficheiro"));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Falha de rede ao enviar"));
    xhr.send(fd);
  });
}
