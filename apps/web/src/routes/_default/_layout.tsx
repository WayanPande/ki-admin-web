import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "@/components/footer";
import Header from "@/components/header";

export const Route = createFileRoute("/_default/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col min-h-svh">
      <Header />

      <main className="flex flex-col flex-1 items-center space-y-10 mt-10">
        <h1 className="text-center font-bold text-lg">
          Sistem Informasi Monitoring Sentra KI Bali
        </h1>
        <div className="flex justify-center w-full">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
