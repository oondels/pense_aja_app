<template>
  <div class="w-full">
    <v-dialog v-model="openRegister" :max-width="isMobile ? '100%' : '850'">
      <template v-slot:activator="{ props: activatorProps }">
        <button
          @click="handleUserClick"
          v-bind="activatorProps"
          id="openMenu"
          @mouseenter="isHover = true"
          @mouseleave="isHover = false"
          v-if="!isMobile"
          :class="[
            'flex items-center space-x-2 px-4 py-2 rounded-lg shadow transition',
            isHover ? 'bg-yellow-400 text-white' : 'bg-white text-gray-800 hover:bg-gray-100',
          ]"
        >
          <i :class="['text-xl mdi', isHover ? 'mdi-lightbulb-on' : 'mdi-lightbulb-on-outline']"></i>
          <span>Cadastrar</span>
        </button>
      </template>

      <template v-slot:default="{ isActive }">
        <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div class="bg-white rounded-lg w-full w-11/12 max-w-3xl max-h-[85vh] overflow-y-auto p-6 relative">
            <!-- Close Button -->
            <button
              @click="isActive.value = false"
              class="absolute top-4 right-4 px-1 bg-red-100 hover:bg-red-200 rounded-full transition transform hover:rotate-90"
            >
              <span class="bi bi-x-lg text-black"></span>
            </button>

            <!-- Header -->
            <div class="flex items-center justify-between border-b pb-4 mb-6">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shadow">
                  <img
                    src="/assets/img/icons/dass-penseaja.png"
                    alt="Ícone Cadastro"
                    class="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <h2 class="text-xl font-bold">Cadastro Pense<span class="text-red-500">&</span>Aja</h2>
                  <span class="text-sm text-gray-500"> Transformando ideias em ações </span>
                </div>
              </div>
            </div>

            <!-- Form -->
            <form id="penseaja-form" class="space-y-6">
              <!-- Matrícula -->
              <div>
                <label for="penseaja-matricula" class="block text-sm font-medium text-gray-700"> Matrícula </label>
                <div class="flex items-center gap-2 mt-1">
                  <input
                    ref="matriculaInput"
                    type="number"
                    id="penseaja-matricula"
                    placeholder="Digite sua matrícula"
                    v-model="registrationEntry"
                    @keyup="serachUser"
                    class="min-w-0 flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  <v-btn
                    @click="serachUser"
                    variant="outlined"
                    color="red"
                    class="whitespace-nowrap px-3 py-2 text-sm min-w-fit"
                  >
                    Buscar
                    <span v-if="loading" class="spinner ml-2"></span>
                  </v-btn>
                </div>
              </div>

              <!-- User Info -->
              <div
                v-if="userData?.nome"
                class="flex items-center bg-gradient-to-r from-red-50 to-white rounded-lg p-4 border-l-4 border-red-500 shadow-sm"
              >
                <i class="bi bi-person-circle text-red-500 text-3xl"></i>
                <div class="ml-4 space-y-1">
                  <p class="text-sm text-gray-800"><span class="font-semibold">Nome:</span> {{ userData.nome }}</p>
                  <p class="text-sm text-gray-800">
                    <span class="font-semibold">Gerente:</span> {{ userData.gerente }}
                  </p>
                </div>
              </div>

              <!-- Projeto & Data -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="penseaja-projeto" class="block text-sm font-medium text-gray-700">
                    Nome do projeto
                  </label>
                  <v-text-field
                    v-model="penseAjaData.projectName"
                    id="penseaja-projeto"
                    label="Ex: Melhoria do processo"
                    variant="outlined"
                    color="red"
                    class="mt-1 w-full"
                  />
                </div>

                <div>
                  <label for="penseaja-data" class="block text-sm font-medium text-gray-700"> Data </label>
                  <v-text-field
                    type="date"
                    v-model="penseAjaData.projectDate"
                    id="penseaja-data"
                    :min="today"
                    variant="outlined"
                    color="red"
                    class="mt-1 w-full"
                  />
                </div>
              </div>

              <!-- Setor -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="penseaja-projeto-area" class="block text-sm font-medium text-gray-700">
                    Onde será implementado essa melhoria?
                  </label>
                  <v-select
                    v-model="penseAjaData.setor"
                    :items="setoresDass[unidadeDass]"
                    label="Selecione o Setor"
                    variant="outlined"
                    color="red"
                    class="mt-1 w-full"
                  />
                </div>

                <div>
                  <label for="penseaja-projeto-area" class="block text-sm font-medium text-gray-700">
                    Em qual fábrica?
                  </label>
                  <v-select
                    variant="outlined"
                    color="red"
                    class="mt-1 w-full"
                    label="Fábrica"
                    :items="['Fábrica 1', 'Fábrica 2', 'Fábrica 3', 'Manutenção']"
                    v-model="penseAjaData.factory"
                  ></v-select>
                </div>
              </div>

              <!-- Situações -->
              <div class="space-y-4">
                <div>
                  <label for="penseaja-anterior" class="block text-sm font-medium text-gray-700">
                    Situação anterior
                  </label>
                  <textarea
                    v-model="penseAjaData.situationBefore"
                    id="penseaja-anterior"
                    placeholder="Descreva a situação anterior..."
                    class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  ></textarea>
                </div>
                <div>
                  <label for="penseaja-atual" class="block text-sm font-medium text-gray-700"> Situação atual </label>
                  <textarea
                    v-model="penseAjaData.situationNow"
                    id="penseaja-atual"
                    placeholder="Descreva a situação atual..."
                    class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  ></textarea>
                </div>
                <ConfettiExplosion v-if="showExplosion" :particleSize="12" :particleCount="200" :duration="3000" />
              </div>

              <!-- Ganhos -->
              <div>
                <div class="flex items-center mb-2">
                  <input v-model="ganhos" type="checkbox" id="ganho-penseaja" class="mr-2" />
                  <label for="ganho-penseaja" class="text-sm font-medium text-gray-700">
                    O que ganhei com essa melhoria?
                  </label>
                </div>
                <div v-if="ganhos" class="space-y-4">
                  <div>
                    <v-select
                      v-model="penseAjaData.ganhos.values"
                      :items="['Dinheiro', 'Tempo', 'Processo', 'Qualidade', 'Espaço Físico (m²)', 'Segurança']"
                      label="Selecione os ganhos"
                      multiple
                      variant="outlined"
                      color="red"
                      class="w-full"
                    />
                  </div>

                  <div>
                    <textarea
                      v-model="penseAjaData.ganhos.justificativa"
                      id="ganhos-descricao"
                      placeholder="Explique quais ganhos foram obtidos..."
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    ></textarea>
                    <p class="mt-1 text-xs text-gray-500 flex items-start gap-1">
                      <i class="bi bi-lightbulb-fill text-yellow-400"></i>
                      Mencione dados e resultados que demonstrem o impacto positivo.
                    </p>
                  </div>
                </div>
              </div>

              <!-- IA Enhance -->
              <div class="relative">
                <button
                  @click="handleImproveText"
                  @mouseenter="showTooltip = true"
                  @mouseleave="showTooltip = false"
                  type="button"
                  :disabled="loadingImprove"
                  :class="[
                    'flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition',
                    disableIaButton ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white',
                  ]"
                >
                  <i class="bi bi-robot"></i>
                  <i class="bi bi-stars text-yellow-300"></i>
                  <span v-if="!loadingImprove">Melhorar texto com IA</span>
                  <span v-else class="spinner"></span>
                </button>

                <div
                  v-if="showTooltip"
                  class="absolute -top-16 left-1/2 transform -translate-x-1/2 w-60 bg-white shadow-lg rounded-lg p-3 text-sm text-gray-700 border-l-4 border-red-500"
                >
                  <strong class="flex items-center gap-1 text-red-500">
                    <i class="bi bi-lightbulb"></i>Dica inteligente!
                  </strong>
                  Revise seu texto com inteligência artificial para facilitar a avaliação!
                </div>
              </div>

              <!-- 8 Perdas -->
              <div>
                <span class="block text-sm font-medium text-gray-700 mb-2">
                  <strong>8 Perdas!</strong>
                </span>
                <v-combobox
                  v-model="penseAjaData.perdas"
                  :items="[
                    'Superprodução',
                    'Transporte',
                    'Processamento',
                    'Movimento',
                    'Estoques',
                    'Espera',
                    'Talento',
                    'Retrabalho',
                  ]"
                  label="Selecione as perdas"
                  multiple
                  variant="outlined"
                  color="red"
                  class="w-full"
                />
              </div>

              <!-- Submit -->
              <button
                @click="handleRegister"
                type="button"
                class="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
              >
                Salvar <i class="mdi mdi-content-save-check-outline ml-2"></i>
              </button>
            </form>
          </div>
        </div>
      </template>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, defineExpose } from "vue";
