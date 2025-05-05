<template>
  <v-dialog max-width="850">
    <template v-slot:activator="{ props: activatorProps }">
      <button
        @click="handleUserClick"
        v-bind="activatorProps"
        id="openMenu"
        @mouseover="isHover = true"
        @mouseleave="isHover = false"
        class="action-button"
        v-if="!isMobile"
      >
        <div class="button-icon-container">
          <i
            :key="isHover"
            class="icon mdi"
            :class="isHover ? 'mdi-lightbulb-on text-amber-accent-4' : 'mdi-lightbulb-on-outline'"
          ></i>
        </div>
        <span class="button-label">Cadastrar</span>
      </button>

      <button
        v-else
        @click="handleUserData"
        v-bind="activatorProps"
        class="mobile-action-button"
        @mouseover="isHover = true"
        @mouseleave="isHover = false"
      >
        <transition name="fade-icon" mode="out-in">
          <i
            :key="isHover"
            class="icon mdi"
            :class="isHover ? 'mdi-lightbulb-on text-yellow-accent-4' : 'mdi-lightbulb-on-outline'"
          ></i>
        </transition>
        <span class="label">Registrar</span>
      </button>
    </template>

    <template v-slot:default="{ isActive }">
      <div id="penseaja-popup" class="penseaja-popup">
        <div class="penseaja-container">
          <div class="penseaja-header">
            <div class="penseaja-header-content">
              <div class="penseaja-header-left">
                <div class="penseaja-icon-wrapper">
                  <img
                    src="/assets/img/icons/dass-penseaja.png"
                    alt="Ícone Cadastro"
                    class="penseaja-icon"
                  />
                </div>

                <div class="penseaja-title-container">
                  <h2>
                    Cadastro Pense<span class="penseaja-highlight">&</span>Aja
                  </h2>
                  <span class="penseaja-subtitle">
                    Transformando ideias em ações
                  </span>
                </div>
              </div>

              <button
                @click="isActive.value = false"
                class="close-register position-absolute top-0 end-0 m-1"
                id="closeLoja"
              >
                <span class="bi bi-x-lg text-black"></span>
              </button>
            </div>
            <div class="penseaja-header-accent"></div>
          </div>

          <div id="penseaja-form" class="penseaja-form">
            <div class="penseaja-field">
              <label for="penseaja-matricula">Matrícula</label>

              <div class="penseaja-input-container">
                <input
                  ref="matriculaInput"
                  type="number"
                  id="penseaja-matricula"
                  placeholder="Digite sua matrícula"
                  v-model="registrationEntry"
                  @keyup="serachUser"
                />
                <span class="penseaja-spinner" v-if="loading"></span>
              </div>
            </div>

            <div v-if="userData?.nome" class="user-penseaja-info">
              <div class="user-penseaja-avatar">
                <span class="bi bi-person-circle"></span>
              </div>
              <div class="user-penseaja-details">
                <div class="user-detail">
                  <span class="detail-label">Nome:</span>
                  <span class="user-name">{{ userData?.nome }}</span>
                </div>
                <div class="user-detail">
                  <span class="detail-label">Gerente:</span>
                  <span class="user-gerente">{{ userData?.gerente }}</span>
                </div>
              </div>
            </div>

            <!-- Seção de Projeto e Data -->
            <div class="penseaja-profile-section oito-perdas mt-3">
              <div class="penseaja-field-group">
                <div class="row">
                  <div class="col-md-6">
                    <label for="penseaja-projeto">Nome do projeto</label>
                    <input
                      v-model="penseAjaData.projectName"
                      type="text"
                      id="penseaja-projeto"
                      placeholder="Ex: Melhoria do processo"
                    />
                  </div>

                  <div class="col-md-6">
                    <label for="penseaja-data">Data</label>
                    <input
                      v-model="penseAjaData.projectDate"
                      type="date"
                      id="penseaja-data"
                      min="<?php echo date('Y-m-d'); ?>"
                      value="<?php echo date('Y-m-d'); ?>"
                    />
                  </div>
                </div>

                <div class="row">
                  <div>
                    <label for="penseaja-projeto-area">
                      Onde será implementado essa melhoria?
                    </label>

                    <v-combobox
                      label="Selecione o Setor"
                      v-model="penseAjaData.setor"
                      :items="setoresDass"
                      variant="outlined"
                      color="red"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Situações -->
            <div class="oito-perdas">
              <div class="penseaja-field">
                <label for="penseaja-anterior">Situação anterior</label>
                <textarea
                  v-model="penseAjaData.situationBefore"
                  id="penseaja-anterior"
                  placeholder="Descreva a situação anterior..."
                ></textarea>
              </div>

              <div class="penseaja-field">
                <label for="penseaja-atual">Situação atual</label>
                <textarea
                  v-model="penseAjaData.situationNow"
                  id="penseaja-atual"
                  placeholder="Descreva a situação atual..."
                ></textarea>
              </div>

              <!-- AI button -->
              <div class="tooltip-container">
                <button
                  @mouseenter="showTooltip = true"
                  @mouseleave="showTooltip = false"
                  @click="handleImproveText"
                  id="ai-button"
                  class="ai-enhance-button"
                  :class="disableIaButton ? 'disabled' : ''"
                  type="button"
                  :disabled="loadingImprove"
                >
                  <div class="ai-enhance-icon">
                    <i class="bi bi-robot"></i>
                    <i class="bi bi-stars icon-spark"></i>
                  </div>
                  <span v-if="!loadingImprove">Melhorar texto com IA</span>
                  <span v-else class="spinner-ai"></span>
                  <div class="ai-enhance-effect"></div>
                </button>

                <AiMicrofone/>

                <div
                  @mouseenter="showTooltip = true"
                  @mouseleave="showTooltip = false"
                  :class="showTooltip ? 'visible' : ''"
                  class="ai-tooltip"
                >
                  <strong>
                    <span class="lamp-icon bi bi-lightbulb"></span>
                    Dica inteligente!
                  </strong>
                  Revise seu texto com inteligência artificial para facilitar a
                  avaliação!
                </div>
              </div>
            </div>

            <!-- 8 Perdas -->
            <div class="oito-perdas mt-3">
              <span class="mt-3">
                <strong>8 Perdas!</strong>
              </span>

              <v-combobox
                v-model="penseAjaData.perdas"
                :items="[
                  'Superprodução',
                  'Transporte',
                  'Processamento',
                  'Movimento',
                  'Estoque',
                  'Espera',
                  'Talento',
                  'Retrabalho',
                ]"
                label="Selecione as perdas"
                multiple
                variant="outlined"
                color="red"
              />
            </div>

            <!-- Ganhos Pense Aja -->
            <div class="ganhos-penseaja">
              <div class="penseaja-checkbox-ganho-ask">
                <input v-model="ganhos" type="checkbox" id="ganho-penseaja" />
                <label for="ganho-penseaja" class="ganhos-penseaja-label">
                  O que ganhei com essa melhoria?
                </label>
              </div>

              <div v-if="ganhos" id="ganhos-form">
                <label for="ganhos-descricao">Descreva os ganhos obtidos</label>
                <div class="ganhos-tipos">
                  <v-combobox
                    v-model="penseAjaData.ganhos.values"
                    :items="['Dinheiro', 'Tempo', 'Processo', 'Qualidade']"
                    label="Selecione os ganhos"
                    multiple
                    variant="outlined"
                    color="red"
                  />

                  <textarea
                    v-model="penseAjaData.ganhos.justificativa"
                    id="ganhos-descricao"
                    placeholder="Explique detalhadamente quais ganhos foram obtidos com sua melhoria..."
                  ></textarea>

                  <div class="input-helper">
                    <span class="bi bi-lightbulb text-yellow"></span>
                    Mencione dados, números e resultados que demonstram o
                    impacto positivo da sua ideia.
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="handleRegister"
              type="button"
              class="penseaja-submit-button"
            >
              <span>Salvar </span>
              <span class="mdi mdi-content-save-check-outline fs-5"></span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </v-dialog>

  <Notification ref="notification" />
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/userStore";
import { getUserData } from "@/services/userService";
import { registerPenseAja } from "@/services/penseAjaService";
import Notification from "@/components/Notification.vue";
import { improveText } from "@/services/aiService";
import AiMicrofone from "./AiTools/AiMicrofone.vue";

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

