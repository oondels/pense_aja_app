<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <Notification ref="notification" />

    <div class="mx-auto max-w-7xl space-y-6">
      <header class="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-700 text-xl font-bold text-white">
            {{ userInitials }}
          </div>
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Perfil</p>
            <h1 class="mt-1 text-2xl font-bold text-gray-950">{{ userData?.nome || 'Usuário' }}</h1>
            <p class="mt-1 text-sm text-gray-600">{{ userData?.setor || 'Setor não informado' }} · {{ dassOffice || 'Unidade não informada' }}</p>
          </div>
        </div>
        <router-link class="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" to="/user/points-history">
          <i class="mdi mdi-history"></i>
          Histórico de pontos
        </router-link>
      </header>

      <PointBalanceSummary :user-data="userData || {}" />

      <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div class="space-y-6">
          <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-950">Registros do colaborador</h2>
            <dl class="mt-4 grid gap-4 sm:grid-cols-2">
              <div v-for="item in profileItems" :key="item.label" class="rounded-md bg-gray-50 p-3">
                <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ item.label }}</dt>
                <dd class="mt-1 text-sm font-semibold text-gray-900">{{ item.value || '-' }}</dd>
              </div>
            </dl>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold text-gray-950">Classificações recebidas</h2>
              <span class="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">{{ totalIdeas }} registro(s)</span>
            </div>
            <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article v-for="item in classifications" :key="item.label" class="rounded-lg border border-gray-200 p-4">
                <div class="flex items-center justify-between gap-3">
                  <span class="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 font-bold text-white">{{ item.label }}</span>
                  <span class="text-2xl font-bold text-gray-950">{{ item.value }}</span>
                </div>
                <p class="mt-2 text-xs font-medium text-gray-500">Ideias nesta classificação</p>
              </article>
              <p v-if="classifications.length === 0" class="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 sm:col-span-2 lg:col-span-4">
                Nenhuma classificação registrada.
              </p>
            </div>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-950">Solicitações de resgate</h2>
                <p class="mt-1 text-sm text-gray-600">Acompanhe os resgates feitos no marketplace.</p>
              </div>
              <button class="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" type="button" @click="loadRequests">
                <i :class="requestsLoading ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-refresh'"></i>
                Atualizar
              </button>
            </div>

            <div class="mt-4 space-y-3">
              <article
                v-for="request in marketplaceRequests"
                :key="request.id"
                class="cursor-pointer rounded-lg border border-gray-200 p-4 transition hover:border-red-200 hover:bg-red-50/20"
                @click="selectedRequest = request"
              >
                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Solicitação #{{ request.id }}</p>
                    <h3 class="mt-1 text-base font-semibold text-gray-950">{{ request.catalogItemName || request.catalogItemId }}</h3>
                    <p class="mt-1 text-sm text-gray-600">{{ request.catalogItemPointsCost ?? '-' }} pontos · {{ formatDate(request.createdAt) }}</p>
                  </div>
                  <StatusBadge :status="request.requestStatus" />
                </div>
              </article>
              <p v-if="!requestsLoading && marketplaceRequests.length === 0" class="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                Nenhuma solicitação de resgate encontrada.
              </p>
            </div>
          </section>
        </div>

        <form class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm" @submit.prevent="updateUserInfo">
          <h2 class="text-lg font-semibold text-gray-950">Email e notificações</h2>
          <div class="mt-4 space-y-4">
            <label class="block text-sm font-medium text-gray-700">
              Email
              <input v-model.trim="formData.email" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required type="email" />
            </label>
            <label class="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input v-model="formData.notificacaoEmail" class="h-4 w-4 rounded border-gray-300 text-red-700" type="checkbox" />
              Receber notificações por email
            </label>
          </div>
          <div class="mt-5 flex flex-wrap gap-2">
            <button
              class="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:bg-gray-300"
              type="submit"
              :disabled="isSubmitting || !formChanged"
            >
              <i :class="isSubmitting ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-content-save-outline'"></i>
              Salvar alterações
            </button>
            <button class="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" type="button" @click="resetForm">
              Resetar
            </button>
          </div>
        </form>
      </section>

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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Notification from '@/components/Notification.vue'
import PointBalanceSummary from '@/components/shared/PointBalanceSummary.vue'
import RequestTimeline from '@/components/shared/RequestTimeline.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { marketplaceService } from '@/services/marketplaceService.js'
import { getUserData, updateUserData } from '@/services/userService.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const isSubmitting = ref(false)
const userData = ref(null)
const notification = ref(null)
const initialFormData = ref({})
const marketplaceRequests = ref([])
const requestsLoading = ref(false)
const selectedRequest = ref(null)
const formData = reactive({
  email: '',
  notificacaoEmail: false,
  authorized_notifications_apps: [],
})

