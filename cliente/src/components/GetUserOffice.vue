<template>
  <div class="unidade-dass">
    <div class="unidade-popup-overlay" :class="{ active: show }"></div>
    <div class="unidade-popup" :class="{ active: show }">
      <div class="unidade-popup-content">
        <div class="unidade-popup-header">
          <div class="unidade-popup-icon-dass">
            <img src="/assets/img/dass.png" alt="Logo Dass" />
          </div>
          <h3>Bem-vindo ao Sistema Pense & Aja!</h3>
        </div>
        <div class="unidade-popup-body">
          <p>
            Para prosseguirmos, por favor informe sua matrícula para
            identificarmos sua unidade Dass.
          </p>
          <div class="unidade-input-container">
            <input
              type="number"
              id="unidade-input"
              placeholder="Sua matrícula"
              v-model="matricula"
              @keyup.enter="submitMatricula"
              :disabled="loading"
              autofocus
            />
            <div class="unidade-validation-message">
              {{ validationMessage }}
            </div>
          </div>
        </div>
        <div class="unidade-popup-footer">
          <button
            class="unidade-popup-button primary"
            id="unidade-submit"
            @click="submitMatricula"
            :disabled="loading"
          >
            <span v-if="!loading">Continuar</span>
            <span v-else>Carregando...</span>
            <svg v-if="!loading" viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="currentColor"
                d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <Notification ref="notification" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { commonApi } from "@/services/httpClient";
import Notification from "@/components/Notification.vue";

const notification = ref(null);
const show = ref(true);
const matricula = ref("");
const validationMessage = ref("");
const loading = ref(false);

function submitMatricula() {
  if (!matricula.value) {
    validationMessage.value = "Por favor, informe sua matrícula.";
    return;
  }

  if (matricula.value.toString().length < 7) {
    validationMessage.value = "A matrícula deve ter 7 dígitos.";
    return;
  }

  validationMessage.value = "";
  loading.value = true;

  commonApi
    .get(`/user/unidade/${matricula.value}`)
    .then((response) => {
      const message = response.data.message;
      const unidade = response.data.dassOffice;

      localStorage.setItem("unidadeDass", unidade);
      notification.value.showPopup(
        "success",
        "Sucesso!",
        message || "Matrícula validada com sucesso!",
        2500
      );
     sessionStorage.setItem("matricula", matricula.value);

      show.value = false;
      setTimeout(() => {
        window.location.reload()
      }, 2600);
    })
    .catch((error) => {
      console.error("Erro ao validar matricula: ", error);

      const message =
        error.response?.data?.message || "Erro ao validar matrícula!";
      notification.value.showPopup("error", "Erro!", message, 2000);
    }).finally(() => {
      loading.value = false;
    })
}

onMounted(() => {
  const unidade = localStorage.getItem("unidadeDass");
  if (unidade) {
    show.value = false;
    return;
  }
  show.value = true;
});
</script>

<style scoped>
.unidade-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(176, 6, 43, 0.1);
  backdrop-filter: blur(8px);
  z-index: 9998;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

.unidade-popup-header:after {
  content: "";
  display: block;
  width: 40px;
  height: 3px;
  background-color: #b0062b;
  margin: 10px auto 0;
  border-radius: 2px;
}

.unidade-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -70%);
  width: 90%;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  overflow: hidden;
}

.unidade-popup.active {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  visibility: visible;
}

.unidade-popup-overlay.active {
  opacity: 1;
  visibility: visible;
}

.unidade-popup-content {
  padding: 28px;
}

.unidade-popup-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.unidade-popup-icon-dass {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ffffff;
  margin-bottom: 20px;
  transform: scale(0);
  animation: popInScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards,
    pulseEffect 2s infinite cubic-bezier(0.66, 0, 0, 1) 1s;
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

.unidade-popup-icon-dass img {
  width: 80%;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.unidade-popup-icon-dass:hover img {
  transform: scale(1.1);
}

.unidade-popup-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #222;
  opacity: 0;
  transform: translateY(15px);
  animation: fadeUpIn 0.5s ease forwards;
  animation-delay: 0.45s;
  text-align: center;
}

.unidade-popup-body {
  margin-bottom: 28px;
}

.unidade-popup-body p {
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #555;
  line-height: 1.5;
  opacity: 0;
  transform: translateY(15px);
  animation: fadeUpIn 0.5s ease forwards;
  animation-delay: 0.55s;
  text-align: center;
}

.unidade-input-container {
  position: relative;
  margin-bottom: 10px;
  opacity: 0;
  transform: translateY(15px);
  animation: fadeUpIn 0.5s ease forwards;
  animation-delay: 0.65s;
}

#unidade-input {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid #e1e1e1;
  border-radius: 12px;
  font-size: 16px;
  background-color: rgba(247, 247, 247, 0.7);
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  text-align: center;
  font-weight: 500;
}

#unidade-input:focus {
  outline: none;
  border-color: #b0062b;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
  background-color: #fff;
}

.unidade-validation-message {
  font-size: 13px;
  color: #ff3b30;
  margin-top: 8px;
  height: 16px;
  padding-left: 4px;
  text-align: center;
}

.unidade-popup-footer {
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: translateY(15px);
  animation: fadeUpIn 0.5s ease forwards;
  animation-delay: 0.75s;
}

.unidade-popup-button {
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.unidade-popup-button.primary {
  background-color: #b0062b;
  color: white;
}

.unidade-popup-button.primary:hover {
  background-color: #8e0522;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 122, 255, 0.3);
}

.unidade-popup-button.primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 122, 255, 0.2);
}

.unidade-popup-button svg {
  transition: transform 0.3s ease;
}

.unidade-popup-button:hover svg {
  transform: translateX(3px);
}

@keyframes fadeUpIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popInScale {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.1);
  }
  100% {
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

.unidade-popup.active .unidade-popup-content {
  animation: contentAppear 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

@keyframes contentAppear {
  from {
    opacity: 0.5;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulseEffect {
  0% {
    box-shadow: 0 0 0 0 rgb(255, 0, 0);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(176, 6, 43, 0);
  }
}
</style>
