"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Globe,
  Shield,
  FileText,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/features/app/components/nav-main"
import { NavProjects } from "@/features/app/components/nav-projects"
import { NavUser } from "@/features/app/components/nav-user"
import { AppBrand } from "@/features/app/components/app-brand"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"

import logoUrl from "@/assets/pwa-512x512.png"

const AppLogo = ({ className }: { className?: string }) => (
  <img src={logoUrl} alt="MessPro Logo" className={className} />
)

// This is sample data.
const data = {
  brand: {
    name: "MessPro",
    logo: AppLogo,
    plan: "Management",
  },
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "History", url: "#" },
        { title: "Starred", url: "#" },
        { title: "Settings", url: "#" },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        { title: "Genesis", url: "#" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Introduction", url: "#" },
        { title: "Get Started", url: "#" },
        { title: "Tutorials", url: "#" },
        { title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
  ],
  projects: [
    { name: "Landing Page", url: "https://messprouet.vercel.app", icon: Globe },
    { name: "Terms & Policy", url: "https://messprouet.vercel.app", icon: Shield },
    { name: "Legal Doc", url: "https://messprouet.vercel.app", icon: FileText },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSelector((state: RootState) => state.auth)

  const displayUser = {
    name: user?.name || "Guest",
    email: user?.email || "guest@messpro.com",
    avatar: `https://api.dicebear.com/9.x/shapes/svg?seed=${user?.name || "Guest"}`,
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <AppBrand brand={data.brand} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}