const notification = ref(null);
const loading = ref(false);
const userData = ref(null);

const user = useUserStore();

const handleUserClick = async () => {
  await nextTick();

  if (user?.matricula) {
    await getUserData(user.matricula, userData, loading);
  }
};

const registrationEntry = ref(null);
const serachUser = async (e) => {
  if (e.key === "Enter") {
    if (registrationEntry.value.toString().length >= 7) {
      await getUserData(
        registrationEntry.value,
        userData,
        loading,
        notification
      );
    } else {
      if (notification.value) {
        notification.value.showPopup(
          "warning",
          "Atenção!",
          "Insira uma matrícula válida, a matrícula deve conter no mínimo 7 caracteres.",
          3000
        );
      }
    }
  }
};

const penseAjaData = ref({
  projectName: "Melhoria do processo",
  projectDate: null,
  situationBefore:
    "NA COSTURA DO DW12, A OPERADORA SE QUEIXAVA QUE A MÁQUINA DE 1 AG DA ANTIGA NÃO CONSEGUIA ACOMPANHAR O RITMO DA PRODUÇÃO, NA OPERAÇÃO DA COSTURA DA BOCA DA LINGUETA. ASSIM FICANDO ESTOCADA DE SERVIÇO E GERANDO PERDA DE PRODUÇÃO.",
  situationNow:
    "DEPOIS DE UM ACOMPANHAMENTO, FOI NOTADO QUE A COSTURA DO TRASEIRO ERA A MAIS SIMPLES DO SETOR, POIS ERA APENAS UMA COSTURA EM LINHA RETA, ASSIM PODENDO FAZER UMA TROCA DENTRO DO PRÓPRIO SETOR, ONDE A LÍDER ACEITOU A SUGESTÃO E AS OPERADORAS TAMBÉM. SENDO ASSIM, GANHANDO PRODUTIVIDADE.",
  setor: null,
  perdas: [],
  ganhos: {
    values: [],
    justificativa: null,
  },
});

