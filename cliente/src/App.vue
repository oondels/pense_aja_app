<template>
  <Navbar />

  <GetUserEmail />
  <GetUserOffice />
  <router-view />
  <Footer />
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import GetUserOffice from "./components/GetUserOffice.vue";
import GetUserEmail from "./components/GetUserEmail.vue";
import { onMounted } from "vue";
import { useUserStore } from "@/stores/userStore.js";

const unidade = localStorage.getItem("unidadeDass");
onMounted(() => {
  const userStore = useUserStore();
  userStore.carregarUsuario();
});
</script>

<style>
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
  background: linear-gradient(
    135deg,
    rgba(176, 6, 43, 0),
    rgba(255, 179, 195, 0.5)
  );
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
.disabled {
  opacity: 0.7;
  pointer-events: none;
  filter: grayscale(60%);
  cursor: not-allowed !important;
}

.close-container {
  background: rgba(231, 76, 60, 0.7);
  border: none;
  color: #e74c3c;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-container:hover {
  background: rgba(231, 76, 60, 0.4);
  transform: rotate(90deg);
}

.mobile-action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  color: #c0392b; /* vermelho suave */
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 100%;
}

.mobile-action-button:hover {
  background-color: #f33e3e;
  color: white
}

.mobile-action-button:active {
  background-color: #f1d6d6;
  transform: scale(0.97);
}

.mobile-action-button .icon {
  font-size: 1.5rem;
}

.mobile-action-button .label {
  flex-grow: 1;
  text-align: left;
}
</style>
