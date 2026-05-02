<script setup lang="ts">
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl as string

useSchemaOrg([
  defineOrganization({
    name: 'Atelier Kaisla',
    url: siteUrl,
    logo: `${siteUrl}/logo-kaisla.png`,
    description:
      "Atelier artisanal de tentures murales et tapis faits main, alliant matériaux naturels et design contemporain.",
    sameAs: ['https://www.homofaber.com/']
  }),
  defineWebSite({
    name: 'Atelier Kaisla',
    url: siteUrl,
    inLanguage: 'fr-FR'
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
