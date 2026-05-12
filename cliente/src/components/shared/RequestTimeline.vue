<template>
  <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div class="flex flex-col gap-4 md:flex-row md:items-start">
      <div
        v-for="(step, index) in steps"
        :key="step.key"
        class="relative flex flex-1 items-start gap-3 md:flex-col md:items-center md:text-center"
      >
        <div
          v-if="index < steps.length - 1"
          class="absolute left-5 top-10 h-full w-px bg-gray-200 md:left-1/2 md:top-5 md:h-px md:w-full"
          :class="{ 'bg-green-700': step.done }"
        ></div>

        <div
          class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white"
          :class="circleClass(step)"
        >
          <i :class="[step.icon, 'text-lg']"></i>
        </div>

        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900">{{ step.title }}</p>
          <p class="mt-1 text-xs text-gray-500">{{ step.caption }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  request: {
    type: Object,
    default: () => ({}),
  },
})

const formatDate = (value) => {
  if (!value) return 'Aguardando...'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

const terminalLabel = computed(() => {
  const status = props.request.requestStatus
  if (status === 'rejected') return 'Rejeitado'
  if (status === 'cancelled') return 'Cancelado'
  if (status === 'refunded') return 'Concluído'
  if (status === 'completed') return 'Concluído'
  return 'Decisão'
})

const steps = computed(() => {
  const status = props.request.requestStatus
  const hasReservation = Boolean(props.request.reservedLedgerEntryId)
  const isTerminal = ['completed', 'rejected', 'cancelled', 'refunded'].includes(status)

  return [
    {
      key: 'created',
      title: 'Solicitado',
      caption: formatDate(props.request.createdAt),
      icon: 'mdi mdi-clipboard-text-outline',
      done: Boolean(props.request.id),
      current: !props.request.id,
    },
    {
      key: 'reserved',
      title: 'Pontos reservados',
      caption: hasReservation ? 'Reserva no ledger criada' : 'Aguardando...',
      icon: 'mdi mdi-lock-check-outline',
      done: hasReservation,
      current: Boolean(props.request.id) && !hasReservation,
    },
    {
      key: 'approval',
      title: 'Análise',
      caption: status === 'pending_approval' ? 'Pendente de aprovação' : 'Decisão registrada',
      icon: 'mdi mdi-account-check-outline',
      done: isTerminal,
      current: status === 'pending_approval',
    },
    {
      key: 'terminal',
      title: terminalLabel.value,
      caption: isTerminal ? formatDate(props.request.updatedAt) : 'Aguardando...',
      icon: status === 'rejected' ? 'mdi mdi-close-circle-outline' : 'mdi mdi-check-circle-outline',
      done: ['completed', 'refunded'].includes(status),
      current: ['completed', 'rejected', 'cancelled'].includes(status),
    },
    {
      key: 'refund',
      title: 'Estorno',
      caption: status === 'refunded' ? formatDate(props.request.updatedAt) : 'Quando aplicável',
      icon: 'mdi mdi-cash-refund',
      done: status === 'refunded',
      current: false,
    },
  ]
})

const circleClass = (step) => {
  if (step.done) return 'border-green-800 bg-green-800 text-white'
  if (step.current) return 'border-amber-300 text-amber-700 shadow-[0_0_0_4px_rgba(252,211,77,0.35)]'
  return 'border-gray-200 text-gray-400'
}
</script>
