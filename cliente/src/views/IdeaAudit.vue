<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <UnitRequiredState v-if="!dassOffice" />

    <div v-else class="mx-auto max-w-5xl space-y-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Auditoria</p>
          <h1 class="mt-1 text-2xl font-bold text-gray-950">Timeline da ideia #{{ ideaId }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600">
            Eventos auditáveis registrados para criação, avaliação e mudanças relevantes.
          </p>
        </div>
        <router-link
          class="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          :to="`/pense-aja/${ideaId}`"
        >
          <i class="mdi mdi-lightbulb-on-outline"></i>
          Ver ideia
        </router-link>
      </header>

      <PermissionGate :any="['idea.evaluate', 'idea.exclude']">
        <div v-if="loading" class="flex items-center justify-center gap-2 rounded-lg bg-white py-12 text-gray-600">
          <i class="mdi mdi-loading mdi-spin text-xl"></i>
          Carregando auditoria...
        </div>
        <AuditTimeline v-else :events="events" />
      </PermissionGate>

      <PermissionGate :any="['idea.evaluate', 'idea.exclude']">
        <template #fallback>
          <section class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            É necessário ter permissão de avaliação ou exclusão para visualizar auditoria de ideias.
          </section>
        </template>
      </PermissionGate>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AuditTimeline from '@/components/shared/AuditTimeline.vue'
import PermissionGate from '@/components/shared/PermissionGate.vue'
import UnitRequiredState from '@/components/shared/UnitRequiredState.vue'
import { ideaService } from '@/services/ideaService.js'
import { useUserStore } from '@/stores/userStore.js'

const route = useRoute()
const userStore = useUserStore()
const events = ref([])
const loading = ref(false)

const ideaId = computed(() => route.params.id)
const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem('unidadeDass') || '')

const loadAudit = async () => {
  if (!dassOffice.value || !userStore.hasAnyPermission(['idea.evaluate', 'idea.exclude'])) return
  loading.value = true
  try {
    events.value = await ideaService.getIdeaAudit(dassOffice.value, ideaId.value)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  userStore.carregarUsuario()
  await userStore.loadSessionContext(dassOffice.value)
  await loadAudit()
})
</script>
