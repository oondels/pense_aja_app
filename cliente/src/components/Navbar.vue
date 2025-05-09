<template>
  <div class="banner-wrapper">
    <div class="banner-container">
      <div class="banner-left">
        <div class="logo-container">
          <div class="logo-circle">
            <router-link to="/">
              <img src="/assets/img/icons/dass-penseaja.png" alt="Logo Dass" class="logo-img" />
            </router-link>
          </div>
        </div>
        <div class="banner-titles">
          <h1 class="main-title">Pense <span class="highlight">&</span> Aja</h1>
          <p class="tagline">Transformando ideias em <span class="highlight-text">ações</span></p>
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
          <Store
            ref="storeRef"
            @notify="(payload) => notification.showPopup(payload.type, payload.title, payload.message, payload.time)"
          />
          <RegisterPenseAja
            ref="registerRef"
            @notify="(payload) => notification.showPopup(payload.type, payload.title, payload.message, payload.time)"
          />
          <Login
            ref="loginRef"
            @notify="(payload) => notification.showPopup(payload.type, payload.title, payload.message, payload.time)"
          />
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
      <div v-if="isMenuOpen" class="side-drawer left" @click.self="isMenuOpen = false">
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
          <i :class="user?.matricula ? 'mdi mdi-logout' : 'mdi mdi-account-circle'" class="fs-4"></i>
          {{ user?.matricula ? "Sair" : "Entrar" }}
        </v-btn>
      </v-bottom-navigation>
    </v-layout>
  </div>

  <Notification ref="notification" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { defineAsyncComponent } from "vue";
import Login from "./Auth/Login.vue";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";
import Notification from "./Notification.vue";

const Store = defineAsyncComponent(() => import("./Store/Store.vue"));
const RegisterPenseAja = defineAsyncComponent(() => import("./RegisterPenseAja.vue"));

const notification = ref(null);
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
header {
  display: flex;
  border-radius: 8px;
  flex: 0 0 auto;
}

header #logo {
  display: flex;
  flex: 0 1 200px;
  background: #fff;
  justify-content: center;
  align-items: center;
}

.banner-wrapper {
  width: 100%;
  position: relative;
  background: linear-gradient(135deg, #f3f4f6, #efe9e9);
  padding: 10px;
  overflow: hidden;
}

.banner-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  position: relative;
  flex-wrap: wrap; /* Allow items to wrap */
  gap: 1rem; /* Add gap between wrapped items */
}

.banner-left {
  display: flex;
  align-items: center;
  gap: clamp(10px, 2vw, 20px); /* Responsive gap */
  flex-grow: 1; /* Allow banner-left to grow */
  min-width: 280px; /* Prevent excessive shrinking */
}

.logo-container {
  position: relative;
  margin-right: 10px;
}

.logo-circle {
  width: clamp(60px, 10vw, 80px); /* Responsive size */
  height: clamp(60px, 10vw, 80px); /* Responsive size */
  border-radius: clamp(16px, 3vw, 24px); /* Responsive border-radius */
  background: linear-gradient(145deg, #f3f4f6, #e2e3e5);
  box-shadow: 6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: float 6s ease-in-out infinite;
}

.logo-img {
  width: clamp(50px, 8vw, 70px); /* Responsive size */
  height: clamp(50px, 8vw, 70px); /* Responsive size */
  transform: rotate(-10deg);
  transition: transform 0.5s ease;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.logo-circle:hover .logo-img {
  transform: rotate(0deg) scale(1.1);
}

.banner-titles {
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem); /* Responsive font size */
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #b0062b, #880320);
  -webkit-background-clip: text;
  background-clip: text; /* Standard property */
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 0.8s ease;
  letter-spacing: -0.5px;
}

.tagline {
  font-size: clamp(0.8rem, 2vw, 1.1rem); /* Responsive font size */
  font-weight: 400;
  color: #444;
  margin: 0;
  animation: fadeInUp 0.8s ease 0.2s forwards;
  opacity: 0;
  transform: translateY(10px);
}

.highlight {
  color: #b0062b;
  -webkit-text-fill-color: #b0062b;
  position: relative;
}

.highlight-text {
  position: relative;
  font-weight: 600;
  color: #b0062b;
}

.highlight-text:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #b0062b, #ff335f);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.5s ease;
}

.banner-titles:hover .highlight-text:after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

.current-month {
  margin-top: 5px;
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  animation: fadeInUp 0.8s ease 0.3s forwards;
  opacity: 0;
  transform: translateY(10px);
}

.month-label {
  opacity: 0.7;
  margin-right: 5px;
}

.month-value {
  font-weight: 600;
  color: #b0062b;
  position: relative;
  padding: 2px 8px;
  background: rgba(176, 6, 43, 0.08);
  border-radius: 4px;
}

.banner-user-info {
  gap: 8px;
}

.button-group.desktop-menu {
  display: flex;
  gap: 8px;
}

.banner-right {
  display: flex;
  justify-content: flex-end;
  flex-grow: 1; /* Allow banner-right to grow if needed */
  min-width: 200px; /* Example, adjust as needed */
}

