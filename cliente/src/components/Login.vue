<template>
  <v-dialog max-width="400">
    <template v-slot:activator="{ props: activatorProps }">
      <button
        v-if="!isMobile"
        v-bind="activatorProps"
        id="openUser"
        class="action-button"
      >
        <div class="button-icon-container">
          <i :class="user?.matricula ? 'mdi mdi-logout' : 'mdi mdi-account-circle'" class="icon fs-4"></i>
        </div>
        <span class="button-label">{{user?.matricula ? 'Sair' : 'Login'}}</span>
      </button>

      <button
        v-else
        @click="handleUserData"
        v-bind="activatorProps"
        class="mobile-action-button"
      >
        <i :class="user?.matricula ? 'mdi mdi-logout' : 'mdi mdi-account-circle'" class="icon"></i>
        <span class="label">{{user?.matricula ? 'Sair' : 'Login'}}</span>
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

            <span @click="isActive.value = false" class="mdi mdi-close-circle login-close"></span>
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
            <div class="login-extra">
              <a href="#" class="forgot-password" @click.prevent>
                Esqueci minha senha
              </a>
            </div>
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

            <span @click="isActive.value = false" class="mdi mdi-close-circle login-close"></span>
          </div>

          <div class="login-form">
            <div class="login-field">
              <label for="login-user"
                >Usuário: {{ user?.usuario }}<span class="usuario-name"></span
              ></label>
              <label for="login-user"
                >Matrícula: {{ user?.matricula
                }}<span class="user-matricula"></span
              ></label>
            </div>

            <div class="login-actions">
              <button
                @click="handleLogout"
                type="button"
                id="logout"
                class="btn btn-outline-danger"
              >
                Sair
                <span class="spinner-logout hidden"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </v-dialog>

  <Notification ref="notification" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { login, logout } from "@/services/authService.js";
import { useUserStore } from "@/stores/userStore.js";
import Notification from "@/components/Notification.vue";

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

const handleLogin = async () => {
  await login(username.value, password.value, loading, notification);
};

const handleLogout = async () => {
  await logout(loading);
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

/* Link "Esqueci minha senha" */
.login-extra {
  text-align: right;
}

.login-extra .forgot-password {
  font-size: 13px;
  color: #e74c3c;
  text-decoration: none;
  transition: opacity 0.3s;
}

.login-extra .forgot-password:hover {
  opacity: 0.8;
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

/* Forgot Password */
.forgot-container.hidden {
  display: none !important;
}

.forgot-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  background: #fff;
  border-radius: 12px;
  width: 350px;
  max-width: 90%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.forgot-header {
  background: linear-gradient(135deg, #d9534f, #e74c3c);
  padding: 20px;
  text-align: center;
  position: relative;
  color: #fff;
}

.forgot-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.forgot-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  padding: 2px 8px;
  transition: background 0.3s;
}

.forgot-close:hover {
  background: rgba(255, 255, 255, 0.6);
}

.forgot-form {
  padding: 25px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

#forgot-password-confirm.diff {
  background-color: rgb(253, 217, 217);
}

#forgot-password.diff {
  background-color: rgb(253, 217, 217);
}

#changePassButton.diff {
  cursor: not-allowed;
  opacity: 0.5;
}

.forgot-field label {
  font-size: 14px;
  color: #555;
  margin-bottom: 6px;
  display: block;
}

.forgot-field input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.forgot-field input:focus {
  outline: none;
  border-color: #e74c3c;
}

.forgot-actions {
  text-align: center;
}

.forgot-btn {
  background: linear-gradient(135deg, #e74c3c, #d9534f);
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.3s;
}

.forgot-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}
</style>
