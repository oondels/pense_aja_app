<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <UnitRequiredState v-if="!dassOffice" />

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Marketplace</p>
          <h1 class="mt-1 text-2xl font-bold text-gray-950">Resgate de recompensas</h1>
          <p class="mt-2 max-w-2xl text-sm text-gray-600">
            Catálogo ativo da unidade {{ dassOffice }} com reserva transacional de pontos.
          </p>
        </div>
        <router-link
          class="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          to="/user/points-history"
        >
          <i class="mdi mdi-history"></i>
          Histórico de pontos
        </router-link>
      </header>

      <div>
        <span>Matrícula:</span>
        <v-text-field placeholder="Digite sua matrícula" v-model="matriculaUser" @keyup.enter="handleUserData($event, false)"></v-text-field>
        <v-btn v-if="Object.keys(userData).length <= 0" @click="handleUserData($event, true)">Buscar</v-btn>

        <!-- User Info -->
        <div v-if="Object.keys(userData).length > 0" class="mb-6">
          <div class="flex items-center bg-white rounded-lg shadow p-4 space-x-4">
            <i class="bi bi-person-circle text-primary text-4xl"></i>
            <div class="space-y-1">
              <p id="nomeLoja" class="text-sm text-gray-700">Nome: {{ userData?.nome }}</p>
              <p id="setorLoja" class="text-sm text-gray-700">Setor: {{ userData?.setor }}</p>
              <p id="gerenteLoja" class="text-sm text-gray-700">Gerente: {{ userData?.gerente }}</p>
            </div>
          </div>
        </div>
      </div>

      <PointBalanceSummary :user-data="userData" />

      <div v-if="loading" class="flex items-center justify-center gap-2 rounded-lg bg-white py-12 text-gray-600">
        <i class="mdi mdi-loading mdi-spin text-xl"></i>
        Carregando catálogo...
      </div>

      <section v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in catalog"
          :key="item.id"
          class="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div class="flex aspect-[16/10] items-center justify-center bg-gray-100">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="h-full w-full object-cover" />
            <i v-else class="mdi mdi-gift-outline text-5xl text-gray-400"></i>
          </div>

          <div class="flex flex-1 flex-col gap-4 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-base font-semibold text-gray-950">{{ item.name }}</h2>
                <p class="mt-1 text-xs uppercase tracking-wide text-gray-500">{{ item.itemType || "physical" }}</p>
              </div>
              <span class="rounded-full bg-red-50 px-2.5 py-1 text-sm font-bold text-red-800">
                {{ item.pointsCost }} pts
              </span>
            </div>

            <div class="mt-auto flex items-center justify-between gap-3">
              <p class="text-sm text-gray-600">
                Estoque:
                <span class="font-semibold text-gray-900">
                  {{ item.availableQuantity ?? "sob demanda" }}
                </span>
              </p>
              <button
                class="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                type="button"
                :disabled="requestingId === item.id || !canRequest(item)"
                @click="requestReward(item)"
              >
                <i v-if="requestingId === item.id" class="mdi mdi-loading mdi-spin"></i>
                <i v-else class="mdi mdi-cart-arrow-down"></i>
                Solicitar Resgate
              </button>
            </div>
          </div>
        </article>
      </section>

      <div
        v-if="!loading && !catalog.length"
        class="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center"
      >
        <i class="mdi mdi-store-off-outline text-4xl text-gray-400"></i>
        <p class="mt-2 text-sm font-medium text-gray-700">Nenhum item ativo no catálogo desta unidade.</p>
      </div>

      <p v-if="feedback" class="rounded-md border px-4 py-3 text-sm" :class="feedbackClass">
        {{ feedback }}
      </p>
    </div>

    <Notification ref="notification" />
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import UnitRequiredState from "@/components/shared/UnitRequiredState.vue";
import PointBalanceSummary from "@/components/shared/PointBalanceSummary.vue";
import { marketplaceService } from "@/services/marketplaceService.js";
import { getUserData } from "@/services/userService.js";
import { useUserStore } from "@/stores/userStore.js";
import Notification from "@/components/Notification.vue";

const notification = ref(null);
const emit = defineEmits(["notify"]);

const userStore = useUserStore();
const loading = ref(false);
const catalog = ref([]);
const userData = ref({});
const feedback = ref("");
const feedbackType = ref("success");
const requestingId = ref("");

const dassOffice = computed(() => userStore.dassOffice || localStorage.getItem("unidadeDass") || "");
const availableBalance = computed(() =>
  Number(userData.value.saldo_disponivel ?? userData.value.availableBalance ?? 0),
);
const feedbackClass = computed(() =>
  feedbackType.value === "success"
    ? "border-green-200 bg-green-50 text-green-800"
    : "border-red-200 bg-red-50 text-red-800",
);

// Busca de dados de colabordaro não autenticado
const matriculaUser = ref(null);
const handleUserData = async (e, click) => {
  try {
    console.log(matriculaUser.value);
    
    // Espera input do usuário
    if ((e.key && e.key === "Enter") || click) {
      await getUserData(matriculaUser.value, userData, loading, emit);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

const loadMarketplace = async () => {
  if (!dassOffice.value) return;
  loading.value = true;
  feedback.value = "";
  try {
    // Atualiza marktplace e dados do usuario
    const [items] = await Promise.all([
      marketplaceService.listCatalog(dassOffice.value),
      userStore.matricula ? getUserData(userStore.matricula, userData) : Promise.resolve(),
    ]);
    catalog.value = Array.isArray(items) ? items : [];
  } catch (error) {
    feedbackType.value = "error";
    feedback.value = error.response?.data?.message || "Não foi possível carregar o marketplace.";
  } finally {
    loading.value = false;
  }
};

const canRequest = (item) => {
  const hasStock =
    item.availableQuantity === null || item.availableQuantity === undefined || Number(item.availableQuantity) > 0;
  return (
    userStore.hasPermission("marketplace.request.create") &&
    hasStock &&
    availableBalance.value >= Number(item.pointsCost || 0)
  );
};

const requestReward = async (item) => {
  requestingId.value = item.id;
  feedback.value = "";
  try {
    await marketplaceService.createRequest({
      dassOffice: dassOffice.value,
      catalogItemId: item.id,
      reason: `Resgate solicitado pelo frontend para ${item.name}`,
    });
    feedbackType.value = "success";
    feedback.value = "Solicitação criada. Os pontos foram reservados até a decisão operacional.";
    await loadMarketplace();
  } catch (error) {
    feedbackType.value = "error";
    feedback.value = error.response?.data?.message || "Não foi possível criar a solicitação.";
  } finally {
    requestingId.value = "";
  }
};

onMounted(async () => {
  userStore.carregarUsuario();
  await userStore.loadSessionContext(dassOffice.value);
  await loadMarketplace();

  if (userData.value) {
    console.log(userData.value);

    matriculaUser.value = userData.value.matricula;
  }
});
</script>
