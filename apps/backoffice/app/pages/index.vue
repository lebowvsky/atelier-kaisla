<!--
  @pattern Template Method Pattern
  @purpose Home page - Dashboard overview
-->

<script setup lang="ts">
import { BarChart3, TrendingUp, Users, Package } from 'lucide-vue-next'

/**
 * SEO Configuration
 */
useSeoMeta({
  title: 'Dashboard - Atelier Kaisla Backoffice',
  description: 'Admin dashboard for Atelier Kaisla e-commerce platform'
})

/**
 * Dashboard stats
 * Pattern: Value Object for data representation
 */
interface DashboardStat {
  title: string
  value: string
  change: string
  icon: Component
  trend: 'up' | 'down'
}

const stats: DashboardStat[] = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    icon: TrendingUp,
    trend: 'up'
  },
  {
    title: 'Products',
    value: '127',
    change: '+12',
    icon: Package,
    trend: 'up'
  },
  {
    title: 'Customers',
    value: '2,350',
    change: '+180',
    icon: Users,
    trend: 'up'
  },
  {
    title: 'Orders',
    value: '573',
    change: '+48',
    icon: BarChart3,
    trend: 'up'
  }
]
</script>

<template>
  <NuxtLayout name="default">
    <div class="space-y-6 py-6">
      <!-- Welcome Section -->
      <div>
        <h2 class="text-3xl font-bold tracking-tight">
          Welcome back!
        </h2>
        <p class="text-muted-foreground">
          Here's what's happening with your store today.
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.title"
          class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-md"
        >
          <div class="flex items-center justify-between space-y-0 pb-2">
            <h3 class="text-sm font-medium text-muted-foreground">
              {{ stat.title }}
            </h3>
            <component
              :is="stat.icon"
              class="h-4 w-4 text-muted-foreground"
            />
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">
              {{ stat.value }}
            </div>
            <p class="text-xs text-muted-foreground">
              <span
                class="font-medium"
                :class="stat.trend === 'up' ? 'text-green-600' : 'text-red-600'"
              >
                {{ stat.change }}
              </span>
              from last month
            </p>
          </div>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div class="p-6">
          <h3 class="text-lg font-semibold">
            Recent Activity
          </h3>
          <p class="text-sm text-muted-foreground">
            Latest updates from your store
          </p>
        </div>
        <div class="border-t p-6">
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="h-2 w-2 rounded-full bg-green-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">New order received</p>
                <p class="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="h-2 w-2 rounded-full bg-blue-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Product added</p>
                <p class="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="h-2 w-2 rounded-full bg-yellow-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Customer registered</p>
                <p class="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
