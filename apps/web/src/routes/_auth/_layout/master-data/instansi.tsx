import { DataTable } from "@/components/data-table";
import FieldInfo from "@/components/field-info";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routeSearchSchema } from "@/lib/utils";
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import type { Id } from "@ki-admin-web/backend/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import z from "zod";

export const Route = createFileRoute("/_auth/_layout/master-data/instansi")({
  component: RouteComponent,
  validateSearch: zodValidator(routeSearchSchema),
});

const emptyArray: any[] = [];

function RouteComponent() {
  const [open, setOpen] = useState(false);

  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const itemsToLoad = search.page * search.limit;

  const { results, status, loadMore } = usePaginatedQuery(
    api.instansi.getAllInstansiPaginated,
    {
      searchTerm: search.query,
    },
    { initialNumItems: itemsToLoad }
  );

  const instansiData = useQuery(api.instansi.getAllInstansi);

  const createInstansi = useMutation(api.instansi.createInstansi);
  const updateInstansi = useMutation(api.instansi.updateInstansi);
  const deleteInstansi = useMutation(api.instansi.deleteInstansi);

  const columns: ColumnDef<(typeof results)[number]>[] = [
    {
      id: "#",
      header: "No",
      cell: ({ row }) => (search.page - 1) * search.limit + row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "type",
      header: "Tipe",
    },
    {
      id: "action",
      cell: ({ row }) => {
        const data = row.original;

        return (
          <div className="flex gap-2">
            <Button
              size={"sm"}
              onClick={() => {
                formAdd.reset();

                formAdd.setFieldValue("id", data._id);
                formAdd.setFieldValue("name", data.name);
                formAdd.setFieldValue("type", data.type);
                setOpen(true);
              }}
            >
              Ubah
            </Button>
            <Button
              size={"sm"}
              variant={"destructive"}
              onClick={() =>
                deleteInstansi({
                  id: data._id,
                })
              }
            >
              Remove
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
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
      globalFilter: search.query,
    },
    manualPagination: true,
    rowCount: instansiData?.length ?? 0,
    onGlobalFilterChange: (value) => {
      if (value !== search.query) {
        navigate({
          search: { ...search, query: value, page: 1 },
        });
      }
    },
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

  const formAdd = useForm({
    defaultValues: {
      name: "",
      type: "",
      id: "",
    },
    onSubmit: async ({ value }) => {
      if (value.id) {
        await updateInstansi({
          id: value.id as Id<"instansi">,
          name: value.name,
          type: value.type,
        });
      } else {
        await createInstansi({ name: value.name, type: value.type });
      }

      setOpen(false);
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Silahkan Isi Nama Instansi"),
        type: z.string().min(2, "Silahkan Isi Jenis Instansi"),
        id: z.any().and(z.any()),
      }),
    },
  });

  return (
    <>
      <SiteHeader title="Master Data Kabupaten/Kota" />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="mx-4 lg:mx-6 flex justify-end">
          <Button
            onClick={() => {
              formAdd.reset();
              setOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
        <DataTable table={table} searchPlaceHolder="Nama Instansi..." />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="dialog">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              formAdd.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {formAdd.getFieldValue("id") ? "Ubah" : "Tambah"} Instansi
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <formAdd.Field name="name">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Nama Instansi</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              </formAdd.Field>

              <formAdd.Field name="type">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Jenis Instansi</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              </formAdd.Field>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <formAdd.Subscribe>
                {(state) => (
                  <Button
                    type="submit"
                    disabled={!state.canSubmit || state.isSubmitting}
                  >
                    {state.isSubmitting ? "Submitting..." : "Simpan"}
                  </Button>
                )}
              </formAdd.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
