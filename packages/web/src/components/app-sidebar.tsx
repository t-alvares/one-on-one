"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LifeBuoy,
  Send,
  Settings,
  ChevronsUpDown,
  ChevronRight,
} from "lucide-react"

import { Bot } from "@/components/animate-ui/icons/bot"
import { Lightbulb } from "@/components/animate-ui/icons/lightbulb"
import { Users } from "@/components/animate-ui/icons/users"
import { LogOut } from "@/components/animate-ui/icons/log-out"
import { TopicsIcon } from "@/components/icons"
import { useAuth } from "@/contexts/AuthContext"
import { useTeamMembers } from "@/hooks/useTeam"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { isMobile } = useSidebar()

  const isActive = (path: string) => location.pathname.startsWith(path)

  const handleLogout = () => {
    logout()
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Determine the home path based on role
  const homePath = user?.role === 'LEADER' ? '/team' : '/workspace'

  // Check if user is a Leader
  const isLeader = user?.role === 'LEADER'

  // Fetch team members for Leaders (only when isLeader)
  const { data: teamMembers = [] } = useTeamMembers()

  // Get initials for IC avatar
  const getICInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar variant="inset" {...props}>
      {/* Header with logo only */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="justify-center">
              <Link to={homePath}>
                <img
                  src="/images/Wawanesa-Logo-RGB-Blue.png"
                  alt="Wawanesa"
                  className="h-[60px] w-auto object-contain"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* IC Navigation */}
        {!isLeader && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/workspace')}
                    tooltip="My Workspace"
                  >
                    <Link to="/workspace">
                      <Bot size={18} animateOnHover />
                      <span>My Workspace</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Thoughts">
                    <Link to="/workspace#thoughts">
                      <Lightbulb size={18} animateOnHover />
                      <span>Thoughts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Topics">
                    <Link to="/workspace#topics">
                      <TopicsIcon size={18} animateOnHover />
                      <span>Topics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="1:1 Meetings">
                    <Link to="/workspace#meetings">
                      <Users size={18} animateOnHover />
                      <span>Upcoming 1:1s</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}

        {/* Leader Navigation */}
        {isLeader && (
          <SidebarGroup>
            <SidebarGroupLabel>Team</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible
                asChild
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isActive('/team')}
                      tooltip="My Team"
                    >
                      <Users size={18} animateOnHover />
                      <span>My Team</span>
                      <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {/* Team Board Link */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={location.pathname === '/team'}
                        >
                          <Link to="/team">
                            <Users className="size-4" />
                            <span>Team Board</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {/* Individual IC Links - sorted alphabetically */}
                      {[...teamMembers].sort((a, b) => a.name.localeCompare(b.name)).map((member) => (
                        <SidebarMenuSubItem key={member.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname === `/team/${member.id}`}
                          >
                            <Link to={`/team/${member.id}`}>
                              <Avatar className="size-4">
                                <AvatarImage src={member.avatarUrl || undefined} />
                                <AvatarFallback className="text-[8px] bg-gray-400 text-white">
                                  {getICInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{member.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Secondary Navigation - pushed to bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <a href="#">
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <a href="#">
                    <LifeBuoy className="size-4" />
                    <span>Support</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <a href="#">
                    <Send className="size-4" />
                    <span>Feedback</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name} />
                    <AvatarFallback className="rounded-lg bg-gray-500 text-white text-xs">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-medium">{user?.name || 'User'}</span>
                    <span className="truncate text-[10px] text-muted-foreground">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-xs">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name} />
                      <AvatarFallback className="rounded-lg bg-gray-500 text-white text-xs">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight">
                      <span className="truncate font-medium">{user?.name || 'User'}</span>
                      <span className="truncate text-[10px] text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-xs">
                  <LogOut size={14} animateOnHover className="mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
