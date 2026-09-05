"use client"

import { useState } from "react"
import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react"

import { useTheme } from "@/context/ThemeProvider"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "@/store"
import { logout } from "@/store/slices/AuthSlice"
import { clearHostel } from "@/store/slices/HostelSlice"
import { useLogoutMutation } from "@/hooks/mutations/useAuthMutations"
import { toast } from "sonner"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import SupportUpgradeModal from "@/components/SupportUpgradeModal"
import AccountModal from "@/features/app/components/AccountModal"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const logoutMutation = useLogoutMutation()

  // Full user and hostel context from Redux
  const { user: authUser } = useSelector((state: RootState) => state.auth)
  const { currentHostel } = useSelector((state: RootState) => state.hostel)

  // Modal states
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Failed to logout from backend", error)
      toast.error("Logout failed. Please try again.")
    } finally {
      // Always clear the frontend state and redirect even if the backend call fails
      await dispatch(logout())
      dispatch(clearHostel())
      navigate("/login", { replace: true })
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl shadow-lg border-border"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setIsUpgradeOpen(true)}
                  className="cursor-pointer text-purple-600 dark:text-purple-400 font-medium focus:text-purple-700 dark:focus:text-purple-300 focus:bg-purple-500/10"
                >
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Upgrade Plan</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setIsAccountOpen(true)}
                  className="cursor-pointer"
                >
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                  <span>Account Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/#plans')}
                  className="cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <span>Plans & Pricing</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="cursor-pointer"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>Toggle theme</span>
                  <kbd className="ml-auto pointer-events-none inline-flex h-4.5 select-none items-center rounded border border-border bg-muted/60 px-1 font-mono text-[9px] font-medium text-muted-foreground">
                    Ctrl+M
                  </kbd>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-700 dark:focus:text-rose-300 focus:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Support & Upgrade Plan Modal */}
      <SupportUpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        initialReason="upgrade"
      />

      {/* User Account & Profile Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={authUser || user}
        hostel={currentHostel}
        onUpgradeClick={() => setIsUpgradeOpen(true)}
      />
    </>
  )
}