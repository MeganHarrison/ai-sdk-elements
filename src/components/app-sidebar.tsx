"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/use-current-user";

// This is sample data.
const data = {
  teams: [
    {
      name: "Alleato",
      logo: "/logos/Alleato_Icon_Light.png",
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Chat",
          url: "/chat",
        },
        {
          title: "Assistant",
          url: "/assistant",
        },
        {
          title: "Chat 2",
          url: "/chat2",
        },
        {
          title: "Chat 3",
          url: "/chat3",
        },
        {
          title: "Chat 4",
          url: "/chat4",
        },
        {
          title: "Projects",
          url: "/projects",
        },
        {
          title: "Projects 2",
          url: "/projects2",
        },
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Data",
          url: "/data",
        },
        {
          title: "Database",
          url: "/data/database",
        },
        {
          title: "Meetings",
          url: "/data/meetings",
        },
        {
          title: "Insights",
          url: "/insights",
        },
      ],
    },
    {
      title: "Tables",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Clients",
          url: "/data/clients",
        },
        {
          title: "API Docs",
          url: "/api-docs/",
        },
        {
          title: "Assistant",
          url: "/assistant",
        },
        {
          title: "Calendar",
          url: "/calendar",
        },
        {
          title: "Estimates",
          url: "/data/estimates",
        },
      ],
    },
    {
      title: "Vision",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Values",
          url: "#",
        },
        {
          title: "Mission",
          url: "#",
        },
        {
          title: "StoryBrand",
          url: "#",
        },
        {
          title: "Company Scorecard",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUser = useCurrentUser();

  // Use real user data or fallback to default
  const userData = currentUser || {
    name: "Loading...",
    email: "",
    avatar: null,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
