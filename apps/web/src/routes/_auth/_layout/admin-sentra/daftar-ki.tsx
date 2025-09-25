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
import { routeSearchSchema } from "@/lib/utils";
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import type { Id } from "@ki-admin-web/backend/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/_auth/_layout/admin-sentra/daftar-ki")({
  component: RouteComponent,
  validateSearch: zodValidator(routeSearchSchema),
});

const emptyArray: any[] = [];

const jenisKi = [
  "Merek",
  "Paten",
  "Hak Cipta",
  "Indikasi Geografis",
  "DTSL",
  "Rahasia Dagang",
  "KI Komunal",
];

const subJenisKi = ["Kelompok", "Rumah", "Ruang", "Tempat"];

function RouteComponent() {
  const [open, setOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const search = Route.useSearch();

  const { results, status, loadMore } = usePaginatedQuery(
    api.daftar_ki.getAllDaftarKiPaginated,
    {},
    { initialNumItems: search.limit }
  );

  const currentUser = useQuery(api.auth.getCurrentUser);

  const createDaftarKi = useMutation(api.daftar_ki.createDaftarKi);
  const updateDaftarKi = useMutation(api.daftar_ki.updateDaftarKi);
  const deleteDaftarKi = useMutation(api.daftar_ki.deleteDaftarKi);

  const columns: ColumnDef<(typeof results)[number]>[] = [
    {
      id: "#",
      header: "No",
      cell: ({ row }) => (search.page - 1) * search.limit + row.index + 1,
    },
    {
      accessorKey: "nomor_permohonan",
      id: "Nomor Permohonan",
      header: "Nomor Permohonan",
    },
    {
      accessorKey: "name",
      header: "Nama KI",
    },
    {
      accessorKey: "type",
      id: "Jenis KI",
      header: "Jenis KI",
    },
    {
      accessorKey: "sub_type",
      id: "Sub Jenis KI",
      header: "Sub Jenis KI",
    },
    {
      accessorKey: "name_pemilik",
      id: "Nama Pemilik",
      header: "Nama Pemilik",
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
                formAdd.setFieldValue(
                  "nomor_permohonan",
                  data.nomor_permohonan
                );
                formAdd.setFieldValue("name", data.name);
                formAdd.setFieldValue("type", data.type);
                formAdd.setFieldValue("sub_type", data.sub_type);
                formAdd.setFieldValue("name_pemilik", data.name_pemilik);
                formAdd.setFieldValue("address_pemilik", data.address_pemilik);
                formAdd.setFieldValue(
                  "pemberi_fasilitas",
                  data.pemberi_fasilitas
                );
                formAdd.setFieldValue("document", data.document);
                formAdd.setFieldValue("pic_name", data.pic_name);
                formAdd.setFieldValue("pic_phone", data.pic_phone);
                formAdd.setFieldValue("pic_email", data.pic_email);
                formAdd.setFieldValue("pic_id", data.pic_id as any);

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
                formAdd.setFieldValue(
                  "nomor_permohonan",
                  data.nomor_permohonan
                );
                formAdd.setFieldValue("name", data.name);
                formAdd.setFieldValue("type", data.type);
                formAdd.setFieldValue("sub_type", data.sub_type);
                formAdd.setFieldValue("name_pemilik", data.name_pemilik);
                formAdd.setFieldValue("address_pemilik", data.address_pemilik);
                formAdd.setFieldValue(
                  "pemberi_fasilitas",
                  data.pemberi_fasilitas
                );
                formAdd.setFieldValue("document", data.document);
                formAdd.setFieldValue("pic_name", data.pic_name);
                formAdd.setFieldValue("pic_phone", data.pic_phone);
                formAdd.setFieldValue("pic_email", data.pic_email);
                formAdd.setFieldValue("pic_id", data.pic_id as any);

                setOpen(true);
              }}
            >
              Ubah
            </Button>
            <Button
              size={"sm"}
              variant={"destructive"}
              onClick={() =>
                deleteDaftarKi({
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

  const formAdd = useForm({
    defaultValues: {
      nomor_permohonan: "",
      name: "",
      type: "",
      sub_type: "",
      name_pemilik: "",
      address_pemilik: "",
      pemberi_fasilitas: "",
      document: "",
      pic_name: currentUser?.name,
      pic_phone: currentUser?.phoneNumber,
      pic_email: currentUser?.email,
      pic_id: currentUser?._id,
      id: "",
    },
    onSubmit: async ({ value }) => {
      if (value.id) {
        try {
          await updateDaftarKi({
            id: value.id as Id<"daftar_ki">,
            nomor_permohonan: value.nomor_permohonan,
            name: value.name,
            type: value.type,
            sub_type: value.sub_type,
            name_pemilik: value.name_pemilik,
            address_pemilik: value.address_pemilik,
            pemberi_fasilitas: value.pemberi_fasilitas,
            document: value.document,
            pic_id: value.pic_id!,
            pic_name: value.pic_name!,
            pic_phone: value.pic_phone!,
            pic_email: value.pic_email!,
          });
          toast.success("KI Berhasil Diubah");
        } catch (error) {
          console.log(error);
          toast.error("KI Gagal Diubah");
        }
      } else {
        try {
          await createDaftarKi({
            nomor_permohonan: value.nomor_permohonan,
            name: value.name,
            type: value.type,
            sub_type: value.sub_type,
            name_pemilik: value.name_pemilik,
            address_pemilik: value.address_pemilik,
            pemberi_fasilitas: value.pemberi_fasilitas,
            document: value.document,
            pic_name: value.pic_name!,
            pic_phone: value.pic_phone!,
            pic_email: value.pic_email!,
            pic_id: value.pic_id!,
          });
          toast.success("KI Berhasil Ditambah");
        } catch (error) {
          toast.error("KI Gagal Ditambah");
        }
      }

      setOpen(false);
    },
    validators: {
      onSubmit: z.object({
        nomor_permohonan: z
          .string()
          .min(2, "Name must be at least 2 characters"),
        name: z.string().min(2, "Name must be at least 2 characters"),
        type: z.string().min(2, "Name must be at least 2 characters"),
        sub_type: z.string().min(2, "Name must be at least 2 characters"),
        name_pemilik: z.string().min(2, "Name must be at least 2 characters"),
        address_pemilik: z
          .string()
          .min(2, "Name must be at least 2 characters"),
        pemberi_fasilitas: z
          .string()
          .min(2, "Name must be at least 2 characters"),
        document: z.string().min(2, "Name must be at least 2 characters"),
        pic_name: z.any().and(z.any()),
        pic_phone: z.any().and(z.any()),
        pic_email: z.any().and(z.any()),
        pic_id: z.any().and(z.any()),
        id: z.any().and(z.any()),
      }),
    },
  });

  return (
    <>
      <SiteHeader title="Pendaftaran KI Oleh Sentra" />
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
                  "Detail Data"
                ) : (
                  <>{formAdd.getFieldValue("id") ? "Ubah" : "Tambah"} Data</>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-10">
              <div className="grid gap-5">
                <formAdd.Field name="nomor_permohonan">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Nomor Permohonan</Label>
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

                <formAdd.Field name="name">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Nama KI</Label>
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

                <div className="grid grid-cols-2 gap-5">
                  <formAdd.Field name="type">
                    {(field) => (
                      <div className="grid gap-3">
                        <Label htmlFor={field.name}>Jenis KI</Label>
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
                            {jenisKi.map((data) => {
                              return (
                                <SelectItem value={data} key={data}>
                                  {data}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </formAdd.Field>
                  <formAdd.Field name="sub_type">
                    {(field) => (
                      <div className="grid gap-3">
                        <Label htmlFor={field.name}>Sub Jenis KI</Label>
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
                            {subJenisKi.map((data) => {
                              return (
                                <SelectItem value={data} key={data}>
                                  {data}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </formAdd.Field>
                </div>

                <formAdd.Field name="name_pemilik">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Nama Pemilik</Label>
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

                <formAdd.Field name="address_pemilik">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Alamat Pemilik</Label>
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

                <formAdd.Field name="pemberi_fasilitas">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Pemberi Fasilitas</Label>
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

                <formAdd.Field name="document">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Unggah Dokumen (.pdf)</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type={isPreview ? "text" : "file"}
                        accept=".pdf"
                        disabled={isPreview}
                        onBlur={field.handleBlur}
                        value={isPreview ? field.state.value : undefined}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.handleChange(file.name);
                          }
                        }}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </formAdd.Field>
              </div>
              <div className="grid gap-5 h-fit">
                <formAdd.Field name="pic_name">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Nama User PIC</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        disabled
                        value={field.state.value}
                        onBlur={field.handleBlur}
                      />
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
                        disabled
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
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
                        disabled
                        value={field.state.value}
                        onBlur={field.handleBlur}
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
