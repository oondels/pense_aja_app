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
          <Store ref="storeRef" />
          <RegisterPenseAja ref="registerRef" />
          <Login ref="loginRef" />

        </div>
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

    <!-- Bottom Navigation para Mobile -->
    <v-layout class="overflow-visible" v-if="isMobile" style="height: 56px">
      <v-bottom-navigation grow class="bg-red-lighten-5" elevation="7">
        <v-btn @click="goHome">
          <i class="mdi mdi-home-lightbulb-outline fs-4"></i>
          PA's
        </v-btn>

        <v-btn @click="handleStoreClick">
          <i class="mdi mdi-store fs-4"></i>
          Loja
        </v-btn>

        <v-btn @click="handleRegisterClick">
          <i class="mdi mdi-lightbulb-on-outline fs-4"></i>
          Registrar
        </v-btn>

        <v-btn @click="handleLoginClick">
          <i
            :class="
              user?.matricula ? 'mdi mdi-logout' : 'mdi mdi-account-circle'
            "
            class="fs-4"
          ></i>
          {{ user?.matricula ? "Sair" : "Entrar" }}
        </v-btn>
      </v-bottom-navigation>
    </v-layout>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { defineAsyncComponent } from 'vue'
import Login from "./Auth/Login.vue";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";


const Store = defineAsyncComponent(() => import("./Store/Store.vue"));
const RegisterPenseAja = defineAsyncComponent(() => import("./RegisterPenseAja.vue"));

const user = useUserStore();

const isMenuOpen = ref(false);
const isMobile = ref(false);


const router = useRouter();
const goHome = () => {
  router.push("/pense-aja");
};

const storeRef = ref(null);
const registerRef = ref(null);
const loginRef = ref(null);

function handleResize() {
  isMobile.value = window.innerWidth <= 1024;
}
const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
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

// Handlers para botões do bottom navigation
const handleStoreClick = () => {
  storeRef.value?.openStoreBottomNav();
};

const handleRegisterClick = () => {
  registerRef.value?.openRegisterBottomNav();
};

const handleLoginClick = () => {
  loginRef.value?.openLoginBottomNav();
};
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
}

.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
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

.month-value,
.user-value {
  font-weight: bold;
  color: #e53935; /* vermelho suave */
  letter-spacing: 0.5px;
}

.user-label,
.month-label {
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
