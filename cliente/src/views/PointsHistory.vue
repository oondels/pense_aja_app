<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <UnitRequiredState v-if="!dassOffice" />

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Pontuação</p>
          <h1 class="mt-1 text-2xl font-bold text-gray-950">Histórico de pontos</h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600">
            Movimentações append-only do ledger para a matrícula autenticada.
          </p>
        </div>
        <ViewModeToggle v-model="viewMode" />
      </header>

      <PointBalanceSummary :user-data="userData" />

      <AdminDataTable v-if="viewMode === 'list'" :columns="columns" :rows="history" :loading="loading" empty-text="Nenhuma movimentação encontrada.">
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
        <template #cell-sourceType="{ value }">
          {{ sourceLabel(value) }}
        </template>
        <template #cell-createdAt="{ value }">
          {{ formatDate(value) }}
        </template>
      </AdminDataTable>

      <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="entry in history" :key="entry.id || `${entry.sourceId}-${entry.createdAt}`" class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="entryClass(entry.entryType)">
                {{ entryLabel(entry.entryType) }}
              </span>
              <h2 class="mt-3 text-base font-semibold text-gray-950">{{ sourceLabel(entry.sourceType) }}</h2>
            </div>
            <span class="text-xl font-bold" :class="amountClass(entry.entryType)">
              {{ amountSign(entry.entryType) }}{{ entry.amount }}
            </span>
          </div>
          <dl class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-gray-500">Referência</dt>
              <dd class="font-medium text-gray-800">{{ entry.sourceId || '-' }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-gray-500">Ator</dt>
              <dd class="font-medium text-gray-800">{{ entry.createdByName || '-' }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-gray-500">Data</dt>
              <dd class="font-medium text-gray-800">{{ formatDate(entry.createdAt) }}</dd>
            </div>
          </dl>
          <p v-if="entry.reason" class="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-600">{{ entry.reason }}</p>
        </article>
        <div v-if="!loading && history.length === 0" class="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 md:col-span-2 xl:col-span-3">
          Nenhuma movimentação encontrada.
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminDataTable from '@/components/shared/AdminDataTable.vue'
import PointBalanceSummary from '@/components/shared/PointBalanceSummary.vue'
import UnitRequiredState from '@/components/shared/UnitRequiredState.vue'
import ViewModeToggle from '@/components/shared/ViewModeToggle.vue'
import { usePersistedViewMode } from '@/composables/usePersistedViewMode.js'
import { getUserData, getUserPointsHistory } from '@/services/userService.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const userData = ref({})
const history = ref([])
const loading = ref(false)
const viewMode = usePersistedViewMode('viewMode:pointsHistory')

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
const sourceMap = {
  idea_evaluation: 'Avaliação de ideia',
  idea_evaluation_bonus: 'Bonificação de avaliação',
  manual_adjustment: 'Ajuste manual',
  marketplace_redemption: 'Resgate no marketplace',
}

const entryLabel = (type) => entryMap[type] || type
const sourceLabel = (type) => sourceMap[type] || type
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
