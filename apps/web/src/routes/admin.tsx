import SignUpFormAdmin from "@/components/sign-up-form-admin";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUpFormAdmin />;
}
