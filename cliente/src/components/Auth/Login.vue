<template>
  <div class="auth">
    <v-dialog v-model="openAuth" max-width="400">
      <template v-slot:activator="{ props: activatorProps }">
        <button
          v-if="!isMobile"
          v-bind="activatorProps"
          id="openUser"
          class="action-button"
        >
          <div class="button-icon-container">
            <i
              :class="
                user?.matricula ? 'mdi mdi-logout' : 'mdi mdi-account-circle'
              "
              class="icon fs-4"
            ></i>
          </div>
          <span class="button-label">{{
            user?.matricula ? "Sair" : "Login"
          }}</span>
        </button>

        <button
          v-else
          @click="handleUserData"
          v-bind="activatorProps"
          class="mobile-action-button"
        >
          <i
            :class="
              user?.matricula ? 'mdi mdi-logout' : 'mdi mdi-account-circle'
            "
            class="icon"
          ></i>
          <span class="label">{{ user?.matricula ? "Sair" : "Login" }}</span>
        </button>
      </template>

      <template v-slot:default="{ isActive }">
        <!-- Login -->
        <div v-if="!user?.matricula" class="login-popup" style="z-index: 9999">
          <div class="login-overlay" @click="close"></div>
          <div class="login-container">
            <div class="login-header">
              <div class="unidade-popup-icon login-imagem">
                <img src="/assets/img/dass.png" alt="dass-logo" />
              </div>
              <h2>Login</h2>

              <span
                @click="isActive.value = false"
                class="mdi mdi-close-circle login-close"
              ></span>
            </div>

            <div class="login-form">
              <div class="login-field">
                <label for="login-user">Usuário</label>
                <div class="input-with-icon">
                  <span class="bi bi-person-fill input-icon"></span>
                  <input
                    type="text"
                    id="login-user"
                    v-model="username"
                    placeholder="Digite seu usuário"
                  />
                </div>
              </div>

              <div class="login-field">
                <label for="login-password">Senha</label>
                <div class="input-with-icon">
                  <span class="bi bi-lock-fill input-icon"></span>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="login-password"
                    v-model="password"
                    placeholder="Digite sua senha"
                  />

                  <span
                    class="bi"
                    :class="showPassword ? 'bi-eye' : 'bi-eye-slash'"
                    @click="showPassword = !showPassword"
                    style="cursor: pointer"
                  ></span>
                </div>

                <div class="warning-container">
                  <span class="warning-content" v-if="warning">
                    {{ warning }}
                  </span>
                </div>
              </div>

              <ForgotPassword
                @notify="
                  (data) =>
                    notification.showPopup(data.type, data.title, data.message)
                "
              />

              <div class="login-actions">
                <button class="login-btn" @click="handleLogin">
                  <span class="btn-text">Entrar</span>
                  <span class="spinner" v-if="loading"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Logout -->
        <div v-else id="logout-popup" class="login-popup">
          <div class="login-overlay"></div>
          <div class="login-container">
            <div class="login-header">
              <div class="unidade-popup-icon login-imagem">
                <img src="/assets/img/dass.png" />
              </div>
              <h2>Dass Pense&Aja</h2>

              <span
                @click="isActive.value = false"
                class="mdi mdi-close-circle login-close"
              ></span>
            </div>

            <div class="login-form">
              <div class="user-info">
                <div class="user-avatar">
                  <span class="avatar-initials">{{ getUserInitials }}</span>
                </div>
                <div class="user-details">
                  <h3 class="user-name">{{ formateName(user?.nome) }}</h3>
                  <div class="user-field">
                    <span class="field-label">Usuário:</span>
                    <span class="field-value">{{ user?.usuario }}</span>
                  </div>
                  <div class="user-field">
                    <span class="field-label">Matrícula:</span>
                    <span class="field-value">{{ user?.matricula }}</span>
                  </div>
                </div>
              </div>

              <div class="login-actions user-actions">
                <button @click="goToProfile" class="profile-btn">
                  <i class="mdi mdi-account-circle"></i>
                  <span>Meu Perfil</span>
                </button>

                <button
                  @click="handleLogout"
                  type="button"
                  id="logout"
                  class="logout-btn"
                >
                  <i class="mdi mdi-logout"></i>
                  <span>Sair</span>
                  <span class="spinner-logout hidden"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </v-dialog>
  </div>

  <Notification ref="notification" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, defineExpose } from "vue";
import { login, logout } from "@/services/authService.js";
import { formateName } from "@/services/userService.js";
import { useUserStore } from "@/stores/userStore.js";
import { useRouter } from "vue-router";
import Notification from "@/components/Notification.vue";
import ForgotPassword from "./ForgotPassword.vue";

