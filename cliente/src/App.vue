<template>
  <Navbar />
  <router-view />
  <Footer />
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { onMounted } from 'vue'
import {useUserStore} from "@/stores/userStore.js"

onMounted(() => {
  const userStore = useUserStore()
  userStore.carregarUsuario()
})
</script>

<style>
body {
  font-family: 'Poppins', sans-serif;
}

.disabled {
  opacity: 0.7;
  pointer-events: none;
  filter: grayscale(60%);
  cursor: not-allowed !important;
}
</style>
