<template>
  <v-dialog max-width="520" transition="dialog-bottom-transition">
    <!-- Botão ativador -->
    <template v-slot:activator="{ props }">
      <!-- <button  :class="{ 'pulse-btn': isInstallable }">
        <v-icon color="#b0062b" ></v-icon>
      </button> -->
      <v-btn
        v-bind="props"
        variant="outlined"
        :class="{ 'pulse-btn': isInstallable }"
        class="ml-2"
        prepend-icon="mdi mdi-cellphone-arrow-down"
        color="danger"
      >
        Baixar App
      </v-btn>
    </template>

    <!-- Conteúdo do diálogo -->
    <template v-slot:default="{ isActive }">
      <v-card class="rounded-xl pwa-card" elevation="10">
        <!-- Banner decorativo -->
        <div class="pwa-header position-relative">
          <div class="banner-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-circle circle-3"></div>
          </div>

          <div class="pwa-header-content">
            <div class="pwa-logo">
              <img src="/assets/img/icons/dass-penseaja.png" alt="Logo Pense & Aja" />
            </div>
            <div class="pwa-title">
              <h2>Pense <span class="highlight">&</span> Aja</h2>
            </div>
          </div>

          <button class="close-container" @click="isActive.value = false">
            <v-icon>mdi-close</v-icon>
          </button>
        </div>

        <!-- Corpo do diálogo -->
        <v-card-text class="pwa-content">
          <div class="info-banner">
            <i class="mdi mdi-information-outline info-icon"></i>
            <span>Instale nosso app para uma experiência mais rápida!</span>
          </div>

          <div class="benefits-container">
            <div class="benefit-item">
              <div class="benefit-icon">
                <v-icon color="#b0062b">mdi-storefront-outline</v-icon>
              </div>
              <div class="benefit-text">
                <span class="benefit-title">Sem download da loja</span>
                <p>Instale diretamente do navegador</p>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <v-icon color="#b0062b">mdi-cellphone-screenshot</v-icon>
              </div>
              <div class="benefit-text">
                <span class="benefit-title">Ícone na tela inicial</span>
                <p>Acesso com apenas um toque</p>
              </div>
            </div>
          </div>

          <div v-if="!isInstallable" class="not-available-message">
            <v-icon color="#e53935" class="me-2">mdi-alert-circle</v-icon>
            <span>Seu navegador não suporta a instalação no momento.</span>
          </div>
        </v-card-text>

        <!-- Ações -->
        <v-card-actions class="pwa-actions">
          <v-btn @click="isActive.value = false" variant="text" class="later-btn"> Mais tarde </v-btn>

          <v-btn :disabled="!isInstallable" @click="installApp" class="install-btn" :loading="installing">
            <span class="me-2">Instalar Agora</span>
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { usePwaInstall } from "@/composables/usePwaInstall";

const { isInstallable, installApp: originalInstallApp } = usePwaInstall();
const installing = ref(false);

// Função wrapper para adicionar feedback visual durante a instalação
const installApp = async () => {
  installing.value = true;
  await originalInstallApp();
  setTimeout(() => {
    installing.value = false;
  }, 1500);
};

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
</script>

<style scoped>
/* Estilo do botão ativador seguindo o padrão do App.vue */
.download-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  padding: 10px 5px;
}

.download-icon-container {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: linear-gradient(145deg, #fff, #f0f0f0);
  box-shadow: 6px 6px 8px #d4d3d3, -6px -6px 12px #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.download-icon-container::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(176, 6, 43, 0), rgba(255, 179, 195, 0.5));
  top: 0;
  left: -100%;
  transition: 0.5s;
}

.download-button:hover .download-icon-container::before {
  left: 0;
}

.button-icon {
  transition: transform 0.3s ease;
}

.download-button:hover .button-icon {
  transform: scale(1.15);
}

.download-button-label {
  font-size: 0.9rem;
  color: #555;
  font-weight: 600;
  transition: color 0.3s ease;
}

.download-button:hover .download-button-label {
  color: #b0062b;
}

/* Animação de pulso */
.pulse-btn .download-icon-container {
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0 rgba(176, 6, 43, 0.7), 6px 6px 8px #d4d3d3, -6px -6px 12px #ffffff;
  }
  70% {
    box-shadow: 0 0 0 10px rgba(176, 6, 43, 0), 6px 6px 8px #d4d3d3, -6px -6px 12px #ffffff;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(176, 6, 43, 0), 6px 6px 8px #d4d3d3, -6px -6px 12px #ffffff;
  }
}

/* Estilos do diálogo PWA */
.pwa-card {
  overflow: hidden;
  font-family: "Poppins", sans-serif;
  border: none;
}

.pwa-header {
  background-color: #b0062b;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
  color: white;
}

.pwa-header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.pwa-logo {
  width: 64px;
  height: 64px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.pwa-logo img {
  width: 85%;
  height: 85%;
  object-fit: contain;
}

.pwa-title {
  flex: 1;
}

.pwa-title h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
}

.pwa-title .highlight {
  color: #ffeb3b;
}

.pwa-title p {
  margin: 5px 0 0;
  font-size: 0.95rem;
  opacity: 0.9;
}

/* Decoração de círculos como no Navbar */
.banner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 120px;
  height: 120px;
  top: -40px;
  right: -20px;
}

.circle-2 {
  width: 80px;
  height: 80px;
  bottom: -20px;
  left: 30px;
}

.circle-3 {
  width: 60px;
  height: 60px;
  top: 40%;
  right: 30%;
  background: rgba(255, 255, 255, 0.15);
}

/* Botão de fechar estilizado conforme App.vue */
.close-container {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(231, 76, 60, 0.7);
  border: none;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}

.close-container:hover {
  background: rgba(231, 76, 60, 0.4);
  transform: rotate(90deg);
}

/* Conteúdo principal */
.pwa-content {
  padding: 24px 20px;
}

.info-banner {
  background: rgba(255, 235, 238, 0.92);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(244, 67, 54, 0.08);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  transition: box-shadow 0.2s;
}

.info-banner:hover {
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.15);
}

.info-icon {
  font-size: 24px;
  color: #e53935;
}

.benefits-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.benefit-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.benefit-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1), -3px -3px 6px white;
}

.benefit-text {
  flex: 1;
}

.benefit-title {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.benefit-text p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.not-available-message {
  margin-top: 20px;
  padding: 12px 16px;
  background-color: #ffebee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  color: #e53935;
  font-size: 0.9rem;
}

/* Botões de ação */
.pwa-actions {
  padding: 16px 20px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.later-btn {
  color: #666;
}

.install-btn {
  background-color: #b0062b !important;
  color: white;
  font-weight: 500;
  padding: 0 20px;
  border-radius: 8px;
  height: 40px;
}

/* Responsividade */
@media (max-width: 600px) {
  .pwa-header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
  }

  .pwa-title h2 {
    font-size: 1.5rem;
  }

  .benefit-item {
    padding: 10px 12px;
  }

  .benefit-icon {
    width: 40px;
    height: 40px;
  }

  .pwa-actions {
    flex-direction: column-reverse;
  }

  .install-btn,
  .later-btn {
    width: 100%;
  }
}
</style>
