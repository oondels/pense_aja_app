import { createRouter, createWebHistory } from 'vue-router'
const Home = () => import('../views/Home.vue')
const PenseAja = () => import('../views/PenseAja.vue')
const AiMicrofone = () => import('../components/AiTools/AiMicrofone.vue')
const UserPage = () => import('../views/UserPage.vue')
const ItemPenseAja = () => import('../views/ItemPenseAja.vue')
const News = () => import('../views/News.vue')
const Dashboard = () => import('../views/Dashboard.vue')

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
