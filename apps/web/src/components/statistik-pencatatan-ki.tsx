import { api } from "@ki-admin-web/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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

interface DashboardProps {
  search: {
    year_from: number;
    year_to: number;
  };
}

export function StatikPencatatanKi({ search }: DashboardProps) {
  const chartDataByType = useQuery(api.permohonan_ki.getPermohonanKiChartData, {
    year_from: search?.year_from ?? new Date().getFullYear(),
    year_to: search?.year_to ?? new Date().getFullYear() + 1,
  });

  const chartConfig = {
    totalYearFrom: {
      label: `${search?.year_from}`,
      color: "var(--chart-1)",
    },
    totalYearTo: {
      label: `${search?.year_to}`,
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Pencatatan/Pendaftaran KI di Bali</CardTitle>
        <CardDescription>
          {search?.year_from} & {search?.year_to}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartDataByType}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="totalYearFrom"
              stroke="var(--color-totalYearFrom)"
              type="monotone"
              dot={false}
              strokeWidth={2}
            />
            <Line
              dataKey="totalYearTo"
              stroke="var(--color-totalYearTo)"
              type="monotone"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
