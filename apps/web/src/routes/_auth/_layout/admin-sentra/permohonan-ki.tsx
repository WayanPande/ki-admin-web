import { api } from "@ki-admin-web/backend/convex/_generated/api";
import type { Id } from "@ki-admin-web/backend/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { format } from "date-fns/format";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
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
import { MonthPicker } from "@/components/ui/monthpicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, routeSearchSchema } from "@/lib/utils";

export const Route = createFileRoute(
  "/_auth/_layout/admin-sentra/permohonan-ki"
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
    api.permohonan_ki.getAllPermohonanKiPaginated,
    {
      searchTerm: search.query,
    },
    { initialNumItems: search.limit }
  );

  const daftarKi = useQuery(api.permohonan_ki.getAllPermohonanKi, {});

  const createPermohonanKi = useMutation(api.permohonan_ki.createPermohonanKi);
  const updatePermohonanKi = useMutation(api.permohonan_ki.updatePermohonanKi);
  const deletePermohonanKi = useMutation(api.permohonan_ki.deletePermohonanKi);

  const columns: ColumnDef<(typeof results)[number]>[] = [
    {
      id: "#",
      header: "No",
      cell: ({ row }) => (search.page - 1) * search.limit + row.index + 1,
    },
    {
      id: "date",
      header: "Bulan",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.getFullYear();

        return `${month} ${year}`;
      },
    },
    {
      accessorKey: "merek",
      id: "Merek",
      header: "Merek",
    },
    {
      accessorKey: "paten",
      id: "Paten",
      header: "Paten",
    },
    { accessorKey: "hak_cipta", id: "Hak Cipta", header: "Hak Cipta" },
    {
      accessorKey: "indikasi_geografis",
      id: "Indikasi Geografis",
      header: "Indikasi Geografis",
    },
    { accessorKey: "dtlst", id: "DTLST", header: "DTLST" },
    {
      accessorKey: "rahasia_dagang",
      id: "Rahasia Dagang",
      header: "Rahasia Dagang",
    },
    {
      accessorKey: "desain_industri",
      id: "Desain Industri",
      header: "Desain Industri",
    },
    { accessorKey: "ki_komunal", id: "KI Komunal", header: "KI Komunal" },
    {
      accessorKey: "total",
      id: "Total",
      header: "Total",
      cell: ({ row }) => {
        const data = row.original;

        return (
          data.desain_industri +
          data.dtlst +
          data.hak_cipta +
          data.indikasi_geografis +
          data.merek +
          data.paten +
          data.rahasia_dagang +
          data.ki_komunal
        );
      },
    },
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
                formAdd.setFieldValue("merek", data.merek);
                formAdd.setFieldValue("paten", data.paten);
                formAdd.setFieldValue("hak_cipta", data.hak_cipta);
                formAdd.setFieldValue(
                  "indikasi_geografis",
                  data.indikasi_geografis
                );
                formAdd.setFieldValue("dtlst", data.dtlst);
                formAdd.setFieldValue("rahasia_dagang", data.rahasia_dagang);
                formAdd.setFieldValue("desain_industri", data.desain_industri);
                formAdd.setFieldValue("ki_komunal", data.ki_komunal);
                formAdd.setFieldValue("date", data.date);

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
                formAdd.setFieldValue("merek", data.merek);
                formAdd.setFieldValue("paten", data.paten);
                formAdd.setFieldValue("hak_cipta", data.hak_cipta);
                formAdd.setFieldValue(
                  "indikasi_geografis",
                  data.indikasi_geografis
                );
                formAdd.setFieldValue("dtlst", data.dtlst);
                formAdd.setFieldValue("rahasia_dagang", data.rahasia_dagang);
                formAdd.setFieldValue("desain_industri", data.desain_industri);
                formAdd.setFieldValue("ki_komunal", data.ki_komunal);
                formAdd.setFieldValue("date", data.date);

                setOpen(true);
              }}
            >
              Ubah
            </Button>
            <Button
              size={"sm"}
              variant={"destructive"}
              onClick={async () => {
                const promise = deletePermohonanKi({ id: data._id });

                toast.promise(promise, {
                  loading: "Loading...",
                  success: "Permohonan KI Berhasil Dihapus",
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
    const totalLoadedItems = daftarKi?.length ?? 0;
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
      merek: 0,
      paten: 0,
      hak_cipta: 0,
      indikasi_geografis: 0,
      dtlst: 0,
      rahasia_dagang: 0,
      desain_industri: 0,
      ki_komunal: 0,
      date: new Date().toISOString(),
    },
    onSubmit: async ({ value }) => {
      let promise: Promise<
        string & {
          __tableName: "permohonan_ki";
        }
      >;

      if (value.id) {
        promise = updatePermohonanKi({
          id: value.id as Id<"permohonan_ki">,
          date: value.date,
          merek: value.merek,
          paten: value.paten,
          hak_cipta: value.hak_cipta,
          indikasi_geografis: value.indikasi_geografis,
          dtlst: value.dtlst,
          rahasia_dagang: value.rahasia_dagang,
          desain_industri: value.desain_industri,
          ki_komunal: value.ki_komunal,
        });
      } else {
        promise = createPermohonanKi({
          date: value.date,
          merek: value.merek,
          paten: value.paten,
          hak_cipta: value.hak_cipta,
          indikasi_geografis: value.indikasi_geografis,
          dtlst: value.dtlst,
          rahasia_dagang: value.rahasia_dagang,
          desain_industri: value.desain_industri,
          ki_komunal: value.ki_komunal,
        });
      }

      toast.promise(promise, {
        loading: "Loading...",
        success: `Permohonan KI Berhasil ${value.id ? "Diubah" : "Ditambah"}`,
        error: "Terjadi Kesalahan",
      });

      setOpen(false);
    },
    validators: {
      onSubmit: z.object({
        merek: z.number().min(0, "Silahkan Isi Jenis Merek"),
        paten: z.number().min(0, "Silahkan Isi Jenis Paten"),
        hak_cipta: z.number().min(0, "Silahkan Isi Jenis Hak Cipta"),
        indikasi_geografis: z
          .number()
          .min(0, "Silahkan Isi Jenis Indikasi Geografis"),
        dtlst: z.number().min(0, "Silahkan Isi Jenis DTLST"),
        rahasia_dagang: z.number().min(0, "Silahkan Isi Jenis Rahasia Dagang"),
        desain_industri: z
          .number()
          .min(0, "Silahkan Isi Jenis Desain Industri"),
        ki_komunal: z.number().min(0, "Silahkan Isi Jenis KI Komunal"),
        id: z.any().and(z.any()),
        date: z.string().min(2, "Silahkan Pilih Periode"),
      }),
    },
  });

  return (
    <>
      <SiteHeader title="Penginputan Jumlah Permohonan KI" />
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
          searchPlaceHolder="Nama KI..."
          loadMore={loadMore}
          paginationInfo={paginationInfo()}
          pagination={pagination}
          navigate={navigate}
          search={search}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          showSearchField={false}
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
        <DialogContent className="sm:max-w-[725px]" aria-describedby="dialog">
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
            <formAdd.Field name="date">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor={field.name}>Periode</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !field.state.value && "text-muted-foreground"
                        )}
                        disabled={isPreview}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.state.value ? (
                          format(field.state.value, "MMM yyyy")
                        ) : (
                          <span>Pilih Periode</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <MonthPicker
                        onMonthSelect={(date) => {
                          field.handleChange(date.toISOString());
                        }}
                        selectedMonth={new Date(field.state.value)}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldInfo field={field} />
                </div>
              )}
            </formAdd.Field>
            <div className="grid grid-cols-2 gap-10">
              <div className="grid gap-5">
                <h1 className="font-bold">Jumlah Permohonan KI</h1>
                <formAdd.Field name="merek">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Merek</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
                <formAdd.Field name="paten">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Paten</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
                <formAdd.Field name="hak_cipta">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Hak Cipta</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
                <formAdd.Field name="dtlst">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>DTLST</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
                <formAdd.Field name="rahasia_dagang">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Rahasia Dagang</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
                <formAdd.Field name="desain_industri">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Desain Industri</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
              </div>
              <div className="grid gap-5 h-fit">
                <h1 className="font-bold">Jumlah Pengajuan Permohonan KI</h1>
                <formAdd.Field name="indikasi_geografis">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Indikasi Geografis</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
                <formAdd.Field name="ki_komunal">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>KI Komunal</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
              </div>
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
