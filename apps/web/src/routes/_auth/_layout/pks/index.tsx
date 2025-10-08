import { api } from "@ki-admin-web/backend/convex/_generated/api";
import type { Id } from "@ki-admin-web/backend/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routeSearchSchema } from "@/lib/utils";

export const Route = createFileRoute("/_auth/_layout/pks/")({
  component: RouteComponent,
  validateSearch: zodValidator(routeSearchSchema),
});

const emptyArray: any[] = [];

function RouteComponent() {
  const [open, setOpen] = useState(false);
  const [openFromCalendar, setOpenFromCalendar] = useState(false);
  const [openToCalendar, setOpenToCalendar] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const search = Route.useSearch();

  const navigate = useNavigate({ from: Route.fullPath });

  const itemsToLoad = search.page * search.limit;

  const { results, status, loadMore } = usePaginatedQuery(
    api.pks.getAllPksPaginated,
    {
      searchTerm: search.query,
    },
    { initialNumItems: itemsToLoad }
  );

  const pksData = useQuery(api.pks.getAllPks, {
    searchTerm: search.query,
  });

  const sentraKiData = useQuery(api.sentra_ki.getAllSentraKi, {});

  const createPks = useMutation(api.pks.createPks);
  const updatePks = useMutation(api.pks.updatePks);
  const deletePks = useMutation(api.pks.deletePks);

  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);

  const columns: ColumnDef<(typeof results)[number]>[] = [
    {
      id: "#",
      header: "No",
      cell: ({ row }) => (search.page - 1) * search.limit + row.index + 1,
    },
    {
      accessorKey: "no",
      header: "Nomor PKS",
    },
    {
      accessorKey: "name",
      header: "Nama PKS",
    },
    {
      id: "sentra_ki",
      header: "Sentra KI",
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
      accessorKey: "expiry_date_to",
      header: "Tanggal Kedaluwarsa",
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
                formAdd.setFieldValue("sentra_ki_id", data.sentra_ki_id);
                formAdd.setFieldValue("name", data.name);
                formAdd.setFieldValue("no", data.no);
                formAdd.setFieldValue("description", data.description ?? "");
                formAdd.setFieldValue("document_url", data.document_url ?? "");
                formAdd.setFieldValue(
                  "expiry_date_from",
                  data.expiry_date_from
                );
                formAdd.setFieldValue("expiry_date_to", data.expiry_date_to);
                formAdd.setFieldValue("document_id", data.document as string);

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
                formAdd.setFieldValue("sentra_ki_id", data.sentra_ki_id);
                formAdd.setFieldValue("name", data.name);
                formAdd.setFieldValue("no", data.no);
                formAdd.setFieldValue("description", data.description ?? "");
                formAdd.setFieldValue("document_url", data.document_url ?? "");
                formAdd.setFieldValue(
                  "expiry_date_from",
                  data.expiry_date_from
                );
                formAdd.setFieldValue("expiry_date_to", data.expiry_date_to);
                formAdd.setFieldValue("document_id", data.document as string);

                setOpen(true);
              }}
            >
              Ubah
            </Button>
            <Button
              size={"sm"}
              variant={"destructive"}
              onClick={async () => {
                const promise = deletePks({ id: data._id });

                toast.promise(promise, {
                  loading: "Loading...",
                  success: "PKS Berhasil Dihapus",
                  error: "Terjadi Kesalahan",
                });
              }}
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
    rowCount: pksData?.length ?? 0,
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
      sentra_ki_id: "",
      name: "",
      no: "",
      description: "",
      document: null as File | null,
      expiry_date_from: new Date().toLocaleDateString(),
      expiry_date_to: "",
      id: "",
      document_url: "",
      document_id: "",
    },
    onSubmit: async ({ value }) => {
      let promise: Promise<
        string & {
          __tableName: "pks";
        }
      >;

      let documentId: Id<"_storage"> | null = null;

      if (value.document instanceof File) {
        try {
          const formData = new FormData();
          formData.append("file", value.document);

          const postUrl = await generateUploadUrl();

          const res = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": value.document.type },
            body: formData,
          });

          const { storageId } = await res.json();
          documentId = storageId;
        } catch {
          toast.error(
            "Terjadi Kesalahan Saat Upload Dokumen, Silahkan Coba Lagi"
          );
          setOpen(false);
          return;
        }
      }

      if (value.id) {
        promise = updatePks({
          id: value.id as Id<"pks">,
          sentra_ki_id: value.sentra_ki_id as Id<"sentra_ki">,
          name: value.name,
          description: value.description,
          document: documentId ?? (value.document_id as Id<"_storage">),
          expiry_date_from: value.expiry_date_from,
          expiry_date_to: value.expiry_date_to,
        });
      } else {
        if (!documentId) {
          toast.error("Dokumen wajib diupload saat membuat data baru");
          return;
        }

        promise = createPks({
          sentra_ki_id: value.sentra_ki_id as Id<"sentra_ki">,
          name: value.name,
          description: value.description,
          document: documentId!,
          expiry_date_from: value.expiry_date_from,
          expiry_date_to: value.expiry_date_to,
        });
      }

      toast.promise(promise, {
        loading: "Loading...",
        success: `PKS Berhasil ${value.id ? "Diubah" : "Ditambah"}`,
        error: "Terjadi Kesalahan",
      });

      setOpen(false);
    },
    validators: {
      onSubmit: z
        .object({
          sentra_ki_id: z.string().min(2, "Silahkan Pilih Sentra KI"),
          name: z.string().min(2, "Silahkan Isi Nama PKS"),
          no: z.any().and(z.any()),
          description: z.string().min(2, "Silahkan Isi Deskripsi PKS"),
          document: z.any(),
          expiry_date_from: z.string().min(2, "Silahkan Pilih Tanggal"),
          expiry_date_to: z.string().min(2, "Silahkan Pilih Tanggal"),
          id: z.any().and(z.any()),
          document_url: z.any().and(z.string()),
          document_id: z.any().and(z.string()),
        })
        .refine(
          (data) => {
            if (!data.id) {
              return data.document instanceof File;
            }

            return true;
          },
          {
            message: "Silahkan Pilih Dokumen",
            path: ["document"],
          }
        ),
    },
  });

  return (
    <>
      <SiteHeader title="Daftar PKS Dengan Sentra KI" />
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
        <DataTable table={table} searchPlaceHolder="No PKS..." />
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
                  "Detail PKS"
                ) : (
                  <>{formAdd.getFieldValue("id") ? "Ubah" : "Tambah"} PKS</>
                )}
                {formAdd.getFieldValue("id") ? (
                  <span className="text-muted-foreground text-sm">
                    ({formAdd.getFieldValue("no")})
                  </span>
                ) : null}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <formAdd.Field name="sentra_ki_id">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Nama Sentra KI</Label>
                    <Select
                      onValueChange={(data) => {
                        field.handleChange(data);
                      }}
                      defaultValue={field.state.value}
                      disabled={isPreview}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Sentra Ki" />
                      </SelectTrigger>
                      <SelectContent>
                        {sentraKiData?.map((data) => {
                          return (
                            <SelectItem value={data._id} key={data._id}>
                              {data.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FieldInfo field={field} />
                  </div>
                )}
              </formAdd.Field>

              <formAdd.Field name="name">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Nama PKS</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      disabled={isPreview}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              </formAdd.Field>

              <formAdd.Field name="description">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Tentang</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      disabled={isPreview}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              </formAdd.Field>

              <Label>Masa Berlaku</Label>
              <div className="flex fle gap-3 w-full items-center">
                <formAdd.Field name="expiry_date_from">
                  {(field) => (
                    <div className="grid gap-3">
                      <Popover
                        open={openFromCalendar}
                        onOpenChange={setOpenFromCalendar}
                      >
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
                            onSelect={(date) => {
                              field.handleChange(
                                date?.toLocaleDateString() ?? ""
                              );
                              setOpenFromCalendar(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
                <small>s/d</small>
                <formAdd.Field name="expiry_date_to">
                  {(field) => (
                    <div className="grid gap-3">
                      <Popover
                        open={openToCalendar}
                        onOpenChange={setOpenToCalendar}
                      >
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
                            onSelect={(date) => {
                              field.handleChange(
                                date?.toLocaleDateString() ?? ""
                              );
                              setOpenToCalendar(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
              </div>

              <formAdd.Field name="document">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>
                      {isPreview ? "Dokumen PKS" : "Unggah Dokumen (.pdf)"}
                    </Label>
                    {isPreview ? (
                      <Button className="w-fit">
                        <a
                          href={formAdd.getFieldValue("document_url")}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Lihat Dokumen
                        </a>
                      </Button>
                    ) : (
                      <Input
                        id={field.name}
                        name={field.name}
                        type="file"
                        accept=".pdf"
                        onBlur={field.handleBlur}
                        disabled={isPreview}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.handleChange(file);
                          }
                        }}
                      />
                    )}
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
