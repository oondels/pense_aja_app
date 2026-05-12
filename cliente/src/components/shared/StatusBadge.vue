<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="statusClass"
  >
    <i :class="iconClass"></i>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
})

const statusMap = {
  pending_approval: {
    label: 'Pendente',
    icon: 'mdi mdi-clock-outline',
    class: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  },
  approved: {
    label: 'Aprovado',
    icon: 'mdi mdi-check-circle-outline',
    class: 'bg-green-50 text-green-800 ring-1 ring-green-200',
  },
  completed: {
    label: 'Concluído',
    icon: 'mdi mdi-check-bold',
    class: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  },
  rejected: {
    label: 'Rejeitado',
    icon: 'mdi mdi-close-circle-outline',
    class: 'bg-red-50 text-red-800 ring-1 ring-red-200',
  },
  refunded: {
    label: 'Estornado',
    icon: 'mdi mdi-cash-refund',
    class: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
  },
  cancelled: {
    label: 'Cancelado',
    icon: 'mdi mdi-cancel',
    class: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  },
  fulfillment_in_progress: {
    label: 'Em separação',
    icon: 'mdi mdi-package-variant-closed',
    class: 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200',
  },
}

const config = computed(() => statusMap[props.status] || {
  label: props.status || 'Indefinido',
  icon: 'mdi mdi-circle-outline',
  class: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
})

const label = computed(() => config.value.label)
const iconClass = computed(() => config.value.icon)
const statusClass = computed(() => config.value.class)
</script>
