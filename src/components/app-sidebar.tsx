"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useCurrentUser } from "@/hooks/use-current-user"

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
          title: "Insights",
          url: "/chat",
        },
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Projects",
          url: "/data/projects",
        },
        {
          title: "Meetings",
          url: "/data/meetings",
        },
        {
          title: "Database",
          url: "/data/database",
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
          title: "Sales",
          url: "/data/",
        },
        {
          title: "CRM",
          url: "/data/contacts",
        },
        {
          title: "Prospects",
          url: "/data/prospects",
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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUser = useCurrentUser()
  
  // Use real user data or fallback to default
  const userData = currentUser || {
    name: "Loading...",
    email: "",
    avatar: null
  }

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
  )
}
