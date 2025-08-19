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
          :disabled="!user.usuario || user.usuario === 'HENDRIUS.SANTANA'"
          :class="{'opacity-50 cursor-not-allowed': !user.usuario || user.usuario === 'HENDRIUS.SANTANA'}"
          v-tooltip="'Em manutenção'"
        >
          <span class="mdi mdi-store text-xl"></span>
          <span>Loja</span>
        </button>

      </template>

      <template v-slot:default="{ isActive }">
        <div id="loja" class="bg-white rounded-b-2xl shadow-lg max-h-screen overflow-y-auto position-relative">
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
              <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="relative bg-white rounded-lg shadow p-4 hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <!-- Tag de pontos -->
                  <div
                    class="absolute top-4 right-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-sm"
                  >
                    {{ product.valor }} pts
                  </div>

                  <!-- Imagem sempre visível -->
                  <div class="h-44 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img :src="product.imagem" :alt="product.nome" class="max-h-full object-contain" />
                  </div>

                  <!-- Se não tiver pontos suficientes, exibe aviso em vez do botão -->
                  <div v-if="product.valor > pontos" class="text-center space-y-1 text-gray-700">
                    <i class="bi bi-emoji-frown-fill text-3xl text-gray-500"></i>
                    <div class="text-lg font-semibold">{{ product.nome }}</div>
                    <div class="font-bold text-red-600">Pontos Insuficientes</div>
                    <div class="text-sm text-gray-500">Junte mais pontos para resgatar!</div>
                  </div>

                  <!-- Se tiver pontos suficientes, exibe o botão -->
                  <div v-else-if="userData" class="space-y-2">
                    <h3 class="text-lg font-semibold">{{ product.nome }}</h3>
                    <BuyItem
                      @updatePoints="updatePoints"
                      :colaboradorData="{ ...userData, matricula: registrationInput }"
                      :PenseAjaProduct="product"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="text-center text-gray-500">
                <p>Nenhum produto encontrado.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Store -->
        <div class="edit-store position-absolute bottom-5 right-5">
          <v-dialog v-if="checkRoleAndEvaluation()" max-width="1200" persistent>
            <template v-slot:activator="{ props: activatorProps }">
              <v-fab
                v-bind="activatorProps"
                color="light-green-lighten-1"
                size="large"
                icon="mdi mdi-storefront-edit-outline"
                class="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:pulse-glow"
              />
            </template>

            <template v-slot:default="{ isActive }">
              <v-card class="rounded-xl">
                <Notification ref="notificationEditStore" />

                <!-- Header -->
                <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <i class="mdi mdi-storefront-edit text-2xl" />
                      </div>

                      <div>
                        <h2 class="text-2xl font-bold">Gerenciar Loja</h2>
                        <p class="text-white/80">Edite produtos e gerencie sua loja de recompensas</p>
                      </div>
                    </div>

                    <v-btn
                      @click="() => (isActive.value = false)"
                      icon="mdi-close"
                      variant="text"
                      color="white"
                      class="hover:bg-white/20 rounded-full"
                    />
                  </div>
                </div>

                <!-- Content -->
                <div class="p-6 bg-gray-50 min-h-[600px]">
                  <!-- Action Bar -->
                  <div class="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
                    <div class="flex items-center space-x-4">
                      <v-btn
                        @click="openAddProductDialog"
                        color="primary"
                        prepend-icon="mdi-plus"
                        class="rounded-lg shadow-md hover:shadow-lg transition-all"
                        size="large"
                      >
                        Adicionar Produto
                      </v-btn>

                      <div @click="teste" class="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
                        <i class="mdi mdi-package-variant text-gray-500 mr-2"></i>
                        <span class="text-sm text-gray-600">{{ editableProducts.length }} produtos</span>
                      </div>
                    </div>

                    <!-- Search -->
                    <div class="flex items-center bg-white rounded-lg shadow-sm overflow-hidden min-w-[300px]">
                      <i class="mdi mdi-magnify text-gray-400 ml-4"></i>
                      <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar produtos..."
                        class="w-full px-4 py-3 outline-none"
                      />
                    </div>
                  </div>

                  <!-- Products Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 custom-scrollbar">
                    <div
                      v-for="product in filteredEditableProducts"
                      :key="product.id"
                      class="product-card bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                    >
                      <!-- Product Image -->
                      <div
                        class="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                      >
                        <img
                          :src="product.imagem"
                          :alt="product.nome"
                          class="max-h-32 max-w-32 object-contain drop-shadow-md"
                        />
                        <div
                          class="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
                        >
                          {{ product.valor }} pts
                        </div>
                      </div>

                      <!-- Product Details -->
                      <div class="p-5">
                        <div class="space-y-4">
                          <!-- Product Name -->
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                            <input
                              v-model="product.nome"
                              type="text"
                              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                              placeholder="Nome do produto"
                            />
                          </div>

                          <!-- Points -->
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Pontos Necessários</label>
                            <div class="relative">
                              <input
                                v-model.number="product.valor"
                                type="number"
                                min="1"
                                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pl-8"
                                placeholder="0"
                              />
                              <i
                                class="mdi mdi-star absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500"
                              ></i>
                            </div>
                          </div>
                        </div>

                        <!-- Actions -->
                        <!-- <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                          <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-sm text-gray-500">ID: {{ product.id }}</span>
                          </div>
                          <v-btn
                            color="error"
                            variant="outlined"
                            size="small"
                            class="rounded-lg"
                            prepend-icon="mdi-delete-outline"
                          >
                            Remover
                          </v-btn>
                        </div> -->
                      </div>
                    </div>

                    <!-- Empty State -->
                    <div
                      v-if="filteredEditableProducts.length === 0"
                      class="col-span-full flex flex-col items-center justify-center py-16 text-gray-500"
                    >
                      <i class="mdi mdi-package-variant-closed text-6xl mb-4"></i>
                      <h3 class="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                      <p class="text-gray-400">
                        {{ searchQuery ? "Tente uma busca diferente" : "Adicione produtos para começar" }}
                      </p>
                    </div>
                  </div>

                  <!-- Save Actions -->
                  <div class="flex items-center justify-center mt-8 pt-6 border-t border-gray-200">
                    <div class="flex items-center space-x-3 mb-5">
                      <v-btn @click="closeEditDialog" variant="outlined" color="gray" class="rounded-lg">
                        Cancelar
                      </v-btn>
                      <v-btn
                        @click="saveProducts"
                        color="primary"
                        class="rounded-lg shadow-md"
                        prepend-icon="mdi-content-save"
                      >
                        Salvar Alterações
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card>
            </template>
          </v-dialog>

          <!-- Add Product Dialog -->
          <v-dialog v-model="addProductDialog" max-width="600" persistent>
            <Notification ref="notificationEditStore" />

            <v-card class="rounded-xl overflow-hidden">
              <!-- Header -->
              <div class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <i class="mdi mdi-plus text-xl"></i>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold">Adicionar Novo Produto</h3>
                      <p class="text-white/80">Crie um novo item para a loja</p>
                    </div>
                  </div>
                  <v-btn
                    @click="closeAddProductDialog"
                    icon="mdi-close"
                    variant="text"
                    color="white"
                    class="hover:bg-white/20 rounded-full"
                  />
                </div>
              </div>

              <!-- Form -->
              <div class="p-6 space-y-6">
                <!-- Product Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                  <input
                    v-model="newProduct.name"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="Digite o nome do produto"
                  />
                </div>

                <!-- Points -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Pontos Necessários</label>
                  <div class="relative">
                    <input
                      v-model.number="newProduct.points"
                      type="number"
                      min="1"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all pl-12"
                      placeholder="Quantos pontos são necessários?"
                    />
                    <i class="mdi mdi-star absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500"></i>
                  </div>
                </div>

                <!-- Image Upload -->
                <div class="image-upload">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Imagem do Item</label>
                  <v-file-upload
                    max-files="1"
                    @update:model-value="handleFileUpload"
                    accept="image/*"
                    clearable
                    density="compact"
                    title="Arraste e Solte a Imagem"
                    variant="outlined"
                    class="border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-400 transition-colors"
                    prepend-icon="mdi-camera-plus"
                  >
                  </v-file-upload>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50">
                <v-btn @click="closeAddProductDialog" variant="outlined" color="gray" class="rounded-lg">
                  Cancelar
                </v-btn>
                <v-btn
                  @click="createNewProduct"
                  color="primary"
                  class="rounded-lg shadow-md"
                  prepend-icon="mdi-plus"
                  :disabled="!newProduct.name || !newProduct.points"
                >
                  Cadastrar Produto
                </v-btn>
              </div>
            </v-card>
          </v-dialog>
        </div>
      </template>
    </v-dialog>
    
    <Notification ref="notification" />
  </div>

