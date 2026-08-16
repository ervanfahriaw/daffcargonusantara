"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface WeeklyPerformanceChartProps {
  data?: Array<{
    day: string;
    kiriman: number;
  }>;
}

const DEFAULT_DATA = [
  { day: "Sen", kiriman: 3 },
  { day: "Sel", kiriman: 5 },
  { day: "Rab", kiriman: 2 },
  { day: "Kam", kiriman: 6 },
  { day: "Jum", kiriman: 4 },
  { day: "Sab", kiriman: 7 },
  { day: "Min", kiriman: 1 },
];

export function WeeklyPerformanceChart({
  data = DEFAULT_DATA,
}: WeeklyPerformanceChartProps) {
  const totalWeekly = data.reduce((acc, curr) => acc + curr.kiriman, 0);

  return (
    <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-surface-tint)]">
            <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-navy-900)]">
              Aktivitas Pengiriman
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Volume armada minggu ini
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[var(--color-surface-tint)] px-3 py-1 text-xs font-bold text-[var(--color-primary)] tabular-nums">
          {totalWeekly} Muatan
        </span>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="day"
              stroke="#5B6B82"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#5B6B82"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--color-surface-tint)", opacity: 0.6 }}
              contentStyle={{
                backgroundColor: "var(--color-navy-900)",
                border: "none",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{ fontWeight: "bold", color: "#ffffff" }}
              formatter={(value) => [`${value ?? 0} Pengiriman`, "Volume"]}
            />
            <Bar
              dataKey="kiriman"
              fill="var(--color-primary)"
              radius={[8, 8, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
