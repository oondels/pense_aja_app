<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <UnitRequiredState v-if="!dassOffice" />

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Configurações</p>
          <h1 class="mt-1 text-2xl font-bold text-gray-950">Fluxo da unidade {{ dassOffice }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600">
            Pontuação, workflow e políticas operacionais que controlam a experiência da unidade.
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:bg-gray-300"
          type="button"
          :disabled="saving || !userStore.hasPermission('unit.config.manage')"
          @click="saveSettings"
        >
          <i :class="saving ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-content-save-outline'"></i>
          Salvar configurações
        </button>
      </header>

      <PermissionGate permission="unit.config.manage">
        <nav class="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
            :class="activeTab === tab.key ? 'bg-red-700 text-white' : 'text-gray-700 hover:bg-gray-100'"
            type="button"
            @click="activeTab = tab.key"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </nav>

        <section v-if="loading" class="rounded-lg bg-white p-10 text-center text-sm text-gray-600">
          <i class="mdi mdi-loading mdi-spin text-xl"></i>
          Carregando configurações...
        </section>

        <section v-else-if="activeTab === 'scoring'" class="space-y-4">
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold text-gray-950">Classificações e pontos</h2>
              <button class="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" type="button" @click="addScoringRule">
                <i class="mdi mdi-plus"></i>
                Adicionar
              </button>
            </div>

            <div class="mt-4 space-y-3">
              <article v-for="(rule, index) in settings.scoringRules" :key="rule.id || index" class="grid gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-7">
                <input v-model="rule.classification" class="rounded-md border border-gray-300 px-3 py-2 text-sm uppercase" maxlength="3" placeholder="A" />
                <input v-model="rule.label" class="rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-2" placeholder="Rótulo" />
                <input v-model="rule.description" class="rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-2" placeholder="Descrição" />
                <input v-model.number="rule.score" class="rounded-md border border-gray-300 px-3 py-2 text-sm" min="1" type="number" />
                <input v-model.number="rule.displayOrder" class="rounded-md border border-gray-300 px-3 py-2 text-sm" min="1" type="number" />
                <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input v-model="rule.active" class="h-4 w-4 rounded border-gray-300 text-red-700" type="checkbox" />
                  Ativa
                </label>
                <button class="justify-self-start rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 md:col-span-2" type="button" @click="deactivateRule(rule)">
                  Desativar
                </button>
              </article>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'workflow'" class="space-y-4">
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold text-gray-950">Etapas de avaliação</h2>
              <button class="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" type="button" @click="addWorkflowStep">
                <i class="mdi mdi-plus"></i>
                Adicionar
              </button>
            </div>

            <div class="mt-4 space-y-3">
              <article v-for="(step, index) in settings.workflowSteps" :key="step.id || index" class="grid gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-6">
                <input v-model="step.stepCode" class="rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="analyst_review" />
                <input v-model.number="step.stepOrder" class="rounded-md border border-gray-300 px-3 py-2 text-sm" min="1" type="number" />
                <input v-model="step.requiredPermission" class="rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-2" placeholder="idea.evaluate" />
                <select v-model="step.metadata.reviewSlot" class="rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="analista">Analista</option>
                  <option value="gerente">Gerente</option>
                </select>
                <input v-model="step.terminalStatus" class="rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="concluded" />
                <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input v-model="step.active" class="h-4 w-4 rounded border-gray-300 text-red-700" type="checkbox" />
                  Ativa
                </label>
              </article>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'marketplace'" class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-950">Política de marketplace</h2>
          <div class="mt-4 grid gap-3 md:grid-cols-3">
            <label class="inline-flex items-center gap-2 text-sm text-gray-700">
              <input v-model="settings.marketplacePolicy.allowRefundAfterCommit" class="h-4 w-4 rounded border-gray-300 text-red-700" type="checkbox" />
              Permitir estorno após commit
            </label>
            <label class="text-sm font-medium text-gray-700">
              Adapter de voucher
              <input v-model="settings.marketplacePolicy.voucherAdapter" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="noop" />
            </label>
            <label class="inline-flex items-center gap-2 text-sm text-gray-700">
              <input v-model="settings.marketplacePolicy.active" class="h-4 w-4 rounded border-gray-300 text-red-700" type="checkbox" />
              Política ativa
            </label>
          </div>
        </section>

        <section v-else class="grid gap-4 md:grid-cols-2">
          <article class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-950">Catálogo</h2>
            <p class="mt-2 text-sm text-gray-600">Gerencie itens, pontos e disponibilidade do marketplace da unidade.</p>
            <router-link class="mt-4 inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800" to="/admin/catalog">
              <i class="mdi mdi-store-edit-outline"></i>
              Abrir catálogo
            </router-link>
          </article>
          <article class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-950">RBAC</h2>
            <p class="mt-2 text-sm text-gray-600">Gerencie vínculos de usuário, unidade e papéis administrativos.</p>
            <router-link class="mt-4 inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800" to="/admin/rbac">
              <i class="mdi mdi-account-key-outline"></i>
              Abrir RBAC
            </router-link>
          </article>
        </section>

        <p v-if="feedback" class="rounded-md border px-4 py-3 text-sm" :class="feedbackClass">{{ feedback }}</p>
      </PermissionGate>

      <PermissionGate permission="unit.config.manage">
        <template #fallback>
          <section class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            É necessário ter permissão de configuração da unidade.
          </section>
        </template>
      </PermissionGate>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PermissionGate from '@/components/shared/PermissionGate.vue'
import UnitRequiredState from '@/components/shared/UnitRequiredState.vue'
import { unitSettingsService } from '@/services/unitSettingsService.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const feedback = ref('')
const feedbackType = ref('success')
const activeTab = ref('scoring')
const settings = reactive({
  active: true,
  metadata: {},
  scoringRules: [],
  workflowSteps: [],
  marketplacePolicy: {
    allowRefundAfterCommit: true,
    voucherAdapter: 'noop',
    active: true,
    metadata: {},
  },
})

const tabs = [
  { key: 'scoring', label: 'Avaliação e pontuação', icon: 'mdi mdi-star-settings-outline' },
  { key: 'workflow', label: 'Workflow', icon: 'mdi mdi-source-branch' },
  { key: 'marketplace', label: 'Marketplace', icon: 'mdi mdi-store-cog-outline' },
  { key: 'operations', label: 'Catálogo e RBAC', icon: 'mdi mdi-tune-variant' },
]

const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem('unidadeDass') || '')
const feedbackClass = computed(() => (
  feedbackType.value === 'success'
    ? 'border-green-200 bg-green-50 text-green-800'
    : 'border-red-200 bg-red-50 text-red-800'
))

