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
import { KI_TYPES, routeSearchSchema } from "@/lib/utils";
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import type { Id } from "@ki-admin-web/backend/convex/_generated/dataModel";

import { useForm, useStore } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/_auth/_layout/admin-sentra/daftar-ki")({
  component: RouteComponent,
  validateSearch: zodValidator(routeSearchSchema),
});

const emptyArray: any[] = [];

const subJenisKiMerek = ["Merek Individu", "Merek Kolektif"];
const subJenisKiHakCipta = [
  "Buku, program komputer, pamflet, perwajahan (layout) karya tulis yang diterbitkan, dan semua hasil karya tulis lain",
  "Ceramah, kuliah, pidato, dan ciptaan lain yang sejenis dengan itu",
  "Alat peraga yang dibuat untuk kepentingan pendidikan dan ilmu pengetahuan",
  "Lagu atau musik dengan atau tanpa teks",
  "Drama atau drama musikal, tari, koreografi, pewayangan, dan pantomim",
  "Seni rupa dalam segala bentuk seperti seni lukis, gambar, seni ukir, seni kaligrafi, seni pahat, seni patung, kolase, dan seni terapan",
  "Arsitektur",
  "Peta",
  "Seni Batik",
  "Fotografi",
  "Terjemahan, tafsir, saduran, bunga rampai, dan karya lain dari hasil pengalihwujudan",
];

function RouteComponent() {
  const [open, setOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const search = Route.useSearch();
  const [openCalendar, setOpenCalendar] = useState(false);

  const navigate = useNavigate({ from: Route.fullPath });

  const { results, status, loadMore } = usePaginatedQuery(
    api.daftar_ki.getAllDaftarKiPaginated,
    {
      searchTerm: search.query,
    },
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
      cell: ({ row }) => {
        const data = row.original;
        return data.sub_type === "" ? "-" : data.sub_type;
      },
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
                formAdd.setFieldValue("sub_type", data.sub_type ?? "");
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

                formAdd.setFieldValue(
                  "registration_date",
                  data.registration_date
                );

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
                formAdd.setFieldValue("sub_type", data.sub_type ?? "");
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
      globalFilter: search.query,
    },
    manualPagination: true,
    onGlobalFilterChange: (value) => {
      if (value !== search.query) {
        navigate({
          search: { ...search, query: value, page: 1 },
        });
      }
    },
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
      registration_date: new Date().toLocaleDateString(),
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
            pic_id: value.pic_id,
            pic_name: value.pic_name!,
            pic_phone: value.pic_phone!,
            pic_email: value.pic_email!,
            registration_date: value.registration_date,
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
            registration_date: value.registration_date,
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
        nomor_permohonan: z.string().min(2, "Silahkan Isi Nomor Permohonan"),
        name: z.string().min(2, "Silahkan Isi Nama"),
        type: z.string().min(2, "Silahkan Pilih Jenis KI"),
        sub_type: z.optional(z.string()).and(z.string()),
        name_pemilik: z.string().min(2, "Silahkan Isi Nama Pemilik"),
        address_pemilik: z.string().min(2, "Silahkan Isi Alamat Pemilik"),
        pemberi_fasilitas: z
          .string()
          .min(2, "Silahkan Masukkan Pemberi Fasilitas"),
        document: z.string().min(2, "Silahkan Masukkan Dokumen"),
        pic_name: z.any().and(z.any()),
        pic_phone: z.any().and(z.any()),
        pic_email: z.any().and(z.any()),
        pic_id: z.any().and(z.any()),
        registration_date: z.string().min(2, "Silahkan Isi Tanggal Pencatatan"),
        id: z.any().and(z.any()),
      }),
    },
  });

  const selectedType = useStore(formAdd.store, (state) => state.values.type);

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
        <DataTable table={table} searchPlaceHolder="Nomor Permohonan..." />
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
                            formAdd.setFieldValue("sub_type", "");
                          }}
                          defaultValue={field.state.value}
                          disabled={isPreview}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Jenis KI" />
                          </SelectTrigger>
                          <SelectContent>
                            {KI_TYPES.map((data) => {
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
                          disabled={
                            isPreview ||
                            !["Merek", "Hak Cipta"].includes(selectedType)
                          }
                        >
                          <SelectTrigger className="w-full max-w-[9.4rem] wrap-break-word">
                            <SelectValue placeholder="Pilih Sub Jenis KI" />
                          </SelectTrigger>
                          <SelectContent className="max-w-md wrap-break-word">
                            {(selectedType === "Merek"
                              ? [...subJenisKiMerek]
                              : selectedType === "Hak Cipta"
                              ? [...subJenisKiHakCipta]
                              : []
                            ).map((data) => {
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

                <formAdd.Field name="registration_date">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>
                        Tanggal Pencatatan/Pendaftaran
                      </Label>
                      <Popover
                        open={openCalendar}
                        onOpenChange={setOpenCalendar}
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
                            startMonth={
                              new Date(new Date().getFullYear() - 25, 11, 31)
                            }
                            onSelect={(date) => {
                              field.handleChange(
                                date?.toLocaleDateString() ?? ""
                              );
                              setOpenCalendar(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
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