const replaceText = async (text, component) => {
  penseAjaData.value[component] = "";
  for (let i = 0; i < text.length; i++) {
    penseAjaData.value[component] += text[i];
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

const loadingImprove = ref(false);
const showTooltip = ref(false);
const disableIaButton = ref(false);
const handleImproveText = async () => {
  if (!penseAjaData.value.situationBefore || !penseAjaData.value.situationNow) {
    notification.value.showPopup(
      "warning",
      "Atenção!",
      "Preencha os campos de situação antes de usar a IA.",
      3000
    );
    return;
  }

  const result = await improveText(
    penseAjaData.value.situationBefore,
    penseAjaData.value.situationNow,
    penseAjaData.value.projectName,
    loadingImprove
  );

  if (Object.keys(result).length === 0) {
    notification.value.showPopup(
      "error",
      "Erro!",
      "Não foi possível melhorar o texto com a IA. Tente novamente mais tarde!",
      3000
    );
    return;
  }

  disableIaButton.value = true;
  if (Object.keys(result).length > 0) {
    replaceText(result?.before, "situationBefore");
    replaceText(result?.after, "situationNow");
  }
};

const setoresDass = ["Montagem", "Apoio", "Costura", "Manutenção"];
const ganhos = ref(false);

const handleRegister = () => {
  if (!registrationEntry.value || !userData.value) {
    notification.value.showPopup(
      "warning",
      "Aviso!",
      "Dados do usuário ausentes.",
      3000
    );
  }
  registerPenseAja(
    penseAjaData.value,
    registrationEntry.value,
    notification,
    userData.value
  );
};
</script>

<style scoped>
.fade-icon-enter-active,
.fade-icon-leave-active {
  transition: opacity 0.2s ease;
}

.fade-icon-enter-from,
.fade-icon-leave-to {
  opacity: 0;
}

.icon {
  font-size: 1.5rem;
}
.ai-tooltip {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%) translateY(-100%) scale(0.3);
  width: 280px;
  background: white;
  border-radius: 12px;
  padding: 12px 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  z-index: 9999;
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-left: 4px solid #ef5350;
  margin-bottom: 15px;
}

.ai-tooltip.visible {
  opacity: 1 !important;
  transform: translateX(-50%) translateY(-100%) scale(1);
  top: -15px;
}

/* Triângulo na parte inferior (rabinho do balão) */
.ai-tooltip::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}

