<template>
  <div class="penseaja-detail-page">
    <div v-if="loading" class="loading-container">
      <v-progress-circular 
        indeterminate 
        color="red" 
        size="64"
      ></v-progress-circular>
      <p class="loading-text">Carregando detalhes do Pense & Aja...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <i class="mdi mdi-alert-circle-outline error-icon"></i>
        <h2>Não foi possível carregar os detalhes</h2>
        <p>{{ errorMessage }}</p>
        <v-btn color="red" class="mt-4" to="/pense-aja">
          Voltar para a lista
        </v-btn>
      </div>
    </div>
    
    <div v-else-if="penseAja" class="avaliar-container active">
      <div class="avaliar-content active">
        <!-- Header -->
        <div class="avaliar-header position-relative container-fluid">
          <div class="d-flex justify-content-around">
            <div class="row">
              <div class="avaliar-title col-md-6">
                <img src="/assets/img/icons/dass-penseaja-light.png" alt="Logo" class="avaliar-logo" />
                <div class="avaliar-title-text">
                  <h2>
                    Pense
                    <span class="avaliar-highlight">& </span>
                    Aja
                  </h2>
                  <span class="avaliar-subtitle">Análise de melhoria contínua</span>
                </div>
              </div>

              <!-- Título Projeto -->
              <div class="avaliar-projeto col-md-6">
                <i class="bi bi-lightbulb"></i>
                Projeto:
                <strong id="nome-projeto">
                  {{ penseAja.nome_projeto }}
                </strong>
              </div>
            </div>
          </div>

          <router-link to="/pense-aja" class="avaliar-close position-absolute top-0 end-0 m-3" aria-label="Fechar">
            <i class="bi bi-x-lg"></i>
          </router-link>
        </div>

        <!-- Main Content -->
        <div class="avaliar-body">
          <!-- Status Badge -->
          <div class="avaliar-status">
            <span class="pense-aja-status p-2 rounded-lg" :class="statusData.className">
              <template v-if="statusData.status === 'Reprovado'">
                <i class="bi bi-x-octagon-fill"></i>
              </template>
              <template v-else-if="statusData.status === 'Em Espera'">
                <i class="bi bi-hourglass-split"></i>
              </template>
              <template v-else-if="statusData.status === 'Sem Análise'">
                <i class="bi bi-eye-slash"></i>
              </template>
              <template v-else-if="statusData.status === 'Visto Pela Melhoria Continua'">
                <i class="bi bi-person-badge"></i>
              </template>
              <template v-else-if="statusData.status === 'Visto pelo Gerente'">
                <i class="bi bi-person-check"></i>
              </template>
              <template v-else-if="statusData.status === 'Avaliado'">
                <i class="bi bi-check-circle-fill"></i>
              </template>
              <template v-else>
                <i class="bi bi-question-circle"></i>
              </template>
              {{ statusData.status }}
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
                  <span class="avaliar-label">Gerente Avaliador</span>
                  <span class="avaliar-value" id="gerente-avaliador">
                    {{ penseAja.gerente_aprovador ?? "Não avaliado" }}
                  </span>
                </div>
              </div>
              <div class="avaliar-revisor">
                <div class="avaliar-avatar avaliar-avatar-analista">
                  <i class="mdi mdi-account-check"></i>
                </div>
                <div class="avaliar-revisor-info">
                  <span class="avaliar-label">Analista Avaliador</span>
                  <span class="avaliar-value" id="analista-avaliador">
                    {{ penseAja.analista_avaliador ?? "Não avaliado" }}
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
                    {{ penseAja.matricula ?? "*******" }}
                  </span>
                </div>

                <div class="avaliar-user-item">
                  <span class="avaliar-label">Nome</span>
                  <span class="avaliar-value" id="nome-penseaja-avaliacao">
                    {{ penseAja.nome }}
                  </span>
                </div>
              </div>

              <div class="avaliar-user-row">
                <div class="avaliar-user-item">
                  <span class="avaliar-label">Gerente</span>
                  <span class="avaliar-value" id="gerente-penseaja-avaliacao">
                    {{ penseAja.gerente }}
                  </span>
                </div>

                <div class="avaliar-user-item">
                  <span class="avaliar-label">Turno</span>
                  <span class="avaliar-value" id="turno-penseaja-avaliacao">
                    {{ penseAja.turno }}
                  </span>
                </div>
              </div>

              <div class="avaliar-user-row">
                <div class="avaliar-user-item">
                  <span class="avaliar-label">Setor</span>
                  <span class="avaliar-value" id="setor-penseaja-avaliacao">
                    {{ penseAja.setor }}
                  </span>
                </div>

                <div class="avaliar-user-item">
                  <span class="avaliar-label">Data de Realização</span>
                  <span class="avaliar-value" id="data-penseaja-avaliacao">
                    {{ formateDate(penseAja.criado) }}
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
                  {{ penseAja.situacao_anterior }}
                </p>
              </div>

              <div class="avaliar-tab-content" :class="beforeAfter ? 'active' : ''" id="depois-tab">
                <p id="texto-depois-penseaja">
                  {{ penseAja.situacao_atual }}
                </p>
              </div>
            </div>
          </div>

          <!-- Detalhes de Ganhos e Perdas, se disponíveis -->
          <div v-if="penseAja.ganhos" class="avaliar-card-ganhos-perdas">
            <div class="avaliar-card-header">
              <i class="mdi mdi-chart-line"></i>
              <h3>Impactos do Projeto</h3>
            </div>
            
            <div class="avaliar-ganhos-perdas-content">
              <!-- Seção de Ganhos -->
              <div v-if="penseAja.ganhos && penseAja.ganhos.length > 0" class="ganhos-section">
                <div class="ganhos-header">
                  <i class="mdi mdi-arrow-up-bold ganhos-icon"></i>
                  <h4 class="ganhos-title">Ganhos Obtidos</h4>
                </div>
                
                <div class="ganhos-cards">
                  <div v-for="(ganho, index) in penseAja.ganhos" :key="'ganho-'+index" class="ganho-card">
                    <div class="ganho-card-icon">
                      <i class="mdi mdi-check-circle-outline"></i>
                    </div>
                    <div class="ganho-card-content">
                      <p>{{ ganho }}</p>
                    </div>
                  </div>
                </div>
                
                <div v-if="penseAja.outros_ganhos" class="ganhos-detalhes">
                  <div class="detalhes-header">
                    <i class="mdi mdi-information-outline"></i>
                    <h5>Observações Adicionais</h5>
                  </div>
                  <div class="detalhes-content">
                    <p>{{ penseAja.outros_ganhos }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Avaliação e Classificação (se foi avaliado) -->
          <div v-if="penseAja.classificacao" class="avaliar-card-nivel">
            <div class="avaliar-card-header">
              <i class="bi bi-trophy"></i>
              <h3>Classificação do Pense<span class="avaliar-highlight">&</span>Aja</h3>
            </div>
            
            <div class="avaliar-nivel-content">
              <div class="avaliar-rating-result">
                <div class="rating-badge" :class="getRatingClass(penseAja.classificacao)">
                  <span class="rating-letter">{{ !isNaN(penseAja.classificacao) ? conertToString(penseAja.classificacao) : penseAja.classificacao }}</span>
                  <span class="rating-label">{{ getRatingLabel(penseAja.classificacao) }}</span>
                </div>
                
                <div v-if="penseAja.justificativa_analista" class="rating-justification">
                  <h5>Justificativa da avaliação:</h5>
                  <p>{{ penseAja.justificativa_analista }}</p>
                </div>
              </div>
            </div>

            <div class="justification">

            </div>
          </div>
          
          <!-- Flags (Replicável, Em Espera, A3) -->
          <div class="avaliar-card-flags" v-if="hasFlagsToShow">
            <div class="avaliar-card-header">
              <i class="mdi mdi-flag-variant"></i>
              <h3>Informações Adicionais</h3>
            </div>
            
            <div class="flags-content">
              <div v-if="penseAja.em_espera === '1'" class="flag-item">
                <div class="flag-icon bg-warning">
                  <i class="bi bi-hourglass"></i>
                </div>
                <div class="flag-text">
                  <strong>Em Espera</strong>
                  <span>Este Pense & Aja está em espera para avaliação completa</span>
                </div>
              </div>
              
              <div v-if="penseAja.replicavel === '1'" class="flag-item">
                <div class="flag-icon bg-info">
                  <i class="bi bi-diagram-3"></i>
                </div>
                <div class="flag-text">
                  <strong>Replicável</strong>
                  <span>Este Pense & Aja foi marcado como replicável para outros setores</span>
                </div>
              </div>
              
              <div v-if="penseAja.a3_mae" class="flag-item">
                <div class="flag-icon bg-primary">
                  <i class="mdi mdi-file-document-outline"></i>
                </div>
                <div class="flag-text">
                  <strong>A3 Mãe: {{ getA3Label(penseAja.a3_mae) }}</strong>
                  <span>Este Pense & Aja está vinculado a um A3 do tipo {{ getA3Label(penseAja.a3_mae) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer com botões -->
        <div class="avaliar-footer">
          <div class="avaliar-actions">
            <router-link to="/pense-aja" class="avaliar-btn avaliar-btn-voltar">
              <i class="bi bi-arrow-left"></i>
              <span>Voltar para a lista</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <Notification ref="notification" />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { commonApi } from "@/services/httpClient.js";
import { ip } from "@/config/ip.js";
import Notification from "../components/Notification.vue";

const route = useRoute();
const penseAja = ref(null);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref("");
const beforeAfter = ref(false);
const notification = ref(null);

const formateDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

// Carrega os dados do Pense Aja pelo ID
const loadPenseAja = async () => {
  const penseAjaId = route.params.id;
  if (!penseAjaId) {
    error.value = true;
    errorMessage.value = "ID do Pense & Aja não fornecido.";
    loading.value = false;
    return;
  }
  
  const dassOffice = localStorage.getItem("unidadeDass") || "SEST";
  
  try {
    loading.value = true;
    const { data } = await commonApi.get(`${ip}:2512/pense-aja/${dassOffice}/${penseAjaId}`);
    
    if (data && Object.keys(data).length > 0) {
      penseAja.value = data;
    } else {
      error.value = true;
      errorMessage.value = "Não foi possível encontrar o Pense & Aja solicitado.";
    }
  } catch (err) {
    console.error("Erro ao carregar Pense Aja:", err);
    error.value = true;
    errorMessage.value = err.response?.data?.message || "Erro ao carregar os dados. Tente novamente mais tarde.";
    
    notification.value?.showPopup(
      "error",
      "Erro!",
      "Não foi possível carregar os detalhes deste Pense & Aja.",
      5000
    );
  } finally {
    loading.value = false;
  }
};

// Computa o status do Pense Aja
const statusData = computed(() => {
  if (!penseAja.value) return { status: "Carregando...", className: "" };
  
  let status;
  
  if (penseAja.value.status_gerente === "REPROVAR") {
    status = "Reprovado";
  } else if (penseAja.value.em_espera === "1") {
    status = "Em Espera";
  } else if (!penseAja.value.gerente_aprovador && !penseAja.value.analista_avaliador) {
    status = "Sem Análise";
  } else if (!penseAja.value.gerente_aprovador) {
    status = "Visto Pela Melhoria Continua";
  } else if (!penseAja.value.analista_avaliador) {
    status = "Visto pelo Gerente";
  } else if (penseAja.value.gerente_aprovador && penseAja.value.analista_avaliador) {
    status = "Avaliado";
  } else {
    status = "Não Avaliado";
  }

  // mapeia status → classe
  const classMap = {
    Reprovado: "reprovado",
    "Em Espera": "em-espera",
    "Sem Análise": "sem-ambos",
    "Visto Pela Melhoria Continua": "sem-gerente",
    "Visto pelo Gerente": "sem-analista",
    Avaliado: "avaliado",
    "Não Avaliado": "nao-avaliado",
  };

  return {
    status,
    className: classMap[status] || "",
  };
});

// Verifica se tem flags para mostrar
const hasFlagsToShow = computed(() => {
  if (!penseAja.value) return false;
  return (
    penseAja.value.em_espera === "1" || 
    penseAja.value.replicavel === "1" || 
    !!penseAja.value.a3_mae
  );
});

// Funções auxiliares para classificação
const getRatingLabel = (rating) => {
  // Se for possível transformar em número, converte e faz a verificação invertida
  const num = Number(rating);
  if (!isNaN(num)) {
    if (num === 3) return "Avançada";
    if (num === 2) return "Intermediária";
    if (num === 1) return "Básica";
    return "Não avaliado";
  }
  // Se não for número, verifica por letra
  if (rating === 'A') return "Avançada";
  if (rating === 'B') return "Intermediária";
  if (rating === 'C') return "Básica";
  return "Não avaliado";
};

const getRatingClass = (rating) => {
  const num = Number(rating);
  if (!isNaN(num)) {
    if (num === 3) return "rating-a";
    if (num === 2) return "rating-b";
    if (num === 1) return "rating-c";
    return "";
  }
  if (rating === 'A') return "rating-a";
  if (rating === 'B') return "rating-b";
  if (rating === 'C') return "rating-c";
  return "";
};

const conertToString = (rating) => {
  if (rating === 3 || rating === "3") return "A";
  if (rating === 2 || rating === "2") return "B";
  if (rating === 1 || rating === "1") return "C";
  return rating;
};

// Obter label do A3
const getA3Label = (a3Type) => {
  const a3Map = {
    lean: "LEAN",
    pessoas: "PESSOAS",
    digitalizacao: "DIGITALIZAÇÃO",
    produtividade: "PRODUTIVIDADE",
    padronizacao: "PADRONIZAÇÃO",
    comunicacao: "COMUNICAÇÃO",
    ssma: "SSMA",
    orcamento: "ORÇAMENTO",
    qualidade: "QUALIDADE"
  };
  
  return a3Map[a3Type] || a3Type;
};

onMounted(() => {
  loadPenseAja();
});
</script>

<style scoped>
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

.ganhos-section, .perdas-section {
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

.ganhos-header, .perdas-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.ganhos-title, .perdas-title {
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

.ganhos-cards, .perdas-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.ganho-card, .perda-card {
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

.ganho-card:hover, .perda-card:hover {
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

.ganho-card-content, .perda-card-content {
  flex: 1;
}

.ganho-card-content p, .perda-card-content p {
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
  .ganhos-cards, .perdas-cards {
    flex-direction: column;
  }
  
  .ganho-card, .perda-card {
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
