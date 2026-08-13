import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar side="left" variant="sidebar" collapsible="icon" />
      
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <SidebarTrigger className="-ml-1" />
        </div>
      
    </SidebarProvider>
  )
}