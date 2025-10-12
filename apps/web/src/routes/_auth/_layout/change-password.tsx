import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import FieldInfo from "@/components/field-info";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/_layout/change-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm({
    defaultValues: {
      newPassword: "",
      currentPassword: "",
    },
    onSubmit: async ({ value, formApi }) => {
      await authClient.changePassword(
        {
          newPassword: value.newPassword,
          currentPassword: value.currentPassword,
          revokeOtherSessions: true,
        },
        {
          onSuccess: async () => {
            toast.success("Password Berhasil Diubah");
            formApi.reset();
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        newPassword: z.string().min(8, "Password Minimal 8 Karakter"),
        currentPassword: z.string().min(8, "Password Minimal 8 Karakter"),
      }),
    },
  });

  return (
    <div>
      <SiteHeader title="Ubah Password" />
      <div className="flex min-h-[50vh] h-full w-full items-center justify-center px-4">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Ubah Password</CardTitle>
            <CardDescription>
              Masukkan Password Lama dan Password Baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-8"
            >
              <div className="grid gap-4">
                <form.Field name="currentPassword">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Password Lama</Label>
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
                </form.Field>

                <form.Field name="newPassword">
                  {(field) => (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Password Baru</Label>
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
                </form.Field>

                <form.Subscribe>
                  {(state) => (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!state.canSubmit || state.isSubmitting}
                    >
                      {state.isSubmitting ? "Submitting..." : "Ubah Password"}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
