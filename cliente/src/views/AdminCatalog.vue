<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <UnitRequiredState v-if="!dassOffice" />

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <Notification ref="notification" />

      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Administração</p>
          <h1 class="mt-1 text-2xl font-bold text-gray-950">Catálogo de recompensas</h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600">
            Gestão dos itens ativos do marketplace por unidade Dass.
          </p>
        </div>
      </header>

      <PermissionGate permission="catalog.manage">
        <section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-5 text-white">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div class="flex items-center gap-3">
                <span class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <i class="mdi mdi-storefront-edit text-2xl"></i>
                </span>
                <div>
                  <h2 class="text-xl font-bold">Gerenciar loja</h2>
                  <p class="text-sm text-white/80">Edite produtos e cadastre novas recompensas.</p>
                </div>
              </div>
              <button
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="creating || saving"
                @click="openAddProductDialog"
              >
                <i class="mdi mdi-plus"></i>
                Adicionar produto
              </button>
            </div>
          </div>

          <div class="space-y-6 bg-gray-50 p-5">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div class="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
                <i class="mdi mdi-package-variant text-gray-500"></i>
                <span>{{ editableCatalog.length }} produto(s)</span>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label class="flex min-w-full items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm sm:min-w-[320px]">
                  <i class="mdi mdi-magnify text-gray-400"></i>
                  <input
                    v-model="searchQuery"
                    class="w-full bg-transparent text-sm outline-none"
                    placeholder="Buscar produtos..."
                    type="search"
                  />
                </label>
                <ViewModeToggle v-model="viewMode" />
              </div>
            </div>

            <div v-if="loading" class="flex items-center justify-center gap-2 rounded-lg bg-white py-16 text-sm text-gray-600">
              <i class="mdi mdi-loading mdi-spin text-xl"></i>
              Carregando catálogo...
            </div>

            <div
              v-else-if="filteredEditableCatalog.length === 0"
              class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center text-gray-500"
            >
              <i class="mdi mdi-package-variant-closed text-6xl"></i>
              <h3 class="mt-3 text-lg font-semibold text-gray-800">Nenhum produto encontrado</h3>
              <p class="mt-1 text-sm">{{ searchQuery ? 'Tente uma busca diferente.' : 'Adicione produtos para começar.' }}</p>
            </div>

            <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="item in filteredEditableCatalog"
                :key="item.id"
                class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div class="relative flex h-48 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    v-if="item.imageUrl"
                    :src="item.imageUrl"
                    :alt="item.name"
                    class="max-h-32 max-w-40 object-contain drop-shadow-md"
                  />
                  <i v-else class="mdi mdi-image-off-outline text-6xl text-gray-400"></i>
                  <span class="absolute right-3 top-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs font-bold text-white shadow">
                    {{ item.pointsCost || 0 }} pts
                  </span>
                  <span
                    class="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold"
                    :class="item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ item.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>

                <div class="space-y-4 p-5">
                  <label class="block text-sm font-medium text-gray-700">
                    Nome do produto
                    <input
                      v-model.trim="item.name"
                      class="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome do produto"
                    />
                  </label>

                  <label class="block text-sm font-medium text-gray-700">
                    URL da imagem
                    <input
                      v-model.trim="item.imageUrl"
                      class="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </label>

                  <div class="grid gap-3 sm:grid-cols-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Pontos
                      <div class="relative mt-1">
                        <input
                          v-model.number="item.pointsCost"
                          class="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          min="1"
                          type="number"
                        />
                        <i class="mdi mdi-star absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500"></i>
                      </div>
                    </label>

                    <label class="block text-sm font-medium text-gray-700">
                      Estoque
                      <input
                        v-model.number="item.availableQuantity"
                        class="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="sob demanda"
                        type="number"
                      />
                    </label>
                  </div>

                  <div class="grid gap-3 sm:grid-cols-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Tipo
                      <select
                        v-model="item.itemType"
                        class="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="physical">Físico</option>
                        <option value="voucher">Voucher</option>
                      </select>
                    </label>

                    <label class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input v-model="item.active" class="h-4 w-4 rounded border-gray-300 text-indigo-600" type="checkbox" />
                      Produto ativo
                    </label>
                  </div>
                </div>
              </article>
            </div>

            <AdminDataTable v-else :columns="catalogColumns" :rows="filteredEditableCatalog" :loading="loading" empty-text="Nenhum produto encontrado.">
              <template #cell-name="{ row }">
                <input v-model.trim="row.name" class="min-w-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </template>
              <template #cell-imageUrl="{ row }">
                <input v-model.trim="row.imageUrl" class="min-w-[260px] rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="https://..." />
              </template>
              <template #cell-pointsCost="{ row }">
                <input v-model.number="row.pointsCost" class="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm" min="1" type="number" />
              </template>
              <template #cell-availableQuantity="{ row }">
                <input v-model.number="row.availableQuantity" class="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm" min="0" placeholder="sob demanda" type="number" />
              </template>
              <template #cell-itemType="{ row }">
                <select v-model="row.itemType" class="rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="physical">Físico</option>
                  <option value="voucher">Voucher</option>
                </select>
              </template>
              <template #cell-active="{ row }">
                <label class="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input v-model="row.active" class="h-4 w-4 rounded border-gray-300 text-indigo-600" type="checkbox" />
                  {{ row.active ? 'Ativo' : 'Inativo' }}
                </label>
              </template>
            </AdminDataTable>

            <div class="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-center">
              <button
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="saving"
                @click="resetEditableCatalog"
              >
                <i class="mdi mdi-restore"></i>
                Descartar alterações
              </button>
              <button
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                type="button"
                :disabled="saving || loading"
                @click="saveCatalogChanges"
              >
                <i :class="saving ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-content-save'"></i>
                Salvar alterações
              </button>
            </div>
          </div>
        </section>

        <v-dialog v-model="addProductDialog" max-width="640" persistent>
          <v-card class="overflow-hidden rounded-xl">
            <div class="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <i class="mdi mdi-plus text-xl"></i>
                  </span>
                  <div>
                    <h3 class="text-xl font-bold">Adicionar novo produto</h3>
                    <p class="text-sm text-white/80">Crie um item para a loja de recompensas.</p>
                  </div>
                </div>
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  color="white"
                  class="hover:bg-white/20"
                  @click="closeAddProductDialog"
                />
              </div>
            </div>

            <div class="space-y-5 p-6">
              <label class="block text-sm font-medium text-gray-700">
                Nome do produto
                <input
                  v-model.trim="newProduct.name"
                  class="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                  placeholder="Digite o nome do produto"
                />
              </label>

              <label class="block text-sm font-medium text-gray-700">
                Pontos necessários
                <div class="relative mt-1">
                  <input
                    v-model.number="newProduct.points"
                    class="w-full rounded-lg border border-gray-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                    min="1"
                    placeholder="Quantos pontos são necessários?"
                    type="number"
                  />
                  <i class="mdi mdi-star absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500"></i>
                </div>
              </label>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Imagem do item</label>
                <v-file-upload
                  max-files="1"
                  accept="image/*"
                  clearable
                  density="compact"
                  title="Arraste e solte a imagem"
                  variant="outlined"
                  class="rounded-lg border-2 border-dashed border-gray-300 transition hover:border-emerald-400"
                  prepend-icon="mdi-camera-plus"
                  @update:model-value="handleFileUpload"
                />
                <p v-if="selectedFileName" class="mt-2 text-xs font-medium text-emerald-700">
                  Arquivo selecionado: {{ selectedFileName }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 p-6">
              <button
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="creating"
                @click="closeAddProductDialog"
              >
                Cancelar
              </button>
              <button
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                type="button"
                :disabled="creating || !canCreateProduct"
                @click="createNewProduct"
              >
                <i :class="creating ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-plus'"></i>
                Cadastrar produto
              </button>
            </div>
          </v-card>
        </v-dialog>
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { VFileUpload } from 'vuetify/labs/VFileUpload'
import Notification from '@/components/Notification.vue'
import AdminDataTable from '@/components/shared/AdminDataTable.vue'
import PermissionGate from '@/components/shared/PermissionGate.vue'
import UnitRequiredState from '@/components/shared/UnitRequiredState.vue'
import ViewModeToggle from '@/components/shared/ViewModeToggle.vue'
import { usePersistedViewMode } from '@/composables/usePersistedViewMode.js'
import { marketplaceService } from '@/services/marketplaceService.js'
import { createProduct } from '@/services/storeService.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const catalog = ref([])
const editableCatalog = ref([])
const originalCatalog = ref([])
const loading = ref(false)
const saving = ref(false)
const creating = ref(false)
const searchQuery = ref('')
const viewMode = usePersistedViewMode('viewMode:adminCatalog', 'cards')
const addProductDialog = ref(false)
const selectedFiles = ref([])
const notification = ref(null)
const newProduct = reactive({
  name: '',
  points: 1,
})
const catalogColumns = [
  { key: 'name', label: 'Nome' },
  { key: 'imageUrl', label: 'Imagem' },
  { key: 'pointsCost', label: 'Pontos' },
  { key: 'availableQuantity', label: 'Estoque' },
  { key: 'itemType', label: 'Tipo' },
  { key: 'active', label: 'Status' },
]

const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem('unidadeDass') || '')
const selectedFileName = computed(() => selectedFiles.value[0]?.name || '')
const canCreateProduct = computed(() => (
  newProduct.name.trim().length > 0 &&
  Number(newProduct.points) > 0 &&
  selectedFiles.value.length > 0
))
const filteredEditableCatalog = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return editableCatalog.value
  return editableCatalog.value.filter((item) => item.name.toLowerCase().includes(query))
})

