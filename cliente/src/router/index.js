import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PenseAja from '../views/PenseAja.vue'
import AiMicrofone from '../components/AiTools/AiMicrofone.vue'
import UserPage from '../views/UserPage.vue'
import ItemPenseAja from '../views/ItemPenseAja.vue'
import News from '../views/News.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/pense-aja', name: 'Pense & Aja', component: PenseAja },
  { path: '/pense-aja/:id', name: 'Detalhe Pense & Aja', component: ItemPenseAja },
  { path: '/news', name: 'Notificações', component: News },
  { path: '/mic', name: 'Mic', component: AiMicrofone },
  { path: '/user', name: 'User', component: UserPage },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
