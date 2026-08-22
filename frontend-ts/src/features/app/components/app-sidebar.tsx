"use client"

import * as React from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { setHostel } from "@/store/slices/HostelSlice"
import { useGetMyHostel } from "@/hooks/queries/useHostelQueries"
import { useNavigation } from "@/hooks/useNavigation"

import { NavMain } from "@/features/app/components/nav-main"
import { NavLinks } from "@/features/app/components/nav-links"
import { NavUser } from "@/features/app/components/nav-user"
import { AppBrand } from "@/features/app/components/app-brand"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

import logoUrl from "@/assets/pwa-192x192.png"

const AppLogo = ({ className }: { className?: string }) => (
  <img src={logoUrl} alt="MessPro Logo" className={className} />
)

const brandData = {
  name: "MessPro",
  logo: AppLogo,
  plan: "Management",
}

function NavSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {Array.from({ length: 4 }).map((_, i) => (
          <SidebarMenuItem key={i} className="py-1">
            <Skeleton className="h-8 w-full rounded-md" />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { navMain, projects } = useNavigation()

  // Fetch hostel data for non-superadmins
  const { data: myHostel, isLoading } = useGetMyHostel(user?.role)

  React.useEffect(() => {
    if (myHostel) {
      dispatch(setHostel(myHostel))
    }
  }, [myHostel, dispatch])

  const displayUser = {
    name: user?.name || "Guest",
    email: user?.email || "guest@messpro.com",
    avatar: `https://api.dicebear.com/9.x/shapes/svg?seed=${user?.name || "Guest"}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`,
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <AppBrand brand={brandData} />
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? <NavSkeleton /> : <NavMain items={navMain} />}
        <NavLinks projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}