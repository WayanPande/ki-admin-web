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
import { authClient } from "@/lib/auth-client";
import { usersPaginatedQueryOptions } from "@/lib/query/users";
import { routeSearchSchema } from "@/lib/utils";
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { zodValidator } from "@tanstack/zod-adapter";
import { useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/_auth/_layout/master-data/user")({
  component: RouteComponent,
  validateSearch: zodValidator(routeSearchSchema),
  loaderDeps: ({ search: { page, limit, query } }) => ({ page, limit, query }),
  loader: ({ context: { queryClient }, deps: { page, limit, query } }) =>
    queryClient.ensureQueryData(
      usersPaginatedQueryOptions({ pageSize: limit, currentPage: page, query })
    ),
});

const emptyArray: any[] = [];

function RouteComponent() {
  const [open, setOpen] = useState(false);
  const search = Route.useSearch();

  const navigate = useNavigate({ from: Route.fullPath });

  const usersQuery = useSuspenseQuery(
    usersPaginatedQueryOptions({
      pageSize: search.limit,
      currentPage: search.page,
      query: search.query,
    })
  );

  const instansi = useQuery(api.instansi.getAllInstansi, {});

  const columns: ColumnDef<any>[] = [
    {
      id: "#",
      header: "No",
      cell: ({ row }) => (search.page - 1) * search.limit + row.index + 1,
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "name",
      header: "Nama Langkap",
    },
    {
      accessorKey: "phoneNumber",
      header: "Nomor Telepon",
    },
    {
      accessorKey: "email",
      header: "Email",
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

                formAdd.setFieldValue("id", data.id);
                formAdd.setFieldValue("name", data.name);
                formAdd.setFieldValue("email", data.email);
                formAdd.setFieldValue("phoneNumber", data.phoneNumber);
                formAdd.setFieldValue("username", data.username);
                formAdd.setFieldValue("password", "12345678");
                formAdd.setFieldValue("instansi", data.instansi);

                setOpen(true);
              }}
            >
              Ubah
            </Button>
            <Button
              size={"sm"}
              variant={"destructive"}
              onClick={async () => {
                await authClient.admin.removeUser({
                  userId: data.id,
                });
                await usersQuery.refetch();
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

  const table = useReactTable({
    data: usersQuery.data.data?.users ?? emptyArray,
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
      email: "",
      password: "",
      name: "",
      username: "",
      id: "",
      phoneNumber: "",
      instansi: "",
    },
    onSubmit: async ({ value }) => {
      if (value.id) {
        await authClient.admin.updateUser(
          {
            userId: value.id,
            data: {
              username: value.username,
              email: value.email,
              phoneNumber: value.phoneNumber,
              name: value.name,
              instansi: value.instansi,
            },
          },
          {
            onSuccess: () => {
              toast.success("User Berhasil Diubah");
            },
            onError: (error) => {
              toast.error(error.error.message || error.error.statusText);
            },
          }
        );
      } else {
        await authClient.admin.createUser(
          {
            email: value.email,
            password: value.password,
            name: value.name,
          },
          {
            onSuccess: async (data) => {
              await authClient.admin.updateUser(
                {
                  userId: data.data.user.id,
                  data: {
                    username: value.username,
                    instansi: value.instansi,
                  },
                },
                {
                  onSuccess: () => {
                    toast.success("User Berhasil Ditambah");
                  },
                  onError: (error) => {
                    toast.error(error.error.message || error.error.statusText);
                  },
                }
              );
            },
            onError: (error) => {
              toast.error(error.error.message || error.error.statusText);
            },
          }
        );
      }

      await usersQuery.refetch();
      setOpen(false);
    },
    validators: {
      onSubmit: z.object({
        username: z.string().min(2, "Silahkan Isi Username"),
        name: z.string().min(2, "Silahkan Isi Nama"),
        password: z.string().min(8, "Silahkan Isi Kata Sandi"),
        email: z.email("Silahkan Isi Email"),
        phoneNumber: z.string().min(2, "Silahkan Isi Nomor Telepon"),
        id: z.any().and(z.any()),
        instansi: z.string().min(2, "Silahkan Pilih Instansi"),
      }),
    },
  });

  return (
    <>
      <SiteHeader title="Master Data User" />
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
        <DataTable table={table} searchPlaceHolder="Nama User..." />
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
                {formAdd.getFieldValue("id") ? "Ubah" : "Tambah"} User
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <formAdd.Field name="name">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Nama</Label>
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

              <formAdd.Field name="username">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Username</Label>
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

              <formAdd.Field name="instansi">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Instansi</Label>
                    <Select
                      onValueChange={(data) => {
                        field.handleChange(data);
                      }}
                      defaultValue={field.state.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Instansi" />
                      </SelectTrigger>
                      <SelectContent>
                        {instansi?.map((data) => {
                          return (
                            <SelectItem value={data.name} key={data._id}>
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

              <formAdd.Field name="phoneNumber">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Nomor Telepon</Label>
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

              <formAdd.Field name="email">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor={field.name}>Email</Label>
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

              {!formAdd.getFieldValue("id") ? (
                <formAdd.Field name="password">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Password</Label>
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
              ) : null}
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