const openAuth = ref(false);
const openLoginBottomNav = () => {
  openAuth.value = !openAuth.value;
};
defineExpose({ openLoginBottomNav });

const router = useRouter();
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
// Carregad dados do usuário se estiver logado
const user = useUserStore();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const warning = ref("");

// Computa as iniciais do nome do usuário para o avatar
const getUserInitials = computed(() => {
  if (!user?.nome) return "?";
  return user.nome
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
});

const handleLogin = async () => {
  await login(username.value, password.value, loading, notification);
};

const handleLogout = async () => {
  await logout(loading);
};

const goToProfile = () => {
  router.push("/user");
};
</script>

<style scoped>
.login-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.5s ease-out;
}

.login-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(4px);
}

/* Container central do popup */
.login-container {
  position: relative;
  background: #fff;
  border-radius: 12px;
  width: 350px;
  max-width: 90%;
  z-index: 2;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideDown 0.5s ease-out;
}

/* Cabeçalho */
.login-header {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: linear-gradient(135deg, #d9534f, #e74c3c);
  padding: 20px;
  text-align: center;
  position: relative;
  color: #fff;
}

.login-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.login-logo {
  width: 48px;
  height: 48px;
  margin-bottom: 10px;
}

.unidade-popup-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ffffff;
  margin-bottom: 20px;
  animation: popInScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards,
    pulseEffect2 2s infinite cubic-bezier(0.66, 0, 0, 1) 1s;
  animation-delay: 0.3s;
  box-shadow: 0 5px 15px rgba(176, 6, 43, 0.3);
  border: 2px solid rgba(176, 6, 43, 0.2);
  overflow: hidden;
  padding: 0;
}

.unidade-popup-icon img {
  width: 80%;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

@keyframes pulseEffect2 {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(176, 6, 43, 0);
  }
}

/* Botão de fechar */
.login-close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.3s;
}

.login-close:hover {
  background: rgba(255, 255, 255, 0.6);
}

/* Formulário */
.login-form {
  padding: 25px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-field label {
  font-size: 14px;
  color: #555;
  margin-bottom: 6px;
  display: block;
}

.login-field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s ease;
}

.login-field input:focus {
  outline: none;
  border-color: #e74c3c;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon .input-icon {
  position: absolute;
  left: 12px;
  color: #aaa;
  font-size: 18px;
}

.input-with-icon input {
  padding-left: 36px;
}

.input-with-icon .toggle-password {
  position: absolute;
  right: 12px;
  cursor: pointer;
  color: #aaa;
  font-size: 18px;
}

/* Ações do formulário */
.login-actions {
  text-align: center;
}

.login-btn {
  background: linear-gradient(135deg, #e74c3c, #d9534f);
  border: none;
  color: #fff;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.3s;
}

.login-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

/* Loading Login */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-left: 8px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top-color: #fff;
  border-radius: 50%;
  animation: loading 0.6s linear infinite;
  vertical-align: middle;
}

.spinner-logout {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-left: 8px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top-color: #fff;
  border-radius: 50%;
  animation: loading 0.6s linear infinite;
  vertical-align: middle;
}

.spinner-ai {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-left: 8px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top-color: #fff;
  border-radius: 50%;
  animation: loading 0.6s linear infinite;
  vertical-align: middle;
}

.hidden {
  display: none;
}

@keyframes loading {
  to {
    transform: rotate(360deg);
  }
}

.warning-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.warning-content {
  color: red;
  text-align: center;
  font-size: 13px;
  margin-top: 8px;
}

.warning-content.hidden {
  display: none;
}

/* Estilos novos para o perfil do usuário */
.user-info {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef5350, #c62828);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  box-shadow: 0 4px 10px rgba(239, 83, 80, 0.3);
  flex-shrink: 0;
}

.avatar-initials {
  font-size: 22px;
  color: white;
  font-weight: bold;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 18px;
  margin: 0 0 5px;
  color: #333;
}

.user-field {
  font-size: 14px;
  margin-bottom: 3px;
  color: #666;
}

.field-label {
  font-weight: 600;
  margin-right: 5px;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile-btn,
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.profile-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.profile-btn:hover {
  background-color: #eee;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.logout-btn {
  background: linear-gradient(135deg, #e74c3c, #d9534f);
  color: white;
  border: none;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #d9534f, #c9302c);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.profile-btn i,
.logout-btn i {
  font-size: 18px;
}
</style>
