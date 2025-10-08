import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { SectionCards } from "@/components/section-cards";
import { SectionCardsUser } from "@/components/section-cards-user";
import { StatikPencatatanKi } from "@/components/statistik-pencatatan-ki";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardSchema, years } from "@/lib/utils";

export const Route = createFileRoute("/_default/_layout/")({
  component: HomeComponent,
  validateSearch: zodValidator(dashboardSchema),
});

function HomeComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate({
    from: Route.fullPath,
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-2 grid gap-10 mb-20">
      <SectionCards />
      <div className="px-4 lg:px-6 space-y-10">
        <div className="space-y-3">
          <Select
            onValueChange={(data) => {
              navigate({
                search: { ...search, year: data },
              });
            }}
            defaultValue={search.year.toString()}
          >
            <SelectTrigger className="ml-auto mr-0">
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
          <StatikPencatatanKi search={search} />
        </div>
        <h1 className="font-semibold">
          Statistik Pencatatan dan/atau Pendaftaran KI oleh Sentra KI
        </h1>
      </div>
      <SectionCardsUser search={search} />
    </div>
  );
}
