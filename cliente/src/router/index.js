import { createRouter, createWebHistory } from 'vue-router'
const Home = () => import('../views/Home.vue')
const PenseAja = () => import('../views/PenseAja.vue')
const AiMicrofone = () => import('../components/AiTools/AiMicrofone.vue')
const UserPage = () => import('../views/UserPage.vue')
const ItemPenseAja = () => import('../views/ItemPenseAja.vue')
const News = () => import('../views/News.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Marketplace = () => import('../views/Marketplace.vue')
const MarketplaceRequests = () => import('../views/MarketplaceRequests.vue')
const AdminMarketplace = () => import('../views/AdminMarketplace.vue')
const AdminCatalog = () => import('../views/AdminCatalog.vue')
const AdminRbac = () => import('../views/AdminRbac.vue')
const IdeaAudit = () => import('../views/IdeaAudit.vue')
const PointsHistory = () => import('../views/PointsHistory.vue')

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/pense-aja', name: 'Pense & Aja', component: PenseAja },
  { path: '/pense-aja/:id', name: 'Detalhe Pense & Aja', component: ItemPenseAja },
  { path: '/pense-aja/:id/audit', name: 'Auditoria Pense & Aja', component: IdeaAudit },
  { path: '/news', name: 'Notificações', component: News },
  { path: '/mic', name: 'Mic', component: AiMicrofone },
  { path: '/user', name: 'User', component: UserPage },
  { path: '/user/points-history', name: 'Histórico de Pontos', component: PointsHistory },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/marketplace', name: 'Marketplace', component: Marketplace },
  { path: '/marketplace/requests', name: 'Solicitações Marketplace', component: MarketplaceRequests },
  { path: '/admin/marketplace', name: 'Admin Marketplace', component: AdminMarketplace },
  { path: '/admin/catalog', name: 'Admin Catálogo', component: AdminCatalog },
  { path: '/admin/rbac', name: 'Admin RBAC', component: AdminRbac },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
