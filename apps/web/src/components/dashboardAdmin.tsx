import { cn } from "@/lib/utils";
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { usePaginatedQuery } from "convex/react";
import { addWeeks, isBefore, isFuture } from "date-fns";
import { useState } from "react";
import { DataTable } from "./data-table";
import { SectionCards } from "./section-cards";
import { SiteHeader } from "./site-header";
import { Badge } from "./ui/badge";

const emptyArray: any[] = [];

interface DashboardProps {
  search: {
    limit: number;
    page: number;
    query: string;
  };
}

const DashboardAdmin = ({ search }: DashboardProps) => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.pks.getAllPksPaginated,
    {},
    { initialNumItems: search.limit }
  );

  const columns: ColumnDef<(typeof results)[number]>[] = [
    {
      id: "#",
      header: "No",
      cell: ({ row }) => (search.page - 1) * search.limit + row.index + 1,
    },
    {
      accessorKey: "sentra_ki_id",
      id: "Nama Sentra KI",
      header: "Nama Sentra KI",
      cell: ({ row }) => {
        const data = row.original;
        return data.sentra_ki?.name ?? "-";
      },
    },
    {
      id: "name_instansi",
      header: "Instansi",
      cell: ({ row }) => {
        const data = row.original;
        return data.instansi?.name ?? "-";
      },
    },
    {
      id: "Kabupaten/Kota",
      header: "Kabupaten/Kota",
      cell: ({ row }) => {
        const data = row.original;
        return data.sentra_ki?.city ?? "-";
      },
    },
    {
      id: "Status",
      header: "Status",
      cell: ({ row }) => {
        const item = row.original;
        let status: "Aktif" | "Kedaluarsa" | "Akan Habis" | "-" = "-";

        const date = new Date(item.expiry_date_to);
        const activeDate = isFuture(date);
        const almostExpiredDate = isBefore(date, addWeeks(new Date(), 1));

        if (almostExpiredDate) {
          status = "Akan Habis";
        } else {
          if (activeDate) {
            status = "Aktif";
          } else {
            status = "Kedaluarsa";
          }
        }

        return (
          <Badge
            className={cn("bg-orange-500", {
              "bg-green-500": status === "Aktif",
              "bg-yellow-500": status === "Kedaluarsa",
            })}
          >
            {status}
          </Badge>
        );
      },
    },
  ];

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: results ?? emptyArray,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
    manualPagination: true,
  });

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <DataTable table={table} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardAdmin;