const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem('unidadeDass') || '')
const registration = computed(() => userStore.matricula || sessionStorage.getItem('matricula') || '')
const userInitials = computed(() => {
  if (!userData.value?.nome) return '?'
  return userData.value.nome.split(' ').map((name) => name.charAt(0).toUpperCase()).slice(0, 2).join('')
})
const profileItems = computed(() => [
  { label: 'Matrícula', value: userData.value?.matricula },
  { label: 'Unidade Dass', value: dassOffice.value },
  { label: 'Setor', value: userData.value?.setor },
  { label: 'Função', value: userData.value?.funcao },
  { label: 'Gerente', value: userData.value?.gerente },
  { label: 'Email', value: userData.value?.email },
])
const classifications = computed(() => Object.entries(userData.value?.classificacoes_pense_aja || {})
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([label, value]) => ({ label, value })))
const totalIdeas = computed(() => classifications.value.reduce((total, item) => total + Number(item.value || 0), 0))
const formChanged = computed(() => {
  if (!initialFormData.value) return false
  return formData.email !== initialFormData.value.email ||
    formData.notificacaoEmail !== initialFormData.value.notificacaoEmail ||
    !areArraysEqual(formData.authorized_notifications_apps, initialFormData.value.authorized_notifications_apps)
})

watch(() => formData.notificacaoEmail, (enabled) => {
  const hasApp = formData.authorized_notifications_apps.includes('pense_aja')
  if (enabled && !hasApp) formData.authorized_notifications_apps.push('pense_aja')
  if (!enabled && hasApp) {
    formData.authorized_notifications_apps.splice(formData.authorized_notifications_apps.indexOf('pense_aja'), 1)
  }
})

const areArraysEqual = (left = [], right = []) => left.length === right.length && left.every((item, index) => item === right[index])

const formatDate = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

const syncForm = () => {
  formData.email = userData.value?.email || ''
  formData.notificacaoEmail = userData.value?.authorized_notifications_apps?.includes('pense_aja') || false
  formData.authorized_notifications_apps = [...(userData.value?.authorized_notifications_apps || [])]
  initialFormData.value = {
    email: formData.email,
    notificacaoEmail: formData.notificacaoEmail,
    authorized_notifications_apps: [...formData.authorized_notifications_apps],
  }
}

const loadUserData = async () => {
  if (!registration.value) {
    notification.value?.showPopup('error', 'Erro', 'Você não está logado. Por favor, faça login novamente.', 4000)
    setTimeout(() => {
      window.location.href = '/'
    }, 4100)
    return
  }

  await getUserData(registration.value, userData, null, notification)
  syncForm()
}

const loadRequests = async () => {
  if (!registration.value || !dassOffice.value) return
  requestsLoading.value = true
  try {
    const response = await marketplaceService.listMyRequests(dassOffice.value, { page: 1, limit: 5 })
    marketplaceRequests.value = response.data || []
  } catch (error) {
    notification.value?.showPopup('error', 'Erro', error.response?.data?.message || 'Não foi possível carregar solicitações de resgate.', 4000)
  } finally {
    requestsLoading.value = false
  }
}

const updateUserInfo = async () => {
  await updateUserData(userData.value, isSubmitting, notification, formData, dassOffice.value)
}

const resetForm = () => {
  syncForm()
}

onMounted(async () => {
  userStore.carregarUsuario()
  await userStore.loadSessionContext(dassOffice.value)
  await loadUserData()
  await loadRequests()
})
</script>
