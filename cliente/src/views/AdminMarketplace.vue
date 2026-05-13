<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <UnitRequiredState v-if="!dassOffice" />

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Administração</p>
          <h1 class="mt-1 text-2xl font-bold text-gray-950">Solicitações de marketplace</h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600">
            Aprovação, rejeição e estorno com trilha no ledger e auditoria.
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          type="button"
          @click="loadRequests"
        >
          <i class="mdi mdi-refresh"></i>
          Atualizar
        </button>
      </header>

      <PermissionGate permission="marketplace.request.approve">
        <AdminDataTable :columns="columns" :rows="requests" :loading="loading" empty-text="Nenhuma solicitação encontrada.">
          <template #cell-requestStatus="{ row }">
            <StatusBadge :status="row.requestStatus" />
          </template>
          <template #cell-createdAt="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-updatedAt="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #actions="{ row }">
            <div class="flex justify-end gap-2">
              <button
                class="rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800 disabled:bg-gray-300"
                type="button"
                :disabled="row.requestStatus !== 'pending_approval' || actionId === row.id"
                @click="transition(row, 'approve')"
              >
                Aprovar
              </button>
              <button
                class="rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 disabled:bg-gray-300"
                type="button"
                :disabled="row.requestStatus !== 'pending_approval' || actionId === row.id"
                @click="transition(row, 'reject')"
              >
                Rejeitar
              </button>
              <button
                class="rounded-md border border-sky-300 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50 disabled:border-gray-200 disabled:text-gray-300"
                type="button"
                :disabled="row.requestStatus !== 'completed' || actionId === row.id"
                @click="transition(row, 'refund')"
              >
                Estornar
              </button>
            </div>
          </template>
        </AdminDataTable>

        <section v-if="selectedRequest" class="space-y-3">
          <h2 class="text-lg font-semibold text-gray-950">Acompanhamento da solicitação #{{ selectedRequest.id }}</h2>
          <RequestTimeline :request="selectedRequest" />
        </section>
      </PermissionGate>

      <PermissionGate permission="marketplace.request.approve">
        <template #fallback>
          <section class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            É necessário ter permissão de aprovação para visualizar solicitações da unidade.
          </section>
        </template>
      </PermissionGate>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminDataTable from '@/components/shared/AdminDataTable.vue'
import PermissionGate from '@/components/shared/PermissionGate.vue'
import RequestTimeline from '@/components/shared/RequestTimeline.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import UnitRequiredState from '@/components/shared/UnitRequiredState.vue'
import { marketplaceService } from '@/services/marketplaceService.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const requests = ref([])
const loading = ref(false)
const actionId = ref(null)
const selectedRequest = ref(null)

const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem('unidadeDass') || '')

const columns = [
  { key: 'id', label: '#' },
  { key: 'registration', label: 'Matrícula' },
  { key: 'catalogItemId', label: 'Item' },
  { key: 'requestStatus', label: 'Status' },
  { key: 'reservedLedgerEntryId', label: 'Ledger' },
  { key: 'createdAt', label: 'Criado' },
  { key: 'updatedAt', label: 'Atualizado' },
]

const formatDate = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

const loadRequests = async () => {
  if (!dassOffice.value || !userStore.hasPermission('marketplace.request.approve')) return
  loading.value = true
  try {
    requests.value = await marketplaceService.listRequests(dassOffice.value)
    selectedRequest.value = requests.value[0] || null
  } finally {
    loading.value = false
  }
}

const transition = async (request, action) => {
  const reason = window.prompt('Informe o motivo operacional:')
  if (!reason) return

  actionId.value = request.id
  const payload = { dassOffice: dassOffice.value, reason }
  try {
    if (action === 'approve') await marketplaceService.approveRequest(request.id, payload)
    if (action === 'reject') await marketplaceService.rejectRequest(request.id, payload)
    if (action === 'refund') await marketplaceService.refundRequest(request.id, payload)
    await loadRequests()
  } finally {
    actionId.value = null
  }
}

onMounted(async () => {
  userStore.carregarUsuario()
  await userStore.loadSessionContext(dassOffice.value)
  await loadRequests()
})
</script>
