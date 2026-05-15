<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <UnitRequiredState v-if="!dassOffice" />

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Administração</p>
          <h1 class="mt-1 text-2xl font-bold text-gray-950">Permissões e papéis</h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600">
            Vínculos RBAC por matrícula e unidade, com escopo validado pelo backend.
          </p>
        </div>
        <ViewModeToggle v-model="viewMode" />
      </header>

      <PermissionGate permission="rbac.manage">
        <form
          class="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-6"
          @submit.prevent="saveAssignment"
        >
          <v-text-field v-model="form.registration" required label="Matrícula" variant="outlined"></v-text-field>

          <v-select
            v-if="userStore.isAdminMaster"
            v-model="form.dassOffice"
            :disabled="Boolean(form.id)"
            required
            :items="dassOffices"
            variant="outlined"
            label="Unidade Dass"
          >
          </v-select>

          <v-select
            v-if="form.id"
            multiple
            :items="roles"
            v-model="form.roleCode"
            item-title="nome"
            item-value="id"
            variant="outlined"
            required
            label="Nível de Permissão"
          ></v-select>

          <v-select
            v-else
            :items="roles"
            v-model="form.roleCodes"
            item-title="nome"
            item-value="id"
            multiple
            variant="outlined"
            label="Nível de Permissão"
            required
          >
          </v-select>

          <v-text-field type="date" variant="outlined" v-model="form.activeFrom" label="Data inicial"></v-text-field>
          <v-text-field type="date" variant="outlined" v-model="form.activeUntil" label="Expira em"></v-text-field>

          <label class="inline-flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.active" class="h-4 w-4 rounded border-gray-300 text-red-700" type="checkbox" />
            Ativo
          </label>
          <button
            class="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            type="submit"
          >
            <i class="mdi mdi-account-key-outline"></i>
            {{ form.id ? "Salvar" : "Criar vínculo" }}
          </button>
        </form>

        <section class="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-5">
          <input
            v-model.trim="filters.search"
            class="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Buscar"
            @keyup.enter="loadRbac"
          />
          <input
            v-model.trim="filters.registration"
            class="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Matrícula"
            @keyup.enter="loadRbac"
          />
          <select v-model="filters.roleCode" class="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">Todos os papéis</option>
            <option v-for="role in roles" :key="role.code" :value="role.code">{{ role.nome }}</option>
          </select>
          <select v-model="filters.active" class="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">Todos os status</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
          <select
            v-if="userStore.isAdminMaster"
            v-model="filters.dassOffice"
            class="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todas as unidades</option>
            <option v-for="office in dassOffices" :key="office" :value="office">{{ office }}</option>
          </select>
          <div class="flex gap-2 md:col-span-5">
            <button
              class="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              type="button"
              @click="loadRbac"
            >
              <i class="mdi mdi-magnify"></i>
              Filtrar
            </button>
            <button
              class="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              type="button"
              @click="clearFilters"
            >
              <i class="mdi mdi-filter-remove-outline"></i>
              Limpar
            </button>
          </div>
        </section>

        <AdminDataTable
          v-if="viewMode === 'list'"
          :columns="columns"
          :rows="assignments"
          :loading="loading"
          empty-text="Nenhum vínculo encontrado."
        >
          <template #cell-active="{ value }">
            <span class="font-semibold" :class="value ? 'text-green-700' : 'text-gray-500'">{{
              value ? "Ativo" : "Inativo"
            }}</span>
          </template>
          <template #cell-activeFrom="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-activeUntil="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #actions="{ row }">
            <div class="flex justify-end gap-2">
              <button
                class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                type="button"
                @click="editAssignment(row)"
              >
                Editar
              </button>
              <button
                class="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                type="button"
                @click="removeAssignment(row)"
              >
                Remover
              </button>
            </div>
          </template>
        </AdminDataTable>

        <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="assignment in assignments"
            :key="assignment.id"
            class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {{ assignment.registration }} · {{ assignment.dassOffice }}
                </p>
                <h2 class="mt-1 text-base font-semibold text-gray-950">{{ assignment.roleName }}</h2>
                <p class="mt-1 text-sm text-gray-600">{{ assignment.roleCode }}</p>
              </div>
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="
                  assignment.active
                    ? 'bg-green-50 text-green-800 ring-1 ring-green-200'
                    : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
                "
              >
                {{ assignment.active ? "Ativo" : "Inativo" }}
              </span>
            </div>
            <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-xs font-medium text-gray-500">Início</dt>
                <dd class="font-medium text-gray-800">{{ formatDate(assignment.activeFrom) }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Fim</dt>
                <dd class="font-medium text-gray-800">{{ formatDate(assignment.activeUntil) }}</dd>
              </div>
            </dl>
            <div class="mt-4 flex justify-end gap-2">
              <button
                class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                type="button"
                @click="editAssignment(assignment)"
              >
                Editar
              </button>
              <button
                class="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                type="button"
                @click="removeAssignment(assignment)"
              >
                Remover
              </button>
            </div>
          </article>
          <div
            v-if="!loading && assignments.length === 0"
            class="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 md:col-span-2 xl:col-span-3"
          >
            Nenhum vínculo encontrado.
          </div>
        </section>
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
import { computed, onMounted, reactive, ref } from "vue";
import AdminDataTable from "@/components/shared/AdminDataTable.vue";
import PermissionGate from "@/components/shared/PermissionGate.vue";
import UnitRequiredState from "@/components/shared/UnitRequiredState.vue";
import ViewModeToggle from "@/components/shared/ViewModeToggle.vue";
import { usePersistedViewMode } from "@/composables/usePersistedViewMode.js";
import { rbacService } from "@/services/rbacService.js";
import { useUserStore } from "@/stores/userStore.js";

const userStore = useUserStore();
const roles = ref([]);
const assignments = ref([]);
const loading = ref(false);
const viewMode = usePersistedViewMode("viewMode:adminRbac");
const dassOffices = ["SEST", "VDC", "ITB", "VDC-CONF", "STJ"];
const form = reactive({
  id: null,
  registration: "",
  dassOffice: "",
  roleCode: "",
  roleCodes: [],
  active: true,
  activeFrom: "",
  activeUntil: "",
});
const filters = reactive({
  search: "",
  registration: "",
  roleCode: "",
  active: "",
  dassOffice: "",
});

const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem("unidadeDass") || "");
const columns = [
  { key: "registration", label: "Matrícula" },
  { key: "dassOffice", label: "Unidade" },
  { key: "roleName", label: "Papel" },
  { key: "roleCode", label: "Código" },
  { key: "active", label: "Status" },
  { key: "activeFrom", label: "Início" },
  { key: "activeUntil", label: "Fim" },
];

