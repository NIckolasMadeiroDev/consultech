import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "xlsx" | "json";

export function exportToFile(
  data: any[],
  filename: string,
  format: ExportFormat = "xlsx"
): void {
  if (data.length === 0) {
    alert("Nenhum dado para exportar");
    return;
  }

  if (format === "json") {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `${filename}.json`);
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, `${filename}.csv`);
  } else {
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
