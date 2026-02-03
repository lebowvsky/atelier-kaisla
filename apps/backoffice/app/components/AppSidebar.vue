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
import { ChevronUp, User2 } from 'lucide-vue-next'

/**
 * Navigation composable - Singleton pattern
 */
const { navigationItems } = useNavigation()
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
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
              <User2 class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">Admin User</span>
              <span class="truncate text-xs text-sidebar-foreground/70">admin@example.com</span>
            </div>
            <ChevronUp class="ml-auto size-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <!-- Rail for collapsible behavior -->
    <SidebarRail />
  </Sidebar>
</template>
