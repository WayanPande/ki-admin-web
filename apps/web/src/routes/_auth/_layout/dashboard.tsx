import DashboardAdmin from "@/components/dashboardAdmin";
import DashboardUser from "@/components/dashboardUser";
import Loader from "@/components/loader";
import { dashboardSchema } from "@/lib/utils";
import { api } from "@ki-admin-web/backend/convex/_generated/api";

import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Authenticated, AuthLoading, useQuery } from "convex/react";

export const Route = createFileRoute("/_auth/_layout/dashboard")({
  component: RouteComponent,
  validateSearch: zodValidator(dashboardSchema),
});

const routeUser = () => {
  const user = useQuery(api.auth.getCurrentUser);
  const search = Route.useSearch();

  if ((user as any)?.role === "admin") {
    return <DashboardAdmin search={search} />;
  } else {
    return <DashboardUser search={search} />;
  }
};

function RouteComponent() {
  return (
    <>
      <Authenticated>
        <>{routeUser()}</>
      </Authenticated>
      <AuthLoading>
        <Loader />
      </AuthLoading>
    </>
  );
}
