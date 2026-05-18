<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl space-y-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Acompanhamento</p>
          <h1 class="mt-1 text-2xl font-bold text-gray-950">Solicitações de resgate</h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600">
            Consulte o status das solicitações de marketplace por matrícula e unidade.
          </p>
        </div>
        <ViewModeToggle v-model="viewMode" />
      </header>

      <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="grid gap-3 md:grid-cols-[160px_minmax(160px,1fr)_180px_auto] md:items-end">
          <label class="text-sm font-medium text-gray-700">
            Unidade
            <select v-model="lookup.dassOffice" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" :disabled="isLoggedIn">
              <option value="" disabled>Selecione</option>
              <option v-for="unit in unitOptions" :key="unit" :value="unit">{{ unit }}</option>
            </select>
          </label>
          <label class="text-sm font-medium text-gray-700">
            Matrícula
            <input
              v-model.trim="lookup.registration"
              class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              inputmode="numeric"
              :disabled="isLoggedIn"
              placeholder="Informe a matrícula"
              type="search"
              @keyup.enter="changePage(1)"
            />
          </label>
          <label class="text-sm font-medium text-gray-700">
            Status
            <select v-model="lookup.status" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" @change="changePage(1)">
              <option value="">Todos</option>
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">{{ status.label }}</option>
            </select>
          </label>
          <button
            class="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:bg-gray-300"
            type="button"
            :disabled="!canSearch || loading"
            @click="changePage(1)"
          >
            <i :class="loading ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-magnify'"></i>
            Consultar
          </button>
        </div>
      </section>

      <p v-if="feedback" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ feedback }}</p>

      <AdminDataTable
        v-if="viewMode === 'list'"
        :columns="columns"
        :rows="requests"
        :loading="loading"
        clickable-rows
        empty-text="Nenhuma solicitação encontrada."
        @row-click="selectedRequest = $event"
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
      </AdminDataTable>

      <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="request in requests"
          :key="request.id"
          class="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-red-200 hover:shadow-md"
          @click="selectedRequest = request"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Solicitação #{{ request.id }}</p>
              <h2 class="mt-1 text-base font-semibold text-gray-950">{{ request.catalogItemName || request.catalogItemId }}</h2>
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
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AdminDataTable from '@/components/shared/AdminDataTable.vue'
import RequestTimeline from '@/components/shared/RequestTimeline.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import ViewModeToggle from '@/components/shared/ViewModeToggle.vue'
import { usePersistedViewMode } from '@/composables/usePersistedViewMode.js'
import { marketplaceService } from '@/services/marketplaceService.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const requests = ref([])
const loading = ref(false)
const feedback = ref('')
const selectedRequest = ref(null)
const viewMode = usePersistedViewMode('viewMode:marketplaceRequests')
const unitOptions = ['SEST', 'VDC', 'ITB', 'VDC-CONF', 'STJ']
const lookup = reactive({
  dassOffice: localStorage.getItem('unidadeDass') || '',
  registration: sessionStorage.getItem('matricula') || '',
  status: '',
})
const pagination = reactive({
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1,
})

const columns = [
  { key: 'id', label: '#' },
  { key: 'registration', label: 'Matrícula' },
  { key: 'catalogItemName', label: 'Item' },
  { key: 'catalogItemPointsCost', label: 'Pontos' },
  { key: 'requestStatus', label: 'Status' },
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

const isLoggedIn = computed(() => Boolean(userStore.matricula || sessionStorage.getItem('matricula')))
const canSearch = computed(() => Boolean(lookup.dassOffice && lookup.registration))

const formatDate = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

const loadRequests = async () => {
  if (!canSearch.value) return
  loading.value = true
  feedback.value = ''
  try {
    const params = {
      status: lookup.status || undefined,
      registration: lookup.registration,
      page: pagination.page,
      limit: pagination.limit,
    }
    const response = isLoggedIn.value
      ? await marketplaceService.listMyRequests(lookup.dassOffice, params)
      : await marketplaceService.listPublicRequests({ dassOffice: lookup.dassOffice, ...params })

    requests.value = response.data || []
    Object.assign(pagination, response.pagination || { page: 1, limit: 5, total: 0, totalPages: 1 })
  } catch (error) {
    feedback.value = error.response?.data?.message || 'Não foi possível consultar solicitações.'
    requests.value = []
    Object.assign(pagination, { page: 1, limit: 5, total: 0, totalPages: 1 })
  } finally {
    loading.value = false
  }
}

const changePage = async (page) => {
  pagination.page = Math.max(1, page)
  await loadRequests()
}

onMounted(async () => {
  userStore.carregarUsuario()
  if (isLoggedIn.value) {
    lookup.registration = userStore.matricula || sessionStorage.getItem('matricula') || ''
    lookup.dassOffice = userStore.dassOffice || localStorage.getItem('unidadeDass') || ''
    await loadRequests()
  }
})
</script>
