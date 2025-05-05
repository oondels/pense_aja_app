<template>
  <div class="list-container">
    <div v-if="!isMobile" class="filters container-fluid">
      <v-text-field
        label="Pesquisar Pense e Aja"
        variant="outlined"
        color="info"
        prepend-inner-icon="mdi mdi-text-search"
        density="compact"
      />

      <div class="row">
        <v-combobox
          :items="availableYears"
          v-model="year"
          class="col-6"
          label="Ano"
          variant="outlined"
          prepend-inner-icon="mdi mdi-calendar-range"
          color="info"
        />
        <v-combobox
          :items="availableMonths"
          item-title="value"
          item-value="index"
          v-model="month"
          class="col-6"
          label="Mês"
          variant="outlined"
          prepend-inner-icon="mdi mdi-calendar-range"
          color="info"
        />
      </div>

      <div class="row">
        <v-combobox
          clearable
          multiple
          v-model="filters.name"
          :items="filterOptions.names"
          density="compact"
          class="col-md-4"
          label="Nome"
          variant="outlined"
          prepend-inner-icon="mdi mdi-account"
          color="info"
        />

        <v-combobox
          clearable
          multiple
          v-model="filters.manager"
          :items="filterOptions.managers"
          density="compact"
          class="col-md-4"
          label="Gerente"
          variant="outlined"
          prepend-inner-icon="mdi mdi-badge-account"
          color="info"
        />

        <v-combobox
          clearable
          multiple
          v-model="filters.sector"
          :items="filterOptions.sectors"
          density="compact"
          class="col-md-4"
          label="Setor"
          variant="outlined"
          prepend-inner-icon="mdi mdi-factory"
          color="info"
        />
      </div>

      <div class="row">
        <v-combobox
          v-model="filters.status"
          :items="filterOptions.status"
          clearable
          multiple
          density="compact"
          class="col-md-4"
          label="Status"
          variant="outlined"
          prepend-inner-icon="mdi mdi-calendar-range"
          color="info"
        />

        <v-combobox
          clearable
          multiple
          v-model="filters.project"
          :items="filterOptions.projects"
          density="compact"
          class="col-md-4"
          label="Projeto"
          variant="outlined"
          prepend-inner-icon="mdi mdi-lightbulb-on"
          color="info"
        />

        <v-combobox
          clearable
          multiple
          v-model="filters.turno"
          :items="filterOptions.turnos"
          density="compact"
          class="col-md-4"
          label="Turno"
          variant="outlined"
          prepend-inner-icon="mdi mdi-clipboard-text-clock"
          color="info"
        />
      </div>
    </div>

    <v-expansion-panels v-else class="position-absolute">
      <v-expansion-panel>
        <v-expansion-panel-title>
          Filtros
          <template v-slot:actions>
            <v-icon icon="mdi mdi-filter-multiple"></v-icon>
          </template>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <div class="filters container-fluid">
            <v-text-field
              label="Pesquisar Pense e Aja"
              variant="outlined"
              color="info"
              prepend-inner-icon="mdi mdi-text-search"
              density="compact"
            />

            <div class="row">
              <v-combobox
                :items="availableYears"
                v-model="year"
                class="col-6"
                label="Ano"
                variant="outlined"
                prepend-inner-icon="mdi mdi-calendar-range"
                color="info"
              />
              <v-combobox
                :items="availableMonths"
                item-title="value"
                item-value="index"
                v-model="month"
                class="col-6"
                label="Mês"
                variant="outlined"
                prepend-inner-icon="mdi mdi-calendar-range"
                color="info"
              />
            </div>

            <div class="row">
              <v-combobox
                clearable
                multiple
                v-model="filters.name"
                :items="filterOptions.names"
                density="compact"
                class="col-sm-4"
                label="Nome"
                variant="outlined"
                prepend-inner-icon="mdi mdi-account"
                color="info"
              />

              <v-combobox
                clearable
                multiple
                v-model="filters.manager"
                :items="filterOptions.managers"
                density="compact"
                class="col-sm-4"
                label="Gerente"
                variant="outlined"
                prepend-inner-icon="mdi mdi-badge-account"
                color="info"
              />

              <v-combobox
                clearable
                multiple
                v-model="filters.sector"
                :items="filterOptions.sectors"
                density="compact"
                class="col-sm-4"
                label="Setor"
                variant="outlined"
                prepend-inner-icon="mdi mdi-factory"
                color="info"
              />
            </div>

            <div class="row">
              <v-combobox
                v-model="filters.status"
                :items="filterOptions.status"
                clearable
                multiple
                density="compact"
                class="col-sm-4"
                label="Status"
                variant="outlined"
                prepend-inner-icon="mdi mdi-calendar-range"
                color="info"
              />

              <v-combobox
                clearable
                multiple
                v-model="filters.project"
                :items="filterOptions.projects"
                density="compact"
                class="col-sm-4"
                label="Projeto"
                variant="outlined"
                prepend-inner-icon="mdi mdi-lightbulb-on"
                color="info"
              />

              <v-combobox
                clearable
                multiple
                v-model="filters.turno"
                :items="filterOptions.turnos"
                density="compact"
                class="col-sm-4"
                label="Turno"
                variant="outlined"
                prepend-inner-icon="mdi mdi-clipboard-text-clock"
                color="info"
              />
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div v-if="penseAjas.length > 0">
      <RecycleScroller
        :items="filteredList"
        :item-size="105"
        key-field="id"
        class="virtual-list"
        @scroll="onScroll"
      >
        <template #default="{ item }">
          <div
            class="list-item mr-3"
            :class="isMobile ? 'mobile' : ''"
            role="button"
            :key="item.id"
          >
            <v-dialog max-width="900">
              <template v-slot:activator="{ props: activatorProps }">
                <div
                  v-bind="activatorProps"
                  class="item-content"
                  :class="`${computeStatusData(item).className}`"
                >
                  <div class="item-accent"></div>
                  <div class="item-main">
                    <img
                      src="/assets/img/icons/idea-on.png"
                      class="icon-main"
                    />
                    <div>
                      <h3 class="item-title text-ellipsis">
                        {{ item.nome_projeto }}
                      </h3>
                      <p class="item-subtitle">{{ item.setor }}</p>
                    </div>
                  </div>
                  <div class="item-meta">
                    <div class="meta-row">
                      <span class="mdi mdi-account"></span>
                      <span class="text-ellipsis-2">
                        {{ formateName(item.nome) }}
                      </span>
                    </div>
                    <div class="meta-row">
                      <span class="mdi mdi-calendar-clock"></span>
                      <span>{{ item.criado }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Conteúdo do Pense e Aja -->
              <template v-slot:default="{ isActive }">
                <div class="avaliar-container active">
                  <div class="avaliar-content active">
                    <!-- Header -->
                    <div
                      class="avaliar-header position-relative container-fluid"
                    >
                      <div class="d-flex justify-content-around">
                        <div class="row">
                          <div class="avaliar-title col-md-6">
                            <img
                              src="/assets/img/icons/dass-penseaja-light.png"
                              alt="Logo"
                              class="avaliar-logo"
                            />
                            <div class="avaliar-title-text">
                              <h2>
                                Avaliação Pense
                                <span class="avaliar-highlight">& </span>
                                Aja
                              </h2>
                              <span class="avaliar-subtitle">
                                Análise de melhoria contínua
                              </span>
                            </div>
                          </div>

                          <!-- Titulo Projetoi -->
                          <div class="avaliar-projeto col-md-6">
                            <i class="bi bi-lightbulb"></i>
                            Projeto:
                            <strong id="nome-projeto">
                              {{ item.nome_projeto }}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <button
                        @click="isActive.value = false"
                        class="avaliar-close position-absolute top-0 end-0 m-3"
                        aria-label="Fechar"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <!-- Main Content -->
                    <div class="avaliar-body">
                      <!-- Status Badge -->
                      <div class="avaliar-status">
                        <span
                          class="pense-aja-status p-2 rounded-lg"
                          :class="computeStatusData(item).className"
                        >
                          <template
                            v-if="
                              computeStatusData(item).status === 'Reprovado'
                            "
                          >
                            <i class="bi bi-x-octagon-fill"></i>
                          </template>
                          <template
                            v-else-if="
                              computeStatusData(item).status === 'Em Espera'
                            "
                          >
                            <i class="bi bi-hourglass-split"></i>
                          </template>
                          <template
                            v-else-if="
                              computeStatusData(item).status === 'Sem Análise'
                            "
                          >
                            <i class="bi bi-eye-slash"></i>
                          </template>
                          <template
                            v-else-if="
                              computeStatusData(item).status ===
                              'Visto pelo Analista'
                            "
                          >
                            <i class="bi bi-person-badge"></i>
                          </template>
                          <template
                            v-else-if="
                              computeStatusData(item).status ===
                              'Visto pelo Gerente'
                            "
                          >
                            <i class="bi bi-person-check"></i>
                          </template>
                          <template
                            v-else-if="
                              computeStatusData(item).status === 'Avaliado'
                            "
                          >
                            <i class="bi bi-check-circle-fill"></i>
                          </template>
                          <template v-else>
                            <i class="bi bi-question-circle"></i>
                          </template>
                          {{ computeStatusData(item).status }}
                        </span>
                      </div>

                      <!-- Avaliadores -->
                      <div class="avaliar-card-revisores">
                        <div class="avaliar-card-header">
                          <i class="bi bi-people-fill"></i>
                          <h3>Avaliadores</h3>
                        </div>
                        <div class="avaliar-revisores-content">
                          <div class="avaliar-revisor">
                            <div class="avaliar-avatar avaliar-avatar-gerente">
                              <i class="mdi mdi-briefcase-account"></i>
                            </div>
                            <div class="avaliar-revisor-info">
                              <span class="avaliar-label">
                                Gerente Avaliador
                              </span>
                              <span
                                class="avaliar-value"
                                id="gerente-avaliador"
                              >
                                {{ item.gerente_aprovador ?? "Não avaliado" }}
                              </span>
                            </div>
                          </div>
                          <div class="avaliar-revisor">
                            <div class="avaliar-avatar avaliar-avatar-analista">
                              <i class="mdi mdi-account-check"></i>
                            </div>
                            <div class="avaliar-revisor-info">
                              <span class="avaliar-label">
                                Analista Avaliador
                              </span>
                              <span
                                class="avaliar-value"
                                id="analista-avaliador"
                              >
                                {{ item.analista_avaliador ?? "Não avaliado" }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Dados do Colaborador -->
                      <div class="avaliar-card-user">
                        <div class="avaliar-card-header">
                          <i class="bi bi-person-vcard"></i>
                          <h3>Dados do Colaborador</h3>
                        </div>

                        <div class="avaliar-user-content">
                          <div class="avaliar-user-row">
                            <div class="avaliar-user-item">
                              <span class="avaliar-label">Matrícula</span>
                              <span
                                class="avaliar-value"
                                id="matricula-penseaja-avaliacao"
                              >
                                {{ item.matricula ?? "*******" }}
                              </span>
                            </div>

                            <div class="avaliar-user-item">
                              <span class="avaliar-label">Nome</span>
                              <span
                                class="avaliar-value"
                                id="nome-penseaja-avaliacao"
                              >
                                {{ item.nome }}
                              </span>
                            </div>
                          </div>

                          <div class="avaliar-user-row">
                            <div class="avaliar-user-item">
                              <span class="avaliar-label">Gerente</span>
                              <span
                                class="avaliar-value"
                                id="gerente-penseaja-avaliacao"
                              >
                                {{ item.gerente }}
                              </span>
                            </div>

                            <div class="avaliar-user-item">
                              <span class="avaliar-label">Turno</span>
                              <span
                                class="avaliar-value"
                                id="turno-penseaja-avaliacao"
                              >
                                {{ item.turno }}
                              </span>
                            </div>
                          </div>

                          <div class="avaliar-user-row">
                            <div class="avaliar-user-item">
                              <span class="avaliar-label">Setor</span>
                              <span
                                class="avaliar-value"
                                id="setor-penseaja-avaliacao"
                              >
                                {{ item.setor }}
                              </span>
                            </div>

                            <div class="avaliar-user-item">
                              <span class="avaliar-label">
                                Data de Realização
                              </span>
                              <span
                                class="avaliar-value"
                                id="data-penseaja-avaliacao"
                              >
                                {{ item.criado }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Situação Antes e Depois -->
                      <div class="avaliar-card-situacao">
                        <div class="avaliar-card-header">
                          <i class="mdi mdi-arrow-right-circle-outline"></i>
                          <h3>Situação Antes e Depois</h3>
                        </div>

                        <div class="avaliar-situacao-content">
                          <div class="avaliar-tabs">
                            <button
                              class="avaliar-tab-btn"
                              :class="!beforeAfter ? 'active' : ''"
                              @click="beforeAfter = false"
                              data-tab="antes"
                            >
                              <i class="mdi mdi-arrow-left-circle-outline" />
                              <span>Antes</span>
                            </button>

                            <button
                              class="avaliar-tab-btn"
                              :class="beforeAfter ? 'active' : ''"
                              @click="beforeAfter = true"
                              data-tab="depois"
                            >
                              <i class="mdi mdi-arrow-right-circle-outline"></i>
                              <span>Depois</span>
                            </button>
                          </div>

                          <div
                            class="avaliar-tab-content"
                            id="antes-tab"
                            :class="!beforeAfter ? 'active' : ''"
                          >
                            <p id="texto-antes-penseaja">
                              {{ item.situacao_anterior }}
                            </p>
                          </div>

                          <div
                            class="avaliar-tab-content"
                            :class="beforeAfter ? 'active' : ''"
                            id="depois-tab"
                          >
                            <p id="texto-depois-penseaja">
                              {{ item.situacao_atual }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Avaliação -->
                      <!-- {{checkRoleAndEvaluation(item)}} -->
                      <div
                        class="avaliar-card-nivel"
                        v-if="
                          getUserPermission(user) &&
                          checkRoleAndEvaluation(item)
                        "
                      >
                        <div class="avaliar-card-header">
                          <i class="bi bi-trophy"></i>
                          <h3>
                            Classificação do Pense<span
                              class="avaliar-highlight"
                              >&</span
                            >Aja
                          </h3>
                        </div>

                        <div class="avaliar-nivel-content">
                          <div class="avaliar-rating">
                            <label
                              v-for="(classification, key) in classifications"
                              :key="key"
                              class="avaliar-rating-option"
                            >
                              <input
                                type="radio"
                                name="avaliacao-pense-aja"
                                @click="
                                  setEvaluationValue(classification.value)
                                "
                              />
                              <div class="avaliar-rating-display">
                                <span class="avaliar-rating-value">
                                  {{ key }}
                                </span>
                                <span class="avaliar-rating-icon">
                                  <i class="bi bi-star-fill"></i>
                                </span>
                                <span class="avaliar-rating-label">
                                  {{ classification.name }}
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div class="justifica-avaliacao" v-if="evaluationValue">
                          <textarea
                            placeholder="Justifique a avaliação do pense e aja."
                            name="justificativa-avaliacao"
                            id="justificativa-avaliacao"
                            v-model="justification"
                          ></textarea>
                        </div>
                      </div>

                      <!-- Flags -->
                      <div
                        class="avaliar-card-flags"
                        v-if="
                          getUserPermission(user) &&
                          checkRoleAndEvaluation(item)
                        "
                      >
                        <div
                          class="row p-3 d-flex justify-content-around align-items-center"
                        >
                          <label class="avaliar-toggle col-md-4">
                            <input
                              type="checkbox"
                              id="em-espera"
                              v-model="emEspera"
                            />
                            <span class="avaliar-toggle-slider"></span>
                            <span class="avaliar-toggle-label">
                              <i class="bi bi-hourglass"></i>
                              Em Espera
                            </span>
                          </label>

                          <label class="avaliar-toggle col-md-4">
                            <input
                              type="checkbox"
                              id="replicavel"
                              v-model="replicavel"
                            />
                            <span class="avaliar-toggle-slider"></span>
                            <span class="avaliar-toggle-label">
                              <i class="bi bi-diagram-3"></i>
                              Replicável
                            </span>
                          </label>

                          <v-combobox
                            v-model="a3PenseAja"
                            :items="opcoesA3"
                            item-title="label"
                            item-value="value"
                            label="A3 Mãe"
                            clearable
                            return-object
                            class="col-md-4 mt-2"
                            variant="outlined"
                            color="red"
                            density="compact"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div
                      class="avaliar-footer"
                      v-if="
                        getUserPermission(user) && checkRoleAndEvaluation(item)
                      "
                    >
                      <div class="avaliar-actions">
                        <button
                          @click="handleEvaluationValue('approve', item)"
                          class="avaliar-btn avaliar-btn-aprovar"
                          :class="setButtonPermission(item)"
                        >
                          <i class="bi bi-check-circle"></i>
                          <span>Aprovar</span>
                        </button>

                        <button
                          @click="handleEvaluationValue('reprove', item)"
                          class="avaliar-btn avaliar-btn-reprovar"
                          :class="setButtonPermission(item)"
                        >
                          <i class="bi bi-x-circle"></i>
                          <span>Reprovar</span>
                        </button>

                        <button
                          @click="handleEvaluationValue('exclude', item)"
                          class="avaliar-btn avaliar-btn-excluir"
                          :class="setButtonPermission(item)"
                        >
                          <i class="bi bi-trash"></i>
                          <span>Excluir</span>
                        </button>

                        <button
                          @click="isActive.value = false"
                          class="avaliar-btn avaliar-btn-cancelar"
                        >
                          <i class="bi bi-arrow-return-left"></i>
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </v-dialog>
          </div>
        </template>
      </RecycleScroller>
    </div>

    <div v-else>
      <span class="p-2 bg-info rounded-lg w-100">
        <i class="mdi mdi-alert-octagon"></i>
        Sem registros no sistema. Seja o primeiro a fazer um Pense&Aja!
      </span>
    </div>
  </div>

  <Notification ref="notification" />
</template>

<script setup>
import {
  computed,
  watch,
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
} from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import axios from "axios";
import { useUserStore } from "@/stores/userStore";
import { evaluatePenseAja } from "@/services/evaluatePenseAjaService";
import Notification from "./Notification.vue";
import { getUserPermission } from "@/services/userService";
import { setUserRole } from "@/services/userService";
import { formateName } from "@/services/userService";

const notification = ref(null);
const isMobile = ref(false);
function handleResize() {
  isMobile.value = window.innerWidth <= 1024;
}

const monthIndex = [
  { index: 0, value: "Janeiro" },
  { index: 1, value: "Fevereiro" },
  { index: 2, value: "Março" },
  { index: 3, value: "Abril" },
  { index: 4, value: "Maio" },
  { index: 5, value: "Junho" },
  { index: 6, value: "Julho" },
  { index: 7, value: "Agosto" },
  { index: 8, value: "Setembro" },
  { index: 9, value: "Outubro" },
  { index: 10, value: "Novembro" },
  { index: 11, value: "Dezembro" },
];

const year = ref(null);
const month = ref(null);
const filterDate = ref({
  startDate: null,
  endDate: null,
});

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonthIndex = currentDate.getMonth();
const penseAjaDay = 28;

/*
  Define o filtro de data baseado no ano e mes selecionado
  Se o mês atual for janeiro, pega o mês anterior (dezembro) e o ano anterior
  Se não, pega o mês anterior e o ano atual
*/
const setupDate = (yearValue, monthValue) => {
  let lastMonthIndex;
  let lastMonthYear;
  if (monthValue === 0) {
    lastMonthIndex = 11;
    lastMonthYear = yearValue - 1;
  } else {
    lastMonthIndex = monthValue - 1;
    lastMonthYear = yearValue;
  }
  year.value = yearValue;
  month.value = monthIndex[monthValue];

  filterDate.value.startDate = new Date(
    lastMonthYear,
    lastMonthIndex,
    penseAjaDay
  );

  filterDate.value.endDate = new Date(yearValue, monthValue, penseAjaDay);
};

const availableYears = ref([]);
const availableMonths = ref([]);
/*
  Atualiza a lista de anos e meses disponíveis
  Verifica se o ano selecionad é o ano atual
  se for pega os meses disponíveis, caso contrário pega todos os meses
*/
const updateYearsAndMonths = (onlyMonths) => {
  if (!onlyMonths) {
    // Pega os anos até 2024
    availableYears.value = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2024; i--) {
      availableYears.value.push(i);
    }
  }

  // Pega os meses disponiveis
  if (year.value === currentYear) {
    availableMonths.value = monthIndex.slice(0, currentMonthIndex + 1);
  } else {
    availableMonths.value = [...monthIndex];
  }
};

// Verifica seleção do pense aja -> Antes \\ Depois
const beforeAfter = ref(false);

// Busca pense aja de acordo com filtro de datas -> Default mês atual
const penseAjaCount = ref(0);
const penseAjas = ref([]);
const loadContent = async () => {
  const dassOffice = localStorage.getItem("unidadeDass");
  if (!dassOffice) {
    console.error("Unidade não encontrada no localStorage");
    notification.value.showPopup(
      "error",
      "Unidade do colaborador não encontrada.",
      "Entre em contato com a equipe de automação",
      10000
    );
    return;
  }
  const params = {
    startDate: filterDate.value.startDate,
    endDate: filterDate.value.endDate,
  };

  try {
    const { data } = await axios.get(
      `http://localhost:2512/pense-aja/${dassOffice}`,
      {
        params,
      }
    );

    penseAjas.value = data;
    penseAjaCount.value = data.length;
    emit('penseAjaCount', penseAjaCount.value)
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  }
};

const emit = defineEmits(['penseAjaCount'])

// Configura watchers para os filtros
function setupWatchers() {
  watch(year, (newYear) => {
    if (!newYear || !month.value) return;
    setupDate(newYear, month.value.index);
    updateYearsAndMonths(true);
    loadContent();
  });

  watch(month, (newMonth) => {
    if (!newMonth) return;
    setupDate(year.value, newMonth.index);
    updateYearsAndMonths(true);
    loadContent();
  });
}

// Carrega mais conteúdo quando o usuário rola para baixo e esta a 100px de terminar a lista
const onScroll = (event) => {
  if (
    event.target.scrollTop + event.target.clientHeight >=
    event.target.scrollHeight - 50
  ) {
    loadContent();
  }
};

// Carrega dados do usuario se estiver logado
const user = useUserStore();

const filters = reactive({
  name: [],
  sector: [],
  manager: [],
  project: [],
  turno: [],
  status: [],
});

const filterOptions = computed(() => {
  const annotated = penseAjas.value.map((item) => {
    const { status } = computeStatusData(item);
    return { ...item, status };
  });

  const unique = (key) =>
    Array.from(new Set(annotated.map((i) => i[key])))
      .filter((v) => v)
      .sort();

  return {
    names: unique("nome"),
    sectors: unique("setor"),
    managers: unique("gerente"),
    projects: unique("nome_projeto"),
    turnos: unique("turno"),
    status: unique("status"),
  };
});

const checkRoleAndEvaluation = (penseAja) => {
  if (setUserRole(user) === "analista" && penseAja.analista_avaliador) {
    return false;
  }
  if (setUserRole(user) === "analista" && penseAja.gerente_aprovador) {
    return false;
  }

  return true;
};

// Filtra a lista de pense e ajas de acordo com os filtros
const filteredList = computed(() => {
  const term =
    Array.isArray(filters.name) && filters.name.length === 1
      ? filters.name[0]?.trim()?.toLowerCase()
      : null;

  return penseAjas.value.filter((item) => {
    const nome = (item.nome || "").toLowerCase();
    const setor = item.setor || "";
    const gerente = item.gerente || "";
    const projeto = item.nome_projeto || "";
    const turno = item.turno || "";
    const { status } = computeStatusData(item);

    // Filtros múltiplos
    const byName = !filters.name.length || filters.name.includes(item.nome);
    const bySector = !filters.sector.length || filters.sector.includes(setor);
    const byManager =
      !filters.manager.length || filters.manager.includes(gerente);
    const byProject =
      !filters.project.length || filters.project.includes(projeto);
    const byTurno = !filters.turno.length || filters.turno.includes(turno);
    const byStatus = !filters.status.length || filters.status.includes(status);

    return byName && bySector && byManager && byProject && byTurno && byStatus;
  });
});

function computeStatusData(penseAja) {
  let status;

  if (penseAja.status_gerente === "REPROVAR") {
    status = "Reprovado";
  } else if (penseAja.em_espera === "1") {
    status = "Em Espera";
  } else if (!penseAja.gerente_aprovador && !penseAja.analista_avaliador) {
    status = "Sem Análise";
  } else if (!penseAja.gerente_aprovador) {
    status = "Visto pelo Analista";
  } else if (!penseAja.analista_avaliador) {
    status = "Visto pelo Gerente";
  } else if (penseAja.gerente_aprovador && penseAja.analista_avaliador) {
    status = "Avaliado";
  } else {
    status = "Não Avaliado";
  }

  // mapeia status → classe (exemplo)
  const classMap = {
    Reprovado: "reprovado",
    "Em Espera": "em-espera",
    "Sem Análise": "sem-ambos",
    "Visto pelo Analista": "sem-gerente",
    "Visto pelo Gerente": "sem-analista",
    Avaliado: "avaliado",
    "Não Avaliado": "nao-avaliado",
  };

  return {
    status,
    className: classMap[status] || "",
  };
}

// Avaliação
const classifications = {
  A: { name: "Avançada", value: 3 },
  B: { name: "Intermediária", value: 2 },
  C: { name: "Básica", value: 1 },
};

const evaluationValue = ref(null);
const emEspera = ref(false);
const replicavel = ref(false);
const a3PenseAja = ref(null);
const opcoesA3 = [
  { value: "lean", label: "LEAN" },
  { value: "pessoas", label: "PESSOAS" },
  { value: "digitalizacao", label: "DIGITALIZAÇÃO" },
  { value: "produtividade", label: "PRODUTIVIDADE" },
  { value: "padronizacao", label: "PADRONIZAÇÃO" },
  { value: "comunicacao", label: "COMUNICAÇÃO" },
  { value: "ssma", label: "SSMA" },
  { value: "orcamento", label: "ORÇAMENTO" },
  { value: "qualidade", label: "QUALIDADE" },
];
const justification = ref("");
const setEvaluationValue = (value) => {
  evaluationValue.value = value;
};

const setButtonPermission = (penseAja) => {
  if (
    penseAja.status_analista !== "0" &&
    user.funcao?.toLowerCase().includes("analista")
  ) {
    return "disabled";
  }
  if (
    penseAja.status_gerente !== "0" &&
    user.funcao?.toLowerCase().includes("gerente")
  ) {
    return "disabled";
  }
  return "";
};

const handleEvaluationValue = async (action, penseAja) => {
  const dassOffice = "SEST";
  const evaluationData = {
    id: penseAja.id,
    status: action,
    emEspera: emEspera.value ? "1" : "0",
    replicavel: replicavel.value ? "1" : "0",
    a3Mae: a3PenseAja.value?.value,
    avaliacao: evaluationValue?.value,
    justificativa: justification.value,
    dassOffice: dassOffice,
  };

  await evaluatePenseAja(evaluationData, notification);
};

onMounted(() => {
  setupDate(currentYear, currentMonthIndex);
  updateYearsAndMonths();
  handleResize();

  loadContent();
  setupWatchers();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
@import url("/assets/css/avaliacao.css");

.sem-gerente {
  background-color: rgba(251, 146, 60, 0.12) !important;
  border-left: 4px solid #f97316;
}

.reprovado {
  background-color: #fcd6d6 !important;
  border-left: 4px solid #ff4000;
}

.sem-ambos {
  background-color: rgba(168, 85, 247, 0.15) !important;
  border-left: 4px solid #a855f7 !important;
  color: #6b21a8;
}

.em-espera {
  background-color: #fbf9e3 !important;
  border-left: 4px solid #ffeb3b !important;
}

.sem-analista {
  background-color: rgba(56, 189, 248, 0.15) !important;
  border-left: 4px solid #0ea5e9 !important;
}

.avaliado {
  background-color: #f1fff1 !important;
  border-left: 4px solid #00f583 !important;
}

.nao-avaliado {
  background-color: #f1f1f1 !important;
  border-left: 4px solid #8f8f8f !important;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
  display: block;
}

.text-ellipsis-2 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 350px;
  display: block;
}

#nome-projeto {
  font-size: 0.7rem;
  font-weight: bold;
}

@media screen and (max-width: 768px) {
  .text-ellipsis {
    max-width: 200px;
  }

  .text-ellipsis-2 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
    display: block;
  }
}

.list-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.virtual-list {
  height: 600px;
  overflow-y: auto;
}

/* cada cartão */
.list-item {
  margin-bottom: 1rem;
}

.list-item.mobile {
  margin-top: 70px;
  margin-bottom: 1rem;
}

.item-content {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-card, #fff);
  border-radius: 1rem;
  padding: 0.8rem 1.2rem;
  box-shadow: 0 2px 8px var(--shadow-light);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.item-content:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px var(--shadow-strong);
}

/* barra de destaque lateral */
/* .item-accent {
  position: absolute;
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  background: var(--red-primary, #ef5350);
} */

/* conteúdo principal */
.item-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.icon-main {
  width: 30px;
  height: 30px;
  filter: hue-rotate(-15deg) brightness(1.2);
}

/* títulos */
.item-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-dark, #333);
}
.item-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: var(--text-muted, #666);
}

/* metadados */
.item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted, #666);
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.icon-meta {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(0.4);
}
</style>
