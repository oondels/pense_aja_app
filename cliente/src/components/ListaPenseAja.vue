<template>
  <div class="list-container">
    <div v-if="!isMobile" class="filters px-6 py-4">
      <!-- Campo de busca -->
      <v-text-field
        label="Pesquisar Pense e Aja"
        variant="outlined"
        color="info"
        prepend-inner-icon="mdi mdi-text-search"
        density="compact"
        v-model="searchText"
        class="w-full"
      />

      <!-- Linha com Ano e Mês -->
      <div class="flex flex-wrap -mx-2">
        <div class="w-full sm:w-1/2 px-2 sm:mb-0">
          <v-combobox
            :items="availableYears"
            v-model="year"
            label="Ano"
            variant="outlined"
            prepend-inner-icon="mdi mdi-calendar-range"
            color="info"
            density="compact"
            class="w-full"
          />
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <v-combobox
            :items="availableMonths"
            item-title="value"
            item-value="index"
            v-model="month"
            label="Mês"
            variant="outlined"
            prepend-inner-icon="mdi mdi-calendar-range"
            color="info"
            density="compact"
            class="w-full"
          />
        </div>
      </div>

      <!-- Linha com Nome, Gerente e Setor -->
      <div class="flex flex-wrap -mx-2">
        <div class="w-full md:w-1/3 px-2 md:mb-0">
          <v-combobox
            clearable
            multiple
            v-model="filters.name"
            :items="filterOptions.names"
            label="Nome"
            variant="outlined"
            prepend-inner-icon="mdi mdi-account"
            color="info"
            density="compact"
            class="w-full"
          />
        </div>
        <div class="w-full md:w-1/3 px-2 md:mb-0">
          <v-combobox
            clearable
            multiple
            v-model="filters.manager"
            :items="filterOptions.managers"
            label="Gerente"
            variant="outlined"
            prepend-inner-icon="mdi mdi-badge-account"
            color="info"
            density="compact"
            class="w-full"
          />
        </div>
        <div class="w-full md:w-1/3 px-2">
          <v-combobox
            clearable
            multiple
            v-model="filters.sector"
            :items="filterOptions.sectors"
            label="Setor"
            variant="outlined"
            prepend-inner-icon="mdi mdi-factory"
            color="info"
            density="compact"
            class="w-full"
          />
        </div>
      </div>

      <!-- Linha com Status, Projeto e Turno -->
      <div class="flex flex-wrap -mx-2">
        <div class="w-full md:w-1/3 px-2 md:mb-0">
          <v-combobox
            v-model="filters.status"
            :items="filterOptions.status"
            clearable
            multiple
            label="Status"
            variant="outlined"
            prepend-inner-icon="mdi mdi-calendar-range"
            color="info"
            density="compact"
            class="w-full"
          />
        </div>
        <div class="w-full md:w-1/3 px-2 md:mb-0">
          <v-combobox
            clearable
            multiple
            v-model="filters.project"
            :items="filterOptions.projects"
            label="Projeto"
            variant="outlined"
            prepend-inner-icon="mdi mdi-lightbulb-on"
            color="info"
            density="compact"
            class="w-full"
          />
        </div>
        <div class="w-full md:w-1/3 px-2">
          <v-combobox
            clearable
            multiple
            v-model="filters.turno"
            :items="filterOptions.turnos"
            label="Turno"
            variant="outlined"
            prepend-inner-icon="mdi mdi-clipboard-text-clock"
            color="info"
            density="compact"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <v-expansion-panels v-else class="mb-4 shadow">
      <v-expansion-panel>
        <v-expansion-panel-title>
          Filtros
          <template v-slot:actions>
            <v-icon icon="mdi mdi-filter-multiple"></v-icon>
          </template>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <div class="filters px-4 py-3">
            <v-text-field
              label="Pesquisar Pense e Aja"
              variant="outlined"
              color="info"
              prepend-inner-icon="mdi mdi-text-search"
              density="compact"
              v-model="searchText"
              class="w-full"
            />

            <!-- Ano e Mês -->
            <div class="flex flex-wrap -mx-2">
              <div class="w-1/2 px-2">
                <v-combobox
                  :items="availableYears"
                  v-model="year"
                  label="Ano"
                  variant="outlined"
                  prepend-inner-icon="mdi mdi-calendar-range"
                  color="info"
                  density="compact"
                  class="w-full"
                />
              </div>
              <div class="w-1/2 px-2">
                <v-combobox
                  :items="availableMonths"
                  item-title="value"
                  item-value="index"
                  v-model="month"
                  label="Mês"
                  variant="outlined"
                  prepend-inner-icon="mdi mdi-calendar-range"
                  color="info"
                  density="compact"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Nome, Gerente, Setor -->
            <div class="flex flex-wrap -mx-2">
              <div class="w-full md:w-1/3 px-2 md:mb-0">
                <v-combobox
                  clearable
                  multiple
                  v-model="filters.name"
                  :items="filterOptions.names"
                  label="Nome"
                  variant="outlined"
                  prepend-inner-icon="mdi mdi-account"
                  color="info"
                  density="compact"
                  class="w-full"
                />
              </div>
              <div class="w-full md:w-1/3 px-2 md:mb-0">
                <v-combobox
                  clearable
                  multiple
                  v-model="filters.manager"
                  :items="filterOptions.managers"
                  label="Gerente"
                  variant="outlined"
                  prepend-inner-icon="mdi mdi-badge-account"
                  color="info"
                  density="compact"
                  class="w-full"
                />
              </div>
              <div class="w-full md:w-1/3 px-2">
                <v-combobox
                  clearable
                  multiple
                  v-model="filters.sector"
                  :items="filterOptions.sectors"
                  label="Setor"
                  variant="outlined"
                  prepend-inner-icon="mdi mdi-factory"
                  color="info"
                  density="compact"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Status, Projeto, Turno -->
            <div class="flex flex-wrap -mx-2">
              <div class="w-full md:w-1/3 px-2 md:mb-0">
                <v-combobox
                  v-model="filters.status"
                  :items="filterOptions.status"
                  clearable
                  multiple
                  label="Status"
                  variant="outlined"
                  prepend-inner-icon="mdi mdi-calendar-range"
                  color="info"
                  density="compact"
                  class="w-full"
                />
              </div>
              <div class="w-full md:w-1/3 px-2 md:mb-0">
                <v-combobox
                  clearable
                  multiple
                  v-model="filters.project"
                  :items="filterOptions.projects"
                  label="Projeto"
                  variant="outlined"
                  prepend-inner-icon="mdi mdi-lightbulb-on"
                  color="info"
                  density="compact"
                  class="w-full"
                />
              </div>
              <div class="w-full md:w-1/3 px-2">
                <v-combobox
                  clearable
                  multiple
                  v-model="filters.turno"
                  :items="filterOptions.turnos"
                  label="Turno"
                  variant="outlined"
                  prepend-inner-icon="mdi mdi-clipboard-text-clock"
                  color="info"
                  density="compact"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div v-if="penseAjas.length > 0 && !loading">
      <RecycleScroller :items="filteredList" :item-size="!smallPhone ? 105 : 80" key-field="id" class="virtual-list">
        <template #default="{ item }">
          <v-dialog max-width="900">
            <template v-slot:activator="{ props: activatorProps }">
              <div
                v-bind="activatorProps"
                class="item-content"
                :class="`${computeStatusData(item).className}`"
                role="button"
              >
                <div class="item-main">
                  <img src="/assets/img/icons/idea-on-brain.png" class="icon-main" />
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

            <template v-slot:default="{ isActive }">
              <div class="list-item mr-3" role="button" :key="item.id">
                <!-- Conteúdo do Pense e Aja -->
                <div class="avaliar-container active">
                  <div class="avaliar-content active">
                    <!-- Header -->
                    <div class="avaliar-header position-relative container-fluid">
                      <div class="d-flex justify-content-around">
                        <div class="row">
                          <div class="avaliar-title col-md-6">
                            <img src="/assets/img/icons/dass-penseaja-light.png" alt="Logo" class="avaliar-logo" />
                            <div class="avaliar-title-text">
                              <h2>
                                Avaliação Pense
                                <span class="avaliar-highlight">& </span>
                                Aja
                              </h2>
                              <span class="avaliar-subtitle"> Análise de melhoria contínua </span>
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
                        <span class="pense-aja-status p-2 rounded-lg" :class="computeStatusData(item).className">
                          <template v-if="computeStatusData(item).status === 'Reprovado'">
                            <i class="bi bi-x-octagon-fill"></i>
                          </template>
                          <template v-else-if="computeStatusData(item).status === 'Em Espera'">
                            <i class="bi bi-hourglass-split"></i>
                          </template>
                          <template v-else-if="computeStatusData(item).status === 'Sem Análise'">
                            <i class="bi bi-eye-slash"></i>
                          </template>
                          <template v-else-if="computeStatusData(item).status === 'Visto pelo Analista'">
                            <i class="bi bi-person-badge"></i>
                          </template>
                          <template v-else-if="computeStatusData(item).status === 'Visto pelo Gerente'">
                            <i class="bi bi-person-check"></i>
                          </template>
                          <template v-else-if="computeStatusData(item).status === 'Avaliado'">
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
                              <span class="avaliar-label"> Gerente Avaliador </span>
                              <span class="avaliar-value" id="gerente-avaliador">
                                {{ item.gerente_aprovador ?? "Não avaliado" }}
                              </span>

                              <span v-if="getUserPermission() && item.gerente_aprovador">
                                Classificação: {{ item.classificacao }}
                              </span>
                            </div>
                          </div>
                          <div class="avaliar-revisor">
                            <div class="avaliar-avatar avaliar-avatar-analista">
                              <i class="mdi mdi-account-check"></i>
                            </div>
                            <div class="avaliar-revisor-info">
                              <span class="avaliar-label"> Analista Avaliador </span>
                              <span class="avaliar-value" id="analista-avaliador">
                                {{ item.analista_avaliador ?? "Não avaliado" }}
                              </span>

                              <span v-if="getUserPermission() && item.analista_avaliador">
                                Classificação: {{ item.classificacao }}
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
                              <span class="avaliar-value" id="matricula-penseaja-avaliacao">
                                {{ item.matricula ?? "*******" }}
                              </span>
                            </div>

                            <div class="avaliar-user-item">
                              <span class="avaliar-label">Nome</span>
                              <span class="avaliar-value" id="nome-penseaja-avaliacao">
                                {{ item.nome }}
                              </span>
                            </div>
                          </div>

                          <div class="avaliar-user-row">
                            <div class="avaliar-user-item">
                              <span class="avaliar-label">Gerente</span>
                              <span class="avaliar-value" id="gerente-penseaja-avaliacao">
                                {{ item.gerente }}
                              </span>
                            </div>

                            <div class="avaliar-user-item">
                              <span class="avaliar-label">Turno</span>
                              <span class="avaliar-value" id="turno-penseaja-avaliacao">
                                {{ item.turno }}
                              </span>
                            </div>
                          </div>

                          <div class="avaliar-user-row">
                            <div class="avaliar-user-item">
                              <span class="avaliar-label">Setor</span>
                              <span class="avaliar-value" id="setor-penseaja-avaliacao">
                                {{ item.setor }}
                              </span>
                            </div>

                            <div class="avaliar-user-item">
                              <span class="avaliar-label"> Data de Realização </span>
                              <span class="avaliar-value" id="data-penseaja-avaliacao">
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

                          <div class="avaliar-tab-content" id="antes-tab" :class="!beforeAfter ? 'active' : ''">
                            <p id="texto-antes-penseaja">
                              {{ item.situacao_anterior }}
                            </p>
                          </div>

                          <div class="avaliar-tab-content" :class="beforeAfter ? 'active' : ''" id="depois-tab">
                            <p id="texto-depois-penseaja">
                              {{ item.situacao_atual }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Avaliação -->
                      <div class="avaliar-card-nivel" v-if="getUserPermission() && checkRoleAndEvaluation(item)">
                        <div class="avaliar-card-header">
                          <i class="bi bi-trophy"></i>
                          <h3>Classificação do Pense<span class="avaliar-highlight">&</span>Aja</h3>
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
                                @click="setEvaluationValue(classification.value)"
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

                        <div class="justifica-avaliacao" v-if="evaluationValue || reprove">
                          <textarea
                            ref="justificativa"
                            placeholder="Justifique a avaliação do pense e aja."
                            name="justificativa-avaliacao"
                            id="justificativa-avaliacao"
                            v-model="justification"
                          ></textarea>
                        </div>
                      </div>

                      <!-- Flags -->
                      <div class="avaliar-card-flags" v-if="getUserPermission() && checkRoleAndEvaluation(item)">
                        <div class="row p-3 d-flex justify-content-around align-items-center">
                          <label class="avaliar-toggle col-md-4">
                            <input type="checkbox" id="em-espera" v-model="emEspera" />
                            <span class="avaliar-toggle-slider"></span>
                            <span class="avaliar-toggle-label">
                              <i class="bi bi-hourglass"></i>
                              Em Espera
                            </span>
                          </label>

                          <label class="avaliar-toggle col-md-4">
                            <input type="checkbox" id="replicavel" v-model="replicavel" />
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
                    <div class="avaliar-footer" v-if="getUserPermission()">
                      <div class="avaliar-actions">
                        <button
                          @click="handleEvaluationValue('approve', item, isActive)"
                          class="avaliar-btn avaliar-btn-aprovar"
                          :class="setButtonPermission(item)"
                        >
                          <i class="bi bi-check-circle"></i>
                          <span>Aprovar</span>
                        </button>

                        <button
                          @click="handleEvaluationValue('reprove', item, isActive)"
                          class="avaliar-btn avaliar-btn-reprovar"
                          :class="setButtonPermission(item)"
                        >
                          <i class="bi bi-x-circle"></i>
                          <span>Reprovar</span>
                        </button>

                        <button
                          @click="handleEvaluationValue('exclude', item, isActive)"
                          class="avaliar-btn avaliar-btn-excluir"
                          :class="setButtonPermission(item)"
                        >
                          <i class="bi bi-trash"></i>
                          <span>Excluir</span>
                        </button>

                        <button @click="isActive.value = false" class="avaliar-btn avaliar-btn-cancelar">
                          <i class="bi bi-arrow-return-left"></i>
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </v-dialog>
        </template>
      </RecycleScroller>
    </div>

    <div v-else-if="loading">
      <Loading />
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
import { computed, watch, ref, onMounted, onBeforeUnmount, reactive, nextTick } from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { useUserStore } from "@/stores/userStore";
import { evaluatePenseAja } from "@/services/evaluatePenseAjaService";
import Notification from "./Notification.vue";
import { getUserPermission } from "@/services/userService";
import { setUserRole } from "@/services/userService";
import { formateName } from "@/services/userService";
import { commonApi } from "@/services/httpClient.js";
import Loading from "@/components/Loading.vue";
import { ip } from "@/config/ip.js";
import { throttle } from "lodash-es";
import "@/assets/css/listaPenseAja.css";

const notification = ref(null);
const isMobile = ref(false);
const smallPhone = ref(false);
function handleResize() {
  isMobile.value = window.innerWidth <= 1024;
  smallPhone.value = window.innerWidth <= 550;
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

  filterDate.value.startDate = new Date(lastMonthYear, lastMonthIndex, penseAjaDay);

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
const loading = ref(false);
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
    loading.value = true;
    const { data } = await commonApi.get(`${ip}:2512/pense-aja/${dassOffice}`, {
      params,
    });

    penseAjas.value = data;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  } finally {
    loading.value = false;
  }
};

