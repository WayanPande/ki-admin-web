import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import { useQuery } from "convex/react";

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function StatikPencatatanKi() {
  const chartDataByType = useQuery(api.daftar_ki.getChartDataByType, {
    year: new Date().getFullYear(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Pencatatan/Pendaftaran KI di Bali</CardTitle>
        <CardDescription>
          Januari - Desember {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartDataByType}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