import { useUserStore } from "@/stores/userStore";
import { getUserData } from "@/services/userService";
import { registerPenseAja } from "@/services/penseAjaService";
import { improveText } from "@/services/aiService";
import ConfettiExplosion from "vue-confetti-explosion";

const openRegister = ref(false);
const openRegisterBottomNav = () => {
  handleUserClick();
  openRegister.value = !openRegister.value;
};
defineExpose({ openRegisterBottomNav });
const emit = defineEmits(["notify"]);

const isHover = ref(false);
const isMobile = ref(false);
function handleResize() {
  isMobile.value = window.innerWidth <= 1024;
}
onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const loading = ref(false);
const loadingImprove = ref(false);
const userData = ref(null);
const ganhos = ref(false);
const showTooltip = ref(false);
const disableIaButton = ref(false);
const showExplosion = ref(false);

const user = useUserStore();
const registrationEntry = ref(null);

const handleUserClick = async () => {
  if (user?.matricula) {
    await getUserData(user.matricula, userData, loading);
    registrationEntry.value = user.matricula;
  }
};

const serachUser = async (e) => {
  if ((e.type === "keyup" && e.key === "Enter") || e.type === "click") {
    if (registrationEntry.value?.toString().length >= 7) {
      await getUserData(registrationEntry.value, userData, loading, emit);
    } else {
      emit("notify", {
        type: "warning",
        title: "Atenção!",
        message: "Insira uma matrícula válida (mínimo 7 dígitos).",
        timeout: 3000,
      });
    }
  }
};

