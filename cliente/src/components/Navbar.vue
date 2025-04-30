<template>
  <div class="banner-wrapper">
    <div class="banner-container">
      <div class="banner-left">
        <div class="logo-container">
          <div class="logo-circle">
            <img
              src="/assets/img/icons/dass-penseaja.png"
              alt="Logo Dass"
              class="logo-img"
            />
          </div>
        </div>
        <div class="banner-titles">
          <h1 class="main-title">Pense <span class="highlight">&</span> Aja</h1>
          <p class="tagline">
            Transformando ideias em <span class="highlight-text">ações</span>
          </p>
        </div>
      </div>
      <div class="current-month">
        <span class="month-label">Mês atual: </span>
        <span id="mes" class="month-value"></span>
        <span>Olá {{ user.formattedUserName }}</span>
      </div>

      <div class="col-3 d-flex align-items-center banner-user-info">
        <span id="usuario" class="usuario"></span>
        <span id="nome" class="nome"></span>
        <span id="funcao" class="funcao"></span>
        <span id="avaliacaoMensal" class="valorTotal"></span>
        <span id="valorTotal" class="valorTotal"></span>
      </div>

      <div class="banner-right">
        <div class="button-group">
          <Store />

          <RegisterPenseAja />

          <Login />
        </div>
      </div>
    </div>

    <div class="banner-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Login from "./Login.vue";
import Store from "./Store.vue"
import RegisterPenseAja from "./RegisterPenseAja.vue";
import { useUserStore } from "@/stores/userStore";

const user = useUserStore();

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
</style>
