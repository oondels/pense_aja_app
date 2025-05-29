<template>
  <div class="email-colector" v-if="show">
    <div class="email-popup-overlay active"></div>
    <div class="email-popup active">
      <div class="email-popup-content">
        <div class="email-popup-header">
          <div class="email-popup-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path
                fill="currentColor"
                d="M12,22c1.1,0,2-0.9,2-2h-4C10,21.1,10.9,22,12,22z M18,16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-0.83-0.67-1.5-1.5-1.5 S10.5,3.17,10.5,4v0.68C7.63,5.36,6,7.92,6,11v5l-2,2v1h16v-1L18,16z"
              />
            </svg>
          </div>
          <h3>Mantenha-se conectado</h3>
          <button class="email-popup-close" @click="closePopup">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
        </div>
        <div class="email-popup-body">
          <p>Deseja receber notificações sobre o sistema Pense&Aja?</p>
          <div class="email-input-container">
            <input
              type="email"
              id="email-input"
              placeholder="Seu email"
              v-model="email"
              :disabled="loading"
            />
            
            <input
              class="mt-2"
              type="email"
              id="email-input"
              placeholder="Matrícula"
              v-model="userMatricula"
              :disabled="loading"
            />
            <div class="email-validation-message">{{ validationMessage }}</div>
          </div>
        </div>
        <div class="email-popup-footer">
          <button class="email-popup-button secondary" id="email-skip" @click="skipEmail" :disabled="loading">
            Agora não
          </button>
          <button class="email-popup-button danger" id="email-no-email" @click="noEmail" :disabled="loading">
            Não tenho email!
          </button>
          <button class="email-popup-button primary" id="email-submit" @click="submitEmail" :disabled="loading">
            <span v-if="!loading">Continuar</span>
            <span v-else>Carregando...</span>
            <div id="email-loading" class="spinner" v-if="loading"></div>
          </button>
        </div>
        <div class="email-popup-copyright">
          <div>
            <span>Dass - SEST</span> &copy; <span>{{ year }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Notification ref="notification" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "../services/httpClient.js";
import Notification from "./Notification.vue";
const router = useRouter();

// TODO: Remover futuramente verificação de hasSeenNews
const hasSeenNews = localStorage.getItem("hasSeenNews");

const notification = ref(null);
const show = ref(false);
const email = ref("");
const validationMessage = ref("");
const loading = ref(false);
const year = ref(new Date().getFullYear());
const userMatricula = ref(null)

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDassEmail(email) {
  return email.includes("@grupodass.com.br");
}

function animateShake() {
  const input = document.getElementById("email-input");
  if (input) {
    input.style.animation = "shake 0.4s ease";
    setTimeout(() => {
      input.style.animation = "";
    }, 400);
  }
}

function closePopup() {
  show.value = false;
  if (!hasSeenNews) {
    router.push("/news").then(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

async function submitEmail() {
  validationMessage.value = "";
  const userEmail = email.value.trim();
  if (!userEmail) {
    validationMessage.value = "Por favor, informe seu email";
    animateShake();
    return;
  }
  if (!isValidEmail(userEmail)) {
    validationMessage.value = "Email inválido";
    animateShake();
    return;
  }
  if (!isValidDassEmail(userEmail)) {
    validationMessage.value = "Insira um email do Grupo Dass!";
    animateShake();
    return;
  }

  if (!userMatricula.value) {
    validationMessage.value = "Erro ao buscar matrícula do usuário, contate equipe de automação!";
    animateShake();
    return;
  }
  loading.value = true;
  let message = "";
  let error = false;
  try {
    const dassOffice = localStorage.getItem("unidadeDass")
    const response = await authApi.put(`/user/email/${userMatricula.value}`, {
      email: userEmail,
      dassOffice: dassOffice
    });

    message = response.data.message;
    notification.value?.showPopup("success", "Sucesso!", message, 3000);
    localStorage.setItem("emailProvided", "true");
    show.value = false;
    email.value = "";
  } catch (err) {
    message = err.response ? err.response.data.message : "Erro desconhecido";
    notification.value?.showPopup("warning", "Aviso!", message, 3000);
    error = true;
  } finally {
    loading.value = false;
    validationMessage.value = "";
    if (!hasSeenNews) {
      router.push("/news").then(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }
}

function skipEmail() {
  const now = Date.now();
  // Salva o timestamp de quando o usuário clicou em "Agora não"
  localStorage.setItem("emailSkipUntil", now.toString());
  show.value = false;

  if (!hasSeenNews) {
    router.push("/news").then(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function noEmail() {
  localStorage.setItem("emailProvided", "true");
  show.value = false;
}

function shouldShowPopup() {
  const unidadeDass = localStorage.getItem("unidadeDass");
  const haveEmail = sessionStorage.getItem("haveEmail");
  const emailProvided = localStorage.getItem("emailProvided");
  const emailSkipUntil = localStorage.getItem("emailSkipUntil");
  const now = Date.now();

  // Se o usuário marcou "Não tenho email", nunca mostra mais
  if (emailProvided === "true") return false;

  if (!unidadeDass) return false;

  // Se está logado, mostra a cada 3 dias
  // TODO: Corrigir funcionalidade de "Agora não"
  if (emailSkipUntil) {
    const skipUntil = parseInt(emailSkipUntil, 10);
    // 3 dias em ms = 259200000

    if (now - skipUntil < 259200000) {
      return false;
    } else {
      // Já passou o tempo, remove o controle
      localStorage.removeItem("emailSkipUntil");
      return true;
    }
  }

  return true;
}

onMounted(() => {
  // Exibe o popup se não tiver marcado "Não tenho email" e respeitando o timer de skip
  if (shouldShowPopup()) {
    setTimeout(() => {
      show.value = true;
    }, 1500);
  }
});
</script>

<style scoped>
.email-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 9998;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.email-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 420px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  opacity: 1;
  visibility: visible;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  overflow: hidden;
}

.email-popup-content {
  padding: 24px;
}

.email-popup-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-bottom: 20px;
}

.email-popup-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #1a237e;
  color: white;
  margin-bottom: 16px;
  transform: scale(0);
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: 0.3s;
}

.email-popup-close {
  position: absolute;
  top: -10px;
  right: -10px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s ease;
}

.email-popup-close:hover {
  color: #333;
}

.email-popup-copyright {
  padding-top: 15px;
  margin-top: 10px;
  font-size: 12px;
  color: #888;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
  align-items: center;
}

.email-popup-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeUp 0.4s ease forwards;
  animation-delay: 0.4s;
}

.email-popup-body {
  margin-bottom: 24px;
}

.email-popup-body p {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #555;
  line-height: 1.4;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeUp 0.4s ease forwards;
  animation-delay: 0.5s;
  text-align: center;
}

.email-input-container {
  position: relative;
  margin-bottom: 10px;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeUp 0.4s ease forwards;
  animation-delay: 0.6s;
}

#email-input {
  width: 100%;
  padding: 14px 20px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 16px;
  background-color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

#email-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
}

.email-validation-message {
  font-size: 13px;
  color: #ff3b30;
  margin-top: 6px;
  height: 16px;
  padding-left: 4px;
}

.email-popup-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeUp 0.4s ease forwards;
  animation-delay: 0.7s;
}

.email-popup-button {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.email-popup-button.primary {
  background-color: #007aff;
  color: white;
}

.email-popup-button.danger {
  background-color: #ff3b30;
  color: white;
}

.email-popup-button.secondary {
  background-color: #f1f1f1;
  border: 1px solid #b6b6b6;
  color: #555;
}

.email-popup-button.primary:hover {
  background-color: #0062cc;
}

.email-popup-button.danger:hover {
  background-color: #fa5951;
}

.email-popup-button.secondary:hover {
  background-color: #e5e5e5;
}

.email-popup-button:active {
  transform: scale(0.97);
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007aff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
  margin-left: 8px;
  display: inline-block;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  to {
    transform: scale(1);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
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
</style>
