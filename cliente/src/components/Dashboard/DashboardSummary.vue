<script setup lang="ts">
import { computed, inject, watch } from 'vue';
import { useSummaryData } from '../../composables/useSummaryData';

// Receber os filtros de data do componente pai (Dashboard.vue)
const props = defineProps<{
  startDate?: string;
  endDate?: string;
}>();

const { summaryData, isLoading, error, refetch } = useSummaryData(props.startDate, props.endDate);

// Observar mudanças nas datas para recarregar os dados
watch([() => props.startDate, () => props.endDate], ([newStartDate, newEndDate]) => {
  refetch(newStartDate, newEndDate);
}, { immediate: false });

const totalIdeas = computed(() => summaryData.value.totalIdeas);
const implementedIdeas = computed(() => summaryData.value.implementedIdeas);
const pendingIdeas = computed(() => summaryData.value.pendingIdeas);
const rejectedIdeas = computed(() => summaryData.value.rejectedIdeas);
const approvedByManager = computed(() => summaryData.value.approvedByManager);
const inAnalysis = computed(() => summaryData.value.inAnalysis);
const totalValue = computed(() => summaryData.value.totalValue);
const avgValue = computed(() => summaryData.value.avgValue);

const implementationRate = computed(() => {
  return Math.round((implementedIdeas.value / totalIdeas.value) * 100) || 0;
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
</script>

<template>
  <section class="summary-section">
    <h2 class="section-title">Resumo Geral</h2>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando dados...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
    </div>
    
    <!-- Content -->
    <div v-else class="summary-cards">
      <div class="summary-card total">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div class="card-content">
          <h3 class="card-title">Total de Ideias</h3>
          <p class="card-value">{{ totalIdeas }}</p>
        </div>
      </div>
      
      <div class="summary-card implemented">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="card-content">
          <h3 class="card-title">Implementadas</h3>
          <p class="card-value">{{ implementedIdeas }}</p>
          <div class="card-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="`width: ${implementationRate}%`"></div>
            </div>
            <span class="progress-text">{{ implementationRate }}%</span>
          </div>
        </div>
      </div>
      
      <div class="summary-card pending">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="card-content">
          <h3 class="card-title">Em Análise</h3>
          <p class="card-value">{{ pendingIdeas }}</p>
        </div>
      </div>
      
      <div class="summary-card rejected">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="card-content">
          <h3 class="card-title">Não Aprovadas</h3>
          <p class="card-value">{{ rejectedIdeas }}</p>
        </div>
      </div>

      <!-- Cards adicionais para métricas financeiras -->
      <div class="summary-card value">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="card-content">
          <h3 class="card-title">Valor Total</h3>
          <p class="card-value">{{ formatCurrency(totalValue) }}</p>
        </div>
      </div>

      <div class="summary-card average">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
          </svg>
        </div>
        <div class="card-content">
          <h3 class="card-title">Valor Médio</h3>
          <p class="card-value">{{ formatCurrency(avgValue) }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.summary-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: var(--color-bg-elevated);
  border-radius: 12px;
  margin: 1rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-bg-hover);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state .error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background-color: var(--color-bg-elevated);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 1rem;
}

.total .card-icon {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
}

.implemented .card-icon {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.pending .card-icon {
  background-color: rgba(249, 115, 22, 0.1);
  color: var(--color-warning);
}

.rejected .card-icon {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.value .card-icon {
  background-color: rgba(139, 69, 197, 0.1);
  color: #8b45c5;
}

.average .card-icon {
  background-color: rgba(14, 165, 233, 0.1);
  color: #0ea5e9;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0 0 0.5rem;
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.card-progress {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: var(--color-bg-hover);
  border-radius: 3px;
  overflow: hidden;
  margin-right: 0.75rem;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-success);
  border-radius: 3px;
  transition: width 1s ease-in-out;
}

.progress-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-success);
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>