const unidadeDass = localStorage.getItem("unidadeDass");
const setoresDass = {
  SEST: [
    "Corte (Recorte, chanfração)",
    "Serigrafia",
    "Frequência",
    "Fuse",
    "Bordado",
    "Pré Fabricado",
    "Pré Costura",
    "Montagem",
    "Costura",
    "Manutenção",
    "Setor de Apoio",
  ],
  VDC: [
    "Administração",
    "Agrupamento Pré",
    "Almoxarifado",
    "Aprendizes",
    "Assistência Médica",
    "Automação de Processos",
    "Banbury EVA",
    "Benefícios",
    "Caldeira",
    "Cilindro",
    "Banbury",
    "Cold Shot",
    "Conformação",
    "Corte de EVA",
    "Degreasing",
    "Departamento Pessoal",
    "Distribuição",
    "EVA Injetado",
    "EVA Pré-Conformado",
    "Expedição",
    "Fábrica de Protótipo",
    "FEFO",
    "Kneader",
    "Laboratório",
    "Lavar EVA",
    "Limpeza",
    "Manutenção",
    "Maternidade",
    "Matrizaria",
    "Melhoria Contínua",
    "Obras/Projetos",
    "PCP Controles",
    "Pré-Fabricado",
    "Pré-moldado",
    "Prensagem EVA Lam",
    "QC 01 Reciclado",
    "Qualidade",
    "Recursos Humanos",
    "Refilagem Borr.",
    "Segurança do Trabalho",
    "Sistemas",
    "Tempos e Métodos",
    "Tintas",
    "Transporte",
    "Treinamento de Produção",
    "Borracha",
  ],
};

const today = ref(new Date().toISOString().split("T")[0]);
const penseAjaData = ref({
  projectName: null,
  projectDate: today.value,
  situationBefore: null,
  situationNow: null,
  setor: null,
  perdas: [],
  ganhos: { values: [], justificativa: null },
  factory: null,
});

const replaceText = async (text, component) => {
  penseAjaData.value[component] = "";
  for (let char of text) {
    penseAjaData.value[component] += char;
    await new Promise((r) => setTimeout(r, 5));
  }
};

const handleImproveText = async () => {
  showTooltip.value = false;
  if (!penseAjaData.value.situationBefore || !penseAjaData.value.situationNow || !penseAjaData.value.projectName) {
    emit("notify", {
      type: "warning",
      title: "Atenção!",
      message: "Preencha situações antes de usar IA.",
      timeout: 3000,
    });
    return;
  }
  const result = await improveText(
    penseAjaData.value.situationBefore,
    penseAjaData.value.situationNow,
    penseAjaData.value.projectName,
    loadingImprove
  );
  if (!Object.keys(result).length) {
    emit("notify", {
      type: "warning",
      title: "Erro!",
      message: "Não foi possível melhorar o texto com IA.",
      timeout: 3000,
    });
    return;
  }
  disableIaButton.value = true;
  await replaceText(result.before, "situationBefore");
  await replaceText(result.after, "situationNow");
};

const handleRegister = async () => {
  if (!registrationEntry.value || !userData.value) {
    emit("notify", {
      type: "warning",
      title: "Aviso!",
      message: "Dados do usuário ausentes.",
      timeout: 3000,
    });
    return;
  }

  registerPenseAja(penseAjaData.value, registrationEntry.value, emit, userData.value, showExplosion);
};
</script>

<style scoped>
.spinner {
  border: 2px solid transparent;
  border-top-color: #ef5350;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