const clone = (value) => JSON.parse(JSON.stringify(value))

const showNotification = (type, title, message, time = 3000) => {
  notification.value?.showPopup(type, title, message, time)
}

const normalizeEditableItem = (item) => ({
  id: String(item.id),
  name: item.name || '',
  imageUrl: item.imageUrl || '',
  pointsCost: Number(item.pointsCost || 1),
  itemType: item.itemType || 'physical',
  active: item.active ?? true,
  availableQuantity:
    item.availableQuantity === null || item.availableQuantity === undefined
      ? null
      : Number(item.availableQuantity),
})

const toCatalogPayload = (item) => ({
  id: item.id,
  name: item.name.trim(),
  imageUrl: item.imageUrl?.trim() || null,
  pointsCost: Number(item.pointsCost),
  itemType: item.itemType || 'physical',
  active: Boolean(item.active),
  availableQuantity:
    item.availableQuantity === '' || item.availableQuantity === null || item.availableQuantity === undefined
      ? null
      : Number(item.availableQuantity),
})

const isSameItem = (left, right) => JSON.stringify(toCatalogPayload(left)) === JSON.stringify(toCatalogPayload(right))

const syncEditableCatalog = () => {
  const normalized = (catalog.value || []).map(normalizeEditableItem)
  editableCatalog.value = clone(normalized)
  originalCatalog.value = clone(normalized)
}

