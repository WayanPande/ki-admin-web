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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usersQueryOptions } from "@/lib/query/users";
import { routeSearchSchema } from "@/lib/utils";
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import type { Id } from "@ki-admin-web/backend/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useQuery as tanstackQuery } from "@tanstack/react-query";
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
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/_auth/_layout/sentra-ki/")({
  component: RouteComponent,
  validateSearch: zodValidator(routeSearchSchema),
});

const emptyArray: any[] = [];

function RouteComponent() {
  const [open, setOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const search = Route.useSearch();

  const navigate = useNavigate({ from: Route.fullPath });

  const itemsToLoad = search.page * search.limit;

  const { results, status, loadMore } = usePaginatedQuery(
    api.sentra_ki.getAllSentraKiPaginated,
    {},
    { initialNumItems: itemsToLoad }
  );

  const instansiData = useQuery(api.instansi.getAllInstansi);
  const sentraKiData = useQuery(api.sentra_ki.getAllSentraKi);

  const createSentraKi = useMutation(api.sentra_ki.createSentraKi);
  const updateSentraKi = useMutation(api.sentra_ki.updateSentraKi);
  const deleteSentraKi = useMutation(api.sentra_ki.deleteSentraKi);

  const { data: usersData } = tanstackQuery(
    usersQueryOptions({
      enabled: !!open,
    })
  );

  const columns: ColumnDef<(typeof results)[number]>[] = [
    {
      id: "#",
      header: "No",
      cell: ({ row }) => (search.page - 1) * search.limit + row.index + 1,
    },
    {
      accessorKey: "custom_id",
      id: "ID",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Nama Sentra KI",
    },
    {
      id: "instansi",
      accessorKey: "instansi",
      header: "Nama Instansi",
      cell: ({ row }) => {
        const data = row.original;
        return data.instansi?.name ?? "-";
      },
    },
    {
      accessorKey: "city",
      header: "Kabupaten/Kota",
    },
    {
      accessorKey: "pic_name",
      id: "Nama PIC",
      header: "Nama PIC",
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
                formAdd.setFieldValue("instansi_id", data.instansi_id);
                formAdd.setFieldValue("name", data.name);
                formAdd.setFieldValue("address", data.address);
                formAdd.setFieldValue("city", data.city);
                formAdd.setFieldValue("latitude", data.latitude);
                formAdd.setFieldValue("longitude", data.longitude);
                formAdd.setFieldValue("pic_name", data.pic_name);
                formAdd.setFieldValue("pic_phone", data.pic_phone);
                formAdd.setFieldValue("pic_email", data.pic_email);
                formAdd.setFieldValue("pic_id", data.pic_id);
                formAdd.setFieldValue("custom_id", data.custom_id);

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
                formAdd.setFieldValue("instansi_id", data.instansi_id);
                formAdd.setFieldValue("name", data.name);
                formAdd.setFieldValue("address", data.address);
                formAdd.setFieldValue("city", data.city);
                formAdd.setFieldValue("latitude", data.latitude);
                formAdd.setFieldValue("longitude", data.longitude);
                formAdd.setFieldValue("pic_name", data.pic_name);
                formAdd.setFieldValue("pic_phone", data.pic_phone);
                formAdd.setFieldValue("pic_email", data.pic_email);
                formAdd.setFieldValue("pic_id", data.pic_id);
                formAdd.setFieldValue("custom_id", data.custom_id);

                setOpen(true);
              }}
            >
              Ubah
            </Button>
            <Button
              size={"sm"}
              variant={"destructive"}
              onClick={() =>
                deleteSentraKi({
                  id: data._id,
                })
              }
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
    rowCount: sentraKiData?.length ?? 0,
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
      instansi_id: "",
      name: "",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      pic_name: "",
      pic_phone: "",
      pic_email: "",
      pic_id: "",
      id: "",
      custom_id: "",
    },
    onSubmit: async ({ value }) => {
      if (value.id) {
        try {
          await updateSentraKi({
            id: value.id as Id<"sentra_ki">,
            instansi_id: value.instansi_id as Id<"instansi">,
            name: value.name,
            address: value.address,
            city: value.city,
            latitude: value.latitude,
            longitude: value.longitude,
            pic_name: value.pic_name,
            pic_phone: value.pic_phone,
            pic_email: value.pic_email,
          });
          toast.success("Sentra KI Berhasil Diubah");
        } catch (error) {
          console.log(error);
          toast.error("Sentra KI Gagal Diubah");
        }
      } else {
        try {
          await createSentraKi({
            instansi_id: value.instansi_id as Id<"instansi">,
            name: value.name,
            address: value.address,
            city: value.city,
            latitude: value.latitude,
            longitude: value.longitude,
            pic_name: value.pic_name,
            pic_phone: value.pic_phone,
            pic_email: value.pic_email,
            pic_id: value.pic_id,
          });
          toast.success("Sentra KI Berhasil Ditambah");
        } catch (error) {
          toast.error("Sentra KI Gagal Ditambah");
        }
      }

      setOpen(false);
    },
    validators: {
      onSubmit: z.object({
        instansi_id: z.string().min(2, "Silahkan Pilih Instansi"),
        name: z.string().min(2, "Silahkan Isi Nama Sentra KI"),
        address: z.string().min(2, "Silahkan Isi Alamat Sentra KI"),
        city: z.string().min(2, "Silahkan Isi Kabupaten/Kota Sentra KI"),
        latitude: z.string().min(2, "Silahkan Isi Latitude"),
        longitude: z.string().min(2, "Silahkan Isi Longitude"),
        pic_name: z.string().min(2, "Silahkan Isi Nama User PIC"),
        pic_phone: z.string().min(2, "Silahkan Isi Nomor Telepon User PIC"),
        pic_email: z.string().min(2, "Silahkan Isi Email User PIC"),
        pic_id: z.string().min(2, "Silahkan Pilih PIC"),
        id: z.any().and(z.any()),
        custom_id: z.any().and(z.any()),
      }),
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
        <DataTable table={table} />
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
                  "Detail Sentra KI"
                ) : (
                  <>
                    {formAdd.getFieldValue("id") ? "Ubah" : "Tambah"} Sentra KI
                  </>
                )}
                {formAdd.getFieldValue("id") ? (
                  <span className="text-muted-foreground text-sm">
                    ({formAdd.getFieldValue("custom_id")})
                  </span>
                ) : null}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-10">
              <div className="grid gap-5">
                <formAdd.Field name="name">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Nama Sentra KI</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>

                <formAdd.Field name="instansi_id">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Instansi</Label>
                      <Select
                        onValueChange={(data) => {
                          field.handleChange(data);
                        }}
                        defaultValue={field.state.value}
                        disabled={isPreview}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Instansi" />
                        </SelectTrigger>
                        <SelectContent>
                          {instansiData?.map((data) => {
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

                <formAdd.Field name="address">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Alamat</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>

                <formAdd.Field name="city">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Kabupaten/Kota</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>

                <Label>Koordinat</Label>
                <div className="flex fle gap-3 w-full items-center">
                  <formAdd.Field name="latitude">
                    {(field) => (
                      <div className="grid gap-3">
                        <Input
                          id={field.name}
                          name={field.name}
                          type="text"
                          disabled={isPreview}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          placeholder="Latitude"
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </formAdd.Field>
                  <formAdd.Field name="longitude">
                    {(field) => (
                      <div className="grid gap-3">
                        <Input
                          id={field.name}
                          name={field.name}
                          type="text"
                          disabled={isPreview}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          placeholder="Longitude"
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </formAdd.Field>
                </div>
              </div>
              <div className="grid gap-5 h-fit">
                <formAdd.Field name="pic_id">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Nama User PIC</Label>
                      <Select
                        onValueChange={(data) => {
                          const users = usersData?.data?.users;
                          field.handleChange(data);
                          formAdd.setFieldValue(
                            "pic_email",
                            users?.find((user) => user.id === data)?.email!
                          );
                          formAdd.setFieldValue(
                            "pic_name",
                            users?.find((user) => user.id === data)?.name!
                          );
                          formAdd.setFieldValue(
                            "pic_phone",
                            (users?.find((user) => user.id === data) as any)
                              ?.phoneNumber
                          );
                        }}
                        defaultValue={field.state.value}
                        disabled={isPreview}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih User" />
                        </SelectTrigger>
                        <SelectContent>
                          {usersData?.data?.users?.map((data) => {
                            return (
                              <SelectItem value={data.id} key={data.id}>
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
                <formAdd.Field name="pic_phone">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Nomor Telepon User PIC</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        disabled={isPreview}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
                <formAdd.Field name="pic_email">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Email User PIC</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
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
