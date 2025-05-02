<template>
  <div class="banner-wrapper">
    <div class="banner-container">
      <div class="banner-left">
        <div class="logo-container">
          <div class="logo-circle">
            <router-link to="/">
              <img
                src="/assets/img/icons/dass-penseaja.png"
                alt="Logo Dass"
                class="logo-img"
              />
            </router-link>
          </div>
        </div>
        <div class="banner-titles">
          <h1 class="main-title">Pense <span class="highlight">&</span> Aja</h1>
          <p class="tagline">
            Transformando ideias em <span class="highlight-text">ações</span>
          </p>
        </div>
      </div>
      <div class="banner-info">
        <div class="info-item month-info">
          <i class="mdi mdi-calendar-month info-icon"></i>
          <span class="month-label">Mês atual:</span>
          <span class="month-value">{{ currentMonth }}</span>
        </div>
        <div class="info-item user-info">
          <i class="mdi mdi-account-circle info-icon"></i>
          <span class="user-label">Olá,</span>
          <span class="user-value">{{ user.formattedUserName }}</span>
        </div>
      </div>

      <div class="banner-right">
        <div class="button-group desktop-menu">
          <Store />
          <RegisterPenseAja />
          <Login />
        </div>
        <!-- FAB menu icon for tablet/mobile -->
        <v-fab
          v-if="isMobile"
          class="menu-fab"
          color="info"
          :icon="isMenuOpen ? 'mdi mdi-menu-open' : 'mdi mdi-menu'"
          variant="flat"
          @click="isMenuOpen = !isMenuOpen"
        ></v-fab>
      </div>
    </div>

    <div class="banner-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <!-- Side Drawer Menu -->
    <transition name="slide-menu">
      <div
        v-if="isMenuOpen"
        class="side-drawer left"
        @click.self="isMenuOpen = false"
      >
        <div class="drawer-content">
          <button class="close-btn" @click="isMenuOpen = false">&times;</button>
          <div class="drawer-menu">
            <Store />
            <RegisterPenseAja />
            <Login />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import Login from "./Login.vue";
import Store from "./Store/Store.vue";
import RegisterPenseAja from "./RegisterPenseAja.vue";
import { useUserStore } from "@/stores/userStore";

const user = useUserStore();

const isMenuOpen = ref(false);
const isMobile = ref(false);
function handleResize() {
  isMobile.value = window.innerWidth <= 1024;
}
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const currentMonth = ref("");
onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
  const now = new Date();
  currentMonth.value = monthNames[now.getMonth()];
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const loginDialog = ref(false);
function openLogin() {
  loginDialog.value = true;
}
function closeLogin() {
  loginDialog.value = false;
}
</script>

<style scoped>
@import url("/assets/css/new.css");
@import url("/assets/css/layout.css");
.banner-user-info {
  gap: 8px;
}

.button-group.desktop-menu {
  display: flex;
  gap: 8px;
}

@media (max-width: 1024px) {
  .button-group.desktop-menu {
    display: none;
  }
  .menu-fab {
    display: inline-flex !important;
  }
}

.menu-fab {
  display: none;
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1200;
}

.side-drawer {
  position: fixed;
  top: 1rem; 
  left: 1rem; 
  width: 240px;
  height: calc(100vh - 2rem); 
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3); 
  z-index: 2000;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  padding: 0.5rem;
}

@media screen and (max-width: 600px) {
  .side-drawer {
    width: 180px !important;
    left: 0.5rem;
    top: 0.5rem;
    height: calc(100vh - 1rem);
    border-radius: 12px;
  }
}

.side-drawer.left {
  left: 0;
  
}

.drawer-content {
  padding: 1.5rem 1rem 1rem 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.close-btn {
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  margin-bottom: 1rem;
}
.drawer-menu {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
@keyframes slideIn {
  from {
    left: -300px;
  }
  to {
    left: 0;
  }
}
.slide-menu-enter-active,
.slide-menu-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-menu-enter-from,
.slide-menu-leave-to {
  transform: translateX(-120%);
  opacity: 0;
}

.slide-menu-enter-to,
.slide-menu-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.banner-info {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  background: rgba(255, 235, 238, 0.92); /* vermelho suave */
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(244, 67, 54, 0.08);
  padding: 0.5rem 1.5rem;
  margin: 0 0 1rem 0;
  transition: box-shadow 0.2s;
}

.banner-info:hover {
  box-shadow: 0 4px 24px rgba(244, 67, 54, 0.18);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.info-icon {
  font-size: 1.6rem;
  color: #e53935; /* vermelho suave */
  transition: color 0.2s;
}

.month-value, .user-value {
  font-weight: bold;
  color: #e53935; /* vermelho suave */
  letter-spacing: 0.5px;
}

.user-label, .month-label {
  color: #b71c1c;
}

@media (max-width: 600px) {
  .banner-info {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0.5rem;
  }
}
</style>