.penseaja-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.5s ease-out;
}

.penseaja-container {
  position: relative;
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  padding: 2rem 2.5rem;
  z-index: 3100;
}

.close-register {
  background: rgba(231, 76, 60, 0.1);
  border: none;
  color: #e74c3c;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-register:hover {
  background: rgba(231, 76, 60, 0.2);
  transform: rotate(90deg);
}

.user-penseaja-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: linear-gradient(to right, #fff5f5, #fff);
  border-radius: 10px;
  padding: 12px 15px;
  margin: 15px 0;
  border-left: 4px solid #ef5350;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.1);
  transition: all 0.3s ease;
}

.user-penseaja-info:hover {
  box-shadow: 0 4px 12px rgba(239, 83, 80, 0.2);
  transform: translateY(-2px);
}

.user-penseaja-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(239, 83, 80, 0.1);
  border-radius: 50%;
  color: #ef5350;
  font-size: 24px;
  flex-shrink: 0;
}

.user-penseaja-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-detail {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.detail-label {
  font-size: 13px;
  font-weight: 500;
  color: #888;
}

.user-name,
.user-gerente {
  font-weight: 600;
  color: #333;
}

.user-name {
  color: #d32f2f;
}

/* Overlay */
.penseaja-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

/* Container do popup */
.penseaja-container {
  position: relative;
  background: #fff;
  border-radius: 14px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  padding: 2.5rem;
  z-index: 3100;
  box-shadow: 0 15px 50px rgba(239, 83, 80, 0.15),
    0 5px 15px rgba(0, 0, 0, 0.08);
  animation: slideUp 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #ef5350 #f9f9f9;
}

.penseaja-container {
  position: relative;
  background: #fff;
  border-radius: 14px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  padding: 2.5rem;
  z-index: 3100;
  box-shadow: 0 15px 50px rgba(239, 83, 80, 0.15),
    0 5px 15px rgba(0, 0, 0, 0.08);
  animation: slideUp 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #ef5350 #f9f9f9;
}

/* Cabeçalho */
.penseaja-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1.2rem;
  margin-bottom: 2rem;
  position: relative;
}

.penseaja-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.penseaja-header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.penseaja-icon-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(145deg, #f9f9f9, #e6e6e6);
  box-shadow: 5px 5px 10px #d9d9d9, -5px -5px 10px #ffffff;
  overflow: hidden;
}

.penseaja-header::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100px;
  height: 3px;
  background: linear-gradient(to right, #ef5350, #f9a825);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.penseaja-header:hover::after {
  width: 150px;
}

.penseaja-header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.penseaja-icon {
  width: 45px;
  height: 45px;
  object-fit: contain;
  filter: drop-shadow(0 3px 5px rgba(239, 83, 80, 0.3));
  animation: pulse-gentle 3s infinite;
  transform: rotate(-5deg);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.penseaja-icon-wrapper:hover .penseaja-icon {
  transform: rotate(0) scale(1.1);
}

.penseaja-title-container {
  display: flex;
  flex-direction: column;
}

.penseaja-header h2 {
  font-size: 24px;
  color: #444;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.penseaja-highlight {
  color: #ef5350;
  position: relative;
}

.penseaja-subtitle {
  font-size: 14px;
  color: #777;
  margin-top: 2px;
}

.penseaja-header-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    to right,
    #f0f0f0,
    rgba(240, 240, 240, 0.5),
    rgba(240, 240, 240, 0)
  );
  overflow: hidden;
}

.penseaja-header-accent::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 150px;
  height: 3px;
  background: linear-gradient(to right, #ef5350, #f9a825);
  border-radius: 3px;
  transition: width 0.5s ease, transform 0.5s ease;
  transform-origin: left;
}

.penseaja-header:hover .penseaja-header-accent::after {
  transform: scaleX(1.2);
}

