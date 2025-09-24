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
import { useMutation, usePaginatedQuery } from "convex/react";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/_auth/_layout/pks/")({
  component: RouteComponent,
});

export const schema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
});

const emptyArray: any[] = [];

function RouteComponent() {
  const [open, setOpen] = useState(false);
  const [openFromCalendar, setOpenFromCalendar] = useState(false);
  const [openToCalendar, setOpenToCalendar] = useState(false);

  const { results, status, loadMore } = usePaginatedQuery(
    api.pks.getAllPksPaginated,
    {},
    { initialNumItems: 5 }
  );

  const createPks = useMutation(api.pks.createPks);
  const updatePks = useMutation(api.pks.updatePks);
  const deletePks = useMutation(api.pks.deletePks);

  console.log(results);

  const columns: ColumnDef<(typeof results)[number]>[] = [
    {
      accessorKey: "no_pks",
      header: "Nomor PKS",
    },
    {
      accessorKey: "name_pks",
      header: "Nama PKS",
    },
    {
      accessorKey: "name_sentra_ki",
      header: "Sentra KI",
    },
    {
      accessorKey: "name_instansi",
      header: "Instansi",
    },
    {
      accessorKey: "expiry_date_to",
      header: "Tanggal Kedaluarsa",
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
                formAdd.setFieldValue("name_sentra_ki", data.name_sentra_ki);
                formAdd.setFieldValue("name_pks", data.name_pks);
                formAdd.setFieldValue("no_pks", data.no_pks);
                formAdd.setFieldValue("description", data.description ?? "");
                formAdd.setFieldValue("document", data.document ?? "");
                formAdd.setFieldValue(
                  "expiry_date_from",
                  data.expiry_date_from
                );
                formAdd.setFieldValue("expiry_date_to", data.expiry_date_to);

                setOpen(true);
              }}
            >
              Ubah
            </Button>
            <Button
              size={"sm"}
              variant={"destructive"}
              onClick={() =>
                deletePks({
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
      name_sentra_ki: "",
      name_pks: "",
      no_pks: "",
      description: "",
      document: "",
      expiry_date_from: new Date().toLocaleDateString(),
      expiry_date_to: "",
      id: "",
      name_instansi: "",
    },
    onSubmit: async ({ value }) => {
      if (value.id) {
        try {
          await updatePks({
            id: value.id as Id<"pks">,
            name_sentra_ki: value.name_sentra_ki,
            name_pks: value.name_pks,
            no_pks: value.no_pks,
            description: value.description,
            document: value.document,
            expiry_date_from: value.expiry_date_from,
            expiry_date_to: value.expiry_date_to,
          });
          toast.success("PKS Berhasil Diubah");
        } catch (error) {
          console.log(error);
          toast.error("PKS Gagal Diubah");
        }
      } else {
        try {
          await createPks({
            name_sentra_ki: value.name_sentra_ki,
            name_pks: value.name_pks,
            no_pks: value.no_pks,
            description: value.description,
            document: value.document,
            expiry_date_from: value.expiry_date_from,
            expiry_date_to: value.expiry_date_to,
            name_instansi: value.name_instansi,
          });
          toast.success("PKS Berhasil Diubah");
        } catch (error) {
          toast.error("PKS Gagal Ditambah");
        }
      }

      setOpen(false);
    },
    validators: {
      onSubmit: z.object({
        name_sentra_ki: z.string().min(2, "Name must be at least 2 characters"),
        name_pks: z.string().min(2, "Name must be at least 2 characters"),
        no_pks: z.string().min(2, "Name must be at least 2 characters"),
        description: z.string().min(2, "Name must be at least 2 characters"),
        document: z.string().min(2, "Name must be at least 2 characters"),
        expiry_date_from: z
          .string()
          .min(2, "Name must be at least 2 characters"),
        expiry_date_to: z.string().min(2, "Name must be at least 2 characters"),
        id: z.any().and(z.any()),
        name_instansi: z.string().min(2, "Name must be at least 2 characters"),
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
                {formAdd.getFieldValue("id") ? "Ubah" : "Tambah"} PKS
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <formAdd.Field name="name_sentra_ki">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Nama Sentra KI</Label>
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

              <formAdd.Field name="no_pks">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Nomor PKS</Label>
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

              <formAdd.Field name="name_pks">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Nama PKS</Label>
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
                    <Label htmlFor={field.name}>Unggah Dokumen (.pdf)</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="file"
                      accept=".pdf"
                      onBlur={field.handleBlur}
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
