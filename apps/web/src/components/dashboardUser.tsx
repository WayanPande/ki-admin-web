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

interface DashboardProps {
  search: {
    limit: number;
    page: number;
    query: string;
    year: number;
  };
}

const DashboardUser = ({ search }: DashboardProps) => {
  const navigate = useNavigate({
    from: "/dashboard",
  });

  return (
    <>
      <SiteHeader title="Dashboard Statistik Pencatatan dan/atau Pendaftaran KI oleh Sentra KI" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCardsUser search={search} />
            <div className="px-4 lg:px-6 space-y-3">
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
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardUser;