.penseaja-close-button {
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.penseaja-close-button:hover {
  color: #ef5350;
  background-color: rgba(239, 83, 80, 0.08);
  transform: rotate(90deg);
}

.penseaja-close-button i {
  font-size: 24px;
}

.penseaja-input-container {
  position: relative;
  width: 100%;
}

.penseaja-spinner {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(239, 83, 80, 0.2);
  border-top-color: #ef5350;
  border-radius: 50%;
  animation: penseaja-spin 0.8s linear infinite;
}

@keyframes penseaja-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-gentle {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.spinner-ai {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-top: 2px solid #ef5350;
  border-radius: 50%;
  animation: penseaja-spin 0.8s linear infinite;
  vertical-align: middle;
}

.penseaja-header h2 {
  font-size: 24px;
  color: #ef5350;
  margin: 0;
}
.penseaja-close-button {
  background: none;
  border: none;
  font-size: 28px;
  color: #ef5350;
  cursor: pointer;
  transition: color 0.3s;
}
.penseaja-close-button:hover {
  color: #d32f2f;
}

/* Campos do formulário */
.penseaja-form .penseaja-field {
  margin-bottom: 1.2rem;
  position: relative;
}

.penseaja-form label {
  display: block;
  margin-bottom: 0.5rem;
  color: #444;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.penseaja-form .penseaja-field:focus-within label {
  color: #ef5350;
}

/* Botão de melhoria com IA */
.ai-enhance-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #ef5350, #d32f2f);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 15px rgba(239, 83, 80, 0.25);
  position: relative;
  overflow: hidden;
  margin: 15px 0;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.ai-enhance-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 83, 80, 0.4);
}

.ai-enhance-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(239, 83, 80, 0.3);
}

.ai-enhance-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-enhance-icon .bi-robot {
  font-size: 20px;
}

.ai-enhance-icon .icon-spark {
  position: absolute;
  font-size: 10px;
  top: -4px;
  right: -4px;
  color: #ffeb3b;
  filter: drop-shadow(0 0 3px rgba(255, 235, 59, 0.8));
  animation: sparkle 1.5s infinite;
}

.ai-enhance-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: sweep 3s infinite;
}

/* Tooltip simples e efetivo */
.tooltip-container {
  position: relative;
}

.ai-tooltip {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%) translateY(-100%) scale(0.3);
  width: 280px;
  background: white;
  border-radius: 12px;
  padding: 12px 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  z-index: 9999;
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-left: 4px solid #ef5350;
  margin-bottom: 15px;
}

.ai-tooltip.visible {
  opacity: 1 !important;
  transform: translateX(-50%) translateY(-100%) scale(1);
  top: -15px;
}

/* Triângulo na parte inferior (rabinho do balão) */
.ai-tooltip::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}

/* Ícone da lâmpada */
.lamp-icon {
  font-size: 20px;
  color: #ffb142;
  animation: pulse-glow 0.8s infinite alternate;
  flex-shrink: 0;
  margin-top: -2px;
}

/* Adiciona um ícone e styling ao texto */
.ai-tooltip strong {
  display: block;
  margin-bottom: 4px;
  color: #ef5350;
  font-size: 15px;
  font-weight: 600;
}

/* Animação de pulso para o ícone */
@keyframes pulse-glow {
  0% {
    opacity: 0.6;
    text-shadow: 0 0 2px rgba(255, 177, 66, 0.3);
  }
  50% {
    opacity: 0.9;
    text-shadow: 0 0 6px rgba(255, 177, 66, 0.6),
      0 0 12px rgba(255, 177, 66, 0.4);
  }
  100% {
    opacity: 1;
    text-shadow: 0 0 10px rgba(255, 177, 66, 0.8),
      0 0 20px rgba(255, 177, 66, 0.6);
  }
}

/* Modifica o conteúdo do tooltip */
.ai-tooltip::after {
  content: attr(data-text);
}

