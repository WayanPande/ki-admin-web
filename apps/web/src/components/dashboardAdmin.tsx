import { cn } from "@/lib/utils";
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { usePaginatedQuery, useQuery } from "convex/react";
import { addDays, isBefore, isFuture } from "date-fns";
import { useMemo, useState } from "react";
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
    year: number;
  };
}

const DashboardAdmin = ({ search }: DashboardProps) => {
  const navigate = useNavigate({ from: "/dashboard" });

  const itemsToLoad = search.page * search.limit;

  const { results, status, loadMore } = usePaginatedQuery(
    api.pks.getAllPksPaginated,
    {},
    { initialNumItems: itemsToLoad }
  );

  const pksData = useQuery(api.pks.getAllPks, {});

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
        const almostExpiredDate = isBefore(date, addDays(new Date(), 30));

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

  const pagination = useMemo(
    () => ({
      pageIndex: search.page - 1,
      pageSize: search.limit,
    }),
    [search.page, search.limit]
  );

  const paginationInfo = useMemo(() => {
    const totalLoadedItems = results?.length ?? 0;
    const currentPageItems =
      results?.slice(
        (search.page - 1) * search.limit,
        search.page * search.limit
      ) ?? emptyArray;

    const canLoadMoreFromConvex = status === "CanLoadMore";
    const isLoadingFromConvex =
      status === "LoadingMore" || status === "LoadingFirstPage";
    const isExhausted = status === "Exhausted";

    let rowCount: number | undefined;
    let pageCount: number | undefined;

    if (isExhausted) {
      rowCount = totalLoadedItems;
      pageCount = Math.max(1, Math.ceil(totalLoadedItems / search.limit));
    } else {
      pageCount = -1;
    }

    return {
      currentPageItems,
      canLoadMoreFromConvex,
      isLoadingFromConvex,
      isExhausted,
      rowCount,
      pageCount,
      totalLoadedItems,
    };
  }, [results, search.page, search.limit, status]);

  const table = useReactTable({
    data: paginationInfo.currentPageItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
      pagination,
    },
    manualPagination: true,
    rowCount: pksData?.length ?? 0,
    onPaginationChange: (updater) => {
      const newPaginationState =
        typeof updater === "function" ? updater(pagination) : updater;

      const newPage = newPaginationState.pageIndex + 1;
      const newLimit = newPaginationState.pageSize;

      navigate({
        search: { ...search, page: newPage, limit: newLimit },
      });

      const requiredItems = newPage * newLimit;
      if (
        requiredItems > paginationInfo.totalLoadedItems &&
        paginationInfo.canLoadMoreFromConvex
      ) {
        const itemsToLoad = requiredItems - paginationInfo.totalLoadedItems;
        loadMore(itemsToLoad);
      }
    },
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
