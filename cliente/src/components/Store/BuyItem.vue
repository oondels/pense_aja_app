<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <button v-bind="activatorProps" class="product-button">
        <span>Resgatar</span>
        <i class="bi bi-bag-plus"></i>
      </button>
    </template>

    <template v-slot:default="{ isActive }">
      <div class="buy-container">
        <header class="buy-item-header-clean">
          <div class="header-content">
            <div class="header-logo">
              <img src="/assets/img/icons/dass-penseaja.png" alt="Logo Dass" />
            </div>
            <div class="header-texts">
              <h1 class="header-title">Resgate de Recompensa</h1>
              <span class="header-subtitle">Loja Dass Pense & Aja</span>
            </div>
            <button
              @click="isActive.value = false"
              class="close-container"
              id="closeLoja"
            >
              <span class="bi bi-x-lg text-dark"></span>
            </button>
          </div>
        </header>

        <div class="buy-item-card animate-fade-in">
          <div class="buy-item-message">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>
              Ao confirmar o resgate,
              <b>os pontos necessários serão descontados</b> da sua pontuação
              disponível.<br />
              <span class="buy-item-highlight"
                >Esta ação não pode ser desfeita.</span
              >
            </span>
          </div>
          <div class="buy-item-info">
            <div class="buy-item-image-illustration">
              <img src="/assets/img/bolsa.png" alt="Bolsa Loja Dass" />
            </div>
            <div class="buy-item-details">
              <h3 class="item-name">Bolsa Exclusiva Dass</h3>
              <p class="item-desc">
                Leve para casa um brinde especial e mostre sua conquista!
              </p>
              <div class="item-points">
                <i class="bi bi-star-fill"></i>
                <span>Resgate por <b>20 pontos</b></span>
              </div>
            </div>
          </div>
          <button
            class="buy-item-action-btn"
            @click="handleRedeem"
            :class="{ loading: isLoading }"
          >
            <span v-if="!isLoading">Confirmar Resgate</span>
            <span v-else class="loader"></span>
          </button>
        </div>
      </div>
    </template>
  </v-dialog>

  <Notification ref="notification"/>
</template>

<script setup>
import { ref } from "vue";
import Notification from "@/components/Notification.vue"

const notification = ref(null)
const props = defineProps({
  PenseAjaProduct: {
    type: Object,
    required: true,
  },
});

const isLoading = ref(false);
function handleRedeem() {
  if (isLoading.value) return;
  isLoading.value = true;
}
</script>

<style scoped>
.buy-container {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(176, 6, 43, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
  max-width: 420px;
}

.buy-item-header-clean {
  border-radius: 18px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 1.2rem 1.5rem;
  display: flex;
  width: 100%;
  justify-content: center;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
  position: relative;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 600px;
  width: 100%;
  gap: 1rem;
}

.header-logo img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f5f5f5;
  padding: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.header-texts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.header-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-subtitle {
  font-size: 0.95rem;
  color: #777;
}

@keyframes headerFadeIn {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.product-button {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
}

.product-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(46, 204, 113, 0.4);
}

.premium-product .product-button {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);
}

.premium-product .product-button:hover {
  box-shadow: 0 6px 12px rgba(243, 156, 18, 0.4);
}

.buy-item-card {
  margin-top: 0;
  width: 100%;
  padding: 2.5rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  animation: fadeInUp 0.7s cubic-bezier(0.19, 1, 0.22, 1);
}
.buy-item-message {
  background: linear-gradient(90deg, #fff5f5 60%, #ffebee 100%);
  border-left: 4px solid #ef5350;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  font-size: 1.08rem;
  color: #b0062b;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.06);
  animation: pulseHighlight 1.2s infinite alternate;
}
.buy-item-message i {
  font-size: 1.5rem;
  color: #ef5350;
  margin-top: 2px;
  animation: pulseGlow 1.2s infinite alternate;
}
.buy-item-highlight {
  color: #d32f2f;
  font-weight: 600;
  display: block;
  margin-top: 4px;
}
.buy-item-info {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 1rem 0 0.5rem 0;
}
.buy-item-image-illustration {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: #fff7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(239, 83, 80, 0.1);
  animation: popInScale 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.buy-item-image-illustration img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  transition: transform 0.3s;
}
.buy-item-image-illustration img:hover {
  transform: scale(1.08) rotate(-6deg);
}
.buy-item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.item-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #b0062b;
  margin: 0;
}
.item-desc {
  font-size: 0.98rem;
  color: #444;
  margin: 0 0 0.2rem 0;
}
.item-points {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ef5350;
  font-weight: 600;
  font-size: 1.05rem;
}
.item-points i {
  color: #f9a825;
  font-size: 1.2rem;
}
.buy-item-action-btn {
  margin-top: 1.2rem;
  background: linear-gradient(135deg, #ef5350, #d32f2f);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 16px 0;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(239, 83, 80, 0.13);
  transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
  width: 100%;
  position: relative;
  overflow: hidden;
  outline: none;
  animation: fadeInUp 0.7s 0.2s backwards;
}
.buy-item-action-btn:hover {
  background: linear-gradient(135deg, #d32f2f, #ef5350);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 24px rgba(239, 83, 80, 0.18);
}
.buy-item-action-btn:active {
  transform: scale(0.98);
}
.buy-item-action-btn .loader {
  width: 24px;
  height: 24px;
  border: 3px solid #fff;
  border-top: 3px solid #ef5350;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
  display: block;
}
.buy-item-success {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(46, 125, 50, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  z-index: 10;
  animation: popInScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.buy-item-success i {
  font-size: 2.5rem;
  color: #4caf50;
  animation: pulseGlow 1.2s infinite alternate;
}
.buy-item-success span {
  font-size: 1.15rem;
  color: #388e3c;
  font-weight: 600;
}

/* Microinterações e animações */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes popInScale {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 83, 80, 0.18);
  }
  100% {
    box-shadow: 0 0 12px 4px rgba(239, 83, 80, 0.13);
  }
}
@keyframes pulseHighlight {
  0% {
    background: #fff5f5;
  }
  100% {
    background: #ffebee;
  }
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsividade */
@media (max-width: 600px) {
  .buy-item-card {
    padding: 1.2rem 0.5rem 1.5rem 0.5rem;
  }
  .buy-item-info {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  .buy-item-image-illustration {
    width: 60px;
    height: 60px;
  }
}
@media (max-width: 700px) {
  .buy-item-header-bg {
    min-height: 120px;
    margin-bottom: -40px;
  }
  .header-content {
    padding: 1.2rem 0.7rem 0.7rem 0.7rem;
    gap: 12px;
  }
  .header-logo img {
    width: 44px;
    height: 44px;
    padding: 3px;
  }
  .header-title {
    font-size: 1.2rem;
  }
  .header-subtitle {
    font-size: 0.9rem;
  }
}
</style>
