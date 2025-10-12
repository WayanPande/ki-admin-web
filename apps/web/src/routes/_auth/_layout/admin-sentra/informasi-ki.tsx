import { api } from "@ki-admin-web/backend/convex/_generated/api";
import type { Id } from "@ki-admin-web/backend/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { DataTable } from "@/components/data-table";
import FieldInfo from "@/components/field-info";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { routeSearchSchema } from "@/lib/utils";

export const Route = createFileRoute(
  "/_auth/_layout/admin-sentra/informasi-ki"
)({
  component: RouteComponent,
  validateSearch: zodValidator(routeSearchSchema),
});

function RouteComponent() {
  const [open, setOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const search = Route.useSearch();

  const navigate = useNavigate({ from: Route.fullPath });

  const { results, status, loadMore } = usePaginatedQuery(
    api.informasi_ki.getAllInformasiKiPaginated,
    {
      searchTerm: search.query,
    },
    { initialNumItems: search.limit }
  );

  const informasiKi = useQuery(api.informasi_ki.getAllInformasiKi, {
    searchTerm: search.query,
  });

  const createInformasiKi = useMutation(api.informasi_ki.createInformasiKi);
  const updateInformasiKi = useMutation(api.informasi_ki.updateInformasiKi);
  const deleteInformasiKi = useMutation(api.informasi_ki.deleteInformasiKi);

  const columns: ColumnDef<(typeof results)[number]>[] = [
    {
      id: "#",
      header: "No",
      cell: ({ row }) => (search.page - 1) * search.limit + row.index + 1,
    },
    {
      accessorKey: "name",
      id: "Nama Sosialisasi",
      header: "Nama Sosialisasi",
    },
    { accessorKey: "date", id: "Tanggal", header: "Tanggal" },
    {
      id: "action",
      cell: ({ row }) => {
        const data = row.original;

        return (
          <div className="flex gap-2">
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                formAdd.reset();

                formAdd.setFieldValue("id", data._id);
                formAdd.setFieldValue("date", data.date);
                formAdd.setFieldValue("name", data.name);
                formAdd.setFieldValue("description", data.description);

                setIsPreview(true);
                setOpen(true);
              }}
            >
              Detail
            </Button>
            <Button
              size={"sm"}
              onClick={() => {
                formAdd.reset();

                formAdd.setFieldValue("id", data._id);
                formAdd.setFieldValue("date", data.date);
                formAdd.setFieldValue("name", data.name);
                formAdd.setFieldValue("description", data.description);

                setOpen(true);
              }}
            >
              Ubah
            </Button>
            <Button
              size={"sm"}
              variant={"destructive"}
              onClick={async () => {
                const promise = deleteInformasiKi({ id: data._id });

                toast.promise(promise, {
                  loading: "Loading...",
                  success: "Informasi Penyebarluasan KI Berhasil Dihapus",
                  error: "Terjadi Kesalahan",
                });
              }}
            >
              Hapus
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const pagination = {
    pageIndex: search.page - 1,
    pageSize: search.limit,
  };

  const paginationInfo = () => {
    const totalLoadedItems = informasiKi?.length ?? 0;
    const currentPageItems = results?.slice(
      (search.page - 1) * search.limit,
      search.page * search.limit
    );

    const canLoadMoreFromConvex = status === "CanLoadMore";
    const isLoadingFromConvex =
      status === "LoadingMore" || status === "LoadingFirstPage";
    const isExhausted = status === "Exhausted";

    const rowCount = totalLoadedItems;
    let pageCount: number | undefined;

    if (isExhausted) {
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
  };

  const formAdd = useForm({
    defaultValues: {
      id: "",
      name: "",
      description: "",
      date: new Date().toLocaleDateString(),
    },
    onSubmit: async ({ value }) => {
      let promise: Promise<
        string & {
          __tableName: "informasi_ki";
        }
      >;

      console.log(value);

      if (value.id) {
        promise = updateInformasiKi({
          id: value.id as Id<"informasi_ki">,
          date: value.date,
          name: value.name,
          description: value.description,
        });
      } else {
        promise = createInformasiKi({
          date: value.date,
          name: value.name,
          description: value.description,
        });
      }

      toast.promise(promise, {
        loading: "Loading...",
        success: `Informasi Penyebarluasan KI Berhasil ${
          value.id ? "Diubah" : "Ditambah"
        }`,
        error: "Terjadi Kesalahan",
      });

      setOpen(false);
    },
    validators: {
      onSubmit: z.object({
        id: z.any().and(z.any()),
        date: z.string().min(2, "Silahkan Pilih Periode"),
        name: z.string().min(2, "Silahkan Isi Nama Sosialisasi"),
        description: z.string().min(2, "Silahkan Isi Deskripsi Sosialisasi"),
      }),
    },
  });

  return (
    <>
      <SiteHeader title="Penyebarluasan Informasi KI" />
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
        <DataTable
          columns={columns}
          searchPlaceHolder="Nama Sosialisasi..."
          loadMore={loadMore}
          paginationInfo={paginationInfo()}
          pagination={pagination}
          navigate={navigate}
          search={search}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
      </div>

      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setIsPreview(false);
          }
        }}
      >
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
              <DialogTitle className="flex gap-3">
                {isPreview ? (
                  "Detail Data"
                ) : (
                  <>{formAdd.getFieldValue("id") ? "Ubah" : "Tambah"} Data</>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-10">
              <formAdd.Field name="name">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Nama Sosialisasi</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="string"
                      disabled={isPreview}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              </formAdd.Field>
              <formAdd.Field name="date">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Tanggal</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date"
                          className="w-full justify-between font-normal"
                          disabled={isPreview}
                        >
                          {field.state.value
                            ? field.state.value
                            : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={new Date(field.state.value)}
                          captionLayout="dropdown"
                          startMonth={
                            new Date(new Date().getFullYear() - 25, 11, 31)
                          }
                          onSelect={(date) => {
                            field.handleChange(
                              date?.toLocaleDateString() ?? ""
                            );
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldInfo field={field} />
                  </div>
                )}
              </formAdd.Field>
              <formAdd.Field name="description">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Deskripsi Singkat</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      disabled={isPreview}
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
              {isPreview ? (
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Close
                  </Button>
                </DialogClose>
              ) : (
                <>
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
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
