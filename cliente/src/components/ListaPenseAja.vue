<!-- ListaPenseAja.vue -->
<template>
  <div class="list-container">
    <RecycleScroller
      :items="filteredItems"
      :item-size="130"
      key-field="id"
      class="virtual-list"
    >
      <template #default="{ item }">
        <div class="list-item" role="button" :key="item.id">
          <v-dialog max-width="900">
            <template v-slot:activator="{ props: activatorProps }">
              <div
                v-bind="activatorProps"
                class="item-content"
                :class="`${setPenseAjaStatus(item)}`"
              >
                <div class="item-accent"></div>
                <div class="item-main">
                  <img src="/assets/img/icons/idea-on.png" class="icon-main" />
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
                    <span class="text-ellipsis-2">{{
                      formateName(item.nome)
                    }}</span>
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
                  <div class="avaliar-header position-relative container-fluid">
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
                    <div class="avaliar-status pending">
                      <i class="bi bi-hourglass-split"></i>
                      <span class="pense-aja-status">
                        Aguardando avaliação
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
                            <span class="avaliar-value" id="gerente-avaliador">
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
                            <span class="avaliar-value" id="analista-avaliador">
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
                    <div class="avaliar-card-nivel">
                      <div class="avaliar-card-header">
                        <i class="bi bi-trophy"></i>
                        <h3>
                          Classificação do Pense<span class="avaliar-highlight"
                            >&</span
                          >Aja
                        </h3>
                      </div>

                      <div class="avaliar-nivel-content">
                        <div class="avaliar-rating">
                          <label class="avaliar-rating-option">
                            <input
                              type="radio"
                              name="avaliacao-pense-aja"
                              value="A"
                            />
                            <div class="avaliar-rating-display">
                              <span class="avaliar-rating-value">A</span>
                              <span class="avaliar-rating-icon">
                                <i class="bi bi-star-fill"></i>
                              </span>
                              <span class="avaliar-rating-label">Básica</span>
                            </div>
                          </label>

                          <label class="avaliar-rating-option">
                            <input
                              type="radio"
                              name="avaliacao-pense-aja"
                              value="B"
                            />
                            <div class="avaliar-rating-display">
                              <span class="avaliar-rating-value">B</span>
                              <span class="avaliar-rating-icon">
                                <i class="bi bi-stars"></i>
                              </span>
                              <span class="avaliar-rating-label"
                                >Intermediária</span
                              >
                            </div>
                          </label>

                          <label class="avaliar-rating-option">
                            <input
                              type="radio"
                              name="avaliacao-pense-aja"
                              value="C"
                            />
                            <div class="avaliar-rating-display">
                              <span class="avaliar-rating-value">C</span>
                              <span class="avaliar-rating-icon">
                                <i class="bi bi-award-fill"></i>
                              </span>
                              <span class="avaliar-rating-label">
                                Avançada
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div class="justifica-avaliacao hidden">
                        <textarea
                          placeholder="Justifique a avaliação do pense e aja."
                          name="justificativa-avaliacao"
                          id="justificativa-avaliacao"
                        ></textarea>
                      </div>
                    </div>

                    <!-- Flags -->
                    <div class="avaliar-card-flags">
                      <div class="avaliar-flags-content">
                        <label class="avaliar-toggle">
                          <input type="checkbox" id="em-espera" />
                          <span class="avaliar-toggle-slider"></span>
                          <span class="avaliar-toggle-label">
                            <i class="bi bi-hourglass"></i>
                            Em Espera
                          </span>
                        </label>

                        <label class="avaliar-toggle">
                          <input type="checkbox" id="replicavel" />
                          <span class="avaliar-toggle-slider"></span>
                          <span class="avaliar-toggle-label">
                            <i class="bi bi-diagram-3"></i>
                            Replicável
                          </span>
                        </label>
                      </div>
                      <select id="a3-penseAja" class="form-select">
                        <option value="" selected disabled id="escolha">
                          Selecione
                        </option>
                        <option value="lean">LEAN</option>
                        <option value="pessoas">PESSOAS</option>
                        <option value="digitalizacao">DIGITALIZAÇÃO</option>
                        <option value="produtividade">PRODUTIVIDADE</option>
                        <option value="padronizacao">PADRONIZAÇÃO</option>
                        <option value="comunicacao">COMUNICAÇÃO</option>
                        <option value="ssma">SSMA</option>
                        <option value="orcamento">ORÇAMENTO</option>
                        <option value="qualidade">QUALIDADE</option>
                      </select>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div class="avaliar-footer">
                    <div class="avaliar-actions">
                      <button class="avaliar-btn avaliar-btn-aprovar">
                        <i class="bi bi-check-circle"></i>
                        <span>Aprovar</span>
                      </button>

                      <button class="avaliar-btn avaliar-btn-reprovar">
                        <i class="bi bi-x-circle"></i>
                        <span>Reprovar</span>
                      </button>

                      <button class="avaliar-btn avaliar-btn-excluir">
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
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import axios from "axios";
import { useUserStore } from "@/stores/userStore";

// Carrega dados do usuario se estiver logado
const user = useUserStore();

const formateName = (name) => {
  const names = name.split(" ");
  if (names.length > 1) {
    return `${names[0]} ${names[names.length - 1]}`;
  }
  return names[0];
};

const props = defineProps({
  filterText: { type: String, default: "" },
});

const penseAjas = ref([]);

const fetchData = async () => {
  const office = "SEST";
  const { data } = await axios.get(`http://localhost:2512/pense-aja/${office}`);
  penseAjas.value = data.dados;
};
onMounted(fetchData);

const setPenseAjaStatus = (penseAja) => {
  if (penseAja.status_gerente === "REPROVAR") {
    return "reprovado";
  }
  if (penseAja.em_espera === "1") {
    return "em-espera";
  }
  if (!penseAja.gerente_aprovador && !penseAja.analista_avaliador) {
    return "sem-ambos";
  }
  if (!penseAja.gerente_aprovador) {
    return "sem-gerente";
  }
  if (!penseAja.analista_avaliador) {
    return "sem-analista";
  }
  if (penseAja.gerente_aprovador && penseAja.analista_avaliador) {
    return "avaliado";
  }
  return "nao-avaliado";
};

const filteredItems = computed(() => {
  const term = props.filterText.trim().toLowerCase();
  if (!term) return penseAjas.value;
  return penseAjas.value.filter(
    (i) =>
      i.nome_projeto.toLowerCase().includes(term) ||
      i.setor.toLowerCase().includes(term) ||
      i.gerente.toLowerCase().includes(term)
  );
});

const beforeAfter = ref(false);
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
