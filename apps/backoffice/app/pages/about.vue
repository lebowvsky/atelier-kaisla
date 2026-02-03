<!--
  @pattern Template Method Pattern
  @purpose About page - Platform information
-->

<script setup lang="ts">
import { Settings, Shield, Zap, Code } from 'lucide-vue-next'

/**
 * SEO Configuration
 */
useSeoMeta({
  title: 'About - Atelier Kaisla Backoffice',
  description: 'About Atelier Kaisla backoffice platform'
})

/**
 * Feature interface
 * Pattern: Value Object for data representation
 */
interface Feature {
  title: string
  description: string
  icon: Component
}

/**
 * Platform features
 */
const features: Feature[] = [
  {
    title: 'Product Management',
    description: 'Easily manage your entire product catalog with an intuitive interface.',
    icon: Settings
  },
  {
    title: 'Secure & Reliable',
    description: 'Built with security best practices and enterprise-grade reliability.',
    icon: Shield
  },
  {
    title: 'Fast Performance',
    description: 'Optimized for speed with modern web technologies and SSR.',
    icon: Zap
  },
  {
    title: 'Developer Friendly',
    description: 'Clean architecture with TypeScript, Vue 3, and design patterns.',
    icon: Code
  }
]

/**
 * Tech stack information
 */
interface TechStack {
  name: string
  version: string
  category: string
}

const techStack: TechStack[] = [
  { name: 'Nuxt', version: '4.3.0', category: 'Framework' },
  { name: 'Vue', version: '3.5.27', category: 'Framework' },
  { name: 'TypeScript', version: '5.x', category: 'Language' },
  { name: 'Tailwind CSS', version: '4.1.18', category: 'Styling' },
  { name: 'shadcn-vue', version: 'latest', category: 'UI Components' },
  { name: 'NestJS', version: '11.x', category: 'Backend' },
  { name: 'PostgreSQL', version: '16', category: 'Database' },
  { name: 'Docker', version: 'latest', category: 'Infrastructure' }
]
</script>

<template>
  <NuxtLayout name="default">
    <div class="space-y-8 py-6">
      <!-- Hero Section -->
      <div class="text-center">
        <h2 class="text-4xl font-bold tracking-tight">
          Atelier Kaisla Backoffice
        </h2>
        <p class="mt-4 text-lg text-muted-foreground">
          A modern, type-safe admin panel for managing your e-commerce platform
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid gap-6 md:grid-cols-2">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md"
        >
          <div class="flex items-start gap-4">
            <div class="rounded-lg bg-primary/10 p-3">
              <component
                :is="feature.icon"
                class="h-6 w-6 text-primary"
              />
            </div>
            <div class="flex-1 space-y-1">
              <h3 class="font-semibold">
                {{ feature.title }}
              </h3>
              <p class="text-sm text-muted-foreground">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Architecture Section -->
      <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 class="mb-4 text-2xl font-bold">
          Architecture
        </h3>
        <div class="space-y-4">
          <div>
            <h4 class="mb-2 font-semibold">Design Patterns</h4>
            <p class="text-sm text-muted-foreground">
              This backoffice implements Gang of Four design patterns adapted for Vue.js:
              Singleton for global state, Factory for component creation, Observer for
              reactive navigation, Strategy for conditional logic, and Template Method
              for page structure.
            </p>
          </div>
          <div>
            <h4 class="mb-2 font-semibold">Composition API</h4>
            <p class="text-sm text-muted-foreground">
              Built with Vue 3 Composition API using TypeScript for maximum type safety.
              Composables provide reusable logic following functional programming principles.
            </p>
          </div>
          <div>
            <h4 class="mb-2 font-semibold">Responsive Design</h4>
            <p class="text-sm text-muted-foreground">
              The sidebar automatically adapts to mobile devices with a collapsible menu,
              ensuring a seamless experience across all screen sizes.
            </p>
          </div>
        </div>
      </div>

      <!-- Tech Stack Section -->
      <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 class="mb-4 text-2xl font-bold">
          Technology Stack
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="pb-3 text-left text-sm font-semibold">
                  Technology
                </th>
                <th class="pb-3 text-left text-sm font-semibold">
                  Version
                </th>
                <th class="pb-3 text-left text-sm font-semibold">
                  Category
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="tech in techStack"
                :key="tech.name"
                class="border-b last:border-0"
              >
                <td class="py-3 text-sm font-medium">
                  {{ tech.name }}
                </td>
                <td class="py-3 text-sm text-muted-foreground">
                  {{ tech.version }}
                </td>
                <td class="py-3 text-sm">
                  <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {{ tech.category }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Info Section -->
      <div class="rounded-lg border border-blue-200 bg-blue-50 p-6 text-blue-900">
        <h4 class="mb-2 font-semibold">
          Development Note
        </h4>
        <p class="text-sm">
          This backoffice is part of a monorepo architecture with a Nuxt 4 frontend,
          NestJS backend, and PostgreSQL database. All services are containerized
          with Docker for consistent development environments.
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>
