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

    <div class="info-data">
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h5 class="text-md font-medium text-gray-700 mb-3 border-b pb-2">Legenda: Status dos Projetos</h5>
        <div class="flex flex-wrap gap-2">
          <div
            class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md transition-all duration-200 hover:-translate-y-1"
          >
            <span class="w-3 h-3 rounded-full bg-purple-400 border-l-4 border-purple-600"></span>
            <span class="text-xs text-gray-600">Sem Análise</span>
          </div>
          <div
            class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md transition-all duration-200 hover:-translate-y-1"
          >
            <span class="w-3 h-3 rounded-full bg-orange-200 border-l-4 border-orange-500"></span>
            <span class="text-xs text-gray-600">Visto pelo Analista</span>
          </div>
          <div
            class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md transition-all duration-200 hover:-translate-y-1"
          >
            <span class="w-3 h-3 rounded-full bg-blue-200 border-l-4 border-blue-400"></span>
            <span class="text-xs text-gray-600">Visto pelo Gerente</span>
          </div>
          <div
            class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md transition-all duration-200 hover:-translate-y-1"
          >
            <span class="w-3 h-3 rounded-full bg-red-200 border-l-4 border-red-500"></span>
            <span class="text-xs text-gray-600">Reprovado</span>
          </div>
          <div
            class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md transition-all duration-200 hover:-translate-y-1"
          >
            <span class="w-3 h-3 rounded-full bg-green-100 border-l-4 border-green-500"></span>
            <span class="text-xs text-gray-600">Avaliado</span>
          </div>
          <div
            class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md transition-all duration-200 hover:-translate-y-1"
          >
            <span class="w-3 h-3 rounded-full bg-yellow-100 border-l-4 border-yellow-400"></span>
            <span class="text-xs text-gray-600">Em Espera</span>
          </div>
        </div>
      </div>
    </div>

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
                                Classificação: {{ item.classificacao || "Reprovado" }}
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
                                Classificação:
                                {{ item.classificacao || "Reprovado" }}
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

                      <div v-if="item.ganhos" class="avaliar-card-ganhos-perdas">
                        <div class="avaliar-card-header">
                          <i class="mdi mdi-chart-line"></i>
                          <h3>Impactos do Projeto</h3>
                        </div>

                        <div class="avaliar-ganhos-perdas-content">
                          <!-- Seção de Ganhos -->
                          <div v-if="item.ganhos && item.ganhos.length > 0" class="ganhos-section">
                            <div class="ganhos-header">
                              <i class="mdi mdi-arrow-up-bold ganhos-icon"></i>
                              <h4 class="ganhos-title">Ganhos Obtidos</h4>
                            </div>

                            <div class="ganhos-cards">
                              <div v-for="(ganho, index) in item.ganhos" :key="'ganho-' + index" class="ganho-card">
                                <div class="ganho-card-icon">
                                  <i class="mdi mdi-check-circle-outline"></i>
                                </div>
                                <div class="ganho-card-content">
                                  <p>{{ ganho }}</p>
                                </div>
                              </div>
                            </div>

                            <div v-if="item.outros_ganhos" class="ganhos-detalhes">
                              <div class="detalhes-header">
                                <i class="mdi mdi-information-outline"></i>
                                <h5>Observações Adicionais</h5>
                              </div>
                              <div class="detalhes-content">
                                <p>{{ item.outros_ganhos }}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Avaliação -->
                      <div class="avaliar-card-nivel" v-if="getUserPermission() && checkRoleAndEvaluation(item)">
                        <div class="avaliar-card-header">
                          <i class="bi bi-trophy"></i>
                          <h3>Classificação do Pense<span class="avaliar-highlight">&</span>Aja</h3>
                        </div>

                        <div class="flex flex-col items-center justify-center py-4">
                          <div class="flex items-center gap-3 px-5 py-3 rounded-xl shadow border border-gray-200">
                            <span
                              v-if="evaluationValue"
                              :class="[
                                'text-3xl font-bold tracking-wide',
                                evaluationValue === 3
                                  ? 'text-green-500'
                                  : evaluationValue === 2
                                  ? 'text-blue-500'
                                  : 'text-yellow-500',
                              ]"
                            >
                              {{
                                Object.keys(classifications).find(
                                  (key) => classifications[key].value === evaluationValue
                                )
                              }}
                            </span>
                            <span class="text-lg font-medium text-gray-700">
                              {{
                                evaluationValue
                                  ? classifications[
                                      Object.keys(classifications).find(
                                        (key) => classifications[key].value === evaluationValue
                                      )
                                    ].name
                                  : "Não avaliado"
                              }}
                            </span>
                            <span v-if="evaluationValue" class="ml-2">
                              <svg
                                v-if="evaluationValue === 3"
                                class="w-6 h-6 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"
                                />
                              </svg>
                              <svg
                                v-else-if="evaluationValue === 2"
                                class="w-6 h-6 text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <circle cx="10" cy="10" r="8" />
                              </svg>
                              <svg v-else class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <rect x="4" y="4" width="12" height="12" rx="3" />
                              </svg>
                            </span>
                          </div>
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
                                :checked="evaluationValue === classification.value"
                                @click="setEvaluationValue(classification.value)"
                              />
                              <div
                                :class="evaluationValue === classification.value ? `evaluated-${key}` : ''"
                                class="avaliar-rating-display"
                              >
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
                    <div class="avaliar-footer" v-if="getUserPermission() && checkRoleAndEvaluation(item)">
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
                          :class="setButtonPermission(item, true)"
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
const penseAjaDay = 29;

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
const dassOffice = localStorage.getItem("unidadeDass");
const loadContent = async () => {
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

  if (setUserRole(user) === "analista" && penseAja.status_gerente === "reprove") {
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

  if (penseAja.status_gerente === "reprove" || penseAja.status_analista === "reprove") {
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
  if (evaluationValue.value) {
    evaluationValue.value = null;
    return;
  }
  evaluationValue.value = value;
};

const setButtonPermission = (penseAja, _ = false) => {
  if (penseAja.status_analista && user.funcao?.toLowerCase().includes("analista")) {
    return "disabled";
  }
  if (penseAja.status_gerente && user.funcao?.toLowerCase().includes("gerente") && !_) {
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

  const avaliacao = await evaluatePenseAja(evaluationData, notification, dialog);
  if (avaliacao) {
    await loadContent();
    evaluationValue.value = null;
    emEspera.value = false;
    replicavel.value = false;
    a3PenseAja.value = null;
    justification.value = null;
    reprove.value = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
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

<style>
.penseaja-detail-page {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.loading-container,
.error-container {
  width: 100%;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.loading-text {
  margin-top: 16px;
  font-size: 1.2rem;
  color: #555;
}

.error-container {
  color: #d32f2f;
}

.error-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 64px;
  color: #d32f2f;
  margin-bottom: 16px;
}

/* Estilos para o conteúdo principal */
.avaliar-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.avaliar-content {
  width: 95%;
  max-width: 900px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  border-radius: 16px !important;
  overflow: hidden;
}

/* Header */
.avaliar-header {
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-top-right-radius: 16px !important;
  border-top-left-radius: 16px !important;
  min-height: 110px;
}

.avaliar-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avaliar-logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.avaliar-title-text {
  display: flex;
  flex-direction: column;
}

.avaliar-title-text h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.5px;
}

.avaliar-highlight {
  color: #ffd700;
}

.avaliar-subtitle {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 300;
}

.avaliar-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
}

.avaliar-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Body */
.avaliar-body {
  flex: 1;
  overflow-y: auto;
  padding: 15px 20px;
}

/* Status Badge */
.avaliar-status {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

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

/* Cards */
.avaliar-card-revisores,
.avaliar-card-user,
.avaliar-card-situacao,
.avaliar-card-nivel,
.avaliar-card-flags,
.avaliar-card-ganhos-perdas {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
  margin-bottom: 16px;
}

.avaliar-card-revisores:hover,
.avaliar-card-user:hover,
.avaliar-card-situacao:hover,
.avaliar-card-nivel:hover,
.avaliar-card-flags:hover,
.avaliar-card-ganhos-perdas:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.avaliar-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.avaliar-card-header i {
  font-size: 18px;
  color: #666;
}

.avaliar-card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* Avaliadores */
.avaliar-revisores-content {
  padding: 16px 20px;
  display: flex;
  gap: 24px;
}

.avaliar-revisores-content,
.avaliar-user-content,
.avaliar-situacao-content,
.avaliar-nivel-content,
.avaliar-ganhos-perdas-content,
.flags-content {
  padding: 12px 16px;
}

.avaliar-revisor {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.avaliar-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.avaliar-avatar-gerente {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
}

.avaliar-avatar-analista {
  background: linear-gradient(135deg, #2196f3, #1565c0);
}

.avaliar-revisor-info {
  display: flex;
  flex-direction: column;
}

.avaliar-revisor-info .avaliar-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
}

.avaliar-revisor-info .avaliar-value {
  font-weight: 500;
  color: #333;
}

/* Colaborador */
.avaliar-user-content {
  padding: 16px 20px;
}

.avaliar-user-row {
  display: flex;
  margin-bottom: 16px;
}

.avaliar-user-row:last-child {
  margin-bottom: 0;
}

.avaliar-user-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.avaliar-user-item .avaliar-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.avaliar-user-item .avaliar-value {
  font-weight: 500;
  color: #333;
}

/* Situação */
.avaliar-situacao-content {
  padding: 16px 20px;
}

.avaliar-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.avaliar-tab-btn {
  background: #f0f0f0;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.avaliar-tab-btn i {
  font-size: 14px;
}

.avaliar-tab-btn.active {
  background: #f44336;
  color: white;
}

.avaliar-tab-content {
  display: none;
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.5;
  color: #444;
}

.avaliar-tab-content.active {
  display: block;
  animation: avaliar-fade-in 0.3s ease-out;
}

@keyframes avaliar-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Ganhos e Perdas - Estilos Melhorados */
.avaliar-ganhos-perdas-content {
  padding: 20px;
}

.ganhos-section,
.perdas-section {
  margin-bottom: 24px;
  animation: slide-up 0.5s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ganhos-header,
.perdas-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.ganhos-title,
.perdas-title {
  font-size: 18px;
  font-weight: 600;
  color: #444;
  margin: 0;
}

.ganhos-icon {
  color: #4caf50;
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(76, 175, 80, 0.2));
}

.perdas-icon {
  color: #f44336;
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(244, 67, 54, 0.2));
}

.ganhos-cards,
.perdas-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.ganho-card,
.perda-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  min-width: 250px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.ganho-card:hover,
.perda-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.ganho-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  font-size: 18px;
  flex-shrink: 0;
}

.perda-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
  font-size: 18px;
  flex-shrink: 0;
}

.ganho-card-content,
.perda-card-content {
  flex: 1;
}

.ganho-card-content p,
.perda-card-content p {
  margin: 0;
  line-height: 1.5;
  color: #555;
  font-size: 15px;
}

.ganhos-detalhes {
  background: linear-gradient(to right, #f9f9f9, #f5f5f5);
  padding: 16px;
  border-radius: 12px;
  margin-top: 16px;
  border-left: 4px solid #4caf50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.detalhes-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.detalhes-header i {
  font-size: 20px;
  color: #4caf50;
}

.detalhes-header h5 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #444;
}

.detalhes-content p {
  font-size: 15px;
  color: #555;
  margin: 0;
  line-height: 1.6;
}

/* Resumo de Impactos */
.impacto-resumo {
  margin-top: 24px;
  background: linear-gradient(135deg, #f5f5f5, #eeeeee);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  animation: fade-in 0.6s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.resumo-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.resumo-header i {
  font-size: 24px;
  color: #555;
}

.resumo-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #444;
  margin: 0;
}

.resumo-visual {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 20px;
  padding: 10px 0;
}

.resumo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background-color: white;
  border-radius: 12px;
  flex: 1;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease;
}

.resumo-item:hover {
  transform: translateY(-3px);
}

.resumo-item.ganhos {
  border-bottom: 3px solid #4caf50;
}

.resumo-item.perdas {
  border-bottom: 3px solid #f44336;
}

.resumo-item .resumo-valor {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #333, #666);
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.resumo-item.ganhos .resumo-valor {
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  -webkit-text-fill-color: transparent;
}

.resumo-item.perdas .resumo-valor {
  background: linear-gradient(135deg, #c62828, #f44336);
  -webkit-text-fill-color: transparent;
}

.resumo-item .resumo-label {
  font-size: 14px;
  color: #666;
  text-align: center;
  font-weight: 500;
}

.resumo-divider {
  display: none;
}

/* Responsivo para Ganhos e Perdas */
@media (max-width: 768px) {
  .ganhos-cards,
  .perdas-cards {
    flex-direction: column;
  }

  .ganho-card,
  .perda-card {
    width: 100%;
  }

  .resumo-visual {
    flex-direction: column;
    gap: 16px;
  }

  .resumo-item {
    width: 100%;
  }
}

/* Classificação - Estilos para avaliar-rating-result */
.avaliar-rating-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  animation: slide-up 0.5s ease-out;
}

.rating-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 32px;
  border-radius: 16px;
  background: #f5f5f5;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.rating-badge:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.rating-letter {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rating-label {
  font-size: 18px;
  font-weight: 500;
}

.rating-a {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.2));
  color: #2e7d32;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.rating-b {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.2));
  color: #1565c0;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.rating-c {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.2));
  color: #e65100;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.rating-justification {
  width: 100%;
  background: linear-gradient(to right, #f9f9f9, #f5f5f5);
  padding: 20px;
  border-radius: 12px;
  margin-top: 16px;
  border-left: 4px solid #f44336;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
}

.rating-justification h5 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #444;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-justification h5::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #f44336;
  border-radius: 50%;
}

