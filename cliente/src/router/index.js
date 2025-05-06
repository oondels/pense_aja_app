import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PenseAja from '../views/PenseAja.vue'
import AiMicrofone from '../components/AiTools/AiMicrofone.vue'
import UserPage from '../views/UserPage.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/pense-aja', name: 'Pense & Aja', component: PenseAja },
  { path: '/mic', name: 'Mic', component: AiMicrofone },
  { path: '/user', name: 'User', component: UserPage },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
