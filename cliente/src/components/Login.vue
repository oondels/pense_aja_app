<template>
  <v-dialog max-width="400">
    <template v-slot:activator="{ props: activatorProps }">
      <button v-bind="activatorProps" id="openUser" class="action-button">
        <div class="button-icon-container">
          <img
            src="/assets/img/icons/login.png"
            alt="user"
            class="button-icon"
          />
        </div>
        <span class="button-label">Login</span>
      </button>
    </template>

    <template v-slot:default="{ isActive }">
      <!-- Login -->
      <div v-if="!user.matricula" class="login-popup" style="z-index: 9999">
        <div class="login-overlay" @click="close"></div>
        <div class="login-container">
          <div class="login-header">
            <div class="unidade-popup-icon login-imagem">
              <img src="/assets/img/dass.png" alt="dass-logo" />
            </div>
            <h2>Login</h2>
            <button @click="isActive.value = false" class="login-close">
              &times;
            </button>
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
            <img src="/assets/img/dass.png"></img>
          </div>
          <h2>Dass Pense&Aja</h2>
          <button @click="isActive.value = false" class="login-close" id="logout-close">&times;</button>
        </div>

        <div class="login-form">
          <div class="login-field">
            <label for="login-user">Usuário: {{ user?.usuario }}<span class="usuario-name"></span></label>
            <label for="login-user">Matrícula: {{ user?.matricula }}<span class="user-matricula"></span></label>
          </div>

          <div class="login-actions">
            <button @click="handleLogout" type="button" id="logout" class="btn btn-outline-danger">
              Sair
              <span class="spinner-logout hidden"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref, defineEmits, watch } from "vue";
import { login, logout } from "@/services/auth.js";
import {useUserStore} from "@/stores/userStore.js";

// Carregad dados do usuário se estiver logado
const user = useUserStore();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const warning = ref("");

const handleLogin = async () => {
  await login(username.value, password.value, loading);
};

const handleLogout = async () => {
  await logout(loading);
}
</script>

<style scoped>
@import url("/assets/css/new.css");
@import url("/assets/css/layout.css");
</style>
