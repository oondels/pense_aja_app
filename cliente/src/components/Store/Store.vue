<template>
  <div class="w-full">
    <v-dialog v-model="openStore" max-width="850">
      <template v-slot:activator="{ props: activatorProps }">
        <button
          v-if="!isMobile"
          @click="handleUserData($event, false)"
          v-bind="activatorProps"
          id="openLoja"
          class="flex items-center space-x-2 px-4 py-2 rounded-lg shadow transition bg-white text-gray-800 hover:bg-gray-100"
        >
          <span class="mdi mdi-store text-xl"></span>
          <span>Loja</span>
        </button>
        <button
          v-else
          @click="handleUserData($event, false)"
          v-bind="activatorProps"
          class="flex flex-col items-center p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition"
        >
          <i class="mdi mdi-store-outline text-2xl"></i>
          <span class="text-sm">Loja</span>
        </button>
      </template>

      <template v-slot:default="{ isActive }">
        <div id="loja" class="bg-white rounded-b-2xl shadow-lg max-h-screen overflow-y-auto">
          <div class="max-w-6xl mx-auto p-6">
            <!-- Header -->
            <div
              class="relative bg-gradient-to-br from-red-700 to-red-400 text-white rounded-t-2xl p-6 mb-6 shadow-lg overflow-hidden"
            >
              <div class="absolute inset-0 gradient-radial pointer-events-none"></div>
              <div class="flex flex-wrap items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="bg-white/90 rounded-full p-2 shadow-md border border-white/80">
                    <img src="/assets/img/icons/dass-penseaja.png" alt="Logo" class="w-12 h-12 object-contain" />
                  </div>
                  <div>
                    <h1 class="text-2xl font-bold">Loja de Recompensas</h1>
                    <span class="text-sm opacity-90">Sistema Pense & Aja</span>
                  </div>
                </div>

                <button
                  @click="isActive.value = false"
                  class="absolute top-4 right-4 px-1 bg-red-100 hover:bg-red-200 rounded-full transition transform hover:rotate-90"
                >
                  <span class="bi bi-x-lg text-red-600"></span>
                </button>
              </div>
              <div
                class="mt-4 flex items-center space-x-4 bg-white/20 backdrop-blur-md rounded-lg p-4 border-l-4 border-pink-200"
              >
                <div class="text-pink-200 animate-pulse text-xl"><i class="bi bi-exclamation-circle-fill"></i></div>
                <div>
                  <p class="font-semibold">Atenção</p>
                  <p class="text-sm opacity-90">Pontuação sujeita a avaliação do gerente</p>
                </div>
              </div>
            </div>

            <!-- Search & Points -->
            <div
              class="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <div id="divLojaMatricula" class="flex items-center bg-white rounded-lg shadow p-2 flex-1">
                <i class="bi bi-person-badge text-gray-500 text-xl mr-2"></i>
                <input
                  type="number"
                  placeholder="Digite sua matrícula"
                  id="lojaMatricula"
                  v-model="registrationInput"
                  @keyup.enter="handleUserData($event, false)"
                  class="w-full bg-transparent outline-none"
                />
                <button
                  @click="handleUserData($event, true)"
                  id="pesqLoja"
                  class="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1 transition shadow"
                >
                  <i class="bi bi-search"></i><span>Buscar</span>
                  <span v-if="loading" class="loader"></span>
                </button>
              </div>
              <div class="flex items-center space-x-2">
                <div
                  class="flex items-center space-x-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full px-4 py-2 shadow-md animate-pulse"
                >
                  <i class="bi bi-star-fill"></i>
                  <span id="pontosLoja" class="font-bold text-lg">{{ pontos }}</span>
                  <span class="text-sm opacity-80">pontos</span>
                </div>
              </div>
            </div>

            <!-- User Info -->
            <div v-if="user?.matricula || userData" class="mb-6">
              <div class="flex items-center bg-white rounded-lg shadow p-4 space-x-4">
                <i class="bi bi-person-circle text-primary text-4xl"></i>
                <div class="space-y-1">
                  <p id="nomeLoja" class="text-sm text-gray-700">Nome: {{ userData?.nome }}</p>
                  <p id="setorLoja" class="text-sm text-gray-700">Setor: {{ userData?.setor }}</p>
                  <p id="gerenteLoja" class="text-sm text-gray-700">Gerente: {{ userData?.gerente }}</p>
                </div>
              </div>
            </div>

            <!-- Filter -->
            <div class="flex flex-wrap justify-center gap-2 mb-6">
              <button
                @click="filterType = 'all'"
                :class="filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'"
                class="flex items-center space-x-1 px-3 py-1 rounded-lg transition"
              >
                <i class="bi bi-grid"></i><span>Todos</span>
              </button>
              <button
                @click="filterType = 'available'"
                :class="filterType === 'available' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'"
                class="flex items-center space-x-1 px-3 py-1 rounded-lg transition"
              >
                <i class="bi bi-bag-check-fill text-green-500"></i><span>Disponíveis</span>
              </button>
              <button
                @click="filterType = 'unavailable'"
                :class="filterType === 'unavailable' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'"
                class="flex items-center space-x-1 px-3 py-1 rounded-lg transition"
              >
                <i class="bi bi-emoji-frown-fill text-red-500"></i><span>Não disponíveis</span>
              </button>
            </div>

            <!-- Products -->
            <div class="overflow-y-auto max-h-[calc(100vh-300px)]">
              <h2
                class="text-2xl font-bold text-center mb-4 relative inline-block before:content-[''] before:absolute before:left-1/2 before:-bottom-1 before:w-16 before:h-1 before:bg-gradient-to-r before:from-blue-500 before:to-blue-600 before:rounded"
              ></h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="relative bg-white rounded-lg shadow p-4 hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <!-- Tag de pontos -->
                  <div
                    class="absolute top-4 right-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-sm"
                  >
                    {{ product.points }} pts
                  </div>

                  <!-- Imagem sempre visível -->
                  <div class="h-44 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img :src="product.image" :alt="product.name" class="max-h-full object-contain" />
                  </div>

                  <!-- Se não tiver pontos suficientes, exibe aviso em vez do botão -->
                  <div v-if="product.points > pontos" class="text-center space-y-1 text-gray-700">
                    <i class="bi bi-emoji-frown-fill text-3xl text-gray-500"></i>
                    <div class="text-lg font-semibold">{{ product.name }}</div>
                    <div class="font-bold text-red-600">Pontos Insuficientes</div>
                    <div class="text-sm text-gray-500">Junte mais pontos para resgatar!</div>
                  </div>

                  <!-- Se tiver pontos suficientes, exibe o botão -->
                  <div v-else-if="userData" class="space-y-2">
                    <h3 class="text-lg font-semibold">{{ product.name }}</h3>
                    <BuyItem
                      @updatePoints="updatePoints"
                      :colaboradorData="{ ...userData, matricula: registrationInput }"
                      :PenseAjaProduct="product"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </v-dialog>
    <Notification ref="notification" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, defineExpose } from "vue";
