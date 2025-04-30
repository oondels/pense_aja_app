<template>
  <v-dialog max-width="850">
    <template v-slot:activator="{ props: activatorProps }">
      <button
        @click="handleUserData"
        v-bind="activatorProps"
        id="openLoja"
        class="action-button"
      >
        <div class="button-icon-container">
          <img
            src="/assets/img/icons/store.png"
            alt="loja"
            class="button-icon"
          />
        </div>
        <span class="button-label">Loja</span>
      </button>
    </template>

    <template v-slot:default="{ isActive }">
      <div id="loja" class="loja store-container rounded-b-shaped">
        <div class="store-wrapper rounded-b-shaped">
          <div class="store-header red-theme rounded-b-shaped">
            <div class="header-gradient-overlay"></div>
            <div class="store-title-container">
              <div class="store-logo">
                <img
                  src="/assets/img/icons/dass-penseaja.png"
                  alt="Dass Pense Aja Logo"
                />
              </div>

              <div class="store-title-content">
                <h1>Loja de Recompensas</h1>
                <span class="store-subtitle">Sistema Pense & Aja</span>
              </div>
            </div>

            <div class="store-notification">
              <div class="notification-icon">
                <i class="bi bi-exclamation-circle-fill"></i>
              </div>

              <div class="notification-content">
                <span class="notification-title">Atenção</span>
                <span class="notification-text">
                  Pontuação sujeita a avaliação do gerente
                </span>
              </div>
            </div>

            <button
              @click="isActive.value = false"
              class="close-store-button position-absolute top-0 end-0 m-4"
              id="closeLoja"
            >
              <span class="bi bi-x-lg text-white"></span>
            </button>
          </div>

          <!-- Barra de pesquisa e pontos -->
          <div class="store-search-bar">
            <div class="search-container" id="divLojaMatricula">
              <i class="bi bi-person-badge search-icon"></i>
              <input
                type="number"
                placeholder="Digite sua matrícula"
                id="lojaMatricula"
                class="search-input"
              />
              <button class="search-button" id="pesqLoja">
                <i class="bi bi-search"></i>
                <span>Buscar</span>
              </button>
            </div>
            <div class="points-container">
              <div class="points-badge">
                <i class="bi bi-star-fill"></i>
                <span id="pontosLoja" class="points-value">{{ pontos }}</span>
                <span class="points-label">pontos</span>
              </div>
            </div>
          </div>

          <!-- Informações do usuário -->
          <div class="user-details d-none">
            <div class="user-info-card">
              <div class="user-avatar">
                <i class="bi bi-person-circle text-primary"></i>
              </div>
              <div class="user-data">
                <p id="nomeLoja" class="nomeLoja">Nome:</p>
                <p id="setorLoja" class="setorLoja">Setor:</p>
                <p id="gerenteLoja" class="gerenteLoja">Gerente:</p>
                <p id="liderLoja" class="liderLoja">Líder:</p>
              </div>
            </div>
          </div>

          <!-- Produtos -->
          <div class="store-products">
            <h2 class="products-heading">Produtos Disponíveis</h2>

            <div class="products-grid">
              <div
                class="product-card polaroid pontosSEM"
                data-value="10"
                data-text="bloco de notas"
              >
                <div class="product-badge">10 pts</div>
                <div class="product-image-container">
                  <img
                    src="/assets/img/bloco.png"
                    alt="Bloco de Notas"
                    data-value="10"
                    class="product-image"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">Bloco de Notas</h3>
                  <button class="product-button">
                    <span>Resgatar</span>
                    <i class="bi bi-bag-plus"></i>
                  </button>
                </div>
              </div>

              <div
                class="product-card polaroid pontosSEM"
                data-value="20"
                data-text="necessaire"
              >
                <div class="product-badge">20 pts</div>
                <div class="product-image-container">
                  <img
                    src="/assets/img/bolsa.png"
                    alt="Necessaire"
                    data-value="20"
                    class="product-image"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">Necessaire</h3>
                  <button class="product-button">
                    <span>Resgatar</span>
                    <i class="bi bi-bag-plus"></i>
                  </button>
                </div>
              </div>

              <div
                class="product-card polaroid pontosSEM"
                data-value="30"
                data-text="camisa"
              >
                <div class="product-badge">30 pts</div>
                <div class="product-image-container">
                  <img
                    src="/assets/img/camisa.png"
                    alt="Camisa"
                    data-value="30"
                    class="product-image"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">Camisa</h3>
                  <button class="product-button">
                    <span>Resgatar</span>
                    <i class="bi bi-bag-plus"></i>
                  </button>
                </div>
              </div>

              <div
                class="product-card polaroid pontosSEM"
                data-value="15"
                data-text="caneca"
              >
                <div class="product-badge">15 pts</div>
                <div class="product-image-container">
                  <img
                    src="/assets/img/caneca.png"
                    alt="Caneca"
                    data-value="15"
                    class="product-image"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">Caneca</h3>
                  <button class="product-button">
                    <span>Resgatar</span>
                    <i class="bi bi-bag-plus"></i>
                  </button>
                </div>
              </div>

              <div
                class="product-card polaroid pontosSEM"
                data-value="4"
                data-text="caneta"
              >
                <div class="product-badge">4 pts</div>
                <div class="product-image-container">
                  <img
                    src="/assets/img/caneta.png"
                    alt="Caneta"
                    data-value="4"
                    class="product-image"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">Caneta</h3>
                  <button class="product-button">
                    <span>Resgatar</span>
                    <i class="bi bi-bag-plus"></i>
                  </button>
                </div>
              </div>

              <div
                class="product-card polaroid pontosSEM"
                data-value="5"
                data-text="chaveiro"
              >
                <div class="product-badge">5 pts</div>
                <div class="product-image-container">
                  <img
                    src="/assets/img/chaveiro.png"
                    alt="Chaveiro"
                    data-value="5"
                    class="product-image"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">Chaveiro</h3>
                  <button class="product-button">
                    <span>Resgatar</span>
                    <i class="bi bi-bag-plus"></i>
                  </button>
                </div>
              </div>

              <div
                class="product-card polaroid pontosSEM"
                data-value="10"
                data-text="copo"
              >
                <div class="product-badge">10 pts</div>
                <div class="product-image-container">
                  <img
                    src="/assets/img/copo.png"
                    alt="Copo"
                    data-value="10"
                    class="product-image"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">Copo</h3>
                  <button class="product-button">
                    <span>Resgatar</span>
                    <i class="bi bi-bag-plus"></i>
                  </button>
                </div>
              </div>

              <div
                class="product-card polaroid pontosSEM premium-product"
                data-value="40"
                data-text="tenis"
              >
                <div class="product-badge premium-badge">40 pts</div>
                <div class="product-image-container">
                  <img
                    src="/assets/img/tenis.png"
                    alt="Tênis"
                    data-value="40"
                    class="product-image"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">Tênis</h3>
                  <button class="product-button">
                    <span>Resgatar</span>
                    <i class="bi bi-bag-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getUserData } from "@/services/userService";
