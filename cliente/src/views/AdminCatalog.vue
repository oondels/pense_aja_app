<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <UnitRequiredState v-if="!dassOffice" />

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <header>
        <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Administração</p>
        <h1 class="mt-1 text-2xl font-bold text-gray-950">Catálogo de recompensas</h1>
        <p class="mt-2 max-w-2xl text-sm text-gray-600">
          Gestão dos itens ativos do marketplace por unidade Dass.
        </p>
      </header>

      <PermissionGate permission="catalog.manage">
        <form class="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-6" @submit.prevent="saveItem">
          <input v-model="form.name" class="rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-2" placeholder="Nome" required />
          <input v-model="form.imageUrl" class="rounded-md border border-gray-300 px-3 py-2 text-sm md:col-span-2" placeholder="URL da imagem" />
          <input v-model.number="form.pointsCost" class="rounded-md border border-gray-300 px-3 py-2 text-sm" min="1" placeholder="Pontos" required type="number" />
          <input v-model.number="form.availableQuantity" class="rounded-md border border-gray-300 px-3 py-2 text-sm" min="0" placeholder="Estoque" type="number" />
          <select v-model="form.itemType" class="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="physical">Físico</option>
            <option value="voucher">Voucher</option>
          </select>
          <label class="inline-flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.active" class="h-4 w-4 rounded border-gray-300 text-red-700" type="checkbox" />
            Ativo
          </label>
          <button class="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 md:col-span-2" type="submit">
            <i class="mdi mdi-content-save-outline"></i>
            {{ form.id ? 'Salvar item' : 'Adicionar item' }}
          </button>
          <button class="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" type="button" @click="resetForm">
            <i class="mdi mdi-plus-circle-outline"></i>
            Novo
          </button>
        </form>

        <AdminDataTable :columns="columns" :rows="catalog" :loading="loading" empty-text="Nenhum item cadastrado.">
          <template #cell-active="{ value }">
            <span class="font-semibold" :class="value ? 'text-green-700' : 'text-gray-500'">{{ value ? 'Ativo' : 'Inativo' }}</span>
          </template>
          <template #cell-imageUrl="{ value }">
            <span class="inline-block max-w-48 truncate">{{ value || '-' }}</span>
          </template>
          <template #actions="{ row }">
            <button class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50" type="button" @click="editItem(row)">
              Editar
            </button>
          </template>
        </AdminDataTable>
      </PermissionGate>

      <PermissionGate permission="catalog.manage">
        <template #fallback>
          <section class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            É necessário ter permissão de catálogo para alterar recompensas.
          </section>
        </template>
      </PermissionGate>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AdminDataTable from '@/components/shared/AdminDataTable.vue'
import PermissionGate from '@/components/shared/PermissionGate.vue'
import UnitRequiredState from '@/components/shared/UnitRequiredState.vue'
import { marketplaceService } from '@/services/marketplaceService.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const catalog = ref([])
const loading = ref(false)
const form = reactive({
  id: '',
  name: '',
  imageUrl: '',
  pointsCost: 1,
  itemType: 'physical',
  active: true,
  availableQuantity: null,
})

const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem('unidadeDass') || '')
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nome' },
  { key: 'pointsCost', label: 'Pontos' },
  { key: 'itemType', label: 'Tipo' },
  { key: 'availableQuantity', label: 'Estoque' },
  { key: 'active', label: 'Status' },
  { key: 'imageUrl', label: 'Imagem' },
]

const resetForm = () => {
  Object.assign(form, {
    id: '',
    name: '',
    imageUrl: '',
    pointsCost: 1,
    itemType: 'physical',
    active: true,
    availableQuantity: null,
  })
}

const loadCatalog = async () => {
  if (!dassOffice.value) return
  loading.value = true
  try {
    catalog.value = await marketplaceService.listCatalog(dassOffice.value)
  } finally {
    loading.value = false
  }
}

const editItem = (item) => {
  Object.assign(form, {
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl || '',
    pointsCost: item.pointsCost,
    itemType: item.itemType || 'physical',
    active: item.active,
    availableQuantity: item.availableQuantity,
  })
}

const saveItem = async () => {
  const payload = {
    ...form,
    imageUrl: form.imageUrl || null,
    availableQuantity: form.availableQuantity === '' ? null : form.availableQuantity,
  }
  if (!payload.id) delete payload.id
  await marketplaceService.upsertCatalog(dassOffice.value, [payload])
  resetForm()
  await loadCatalog()
}

onMounted(async () => {
  userStore.carregarUsuario()
  await userStore.loadSessionContext(dassOffice.value)
  await loadCatalog()
})
</script>
