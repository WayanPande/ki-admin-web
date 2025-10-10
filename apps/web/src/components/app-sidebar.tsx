import { api } from "@ki-admin-web/backend/convex/_generated/api";
import {
  IconBuilding,
  IconChartBar,
  IconDashboard,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import icon from "@/icon.png";

const menuKanwil = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Sentra KI",
    url: "/sentra-ki",
    icon: IconListDetails,
  },
  {
    title: "PKS",
    url: "/pks",
    icon: IconChartBar,
  },
  {
    title: "User",
    url: "/master-data/user",
    icon: IconUsers,
  },
  {
    title: "Master Data Instansi",
    url: "/master-data/instansi",
    icon: IconBuilding,
  },
];

const menuKi = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Pencatatan KI",
    url: "/admin-sentra/daftar-ki",
    icon: IconListDetails,
  },
  {
    title: "Penginputan Jumlah Permohonan KI",
    url: "/admin-sentra/permohonan-ki",
    icon: IconChartBar,
  },
  {
    title: "Penyebarluasan Informasi KI",
    url: "/admin-sentra/informasi-ki",
    icon: IconListDetails,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useQuery(api.auth.getCurrentUser);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <img
                  src={icon}
                  alt="Lambang Kementerian Hukum dan HAM"
                  className="size-6 shrink-0 rounded"
                />
                <span className="text-base font-semibold">KI Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={(user as any)?.role === "admin" ? menuKanwil : menuKi}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
