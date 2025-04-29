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
/* global styles */
</style>