import { useUserStore } from "@/stores/userStore";

const user = useUserStore()

const userData = ref(null);
let pontos = ref(0);
const handleUserData = async () => {
  try {
    if (!userData.value && user.matricula) {
      await getUserData(user.matricula, userData);
      pontos.value = userData.value.pontos - userData.value.pontos_resgatados;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};
</script>

<style scoped>
.store-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  overflow-y: auto;
  overflow-x: auto;
  transition: opacity 0.4s ease, visibility 0.4s ease, transform 0.4s ease;
  border-radius: 20px;
}

.store-container.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.store-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Header da Loja */
.store-header.red-theme {
  background: linear-gradient(135deg, #c62828 0%, #fc5050 100%);
  margin: -30px -20px 30px;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 15px rgba(183, 28, 28, 0.3);
  position: relative;
  overflow: hidden;
  color: white;
  border-radius: 12px 12px 0 0;
}

.header-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at top right,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0) 60%
  );
  pointer-events: none;
}

.store-header.red-theme::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 3px;
  background: linear-gradient(90deg, #ffcdd2, #ffffff, #ffcdd2);
  animation: gradient-shift 8s linear infinite;
}

.store-title-container {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  position: relative;
}

.store-logo {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.store-logo img {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}

.store-title-content {
  display: flex;
  flex-direction: column;
}

.store-header.red-theme h1 {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.store-subtitle {
  font-size: 14px;
  opacity: 0.9;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.store-header.red-theme .store-notification {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border-radius: 10px;
  border-left: 4px solid #ffcdd2;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
}

.notification-icon {
  font-size: 18px;
  color: #ffcdd2;
  animation: pulse-glow 2s infinite;
}

.notification-content {
  display: flex;
  flex-direction: column;
}

.notification-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
}

.notification-text {
  opacity: 0.85;
}

@keyframes gradient-shift {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%);
  }
}

