import {
  IconChartBar,
  IconDashboard,
  IconInnerShadowTop,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react";
import * as React from "react";

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
import { api } from "@ki-admin-web/backend/convex/_generated/api";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";

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
    title: "Master Data",
    url: "/master-data/instansi",
    icon: IconUsers,
  },
];

const menuKi = [
  {
    title: "Dashboard",
    url: "/admin-sentra/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Pencatatan KI",
    url: "/admin-sentra/daftar-ki",
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
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">KI</span>
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
