<template>
  <div class="relative w-full bg-gradient-to-br from-red-100 to-gray-100 p-4 overflow-hidden shadow-lg">
    <!-- Círculos decorativos -->
    <div
      class="absolute z-0 -top-10 -left-10 w-36 h-36 bg-gradient-to-br from-red-600 to-pink-400 opacity-10 rounded-full"
    ></div>
    <div
      class="absolute z-0 bottom-0 right-[25%] w-24 h-24 bg-gradient-to-br from-red-600 to-pink-400 opacity-10 rounded-full"
    ></div>
    <div
      class="absolute z-0 top-5 right-[10%] w-16 h-16 bg-gradient-to-br from-red-600 to-pink-400 opacity-10 rounded-full"
    ></div>

    <div class="relative z-10 flex flex-wrap justify-between items-center gap-4 p-4">
      <!-- Banner Left -->
      <div class="flex items-center gap-4 flex-grow min-w-[280px]">
        <div class="relative">
          <div
            class="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner flex items-center justify-center animate-float"
          >
            <router-link to="/">
              <img
                src="/assets/img/icons/dass-penseaja.png"
                alt="Logo Dass"
                class="w-16 h-16 rotate-0 transition-transform hover:rotate-[-10deg] hover:scale-110 drop-shadow-md"
              />
            </router-link>
          </div>
        </div>
        <div>
          <h1
            class="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent tracking-tight animate-fade-in-up"
          >
            Pense <span class="text-red-800">&</span> Aja
          </h1>
          <p class="text-sm sm:text-base text-gray-700 animate-fade-in-up mt-1">
            Transformando ideias em <span class="text-red-700 font-semibold underline decoration-pink-500">ações</span>
          </p>
        </div>
      </div>

      <!-- Banner Info -->
      <div class="flex flex-wrap items-center justify-center gap-4 bg-white rounded-xl shadow px-6 py-2 min-w-[260px]">
        <div class="flex items-center gap-2 text-sm">
          <i class="mdi mdi-calendar-month text-red-500 text-lg"></i>
          <span class="text-red-700">Mês atual:</span>
          <span class="font-bold text-red-600 px-2 py-0.5 rounded">{{ currentMonth }}</span>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <i class="mdi mdi-account-circle text-red-500 text-lg"></i>
          <span class="text-red-700">Olá,</span>
          <span class="font-bold text-red-600">{{ user.formattedUserName }}</span>
        </div>
      </div>

      <!-- Banner Right -->
      <div class="hidden lg:flex items-center gap-3 min-w-[200px]">
        <Store ref="storeRef" @notify="handleNotify" />
        <RegisterPenseAja ref="registerRef" @notify="handleNotify" />
        <Login ref="loginRef" @notify="handleNotify" />
      </div>
    </div>

    <!-- Mobile Navigation -->
    <v-layout class="z-10 overflow-visible" v-if="isMobile" style="height: 56px">
      <v-bottom-navigation grow class="bg-red-100" elevation="7">
        <v-btn @click="goHome"><i class="mdi mdi-home-lightbulb-outline text-xl"></i> PA's</v-btn>
        <v-btn
          @click="handleStoreClick"
          :disabled="!user.usuario || user.usuario === 'HENDRIUS.SANTANA'"
          
          v-tooltip="'Em manutenção'"
          ><i class="mdi mdi-store text-xl"></i> Loja</v-btn
        >
        <v-btn @click="handleRegisterClick"><i class="mdi mdi-lightbulb-on-outline text-xl"></i> Registrar</v-btn>
        <v-btn @click="handleLoginClick">
          <i :class="user?.matricula ? 'mdi mdi-logout' : 'mdi mdi-account-circle'" class="text-xl"></i>
          {{ user?.matricula ? "Sair" : "Entrar" }}
        </v-btn>
      </v-bottom-navigation>
    </v-layout>

    <Notification ref="notification" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import Notification from "./Notification.vue";

import { defineAsyncComponent } from "vue";
const Store = defineAsyncComponent(() => import("./Store/Store.vue"));
const RegisterPenseAja = defineAsyncComponent(() => import("./RegisterPenseAja.vue"));
import Login from "./Auth/Login.vue";

const notification = ref(null);
const user = useUserStore();
const storeRef = ref(null);
const registerRef = ref(null);
const loginRef = ref(null);
const isMenuOpen = ref(false);
const isMobile = ref(false);

const router = useRouter();
const goHome = () => router.push("/pense-aja");
const handleNotify = (payload) => {
  notification.value?.showPopup(payload.type, payload.title, payload.message, payload.time);
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 1024;
};

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
  const now = new Date();
  currentMonth.value = monthNames[now.getMonth()];
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const handleStoreClick = () => storeRef.value?.openStoreBottomNav();
const handleRegisterClick = () => registerRef.value?.openRegisterBottomNav();
const handleLoginClick = () => loginRef.value?.openLoginBottomNav();

const currentMonth = ref("");
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
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out both;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