.store-title {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.store-icon {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.store-icon i {
  font-size: 24px;
  color: #3498db;
}

.store-title h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.5px;
}

.store-notification {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.store-notification i {
  color: #3498db;
}

/* Barra de pesquisa e pontos */
.store-search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 20px;
}

.search-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  padding: 8px 15px;
  flex: 1;
}

.search-icon {
  color: #7f8c8d;
  font-size: 18px;
  margin-right: 10px;
}

.search-input {
  border: none;
  outline: none;
  font-size: 16px;
  width: 100%;
  background: transparent;
}

.search-button {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(52, 152, 219, 0.4);
}

.search-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(52, 152, 219, 0.3);
}

.points-container {
  display: flex;
  align-items: center;
}

.points-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  padding: 8px 20px;
  border-radius: 50px;
  color: white;
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.points-value {
  font-size: 24px;
  font-weight: 700;
}

.points-label {
  font-size: 14px;
  opacity: 0.8;
}

.close-store-button {
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

.close-store-button:hover {
  background: rgba(231, 76, 60, 0.2);
  transform: rotate(90deg);
}

/* Informações do usuário */
.user-details {
  margin-bottom: 30px;
  transition: all 0.3s ease;
}

.user-info-card {
  display: flex;
  gap: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.user-avatar {
  font-size: 40px;
  color: #7f8c8d;
}

.user-data {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-data p {
  margin: 0;
  font-size: 14px;
  color: #34495e;
}

/* Produtos */
.products-heading {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
  position: relative;
  padding-bottom: 15px;
}

.products-heading::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
  border-radius: 3px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
}

.product-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 2;
  box-shadow: 0 3px 8px rgba(52, 152, 219, 0.3);
  transform: scale(0.9);
  transition: transform 0.2s ease;
}

.premium-badge {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  box-shadow: 0 3px 8px rgba(243, 156, 18, 0.3);
}

.product-card:hover .product-badge {
  transform: scale(1);
}

.product-image-container {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  overflow: hidden;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
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

/* Animações para entrada de produtos */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-card {
  opacity: 0;
  animation: fadeIn 0.5s forwards;
}

.product-card:nth-child(1) {
  animation-delay: 0.1s;
}
.product-card:nth-child(2) {
  animation-delay: 0.2s;
}
.product-card:nth-child(3) {
  animation-delay: 0.3s;
}
.product-card:nth-child(4) {
  animation-delay: 0.4s;
}
.product-card:nth-child(5) {
  animation-delay: 0.5s;
}
.product-card:nth-child(6) {
  animation-delay: 0.6s;
}
.product-card:nth-child(7) {
  animation-delay: 0.7s;
}
.product-card:nth-child(8) {
  animation-delay: 0.8s;
}
</style>
