<script setup lang="ts">
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl as string

useSchemaOrg([
  defineOrganization({
    name: 'Atelier Kaisla',
    url: siteUrl,
    logo: `${siteUrl}/logo-kaisla.png`,
    description:
      "Artisan studio of handcrafted wall hangings and rugs, combining natural materials with contemporary design.",
    sameAs: ['https://www.homofaber.com/']
  }),
  defineWebSite({
    name: 'Atelier Kaisla',
    url: siteUrl,
    inLanguage: 'en-GB'
  })
])
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
