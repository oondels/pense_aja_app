<template>
  <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <article
      v-for="item in items"
      :key="item.label"
      class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-gray-500">{{ item.label }}</p>
        <i :class="[item.icon, item.color, 'text-xl']"></i>
      </div>
      <p class="mt-3 text-2xl font-bold text-gray-950">{{ item.value }}</p>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  userData: {
    type: Object,
    default: () => ({}),
  },
})

const toNumber = (value) => Number(value || 0)

const items = computed(() => [
  {
    label: 'Saldo disponível',
    value: toNumber(props.userData.saldo_disponivel ?? props.userData.availableBalance),
    icon: 'mdi mdi-wallet-outline',
    color: 'text-green-700',
  },
  {
    label: 'Pontos ganhos',
    value: toNumber(props.userData.pontos ?? props.userData.total_earned),
    icon: 'mdi mdi-star-circle-outline',
    color: 'text-amber-600',
  },
  {
    label: 'Pontos resgatados',
    value: toNumber(props.userData.pontos_resgatados ?? props.userData.total_committed),
    icon: 'mdi mdi-store-check-outline',
    color: 'text-red-700',
  },
  {
    label: 'Pontos reservados',
    value: toNumber(props.userData.total_reserved ?? props.userData.pontos_reservados),
    icon: 'mdi mdi-lock-clock',
    color: 'text-sky-700',
  },
])
</script>