const normalizeSettings = (data) => {
  settings.active = data.active ?? true
  settings.metadata = data.metadata || {}
  settings.scoringRules = (data.scoringRules || []).map((rule, index) => ({
    ...rule,
    label: rule.label || rule.classification,
    description: rule.description || '',
    displayOrder: rule.displayOrder || index + 1,
    active: rule.active ?? true,
  }))
  settings.workflowSteps = (data.workflowSteps || []).map((step) => ({
    ...step,
    terminalStatus: step.terminalStatus || '',
    active: step.active ?? true,
    metadata: {
      ...(step.metadata || {}),
      reviewSlot: step.metadata?.reviewSlot || (step.stepCode?.includes('manager') ? 'gerente' : 'analista'),
    },
  }))
  settings.marketplacePolicy = {
    allowRefundAfterCommit: data.marketplacePolicy?.allowRefundAfterCommit ?? true,
    voucherAdapter: data.marketplacePolicy?.voucherAdapter || 'noop',
    active: data.marketplacePolicy?.active ?? true,
    metadata: data.marketplacePolicy?.metadata || {},
  }
}

const loadSettings = async () => {
  if (!dassOffice.value || !userStore.hasPermission('unit.config.manage')) return
  loading.value = true
  feedback.value = ''
  try {
    normalizeSettings(await unitSettingsService.getSettings(dassOffice.value))
  } catch (error) {
    feedbackType.value = 'error'
    feedback.value = error.response?.data?.message || 'Não foi possível carregar configurações.'
  } finally {
    loading.value = false
  }
}

const addScoringRule = () => {
  const nextIndex = settings.scoringRules.length
  settings.scoringRules.push({
    classification: String.fromCharCode(65 + nextIndex),
    label: String.fromCharCode(65 + nextIndex),
    description: '',
    score: Math.max(1, settings.scoringRules.length + 1),
    displayOrder: nextIndex + 1,
    active: true,
    metadata: {},
  })
}

const deactivateRule = (rule) => {
  rule.active = false
}

const addWorkflowStep = () => {
  settings.workflowSteps.push({
    stepCode: `step_${settings.workflowSteps.length + 1}`,
    stepOrder: settings.workflowSteps.length + 1,
    requiredPermission: 'idea.evaluate',
    terminalStatus: '',
    active: true,
    metadata: { reviewSlot: 'analista' },
  })
}

const saveSettings = async () => {
  saving.value = true
  feedback.value = ''
  try {
    const updated = await unitSettingsService.updateSettings(dassOffice.value, settings)
    normalizeSettings(updated)
    userStore.unitConfig = updated
    localStorage.setItem(`unitConfig:${dassOffice.value}`, JSON.stringify(updated))
    feedbackType.value = 'success'
    feedback.value = 'Configurações salvas com sucesso.'
  } catch (error) {
    feedbackType.value = 'error'
    feedback.value = error.response?.data?.message || 'Não foi possível salvar configurações.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  userStore.carregarUsuario()
  await userStore.loadSessionContext(dassOffice.value)
  await loadSettings()
})
</script>
