<script setup lang="ts">
import { computed, watch } from 'vue';
import { useIdeasData } from '../../composables/useIdeasData';

// Props para filtros de data
const props = defineProps<{
  startDate?: string;
  endDate?: string;
}>();

const { topIdeas, isLoading, error, refetch } = useIdeasData(props.startDate, props.endDate);

// Observar mudanças nas datas para recarregar os dados
watch([() => props.startDate, () => props.endDate], ([newStartDate, newEndDate]) => {
  console.log("Updating idea highlights data with new dates:", { startDate: newStartDate, endDate: newEndDate });
  refetch(newStartDate, newEndDate);
}, { immediate: false });

// Format date to readable string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
</script>

<template>
  <section class="highlights-section">
    <h2 class="section-title">Ideias em Destaque</h2>
    
    <div class="highlights-container">
      <div v-if="isLoading" class="loading-indicator">Carregando ideias em destaque...</div>
      
      <div v-else-if="error" class="error-indicator">
        <p>{{ error }}</p>
        <p class="retry-text">Dados de exemplo serão exibidos.</p>
      </div>
      
      <div v-else-if="topIdeas.length === 0" class="empty-indicator">
        Nenhuma ideia encontrada para esta unidade.
      </div>
      
      <div v-else class="idea-cards">
        <div v-for="idea in topIdeas" :key="idea.id" class="idea-card">
          <div class="idea-header">
            <div class="avatar" :style="`background-color: ${idea.avatarColor}`">
              {{ idea.author.charAt(0).toUpperCase() }}
            </div>
            <div class="idea-meta">
              <h3 class="idea-title">{{ idea.title }}</h3>
              <div class="idea-author">
                <span>{{ idea.author }}</span>
                <span class="idea-date">{{ formatDate(idea.date) }}</span>
              </div>
            </div>
            <div class="idea-status" :class="idea.status.toLowerCase()">
              {{ idea.status }}
            </div>
          </div>
          
          <p class="idea-description">{{ idea.description }}</p>
          
          <div class="idea-footer">
            <div class="idea-category">{{ idea.category }}</div>
            <div class="idea-factory">{{ idea.factory }}</div>
            <div class="idea-sector">{{ idea.sector }}</div>
            
            <div class="idea-metrics">
              <div class="idea-metric likes">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <span>{{ idea.likes }}</span>
              </div>
              
              <div class="idea-metric comments">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>{{ idea.comments }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.highlights-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.highlights-container {
  display: flex;
  flex-direction: column;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-secondary);
}

.error-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-error);
  text-align: center;
}

.error-indicator .retry-text {
  margin-top: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.empty-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-secondary);
  text-align: center;
}

.idea-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.idea-card {
  background-color: var(--color-bg-elevated);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.idea-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.idea-header {
  display: flex;
  margin-bottom: 1rem;
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  margin-right: 0.75rem;
}

.idea-meta {
  flex: 1;
}

.idea-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: var(--color-text-primary);
}

.idea-author {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}

.idea-date {
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid var(--color-border);
}

.idea-status {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
}

.idea-status.aprovada {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.idea-status.pendente {
  background-color: rgba(249, 115, 22, 0.1);
  color: var(--color-warning);
}

.idea-status.rejeitada {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.idea-description {
  margin: 0 0 1.5rem;
  color: var(--color-text-primary);
  font-size: 0.95rem;
  line-height: 1.5;
  flex: 1;
}

.idea-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.idea-category,
.idea-factory,
.idea-sector {
  font-size: 0.75rem;
  background-color: var(--color-bg-hover);
  color: var(--color-text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.idea-metrics {
  display: flex;
  gap: 1rem;
  margin-left: auto;
}

.idea-metric {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.idea-metric.likes {
  color: var(--color-primary);
}

.idea-metric.comments {
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .idea-cards {
    grid-template-columns: 1fr;
  }
}
</style>