/* Modifica o HTML para incluir título */
.ai-enhance-button {
  position: relative;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

@keyframes sweep {
  0% {
    left: -100%;
  }
  50%,
  100% {
    left: 100%;
  }
}

.penseaja-form input[type="text"],
.penseaja-form input[type="number"],
.penseaja-form input[type="date"],
.penseaja-form textarea {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: #fdfdfd;
  color: #333;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.penseaja-form input:focus,
.penseaja-form textarea:focus {
  border-color: #ef5350;
  outline: none;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(239, 83, 80, 0.15),
    inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Melhorias para textarea */
.penseaja-form textarea,
.justifica-avaliacao textarea {
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
  padding-top: 12px;
}

/* Seção de perfil com avatar e campos agrupados */
.penseaja-profile-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 500px) {
  .penseaja-profile-section {
    flex-direction: row;
    align-items: center;
  }
}

.penseaja-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #ddd;
  flex-shrink: 0;
}
.penseaja-field-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Checkboxes */
.penseaja-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin: 1.5rem 0;
}
.penseaja-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.penseaja-checkbox:hover {
  background-color: rgba(239, 83, 80, 0.05);
}

.penseaja-checkbox input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.penseaja-checkbox input[type="checkbox"]:checked {
  background-color: #ef5350;
  border-color: #ef5350;
}

.penseaja-checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 14px;
  font-weight: bold;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.penseaja-checkbox input[type="checkbox"]:hover {
  border-color: #ef5350;
  transform: scale(1.05);
}

.penseaja-checkbox label {
  font-size: 14px;
  color: #444;
  cursor: pointer;
  margin: 0;
  line-height: 1.2;
}

