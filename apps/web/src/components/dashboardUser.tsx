import { SectionCardsUser } from "./section-cards-user";
import { SiteHeader } from "./site-header";
import { StatikPencatatanKi } from "./statistik-pencatatan-ki";

const DashboardUser = () => {
  return (
    <>
      <SiteHeader title="DashboardStatistik Pencatatan dan/atau Pendaftaran KI oleh Sentra KI" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCardsUser />
            <div className="px-4 lg:px-6">
              <StatikPencatatanKi />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardUser;
