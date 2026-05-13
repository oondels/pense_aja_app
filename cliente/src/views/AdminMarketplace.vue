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
        <section class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div class="grid gap-3 md:grid-cols-[180px_minmax(180px,1fr)_auto] md:items-end">
            <label class="text-sm font-medium text-gray-700">
              Status
              <select v-model="filters.status" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" @change="changePage(1)">
                <option value="">Todos</option>
                <option v-for="status in statusOptions" :key="status.value" :value="status.value">{{ status.label }}</option>
              </select>
            </label>
            <label class="text-sm font-medium text-gray-700">
              Matrícula
              <input
                v-model.trim="filters.registration"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                inputmode="numeric"
                placeholder="Buscar por matrícula"
                type="search"
                @keyup.enter="changePage(1)"
              />
            </label>
            <div class="flex flex-wrap items-center gap-2">
              <button class="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800" type="button" @click="changePage(1)">
                <i class="mdi mdi-filter-outline"></i>
                Filtrar
              </button>
              <button class="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" type="button" @click="clearFilters">
                <i class="mdi mdi-filter-remove-outline"></i>
                Limpar
              </button>
              <ViewModeToggle v-model="viewMode" />
            </div>
          </div>
        </section>

        <AdminDataTable
          v-if="viewMode === 'list'"
          :columns="columns"
          :rows="requests"
          :loading="loading"
          clickable-rows
          empty-text="Nenhuma solicitação encontrada."
          @row-click="openRequest"
        >
          <template #cell-requestStatus="{ row }">
            <StatusBadge :status="row.requestStatus" />
          </template>
          <template #cell-catalogItemName="{ row }">
            {{ row.catalogItemName || row.catalogItemId }}
          </template>
          <template #cell-createdAt="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-updatedAt="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #actions="{ row }">
            <RequestActions :request="row" :action-id="actionId" @transition="transition" />
          </template>
        </AdminDataTable>

        <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="request in requests"
            :key="request.id"
            class="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-red-200 hover:shadow-md"
            @click="openRequest(request)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Solicitação #{{ request.id }}</p>
                <h3 class="mt-1 text-base font-semibold text-gray-950">{{ request.catalogItemName || request.catalogItemId }}</h3>
              </div>
              <StatusBadge :status="request.requestStatus" />
            </div>
            <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-xs font-medium text-gray-500">Matrícula</dt>
                <dd class="font-semibold text-gray-800">{{ request.registration }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Pontos</dt>
                <dd class="font-semibold text-gray-800">{{ request.catalogItemPointsCost ?? '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Criado</dt>
                <dd class="text-gray-700">{{ formatDate(request.createdAt) }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Atualizado</dt>
                <dd class="text-gray-700">{{ formatDate(request.updatedAt) }}</dd>
              </div>
            </dl>
            <RequestActions class="mt-4" :request="request" :action-id="actionId" @transition="transition" />
          </article>
          <div v-if="!loading && requests.length === 0" class="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 md:col-span-2 xl:col-span-3">
            Nenhuma solicitação encontrada.
          </div>
        </section>

        <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span>Exibindo {{ requests.length }} de {{ pagination.total }} solicitação(ões)</span>
          <div class="flex items-center gap-2">
            <button class="rounded-md border border-gray-300 px-3 py-1.5 font-semibold disabled:text-gray-300" type="button" :disabled="pagination.page <= 1 || loading" @click="changePage(pagination.page - 1)">
              Anterior
            </button>
            <span class="font-semibold text-gray-800">Página {{ pagination.page }} de {{ pagination.totalPages }}</span>
            <button class="rounded-md border border-gray-300 px-3 py-1.5 font-semibold disabled:text-gray-300" type="button" :disabled="pagination.page >= pagination.totalPages || loading" @click="changePage(pagination.page + 1)">
              Próxima
            </button>
          </div>
        </div>

        <div v-if="selectedRequest" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4" @click.self="selectedRequest = null">
          <section class="w-full max-w-4xl rounded-lg bg-white p-5 shadow-xl">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Acompanhamento da solicitação</p>
                <h2 class="mt-1 text-xl font-bold text-gray-950">#{{ selectedRequest.id }} - {{ selectedRequest.catalogItemName || selectedRequest.catalogItemId }}</h2>
              </div>
              <button class="rounded-full p-2 text-gray-500 hover:bg-gray-100" type="button" @click="selectedRequest = null">
                <i class="mdi mdi-close text-xl"></i>
              </button>
            </div>
            <RequestTimeline class="mt-4" :request="selectedRequest" />
          </section>
        </div>
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
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import AdminDataTable from '@/components/shared/AdminDataTable.vue'
import PermissionGate from '@/components/shared/PermissionGate.vue'
import RequestTimeline from '@/components/shared/RequestTimeline.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import UnitRequiredState from '@/components/shared/UnitRequiredState.vue'
import ViewModeToggle from '@/components/shared/ViewModeToggle.vue'
import { usePersistedViewMode } from '@/composables/usePersistedViewMode.js'
import { marketplaceService } from '@/services/marketplaceService.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const requests = ref([])
const loading = ref(false)
const actionId = ref(null)
const selectedRequest = ref(null)
const viewMode = usePersistedViewMode('viewMode:adminMarketplace')
const filters = reactive({
  status: '',
  registration: '',
})
const pagination = reactive({
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1,
})

const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem('unidadeDass') || '')

const columns = [
  { key: 'id', label: '#' },
  { key: 'registration', label: 'Matrícula' },
  { key: 'catalogItemName', label: 'Item' },
  { key: 'requestStatus', label: 'Status' },
  { key: 'catalogItemPointsCost', label: 'Pontos' },
  { key: 'createdAt', label: 'Criado' },
  { key: 'updatedAt', label: 'Atualizado' },
]
const statusOptions = [
  { value: 'pending_approval', label: 'Pendente' },
  { value: 'completed', label: 'Concluído' },
  { value: 'rejected', label: 'Rejeitado' },
  { value: 'refunded', label: 'Estornado' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'fulfillment_in_progress', label: 'Em separação' },
  { value: 'cancelled', label: 'Cancelado' },
]

const RequestActions = defineComponent({
  props: {
    request: { type: Object, required: true },
    actionId: { type: [Number, String], default: null },
  },
  emits: ['transition'],
  setup(props, { emit, attrs }) {
    const button = (label, action, classes, disabled) =>
      h('button', {
        class: classes,
        type: 'button',
        disabled,
        onClick: (event) => {
          event.stopPropagation()
          emit('transition', props.request, action)
        },
      }, label)

    return () => h('div', {
      ...attrs,
      class: ['flex flex-wrap justify-end gap-2', attrs.class],
    }, [
      button('Aprovar', 'approve', 'rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800 disabled:bg-gray-300', props.request.requestStatus !== 'pending_approval' || props.actionId === props.request.id),
      button('Rejeitar', 'reject', 'rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 disabled:bg-gray-300', props.request.requestStatus !== 'pending_approval' || props.actionId === props.request.id),
      button('Estornar', 'refund', 'rounded-md border border-sky-300 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50 disabled:border-gray-200 disabled:text-gray-300', props.request.requestStatus !== 'completed' || props.actionId === props.request.id),
    ])
  },
})

const formatDate = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

const loadRequests = async () => {
  if (!dassOffice.value || !userStore.hasPermission('marketplace.request.approve')) return
  loading.value = true
  try {
    const response = await marketplaceService.listRequests(dassOffice.value, {
      status: filters.status || undefined,
      registration: filters.registration || undefined,
      page: pagination.page,
      limit: pagination.limit,
    })
    requests.value = response.data || []
    Object.assign(pagination, response.pagination || { page: 1, limit: 5, total: 0, totalPages: 1 })
  } finally {
    loading.value = false
  }
}

const openRequest = (request) => {
  selectedRequest.value = request
}

const changePage = async (page) => {
  pagination.page = Math.max(1, page)
  await loadRequests()
}

const clearFilters = async () => {
  filters.status = ''
  filters.registration = ''
  await changePage(1)
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
