<script setup lang="ts">
import { computed, watch } from "vue";
import { useIdeasData } from "../../composables/useIdeasData";

// Props para filtros de data
const props = defineProps<{
  startDate?: string;
  endDate?: string;
}>();

const { topIdeas, isLoading, error, refetch } = useIdeasData(props.startDate, props.endDate);

// Observar mudanças nas datas para recarregar os dados
watch(
  [() => props.startDate, () => props.endDate],
  ([newStartDate, newEndDate]) => {
    console.log("Updating idea highlights data with new dates:", { startDate: newStartDate, endDate: newEndDate });
    refetch(newStartDate, newEndDate);
  },
  { immediate: false }
);

// Format date to readable string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

      <div v-else-if="topIdeas.length === 0" class="empty-indicator">Nenhuma ideia encontrada para esta unidade.</div>

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
          </div>

          <p class="idea-description">{{ idea.description }}</p>

          <div class="idea-footer">
            <div class="idea-category">{{ idea.category }}</div>
            <div class="idea-factory">{{ idea.factory }}</div>
            <div class="idea-sector">{{ idea.sector }}</div>

            <div class="idea-metrics">
              <div class="idea-metric comments">
                <span class="idea-status" :class="idea.status.toLowerCase()">{{ idea.status }}</span>
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.idea-card {
  background-color: var(--color-bg-elevated);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 280px;
}

.idea-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.idea-header {
  display: flex;
  margin-bottom: 0.75rem;
  position: relative;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.idea-meta {
  flex: 1;
  min-width: 0;
}

.idea-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: var(--color-text-primary);
  word-wrap: break-word;
  line-height: 1.3;
}

.idea-author {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.idea-date {
  padding-left: 0.5rem;
  border-left: 1px solid var(--color-border);
  white-space: nowrap;
}

.idea-status {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 999px;
  white-space: nowrap;
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
  margin: 0 0 1rem;
  color: var(--color-text-primary);
  font-size: 0.9rem;
  line-height: 1.4;
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.idea-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: auto;
  align-items: flex-end;
}

.idea-category,
.idea-factory,
.idea-sector {
  font-size: 0.7rem;
  background-color: var(--color-bg-hover);
  color: var(--color-text-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.idea-metrics {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
  flex-shrink: 0;
}

.idea-metric {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.idea-metric.likes {
  color: var(--color-primary);
}

.idea-metric.comments {
  color: var(--color-text-secondary);
}

@media (max-width: 1200px) {
  .idea-cards {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 0.75rem;
  }
}

@media (max-width: 768px) {
  .highlights-section {
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .idea-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .idea-card {
    padding: 0.875rem;
    min-height: auto;
  }

  .idea-header {
    margin-bottom: 0.5rem;
  }

  .idea-status {
    position: static;
    align-self: flex-start;
    margin-top: 0.25rem;
  }

  .idea-meta {
    width: 100%;
  }

  .idea-title {
    font-size: 0.95rem;
    margin-bottom: 0.375rem;
  }

  .idea-author {
    font-size: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
  }

  .idea-date {
    border-left: none;
    padding-left: 0;
  }

  .idea-description {
    font-size: 0.85rem;
    line-height: 1.4;
    margin-bottom: 0.75rem;
  }

  .idea-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .idea-metrics {
    margin-left: 0;
    justify-content: flex-start;
  }

  .idea-category,
  .idea-factory,
  .idea-sector {
    font-size: 0.65rem;
    padding: 0.15rem 0.35rem;
  }
}

@media (max-width: 480px) {
  .highlights-container {
    padding: 0 0.5rem;
  }

  .idea-card {
    padding: 0.75rem;
    border-radius: 8px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }

  .idea-title {
    font-size: 0.9rem;
  }

  .idea-description {
    font-size: 0.8rem;
  }

  .loading-indicator,
  .error-indicator,
  .empty-indicator {
    height: 150px;
    font-size: 0.9rem;
    padding: 1rem;
  }
}

@media (min-width: 1400px) {
  .idea-cards {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }

  .idea-card {
    padding: 1.25rem;
  }
}
</style>
