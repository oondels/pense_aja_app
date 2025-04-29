import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PenseAja from '../views/PenseAja.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/pense-aja', name: 'Pense & Aja', component: PenseAja },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
