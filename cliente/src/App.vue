<template>
  <Navbar />
  <router-view />
  <Footer />
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
// Entry point: Vue Router handles view rendering
</script>

<style>
/* global styles */
</style>
