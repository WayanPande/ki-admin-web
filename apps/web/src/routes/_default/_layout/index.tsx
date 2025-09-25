import { SectionCards } from "@/components/section-cards";
import { SectionCardsUser } from "@/components/section-cards-user";
import { StatikPencatatanKi } from "@/components/statistik-pencatatan-ki";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_default/_layout/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-2 grid gap-10 mb-20">
      <SectionCards />
      <div className="px-4 lg:px-6 space-y-10">
        <StatikPencatatanKi />
        <h1 className="font-semibold">
          Statistik Pencatatan dan/atau Pendaftaran KI oleh Sentra KI
        </h1>
      </div>
      <SectionCardsUser />
    </div>
  );
}
