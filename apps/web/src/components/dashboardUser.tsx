import { useNavigate } from "@tanstack/react-router";
import { years } from "@/lib/utils";
import { SectionCardsUser } from "./section-cards-user";
import { SiteHeader } from "./site-header";
import { StatikPencatatanKi } from "./statistik-pencatatan-ki";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useQuery } from "convex/react";
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface DashboardProps {
  search: {
    limit: number;
    page: number;
    query: string;
    year_from: number;
    year_to: number;
  };
}

const DashboardUser = ({ search }: DashboardProps) => {
  const navigate = useNavigate({
    from: "/dashboard",
  });

  const countPenyebarluasan = useQuery(api.informasi_ki.getAllInformasiKi, {});

  return (
    <>
      <SiteHeader title="Dashboard Statistik Pencatatan dan/atau Pendaftaran KI oleh Sentra KI" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <Card className="from-primary/5 to-card dark:bg-card bg-gradient-to-t shadow-xs grid-cols-2 w-1/3">
                <CardHeader>
                  <CardDescription>
                    Total Penyebarluasan Informasi Sentra KI
                  </CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl p-1">
                    {countPenyebarluasan?.length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            <SectionCardsUser search={search} />
            <div className="px-4 lg:px-6 space-y-3">
              <div className="flex items-center ml-auto mr-0 w-fit gap-2">
                <Select
                  onValueChange={(data) => {
                    navigate({
                      search: { ...search, year_from: data, year_to: data },
                    });
                  }}
                  defaultValue={search.year_from.toString()}
                  value={search.year_from.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {years?.map((data) => {
                      return (
                        <SelectItem value={data} key={data}>
                          {data}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <span>&</span>
                <Select
                  onValueChange={(data) => {
                    navigate({
                      search: { ...search, year_to: data },
                    });
                  }}
                  defaultValue={search.year_to.toString()}
                  value={search.year_to.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {years?.map((data) => {
                      const year = parseInt(data);
                      return (
                        <SelectItem
                          value={data}
                          disabled={year <= search.year_from}
                          key={data}
                        >
                          {data}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <StatikPencatatanKi search={search} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardUser;
