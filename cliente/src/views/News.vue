<template>
  <div class="news-page">
    <div class="news-container">
      <header class="news-header">
        <div class="header-content">
          <img src="/assets/img/icons/dass-penseaja-light.png" alt="Logo Pense & Aja" class="news-logo">
          <div class="header-text">
            <h1 class="news-title">Pense<span class="highlight">&</span>Aja</h1>
            <p class="news-subtitle">Central de Notificações</p>
          </div>
        </div>
      </header>

      <main class="news-content">
        <div class="notification-info">
          <div v-if="loading" class="loading-section">
            <v-progress-circular 
              indeterminate 
              color="red" 
              size="32"
            ></v-progress-circular>
            <p>Carregando informações...</p>
          </div>
          
          <div v-else-if="error" class="error-section">
            <div class="error-icon">
              <i class="mdi mdi-alert-circle-outline"></i>
            </div>
            <h2>Ocorreu um erro</h2>
            <p>{{ errorMessage }}</p>
            <router-link to="/" class="btn btn-primary">
              Voltar para o início
            </router-link>
          </div>
          
          <div v-else-if="notificationData" class="notification-details">
            <div class="notification-card">
              <div class="notification-header">
                <i class="mdi mdi-bell-ring"></i>
                <h2>Notificação de Pense & Aja</h2>
              </div>
              
              <div class="notification-body">
                <p class="notification-message">{{ notificationData.message }}</p>
                
                <div class="notification-meta">
                  <div class="meta-item">
                    <i class="mdi mdi-calendar"></i>
                    <span>{{ formatDate(notificationData.date) }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="mdi mdi-account"></i>
                    <span>{{ notificationData.sender }}</span>
                  </div>
                </div>
                
                <div v-if="notificationData.penseAjaId" class="action-container">
                  <p class="action-text">Clique no botão abaixo para visualizar os detalhes deste Pense & Aja:</p>
                  <router-link :to="`/pense-aja/${notificationData.penseAjaId}`" class="view-btn">
                    <i class="mdi mdi-eye"></i>
                    Visualizar Pense & Aja
                  </router-link>
                </div>
              </div>
            </div>
            
            <div class="additional-options">
              <router-link to="/pense-aja" class="option-link">
                <i class="mdi mdi-view-list"></i>
                <span>Ver todos os Pense & Aja</span>
              </router-link>
              <router-link to="/" class="option-link">
                <i class="mdi mdi-home"></i>
                <span>Voltar para o início</span>
              </router-link>
            </div>
          </div>
          
          <div v-else class="no-notification">
            <div class="empty-icon">
              <i class="mdi mdi-bell-off"></i>
            </div>
            <h2>Nenhuma notificação encontrada</h2>
            <p>Esta página deve ser acessada através de um link de notificação.</p>
            <div class="empty-actions">
              <router-link to="/pense-aja" class="btn btn-primary">
                Ver Pense & Aja
              </router-link>
              <router-link to="/" class="btn btn-secondary">
                Voltar para o início
              </router-link>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const notificationData = ref(null)

// Formata a data para exibição
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(() => {
  // Verifica se existe ID de notificação ou ID do Pense Aja na URL
  const notificationId = route.query.notificationId
  const penseAjaId = route.query.penseAjaId
  
  // Se houver um ID de Pense Aja na URL, redirecionar diretamente para a página de detalhes
  if (penseAjaId) {
    router.push(`/pense-aja/${penseAjaId}`)
    return
  }
  
  // Se houver um ID de notificação, buscar os detalhes da notificação
  if (notificationId) {
    // Simular carregamento e dados de notificação
    // Em um caso real, você faria uma chamada à API para buscar os detalhes da notificação
    setTimeout(() => {
      try {
        // Exemplo de dados de notificação
        notificationData.value = {
          id: notificationId,
          message: "Um novo Pense & Aja requer sua atenção. Verifique os detalhes para mais informações.",
          date: new Date().toISOString(),
          sender: "Sistema Pense & Aja",
          penseAjaId: route.query.penseAjaId || null
        }
        
        loading.value = false
      } catch (err) {
        console.error("Erro ao carregar notificação:", err)
        error.value = true
        errorMessage.value = "Não foi possível carregar os detalhes da notificação."
        loading.value = false
      }
    }, 1000)
  } else {
    // Se não houver ID de notificação, apenas exibir a mensagem padrão
    loading.value = false
  }
})
</script>

<style scoped>
.news-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.news-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* Header */
.news-header {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border-radius: 16px 16px 0 0;
  padding: 24px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.news-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.header-text {
  flex: 1;
}

.news-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.5px;
}

.highlight {
  color: #ffd700;
}

.news-subtitle {
  margin: 4px 0 0;
  font-size: 16px;
  opacity: 0.9;
}

/* Content */
.news-content {
  background: white;
  border-radius: 0 0 16px 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-height: 60vh;
}

/* Loading section */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #666;
}

.loading-section p {
  margin-top: 16px;
  font-size: 16px;
}

/* Error section */
.error-section {
  text-align: center;
  padding: 32px;
  color: #d32f2f;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-section h2 {
  font-size: 24px;
  margin-bottom: 16px;
}

.error-section p {
  color: #666;
  margin-bottom: 24px;
}

/* Notification details */
.notification-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.notification-card {
  background: #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.notification-header i {
  font-size: 24px;
  color: #f44336;
}

.notification-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.notification-body {
  padding: 24px;
}

.notification-message {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 20px;
}

.notification-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  color: #666;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-container {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.action-text {
  margin-bottom: 16px;
  color: #555;
}

.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f44336;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s;
}

.view-btn:hover {
  background: #d32f2f;
}

/* Additional options */
.additional-options {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.option-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.option-link:hover {
  background: #f5f5f5;
  color: #f44336;
}

/* No notification */
.no-notification {
  text-align: center;
  padding: 48px 0;
}

.empty-icon {
  font-size: 48px;
  color: #999;
  margin-bottom: 16px;
}

.no-notification h2 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
}

.no-notification p {
  color: #666;
  margin-bottom: 24px;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #f44336;
  color: white;
}

.btn-primary:hover {
  background: #d32f2f;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #bdbdbd;
}

/* Responsive */
@media (max-width: 768px) {
  .news-page {
    padding: 16px;
  }
  
  .news-header {
    padding: 16px;
  }
  
  .header-content {
    gap: 12px;
  }
  
  .news-logo {
    width: 48px;
    height: 48px;
  }
  
  .news-title {
    font-size: 24px;
  }
  
  .news-content {
    padding: 20px;
  }
  
  .notification-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .additional-options {
    flex-direction: column;
    align-items: center;
  }
}
</style>