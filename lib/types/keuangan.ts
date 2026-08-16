export type StatusPembayaran =
  | "belum_ditagih"
  | "menunggu_pembayaran"
  | "lunas";

export const statusPembayaranConfig: Record<
  StatusPembayaran,
  { label: string; bgColor: string; textColor: string }
> = {
  belum_ditagih: {
    label: "Belum Ditagih",
    bgColor: "bg-[var(--color-neutral-100)]",
    textColor: "text-[var(--color-neutral-600)]",
  },
  menunggu_pembayaran: {
    label: "Menunggu Pembayaran",
    bgColor: "bg-[var(--color-warning-100)]",
    textColor: "text-[var(--color-warning-600)]",
  },
  lunas: {
    label: "Lunas",
    bgColor: "bg-[var(--color-success-100)]",
    textColor: "text-[var(--color-success-600)]",
  },
};
