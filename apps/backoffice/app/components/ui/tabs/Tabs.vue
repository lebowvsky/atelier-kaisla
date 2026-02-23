<script setup lang="ts">
import { TabsRoot, type TabsRootEmits, type TabsRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<TabsRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<TabsRootEmits>()
</script>

<template>
  <TabsRoot
    v-bind="{ ...props, class: undefined }"
    :class="cn(props.class)"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <slot />
  </TabsRoot>
</template>