.rating-justification p {
  font-size: 15px;
  color: #555;
  margin: 0;
  line-height: 1.6;
  font-style: italic;
  position: relative;
  padding-left: 16px;
}

.rating-justification p::before {
  content: '"';
  left: 0;
  top: 0;
  font-size: 24px;
  color: rgba(244, 67, 54, 0.3);
  font-family: serif;
}

.rating-justification p::after {
  content: '"';
  font-size: 24px;
  color: rgba(244, 67, 54, 0.3);
  font-family: serif;
}

/* Footer */
.avaliar-footer {
  background: #f5f5f5;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.avaliar-projeto {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #ffffff !important;
  max-width: 400px;
}

.avaliar-actions {
  display: flex;
  gap: 10px;
}

.avaliar-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.avaliar-btn-voltar {
  background: #757575;
  color: white;
}

.avaliar-btn-voltar:hover {
  background: #616161;
}

/* Responsive */
@media (max-width: 768px) {
  .avaliar-revisores-content {
    flex-direction: column;
    gap: 16px;
  }

  .avaliar-user-row {
    flex-direction: column;
    gap: 16px;
  }

  .avaliar-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .avaliar-btn {
    flex-grow: 1;
    justify-content: center;
  }

  .avaliar-projeto {
    max-width: 100%;
    margin-top: 20px;
  }

  .avaliar-title {
    justify-content: center;
    text-align: center;
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .avaliar-header {
    padding: 12px;
  }

  .avaliar-body {
    padding: 12px;
  }

  .avaliar-card-header {
    padding: 12px;
  }

  .avaliar-revisores-content,
  .avaliar-user-content,
  .avaliar-situacao-content,
  .avaliar-nivel-content {
    padding: 12px;
  }

  .avaliar-tabs {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
