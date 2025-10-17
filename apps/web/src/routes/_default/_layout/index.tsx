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
import { Separator } from "@/components/ui/separator";
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
      <div className="px-4 lg:px-6">
        <Separator />
      </div>
      <div className=" space-y-10">
        <div className="space-y-3">
          <SectionCardsUser search={search} />
          <div className="flex items-center ml-auto mr-0 w-fit gap-2 px-4 lg:px-6 mt-10">
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
          <div className="px-4 lg:px-6">
            <StatikPencatatanKi search={search} />
          </div>
        </div>
      </div>
    </div>
  );
}