.button-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  padding: 10px 5px;
}

.button-icon-container {
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

.button-icon-container::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(176, 6, 43, 0), rgba(255, 0, 55, 0.5));
  top: 0;
  left: -100%;
  transition: 0.5s;
}

.action-button:hover .button-icon-container::before {
  left: 0;
}

.button-icon {
  width: 28px;
  height: 28px;
  transition: transform 0.3s ease;
}

.action-button:hover .button-icon {
  transform: scale(1.15);
}

.button-label {
  font-size: 0.85rem;
  color: #555;
  font-weight: 500;
  transition: color 0.3s ease;
  opacity: 0;
  transform: translateY(-5px);
  transition: all 0.3s ease;
}

.action-button:hover .button-label {
  color: #000000;
  opacity: 1;
  transform: translateY(0);
}

.banner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  background: linear-gradient(135deg, #b0062b, #ff335f);
}

.circle-1 {
  width: 150px;
  height: 150px;
  top: -40px;
  left: -40px;
}

.circle-2 {
  width: 100px;
  height: 100px;
  bottom: -30px;
  right: 25%;
}

.circle-3 {
  width: 70px;
  height: 70px;
  top: 20px;
  right: 10%;
}

@media (max-width: 1024px) {
  .button-group.desktop-menu {
    display: none;
  }
  .banner-container {
    justify-content: center; /* Center items when desktop menu is hidden */
  }
  .banner-info {
    order: 3; /* Ensure banner-info can be reordered if necessary */
    flex-basis: 100%; /* Allow it to take full width if other items wrap */
    justify-content: center;
    margin-top: 1rem; /* Add some space if it wraps below */
  }
  .banner-right {
    display: none; /* Hide desktop menu container */
  }
  .banner-left {
    justify-content: center; /* Center logo and title if banner-right is gone */
    flex-basis: 100%; /* Allow it to take full width */
    margin-bottom: 0.5rem;
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
  gap: clamp(0.5rem, 2vw, 1.5rem); /* Responsive gap */
  align-items: center;
  background: rgba(255, 235, 238, 0.92);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(244, 67, 54, 0.08);
  padding: clamp(0.4rem, 1.5vw, 0.6rem) clamp(0.8rem, 2.5vw, 1.5rem); /* Responsive padding */
  margin: 0; /* Rely on container gap or specific media query margins */
  transition: box-shadow 0.2s;
  flex-wrap: wrap; /* Allow info items to wrap */
  justify-content: center; /* Center items if they wrap or in general */
  flex-grow: 1; /* Allow banner-info to grow if space allows */
  min-width: 260px; /* Prevent excessive shrinking */
}

.banner-info:hover {
  box-shadow: 0 4px 24px rgba(244, 67, 54, 0.18);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: clamp(0.85rem, 1.8vw, 1rem); /* Responsive font size */
}

.info-icon {
  font-size: clamp(1.1rem, 2.2vw, 1.5rem); /* Responsive font size */
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

/* Responsive adjustments for overall layout */
@media (max-width: 768px) {
  .banner-container {
    flex-direction: column; /* Stack main sections */
    align-items: center; /* Center items in column */
    padding: 10px;
  }
  .banner-left {
    flex-direction: column; /* Stack logo and titles */
    text-align: center;
    gap: 10px; /* Adjust gap for column layout */
    margin-bottom: 1rem; /* Space between banner-left and banner-info when stacked */
    width: 100%; /* Ensure it takes full width in column layout */
  }
  .logo-container {
    margin-right: 0; /* Remove margin when stacked */
    margin-bottom: 10px; /* Add some space below logo */
  }
  .banner-titles {
    align-items: center; /* Center titles text */
  }
  .banner-info {
    width: auto; /* Allow it to size based on content or flex properties */
    max-width: 90%; /* Prevent it from becoming too wide */
    justify-content: space-around; /* Distribute info items */
    padding: 0.5rem 1rem; /* Adjust padding for smaller screens */
    order: 2; /* Ensure it comes after banner-left */
  }
  .banner-right {
    /* Ensure this is also hidden or handled */
    display: none;
  }
}

@media (max-width: 600px) {
  .banner-info {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem; /* Specific padding for very small screens */
    align-items: center; /* Center items in column */
    width: 100%; /* Take full available width */
    max-width: 100%;
  }
  .info-item {
    width: auto; /* Let content define width, or set to 100% if needed */
    justify-content: center; /* Center content of info item */
    padding: 0.2rem 0;
  }
  .main-title {
    font-size: clamp(1.5rem, 5vw, 1.8rem); /* Further reduce font size */
  }
  .tagline {
    font-size: clamp(0.7rem, 2.5vw, 0.9rem); /* Further reduce font size */
  }
  .logo-circle {
    width: clamp(50px, 8vw, 60px);
    height: clamp(50px, 8vw, 60px);
    border-radius: clamp(12px, 2.5vw, 18px);
  }
  .logo-img {
    width: clamp(40px, 7vw, 50px);
    height: clamp(40px, 7vw, 50px);
  }
  .banner-left {
    gap: 5px;
    margin-bottom: 0.5rem;
  }
}
</style>
