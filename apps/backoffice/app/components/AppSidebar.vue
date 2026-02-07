<!--
  @pattern Composite Pattern + Strategy Pattern
  @purpose Reusable sidebar navigation component with responsive behavior
-->

<script setup lang="ts">
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
  SidebarRail,
} from '@/components/ui/sidebar'
import { User2, LogOut } from 'lucide-vue-next'

/**
 * Navigation composable - Singleton pattern
 */
const { navigationItems } = useNavigation()

/**
 * Authentication composable
 */
const { user, logout } = useAuth()

/**
 * Handle logout action
 */
const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <Sidebar collapsible="icon">
    <!-- Header Section -->
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span class="text-xl font-bold">AK</span>
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Atelier Kaisla</span>
                <span class="truncate text-xs text-sidebar-foreground/70">Backoffice</span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <!-- Main Navigation Content -->
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem
              v-for="item in navigationItems"
              :key="item.path"
            >
              <SidebarMenuButton
                as-child
                :is-active="item.isActive"
                :tooltip="item.title"
              >
                <NuxtLink :to="item.path">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- Footer Section -->
    <SidebarFooter>
      <SidebarMenu>
        <!-- User Info -->
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
              <User2 class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ user?.username || 'Utilisateur' }}</span>
              <span class="truncate text-xs text-sidebar-foreground/70">{{ user?.role || 'Rôle' }}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <!-- Logout Button -->
        <SidebarMenuItem>
          <SidebarMenuButton @click="handleLogout" tooltip="Déconnexion">
            <LogOut class="size-4" />
            <span>Déconnexion</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <!-- Rail for collapsible behavior -->
    <SidebarRail />
  </Sidebar>
</template>
