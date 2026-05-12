<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <UnitRequiredState v-if="!dassOffice" />

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <header>
        <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Pontuação</p>
        <h1 class="mt-1 text-2xl font-bold text-gray-950">Histórico de pontos</h1>
        <p class="mt-2 max-w-2xl text-sm text-gray-600">
          Movimentações append-only do ledger para a matrícula autenticada.
        </p>
      </header>

      <PointBalanceSummary :user-data="userData" />

      <AdminDataTable :columns="columns" :rows="history" :loading="loading" empty-text="Nenhuma movimentação encontrada.">
        <template #cell-entryType="{ value }">
          <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="entryClass(value)">
            {{ entryLabel(value) }}
          </span>
        </template>
        <template #cell-amount="{ row, value }">
          <span class="font-semibold" :class="amountClass(row.entryType)">
            {{ amountSign(row.entryType) }}{{ value }}
          </span>
        </template>
        <template #cell-createdAt="{ value }">
          {{ formatDate(value) }}
        </template>
      </AdminDataTable>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminDataTable from '@/components/shared/AdminDataTable.vue'
import PointBalanceSummary from '@/components/shared/PointBalanceSummary.vue'
import UnitRequiredState from '@/components/shared/UnitRequiredState.vue'
import { getUserData, getUserPointsHistory } from '@/services/userService.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const userData = ref({})
const history = ref([])
const loading = ref(false)

const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem('unidadeDass') || '')
const columns = [
  { key: 'entryType', label: 'Tipo' },
  { key: 'amount', label: 'Pontos' },
  { key: 'sourceType', label: 'Origem' },
  { key: 'sourceId', label: 'Ref.' },
  { key: 'reason', label: 'Motivo' },
  { key: 'createdByName', label: 'Ator' },
  { key: 'createdAt', label: 'Data' },
]

const entryMap = {
  earn: 'Ganho',
  reverse: 'Reversão',
  reserve: 'Reserva',
  commit: 'Consumo',
  release: 'Liberação',
  refund: 'Estorno',
}

const entryLabel = (type) => entryMap[type] || type
const amountSign = (type) => (['earn', 'release', 'refund'].includes(type) ? '+' : '-')
const amountClass = (type) => (['earn', 'release', 'refund'].includes(type) ? 'text-green-700' : 'text-red-700')
const entryClass = (type) => (['earn', 'release', 'refund'].includes(type) ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')

const formatDate = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

const loadHistory = async () => {
  if (!dassOffice.value || !userStore.matricula) return
  loading.value = true
  try {
    await getUserData(userStore.matricula, userData)
    history.value = await getUserPointsHistory(userStore.matricula, dassOffice.value)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  userStore.carregarUsuario()
  await userStore.loadSessionContext(dassOffice.value)
  await loadHistory()
})
</script>
