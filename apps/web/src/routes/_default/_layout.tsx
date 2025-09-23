import Header from "@/components/header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_default/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid grid-rows-[auto_1fr] h-svh">
      <Header />
      <Outlet />
    </div>
  );
}
