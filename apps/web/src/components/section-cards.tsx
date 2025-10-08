import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { addDays, isBefore, isFuture } from "date-fns";
import { useMemo } from "react";

export function SectionCards() {
  const pksData = useQuery(api.pks.getAllPks, {});

  const { totalActive, totalExpired, totalAlmostExpired, totalData } =
    useMemo(() => {
      let totalActive = 0;
      let totalExpired = 0;
      let totalAlmostExpired = 0;
      const totalData = pksData?.length || 0;

      pksData?.forEach((item) => {
        const date = new Date(item.expiry_date_to);
        const activeDate = isFuture(date);
        const almostExpiredDate = isBefore(date, addDays(new Date(), 30));

        if (almostExpiredDate) {
          totalAlmostExpired += 1;
        } else {
          if (activeDate) {
            totalActive += 1;
          } else {
            totalExpired += 1;
          }
        }
      });

      return {
        totalActive,
        totalExpired,
        totalData,
        totalAlmostExpired,
      };
    }, [pksData]);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total PKS</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl p-1">
            {totalData}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>PKS Aktif</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalActive}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>PKS Akan Habis</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalAlmostExpired}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>PKS Kedaluwarsa</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalExpired}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