.penseaja-checkbox-ganho-ask {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.penseaja-checkbox-ganho-ask:hover {
  background-color: rgba(239, 83, 80, 0.05);
}

.penseaja-checkbox-ganho-ask input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.penseaja-checkbox-ganho-ask input[type="checkbox"]:checked {
  background-color: #ef5350;
  border-color: #ef5350;
}

.penseaja-checkbox-ganho-ask input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 14px;
  font-weight: bold;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.penseaja-checkbox-ganho-ask input[type="checkbox"]:hover {
  border-color: #ef5350;
  transform: scale(1.05);
}

.penseaja-checkbox-ganho label {
  font-size: 14px;
  color: #444;
  cursor: pointer;
  margin: 0;
  line-height: 1.2;
}

.penseaja-checkbox-ganho {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.penseaja-checkbox-ganho:hover {
  background-color: rgba(239, 83, 80, 0.05);
}

.penseaja-checkbox-ganho input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.penseaja-checkbox-ganho input[type="checkbox"]:checked {
  background-color: #ef5350;
  border-color: #ef5350;
}

.penseaja-checkbox-ganho input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 14px;
  font-weight: bold;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.penseaja-checkbox-ganho input[type="checkbox"]:hover {
  border-color: #ef5350;
  transform: scale(1.05);
}

.penseaja-checkbox-ganho label {
  font-size: 14px;
  color: #444;
  cursor: pointer;
  margin: 0;
  line-height: 1.2;
}

/* Botão de submit */
.penseaja-submit-button {
  display: block;
  width: 100%;
  padding: 1rem;
  margin-top: 2rem;
  background: linear-gradient(135deg, #ef5350, #e53935);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 83, 80, 0.4);
  position: relative;
  overflow: hidden;
}

.penseaja-submit-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.penseaja-submit-button:hover {
  background: linear-gradient(135deg, #e53935, #c62828);
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(239, 83, 80, 0.5);
}

.penseaja-submit-button:hover::before {
  left: 100%;
}

.penseaja-submit-button:active {
  transform: translateY(1px);
}

.oito-perdas {
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
}

/* Calculadora de Ganhos */
.calculator-overlay {
  z-index: 100 !important;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.calculator-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity 0.4s ease, visibility 0.4s ease, transform 0.4s ease;
}

.gains-calculator {
  z-index: 1000;
  background: linear-gradient(to bottom right, #fff8f8, #fff);
  border-radius: 12px;
  padding: 20px;
  margin: 25px 0;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  max-height: 90vh;
}

.gains-calculator.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.section-title {
  display: flex;
  align-items: center;
  color: #d32f2f;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  gap: 8px;
}

.section-title .subtitle {
  margin-left: 8px;
  font-size: 14px;
  color: #777;
  font-weight: normal;
}

.section-title i {
  font-size: 24px;
  margin-right: 6px;
}

/* Abas da calculadora */
.calculator-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.tab-button {
  background: none;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  color: #555;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-button i {
  font-size: 18px;
}

.tab-button:hover {
  background: rgba(239, 83, 80, 0.1);
  color: #d32f2f;
}

.tab-button.active {
  background: linear-gradient(135deg, #ef5350, #d32f2f);
  color: white;
  box-shadow: 0 3px 8px rgba(239, 83, 80, 0.3);
}

/* Conteúdo das abas */
.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Cartões de entrada */
.input-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.input-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.input-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
}

.card-header {
  background: linear-gradient(to right, #f5f5f5, #fff);
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header i {
  font-size: 20px;
  color: #ef5350;
}

.card-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.tooltip-icon {
  color: #888;
  font-size: 16px;
  cursor: pointer;
  position: relative;
}

.tooltip-icon:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 10px);
  right: -10px;
  background: rgba(51, 51, 51, 0.95);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: normal;
  white-space: nowrap;
  z-index: 10;
}

.tooltip-icon:hover::before {
  content: "";
  position: absolute;
  bottom: calc(100% + 4px);
  right: 6px;
  border: 6px solid transparent;
  border-top-color: rgba(51, 51, 51, 0.95);
  z-index: 10;
}

.card-body {
  padding: 15px;
}

/* Campos de entrada */
.input-group {
  display: flex;
  align-items: center;
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
  transition: all 0.3s;
}

.input-group:focus-within {
  border-color: #ef5350;
  box-shadow: 0 0 0 3px rgba(239, 83, 80, 0.15);
}

.input-prefix,
.input-suffix {
  padding: 0 12px;
  font-weight: 500;
  color: #555;
  background: #f0f0f0;
}

.input-group input {
  flex: 1;
  border: none;
  padding: 10px 12px;
  background: transparent;
  font-size: 16px;
  outline: none;
}

.input-helper {
  font-size: 12px;
  color: #888;
  margin-top: 6px;
}

/* Seletor de tempo */
.time-selector {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.time-selector label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 14px;
}

/* Cartão de resultados */
.results-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.results-header {
  background: linear-gradient(135deg, #ef5350, #d32f2f);
  padding: 12px 20px;
  color: white;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.results-header h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.refresh-button {
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
  transition: all 0.2s;
}

.refresh-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(45deg);
}

.results-body {
  padding: 20px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.result-label {
  color: #555;
  font-weight: 500;
}

.result-value {
  font-weight: 700;
  font-size: 18px;
  color: #d32f2f;
}

.result-chart-container {
  height: 250px;
  padding: 10px 20px 20px;
}

/* Estilo para abas de tempo */
.time-savings-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.time-input-group input {
  width: 70px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
}

.time-label {
  color: #666;
  width: 40px;
}

.frequency-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.frequency-input input {
  width: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
}

.frequency-input select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f9f9f9;
}

/* Estilo para abas de qualidade */
.quality-metrics-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.before-after-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quality-chart-container {
  height: 200px;
  padding: 10px 20px 20px;
}

/* Dica da calculadora */
.calculator-tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(255, 248, 225, 0.8);
  border-left: 3px solid #ffb142;
  padding: 12px 15px;
  border-radius: 6px;
  margin-top: 25px;
}

.calculator-tip i {
  color: #ffb142;
  font-size: 18px;
}

.calculator-tip p {
  margin: 0;
  font-size: 14px;
  color: #555;
}

.ganhos-penseaja {
  margin-top: 15px;
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
}

#ganhos-form {
  margin-top: 10px;
}

/* Animações e efeitos */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.highlight-result {
  animation: pulse 0.6s ease-in-out;
}

/* Responsividade */
@media (max-width: 768px) {
  .input-cards-container,
  .time-savings-container,
  .quality-metrics-container {
    grid-template-columns: 1fr;
  }

  .calculator-tabs {
    overflow-x: auto;
    padding-bottom: 5px;
    margin-bottom: 15px;
  }

  .tab-button {
    white-space: nowrap;
    padding: 8px 15px;
    font-size: 14px;
  }

  .result-chart-container,
  .quality-chart-container {
    height: 200px;
  }
}
</style>
