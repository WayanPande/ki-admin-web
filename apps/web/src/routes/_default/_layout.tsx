import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "@/components/footer";
import Header from "@/components/header";

export const Route = createFileRoute("/_default/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid grid-rows-[auto_1fr] min-h-svh space-y-10">
      <Header />
      <h1 className="text-center font-bold text-lg">
        Sistem Informasi Monitoring Sentra KI
      </h1>
      <Outlet />
      <Footer />
    </div>
  );
}
