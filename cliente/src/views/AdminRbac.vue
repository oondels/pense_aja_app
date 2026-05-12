<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <UnitRequiredState v-if="!dassOffice" />

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <header>
        <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Administração</p>
        <h1 class="mt-1 text-2xl font-bold text-gray-950">Permissões e papéis</h1>
        <p class="mt-2 max-w-2xl text-sm text-gray-600">
          Vínculos RBAC por matrícula e unidade, com invalidação de snapshot pelo backend.
        </p>
      </header>

      <PermissionGate permission="rbac.manage">
        <form class="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-6" @submit.prevent="saveAssignment">
          <input v-model="form.registration" class="rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Matrícula" required />
          <select v-model="form.roleCode" class="rounded-md border border-gray-300 px-3 py-2 text-sm" required>
            <option value="" disabled>Papel</option>
            <option v-for="role in roles" :key="role.code" :value="role.code">{{ role.nome }}</option>
          </select>
          <input v-model="form.activeFrom" class="rounded-md border border-gray-300 px-3 py-2 text-sm" type="date" />
          <input v-model="form.activeUntil" class="rounded-md border border-gray-300 px-3 py-2 text-sm" type="date" />
          <label class="inline-flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.active" class="h-4 w-4 rounded border-gray-300 text-red-700" type="checkbox" />
            Ativo
          </label>
          <button class="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800" type="submit">
            <i class="mdi mdi-account-key-outline"></i>
            {{ form.id ? 'Salvar' : 'Criar vínculo' }}
          </button>
        </form>

        <AdminDataTable :columns="columns" :rows="assignments" :loading="loading" empty-text="Nenhum vínculo encontrado.">
          <template #cell-active="{ value }">
            <span class="font-semibold" :class="value ? 'text-green-700' : 'text-gray-500'">{{ value ? 'Ativo' : 'Inativo' }}</span>
          </template>
          <template #cell-activeFrom="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-activeUntil="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #actions="{ row }">
            <div class="flex justify-end gap-2">
              <button class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50" type="button" @click="editAssignment(row)">
                Editar
              </button>
              <button class="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50" type="button" @click="removeAssignment(row)">
                Remover
              </button>
            </div>
          </template>
        </AdminDataTable>
      </PermissionGate>

      <PermissionGate permission="rbac.manage">
        <template #fallback>
          <section class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            É necessário ter permissão de RBAC para administrar papéis.
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
import { rbacService } from '@/services/rbacService.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const roles = ref([])
const assignments = ref([])
const loading = ref(false)
const form = reactive({
  id: null,
  registration: '',
  roleCode: '',
  active: true,
  activeFrom: '',
  activeUntil: '',
})

const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem('unidadeDass') || '')
const columns = [
  { key: 'registration', label: 'Matrícula' },
  { key: 'dassOffice', label: 'Unidade' },
  { key: 'roleName', label: 'Papel' },
  { key: 'roleCode', label: 'Código' },
  { key: 'active', label: 'Status' },
  { key: 'activeFrom', label: 'Início' },
  { key: 'activeUntil', label: 'Fim' },
]

const toInputDate = (value) => {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value))
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    registration: '',
    roleCode: '',
    active: true,
    activeFrom: '',
    activeUntil: '',
  })
}

const loadRbac = async () => {
  if (!dassOffice.value || !userStore.hasPermission('rbac.manage')) return
  loading.value = true
  try {
    const [roleList, assignmentList] = await Promise.all([
      rbacService.listRoles(dassOffice.value),
      rbacService.listAssignments({ dassOffice: dassOffice.value }),
    ])
    roles.value = roleList
    assignments.value = assignmentList
  } finally {
    loading.value = false
  }
}

const editAssignment = (assignment) => {
  Object.assign(form, {
    id: assignment.id,
    registration: assignment.registration,
    roleCode: assignment.roleCode,
    active: assignment.active,
    activeFrom: toInputDate(assignment.activeFrom),
    activeUntil: toInputDate(assignment.activeUntil),
  })
}

const saveAssignment = async () => {
  const payload = {
    registration: form.registration,
    dassOffice: dassOffice.value,
    roleCode: form.roleCode,
    active: form.active,
    activeFrom: form.activeFrom || null,
    activeUntil: form.activeUntil || null,
  }

  if (form.id) {
    await rbacService.updateAssignment(form.id, payload)
  } else {
    await rbacService.createAssignment(payload)
  }

  resetForm()
  await loadRbac()
}

const removeAssignment = async (assignment) => {
  const confirmed = window.confirm(`Remover vínculo ${assignment.roleName} da matrícula ${assignment.registration}?`)
  if (!confirmed) return
  await rbacService.deleteAssignment(assignment.id, dassOffice.value)
  await loadRbac()
}

onMounted(async () => {
  userStore.carregarUsuario()
  await userStore.loadSessionContext(dassOffice.value)
  await loadRbac()
})
</script>