import { getUserData } from "@/services/userService";
import { useUserStore } from "@/stores/userStore";
import BuyItem from "@/components/Store/BuyItem.vue";
import Notification from "../Notification.vue";
// TODO: Passar dados para banco de dados
import storeProducts from "@/utils/penseAjaProducts.json";

const emit = defineEmits(["notify"]);

// Abre a loja pelo bottomNav
const openStore = ref(false);
const openStoreBottomNav = () => {
  openStore.value = !openStore.value;
};
defineExpose({
  openStoreBottomNav,
});

const loading = ref(false);
const notification = ref(null);

const isMobile = ref(false);
function handleResize() {
  isMobile.value = window.innerWidth <= 1024;
}
onMounted(() => {
  filterProduct();
  handleResize();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const user = useUserStore();

const userData = ref(null);
let pontos = ref(0);
const filterType = ref("all");

const filteredProducts = ref(null);
const filterProduct = () => {
  if (filterType.value === "available") {
    filteredProducts.value = storeProducts.filter((p) => p.points <= pontos.value);
    return;
  } else if (filterType.value === "unavailable") {
    filteredProducts.value = storeProducts.filter((p) => p.points > pontos.value);
    return;
  }

  filteredProducts.value = storeProducts;
};

watch(filterType, (newValue) => {
  if (newValue === "all") {
    filteredProducts.value = storeProducts;
  } else {
    filterProduct();
  }
});

const registrationInput = ref(null);
const handleUserData = async (e, click) => {
  try {
    // Se estiver logado ja pesquisa os dados
    if (!userData.value && user.matricula) {
      registrationInput.value = user.matricula;
      await getUserData(user.matricula, userData);
      pontos.value = userData.value.pontos - userData.value.pontos_resgatados;
    }

    // Espera input do usuário
    if ((e.key && e.key === "Enter") || click) {
      await getUserData(registrationInput.value, userData, loading, emit);
      pontos.value = userData.value.pontos - userData.value.pontos_resgatados;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

// Atualiza pontuação apos resgate de item
const updatePoints = async (update) => {
  if (update) {
    await getUserData(user.matricula, userData);
    pontos.value = userData.value.pontos - userData.value.pontos_resgatados;
  }
};
</script>

<style scoped>
@keyframes gradient-shift {
  to {
    transform: translateX(50%);
  }
}

/* animação de gradiente */
@keyframes gradient-shift {
  to {
    transform: translateX(50%);
  }
}

/* loader spinner */
.loader {
  border: 2px solid transparent;
  border-top-color: white;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
