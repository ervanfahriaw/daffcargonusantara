export type JenisDokumen = "surat_jalan" | "invoice" | "cost_sheet" | "pod";

export const jenisDokumenLabels: Record<JenisDokumen, string> = {
  surat_jalan: "Surat Jalan",
  invoice: "Invoice",
  cost_sheet: "Rincian Biaya (Cost Sheet)",
  pod: "Bukti Serah Terima (POD)",
};
