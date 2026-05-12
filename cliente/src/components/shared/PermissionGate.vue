<template>
  <slot v-if="allowed" />
  <slot v-else name="fallback" />
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore.js'

const props = defineProps({
  permission: {
    type: String,
    default: '',
  },
  any: {
    type: Array,
    default: () => [],
  },
})

const userStore = useUserStore()

const allowed = computed(() => {
  if (props.permission) return userStore.hasPermission(props.permission)
  if (props.any.length) return userStore.hasAnyPermission(props.any)
  return true
})
</script>
