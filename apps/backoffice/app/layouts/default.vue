<!--
  @pattern Template Method Pattern + Facade Pattern
  @purpose Main application layout with sidebar navigation
-->

<script setup lang="ts">
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import AppSidebar from '@/components/AppSidebar.vue'

/**
 * Navigation state management
 */
const { currentPageTitle } = useNavigation()
</script>

<template>
  <SidebarProvider>
    <!-- Application Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <SidebarInset>
      <!-- Header with trigger and breadcrumb -->
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <h1 class="text-lg font-semibold">
            {{ currentPageTitle }}
          </h1>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped>
/**
 * Layout-specific styles
 * Ensures proper spacing and responsive behavior
 */
main {
  min-height: calc(100vh - 4rem);
}
</style>
