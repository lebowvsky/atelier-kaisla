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
  title: 'Tableau de bord - Atelier Kaisla Backoffice',
  description: 'Tableau de bord administrateur pour la plateforme e-commerce Atelier Kaisla'
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
    title: 'Revenu total',
    value: '$45,231.89',
    change: '+20.1%',
    icon: TrendingUp,
    trend: 'up'
  },
  {
    title: 'Produits',
    value: '127',
    change: '+12',
    icon: Package,
    trend: 'up'
  },
  {
    title: 'Clients',
    value: '2,350',
    change: '+180',
    icon: Users,
    trend: 'up'
  },
  {
    title: 'Commandes',
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
          Bon retour !
        </h2>
        <p class="text-muted-foreground">
          Voici ce qui se passe dans votre boutique aujourd'hui.
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
              par rapport au mois dernier
            </p>
          </div>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div class="p-6">
          <h3 class="text-lg font-semibold">
            Activité récente
          </h3>
          <p class="text-sm text-muted-foreground">
            Dernières mises à jour de votre boutique
          </p>
        </div>
        <div class="border-t p-6">
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="h-2 w-2 rounded-full bg-green-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Nouvelle commande reçue</p>
                <p class="text-xs text-muted-foreground">Il y a 2 minutes</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="h-2 w-2 rounded-full bg-blue-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Produit ajouté</p>
                <p class="text-xs text-muted-foreground">Il y a 1 heure</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="h-2 w-2 rounded-full bg-yellow-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Client inscrit</p>
                <p class="text-xs text-muted-foreground">Il y a 3 heures</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