watch(catalog, syncEditableCatalog, { deep: true })

const resetNewProduct = () => {
  newProduct.name = ''
  newProduct.points = 1
  selectedFiles.value = []
}

const openAddProductDialog = () => {
  resetNewProduct()
  addProductDialog.value = true
}

const closeAddProductDialog = () => {
  if (creating.value) return
  addProductDialog.value = false
  resetNewProduct()
}

const validateCatalogItem = (item) => {
  if (!item.name.trim()) {
    return 'Nome do produto é obrigatório.'
  }
  if (!Number.isFinite(Number(item.pointsCost)) || Number(item.pointsCost) <= 0) {
    return 'Pontos do produto deve ser maior que zero.'
  }
  if (
    item.availableQuantity !== null &&
    item.availableQuantity !== '' &&
    item.availableQuantity !== undefined &&
    Number(item.availableQuantity) < 0
  ) {
    return 'Estoque não pode ser negativo.'
  }
  return ''
}

const resetEditableCatalog = () => {
  editableCatalog.value = clone(originalCatalog.value)
  showNotification('info', 'Info!', 'Alterações descartadas.')
}

const loadCatalog = async () => {
  if (!dassOffice.value) return
  loading.value = true
  try {
    catalog.value = await marketplaceService.listCatalog(dassOffice.value)
  } catch (error) {
    showNotification('error', 'Erro!', error.response?.data?.message || 'Não foi possível carregar o catálogo.')
  } finally {
    loading.value = false
  }
}

const handleFileUpload = (value) => {
  const file = Array.isArray(value) ? value[0] : value

  if (!file) {
    selectedFiles.value = []
    return
  }

  if (!file.type?.startsWith('image/')) {
    selectedFiles.value = []
    showNotification('warning', 'Aviso!', 'Por favor, selecione apenas arquivos de imagem.')
    return
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    selectedFiles.value = []
    showNotification('warning', 'Aviso!', 'A imagem deve ter no máximo 5MB.')
    return
  }

  selectedFiles.value = [file]
}

const createNewProduct = async () => {
  if (!canCreateProduct.value) {
    showNotification('warning', 'Aviso!', 'Preencha nome, pontos e imagem do produto.')
    return
  }

  if (!userStore.usuario && !userStore.matricula) {
    showNotification('error', 'Erro!', 'Você precisa estar logado para adicionar produtos.')
    return
  }

  creating.value = true
  try {
    await createProduct(
      {
        name: newProduct.name.trim(),
        points: Number(newProduct.points),
        user: userStore.usuario || userStore.matricula,
      },
      selectedFiles.value,
      dassOffice.value
    )
    showNotification('success', 'Sucesso!', 'Produto enfileirado para processamento.')
    addProductDialog.value = false
    resetNewProduct()
    await loadCatalog()
  } catch (error) {
    showNotification('error', 'Erro!', error.message || 'Não foi possível criar o produto.')
  } finally {
    creating.value = false
  }
}

const saveCatalogChanges = async () => {
  const changedItems = editableCatalog.value.filter((item) => {
    const original = originalCatalog.value.find((candidate) => candidate.id === item.id)
    return original && !isSameItem(item, original)
  })

  if (!changedItems.length) {
    showNotification('info', 'Info!', 'Nenhuma alteração de produtos foi detectada.')
    return
  }

  const invalidMessage = changedItems.map(validateCatalogItem).find(Boolean)
  if (invalidMessage) {
    showNotification('warning', 'Aviso!', invalidMessage)
    return
  }

  saving.value = true
  try {
    await marketplaceService.upsertCatalog(dassOffice.value, changedItems.map(toCatalogPayload))
    showNotification('success', 'Sucesso!', `${changedItems.length} produto(s) editado(s) com sucesso.`)
    await loadCatalog()
  } catch (error) {
    showNotification('error', 'Erro!', error.response?.data?.message || 'Não foi possível salvar as alterações.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  userStore.carregarUsuario()
  await userStore.loadSessionContext(dassOffice.value)
  await loadCatalog()
})
</script>