</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, defineExpose, computed, nextTick } from "vue";
import { getUserData, setUserRole } from "@/services/userService";
import { useUserStore } from "@/stores/userStore";
import BuyItem from "@/components/Store/BuyItem.vue";
import Notification from "../Notification.vue";
// TODO: Passar dados para banco de dados
// import storeProducts from "@/utils/penseAjaProducts.json";
import { VFileUpload } from "vuetify/labs/VFileUpload";
import { createProduct, fetchStoreProducts, editProducts } from "@/services/storeService.js";

const dassOffice = localStorage.getItem("unidadeDass");

const emit = defineEmits(["notify"]);

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

const storeProducts = ref([]);
const fetchProducts = () => {
  const dassOffice = localStorage.getItem("unidadeDass");
  fetchStoreProducts(dassOffice)
    .then((products) => {
      storeProducts.value = products;
      filterProduct();
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      notification.value.showPopup("error", "Erro!", "Não foi possível carregar os produtos da loja.");
    });
};

onMounted(() => {
  fetchProducts();
  filterProduct();
  handleResize();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const user = useUserStore();

const checkRoleAndEvaluation = () => {
  if (setUserRole(user) === "analista" || setUserRole(user) === "automacao") {
    return true;
  }

  return false;
};

const userData = ref(null);
let pontos = ref(0);
const filterType = ref("all");

const filteredProducts = ref(null);
const filterProduct = () => {
  if (!storeProducts.value || storeProducts.value.length === 0) {
    filteredProducts.value = [];
    return;
  }

  if (filterType.value === "available") {
    filteredProducts.value = storeProducts.value.filter((p) => p.points <= pontos.value);
    return;
  } else if (filterType.value === "unavailable") {
    filteredProducts.value = storeProducts.value.filter((p) => p.points > pontos.value);
    return;
  }

  filteredProducts.value = storeProducts.value || [];
};

watch(filterType, (newValue) => {
  if (newValue === "all") {
    filteredProducts.value = storeProducts.value;
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

// Edit Store Methods
const addProductDialog = ref(false);
const searchQuery = ref("");
const originalProducts = ref([]);
const editableProducts = ref([]);
watch(
  storeProducts,
  (newProducts) => {
    const src = newProducts || [];

    editableProducts.value = JSON.parse(JSON.stringify(src));
    originalProducts.value = JSON.parse(JSON.stringify(src));
  },
  { immediate: true, deep: true }
);

const newProduct = ref({
  name: "",
  points: 1,
  image: "",
});

// File upload handling
const selectedFiles = ref([]);
const filteredEditableProducts = computed(() => {
  if (!editableProducts.value || editableProducts.value.length === 0) {
    return [];
  }

  if (!searchQuery.value) return editableProducts.value;

  return editableProducts.value.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const notificationEditStore = ref(null);
const openAddProductDialog = async () => {
  addProductDialog.value = true;
  newProduct.value = {
    name: "",
    points: 1,
    image: "",
  };
  selectedFiles.value = [];
};

const closeAddProductDialog = () => {
  addProductDialog.value = false;
  newProduct.value = {
    name: "",
    points: 1,
    image: "",
  };
  selectedFiles.value = [];
};

const handleFileUpload = (file) => {
  if (!file.type.startsWith("image/")) {
    notificationEditStore.value.showPopup("warning", "Aviso!", "Por favor, selecione apenas arquivos de imagem.");
    return;
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    notificationEditStore.value.showPopup("warning", "Aviso!", "A imagem deve ter no máximo 5MB.");
    return;
  }
  selectedFiles.value = [file];
};

const closeEditDialog = () => {
  editStoreDialog.value = false;
  searchQuery.value = "";
};

const createNewProduct = async () => {
  try {
    if (!user.usuario) {
      console.error("User not logged in");
      notificationEditStore.value.showPopup("error", "Erro!", "Você precisa estar logado para adicionar produtos.");
      return;
    }

    newProduct.value.user = user.usuario;
    const dassOffice = localStorage.getItem("unidadeDass");

    await createProduct(newProduct.value, selectedFiles.value, dassOffice);
    notificationEditStore.value.showPopup("success", "Sucesso!", "Produto enfileirado para processamento!");

    setTimeout(async () => {
      closeAddProductDialog();
      await fetchProducts();
    }, 2000);
  } catch (error) {
    console.error(error);
    notificationEditStore.value.showPopup(
      "error",
      "Erro!",
      "Não foi possível criar o produto. Acione a equipe de automação."
    );
  }
};

const saveProducts = async () => {
  /**
   * Salva as alterações dos produtos editados na loja
   *
   * Esta função:
   * 1. Filtra apenas os produtos que foram realmente modificados comparando com os dados originais
   * 2. Verifica se houve mudanças nos campos 'nome' ou 'valor'
   * 3. Envia apenas os produtos alterados para o servidor via API
   * 4. Atualiza localmente apenas os produtos que foram editados
   * 5. Exibe notificações de sucesso/erro e fecha o diálogo após 2 segundos em caso de sucesso
   *
   * @async
   * @function saveEditedProducts
   * @returns {Promise<void>} Promise que resolve quando a operação de salvamento é concluída
   *
   * @throws {Error} Quando ocorre erro na comunicação com a API
   *
   * @example
   * // Chama a função para salvar produtos editados
   * await saveEditedProducts();
   *
   * @description
   * - Se nenhuma alteração for detectada, exibe notificação informativa
   * - Em caso de sucesso, atualiza o array storeProducts e exibe mensagem de confirmação
   * - Em caso de erro, exibe notificação de erro e mantém os dados inalterados
   */
  // Filtrar apenas produtos que foram editados (comparando com produtos originais)
  const editedProducts = editableProducts.value.filter((editedProduct) => {
    const originalProduct = originalProducts.value.find((p) => p.id === editedProduct.id);
    if (!originalProduct) return false;

    // Verificar se nome ou valor foram alterados
    return originalProduct.nome !== editedProduct.nome || originalProduct.valor !== editedProduct.valor;
  });

  if (editedProducts.length === 0) {
    notificationEditStore.value.showPopup("info", "Info!", "Nenhuma alteração de produtos foi detectada.");
    return;
  }

  try {
    await editProducts(dassOffice, editedProducts);

    // Atualizar apenas os produtos editados no storeProducts
    editedProducts.forEach((editedProduct) => {
      const index = storeProducts.value.findIndex((p) => p.id === editedProduct.id);
      if (index !== -1) {
        storeProducts.value[index] = JSON.parse(JSON.stringify(editedProduct));
      }
    });

    const src = JSON.parse(JSON.stringify(storeProducts.value));
    originalProducts.value = src;
    editableProducts.value = src;

    notificationEditStore.value.showPopup(
      "success",
      "Sucesso!",
      `${editedProducts.length} produto(s) editado(s) com sucesso!`
    );

    setTimeout(() => {
      closeEditDialog();
    }, 2000);
  } catch (error) {
    console.error("Erro ao salvar produtos:", error);
    notificationEditStore.value.showPopup("error", "Erro!", "Não foi possível salvar as alterações.");
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

/* Custom edit store animations */
.edit-store .v-fab {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.edit-store .v-fab:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* File upload styling */
.v-file-upload {
  transition: all 0.3s ease;
}

.v-file-upload:hover {
  border-color: #10b981 !important;
  background-color: #f0fdf4;
}

.image-upload .v-file-upload.v-file-upload--drag-active {
  border-color: #10b981 !important;
  background-color: #ecfdf5;
  transform: scale(1.02);
}

/* Product card hover effects */
.product-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Input focus effects */
input:focus {
  transform: scale(1.02);
  transition: all 0.2s ease;
}

/* Glassmorphism effect */
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #5a6fd8, #6a4190);
}

/* Pulse animation for active states */
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.6);
  }
}

.pulse-glow {
  animation: pulse-glow 2s infinite;
}

/* Floating animation for FAB */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.edit-store .v-fab {
  animation: float 3s ease-in-out infinite;
}
</style>