const emit = defineEmits(["penseAjaCount"]);

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

// Carrega dados do usuario se estiver logado
const user = useUserStore();

const checkRoleAndEvaluation = (penseAja) => {
  if (setUserRole(user) === "analista" && penseAja.analista_avaliador) {
    return false;
  }
  if (setUserRole(user) === "analista" && penseAja.gerente_aprovador) {
    return false;
  }

  return true;
};

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
    Array.from(new Set(annotated.map((i) => i[key].toUpperCase())))
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

const searchText = ref("");
// Filtra a lista de pense e ajas de acordo com os filtros
const filteredList = computed(() => {
  // Obtém o termo de pesquisa e normaliza para facilitar a comparação
  const searchTerm = searchText.value?.toUpperCase().trim() || "";

  return penseAjas.value.filter((item) => {
    const nome = (item.nome || "").toUpperCase();
    const setor = (item.setor || "").toUpperCase();
    const gerente = (item.gerente || "").toUpperCase();
    const projeto = (item.nome_projeto || "").toUpperCase();
    const turno = (item.turno || "").toUpperCase();
    const situacaoAnterior = (item.situacao_anterior || "").toUpperCase();
    const situacaoAtual = (item.situacao_atual || "").toUpperCase();
    const matricula = (item.matricula || "").toString().toUpperCase();
    const { status } = computeStatusData(item);
    const statusUpper = status.toUpperCase();

    // Filtro por texto de pesquisa (busca em múltiplos campos)
    const matchesSearch =
      searchTerm === "" ||
      nome.includes(searchTerm) ||
      setor.includes(searchTerm) ||
      gerente.includes(searchTerm) ||
      projeto.includes(searchTerm) ||
      turno.includes(searchTerm) ||
      situacaoAnterior.includes(searchTerm) ||
      situacaoAtual.includes(searchTerm) ||
      matricula.includes(searchTerm) ||
      statusUpper.includes(searchTerm);

    // Filtros de seleção múltipla
    const byName = !filters.name.length || filters.name.includes(nome);
    const bySector = !filters.sector.length || filters.sector.includes(setor);
    const byManager = !filters.manager.length || filters.manager.includes(gerente);
    const byProject = !filters.project.length || filters.project.includes(projeto);
    const byTurno = !filters.turno.length || filters.turno.includes(turno);
    const byStatus = !filters.status.length || filters.status.includes(status);

    // Retorna true apenas se passar por todos os filtros
    return matchesSearch && byName && bySector && byManager && byProject && byTurno && byStatus;
  });
});

