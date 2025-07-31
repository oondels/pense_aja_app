<template>
  <section class="chart-section">
    <div class="section-header">
      <h2 class="section-title">Tendências Mensais</h2>
      <div v-if="monthlyData.length > 0" class="chart-summary">
        <span class="summary-item">
          <strong>{{ monthlyData.reduce((sum, item) => sum + item.count, 0) }}</strong> ideias no período
        </span>
        <span class="summary-divider">•</span>
        <span class="summary-item">
          <strong>{{ monthlyData.reduce((sum, item) => sum + (item.value || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 }) }}</strong> ideias aprovadas no período
        </span>
      </div>
    </div>
    
    <div class="chart-container">
      <!-- Loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Carregando dados mensais...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">📊</div>
        <p>{{ error }}</p>
        <small>Exibindo dados de exemplo</small>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="monthlyData.length === 0" class="empty-state">
        <div class="empty-icon">📈</div>
        <p>Nenhum dado encontrado para o período selecionado</p>
        <small>Tente ajustar o filtro de datas</small>
      </div>
      
      <!-- Chart -->
      <Line 
        v-else
        ref="chartRef"
        :data="chartData" 
        :options="chartOptions" 
        class="chart"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useMonthlyData } from '../../composables/useMonthlyData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Receber os filtros de data do componente pai (Dashboard.vue)
const props = defineProps<{
  startDate?: string;
  endDate?: string;
}>();

const { monthlyData, isLoading, error, refetch } = useMonthlyData(props.startDate, props.endDate);

// Observar mudanças nas datas para recarregar os dados
watch([() => props.startDate, () => props.endDate], ([newStartDate, newEndDate]) => {
  console.log("Updating monthly data with new dates:", { startDate: newStartDate, endDate: newEndDate });
  refetch(newStartDate, newEndDate);
}, { immediate: false });

let maxY_Value = 0
const chartData = computed(() => {
  maxY_Value = monthlyData.value.reduce((max, item) => {
  return item.count > max.count ? item : max;
});

  return {
    labels: monthlyData.value.map(item => item.month),
    datasets: [
      {
        label: 'Ideias Registradas',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        data: monthlyData.value.map(item => item.count),
        fill: true
      },
      {
        label: 'Ideias Aprovadas',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        data: monthlyData.value.map(item => item.value || 0),
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };
});

const chartOptions = computed(() => {
  const textColor = document.documentElement.getAttribute('data-theme') === 'dark' 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'rgba(0, 0, 0, 0.7)';
  
  const gridColor = document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)';

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 1) {
              return `Aprovadas: ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        max: maxY_Value.count + 30,
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Quantidade de Ideias',
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        max: maxY_Value.count + 30,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
         
        },
        title: {
          display: true,
          text: 'Aprovadas',
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      }
    }
  };
});

const chartRef = ref<any>(null);

onMounted(() => {
  const observer = new MutationObserver(() => {
    if (chartRef.value?.chart) {
      chartRef.value.chart.update();
    }
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
});
</script>

<style scoped>
.chart-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.chart-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.summary-divider {
  color: var(--color-text-tertiary);
}

.chart-container {
  background-color: var(--color-bg-elevated);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: 450px;
  position: relative;
}

.chart {
  height: 100%;
  width: 100%;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
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

.error-state .error-icon,
.empty-state .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.error-state p,
.empty-state p {
  font-size: 1.1rem;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.error-state small,
.empty-state small {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.loading-state p {
  color: var(--color-text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .summary-divider {
    display: none;
  }
  
  .chart-container {
    height: 350px;
    padding: 1rem;
  }
}
</style>