const toInputDate = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
};

const resetForm = () => {
  Object.assign(form, {
    id: null,
    registration: "",
    dassOffice: userStore.isAdminMaster ? filters.dassOffice : "",
    roleCode: "",
    roleCodes: [],
    active: true,
    activeFrom: "",
    activeUntil: "",
  });
};

const buildFilters = () => ({
  search: filters.search || undefined,
  registration: filters.registration || undefined,
  roleCode: filters.roleCode || undefined,
  active: filters.active || undefined,
  dassOffice: userStore.isAdminMaster ? filters.dassOffice || undefined : dassOffice.value,
});

const loadRbac = async () => {
  if (!dassOffice.value || !userStore.hasPermission("rbac.manage")) return;
  loading.value = true;
  try {
    const [roleList, assignmentList] = await Promise.all([
      rbacService.listRoles(dassOffice.value),
      rbacService.listAssignments(buildFilters()),
    ]);
    roles.value = roleList;
    assignments.value = assignmentList;
  } finally {
    loading.value = false;
  }
};

const editAssignment = (assignment) => {
  Object.assign(form, {
    id: assignment.id,
    registration: assignment.registration,
    dassOffice: assignment.dassOffice,
    roleCode: assignment.roleCode,
    roleCodes: [assignment.roleCode],
    active: assignment.active,
    activeFrom: toInputDate(assignment.activeFrom),
    activeUntil: toInputDate(assignment.activeUntil),
  });
};

const saveAssignment = async () => {
  const payload = {
    registration: form.registration,
    dassOffice: userStore.isAdminMaster ? form.dassOffice : dassOffice.value,
    roleCodes: form.roleCodes,
    active: form.active,
    activeFrom: form.activeFrom || null,
    activeUntil: form.activeUntil || null,
  };

  if (form.id) {
    await rbacService.updateAssignment(form.id, {
      roleCode: form.roleCode,
      active: form.active,
      activeFrom: form.activeFrom || null,
      activeUntil: form.activeUntil || null,
    });
  } else {
    await rbacService.createAssignment(payload);
  }

  resetForm();
  await loadRbac();
};

const removeAssignment = async (assignment) => {
  const confirmed = window.confirm(`Remover vínculo ${assignment.roleName} da matrícula ${assignment.registration}?`);
  if (!confirmed) return;
  await rbacService.deleteAssignment(assignment.id);
  await loadRbac();
};

const clearFilters = async () => {
  Object.assign(filters, {
    search: "",
    registration: "",
    roleCode: "",
    active: "",
    dassOffice: "",
  });
  await loadRbac();
};

onMounted(async () => {
  userStore.carregarUsuario();
  await userStore.loadSessionContext(dassOffice.value);
  await loadRbac();
});
</script>