// Atualiza a contagem de pense e aja disponíveis de acordo com o filtro aplicado
watch(filteredList, (newValue) => {
  if (newValue) {
    penseAjaCount.value = newValue.length;
    emit("penseAjaCount", penseAjaCount.value);
  }
});

function computeStatusData(penseAja) {
  let status;

  if (penseAja.status_gerente === "REPROVAR") {
    status = "REPROVADO";
  } else if (penseAja.em_espera === "1") {
    status = "EM ESPERA";
  } else if (!penseAja.gerente_aprovador && !penseAja.analista_avaliador) {
    status = "SEM ANÁLISE";
  } else if (!penseAja.gerente_aprovador) {
    status = "VISTO PELO ANALISTA";
  } else if (!penseAja.analista_avaliador) {
    status = "VISTO PELO GERENTE";
  } else if (penseAja.gerente_aprovador && penseAja.analista_avaliador) {
    status = "AVALIADO";
  } else {
    status = "NÃO AVALIADO";
  }

  // mapeia status → classe (exemplo)
  const classMap = {
    REPROVADO: "reprovado",
    "EM ESPERA": "em-espera",
    "SEM ANÁLISE": "sem-ambos",
    "VISTO PELO ANALISTA": "sem-gerente",
    "VISTO PELO GERENTE": "sem-analista",
    AVALIADO: "avaliado",
    "NÃO AVALIADO": "nao-avaliado",
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
  if (penseAja.status_analista && user.funcao?.toLowerCase().includes("analista")) {
    return "disabled";
  }
  if (penseAja.status_gerente && user.funcao?.toLowerCase().includes("gerente")) {
    return "disabled";
  }
  return "";
};

const justificativa = ref(null);
const reprove = ref(false);
// TODO: Exibir avaliação do analista para o gerente
const handleEvaluationValue = async (action, penseAja, dialog) => {
  if (action === "reprove") {
    reprove.value = true;
    await nextTick();
    justificativa.value.focus();
  }

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

  await evaluatePenseAja(evaluationData, notification, dialog);
  await loadContent();
};

const handleResizeThrottled = throttle(handleResize, 200);
onMounted(() => {
  window.addEventListener("resize", handleResizeThrottled);
  setupDate(currentYear, currentMonthIndex);
  updateYearsAndMonths();
  handleResize();

  loadContent();
  setupWatchers();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResizeThrottled);
});
</script>
