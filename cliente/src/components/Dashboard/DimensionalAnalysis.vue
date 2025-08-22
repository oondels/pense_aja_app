<template>
  <section class="dimensional-section">
    <h2 class="section-title">Análise Dimensional</h2>

    <div class="chart-container">
      <div class="chart-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="setActiveTab(tab.id)"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="chart-content">
        <!-- Loading state -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Carregando dados dimensionais...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <p>Erro ao carregar dados...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="!chartData.labels.length" class="empty-state">
          <div class="empty-icon">📊</div>
          <p>Nenhum dado encontrado para o período selecionado</p>
        </div>

        <!-- Chart -->
        <Pie v-else ref="chartRef" :data="chartData" :options="chartOptions" class="chart" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useDimensionalData } from "../../composables/useDimensionalData";

ChartJS.register(ArcElement, Tooltip, Legend);

// Receber os filtros de data do componente pai (Dashboard.vue)
const props = defineProps<{
  startDate?: string;
  endDate?: string;
}>();

// Usar o composable para buscar dados dimensionais
const { dimensionalData, isLoading, error, refetch } = useDimensionalData(props.startDate, props.endDate);

// Observar mudanças nas datas para recarregar os dados
watch([() => props.startDate, () => props.endDate], ([newStartDate, newEndDate]) => {
  refetch(newStartDate, newEndDate);
}, { immediate: false });

const activeTab = ref("manager");
const tabs = [
  { id: "manager", label: "Por Gerente" },
  { id: "sector", label: "Por Setor" },
  { id: "factory", label: "Por Fábrica" },
];

const chartData = computed(() => {
  const data = dimensionalData.value[activeTab.value] || [];

  return {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(249, 115, 22, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(168, 85, 247, 0.7)",
          "rgba(236, 72, 153, 0.7)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(236, 72, 153, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
});

const chartOptions = computed(() => {
  const textColor =
    document.documentElement.getAttribute("data-theme") === "dark" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)";

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        padding: 12,
        cornerRadius: 6,
      },
    },
  };
});

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
};

const chartRef = ref<any>(null);

//Atualziar o grafico quando o tema mudar
onMounted(() => {
  const observer = new MutationObserver(() => {
    if (chartRef.value?.chart) {
      chartRef.value.chart.update();
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
});
</script>

<style scoped>
.dimensional-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.chart-container {
  background-color: var(--color-bg-elevated);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.chart-tabs {
  display: flex;
  background-color: var(--color-bg-hover);
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.tab-button {
  flex: 1;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-hover);
}

.tab-button.active {
  background-color: var(--color-primary);
  color: white;
}

.chart-content {
  padding: 1.5rem;
  height: 400px;
  position: relative;
}

.chart {
  height: 100%;
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state .error-icon,
.empty-state .empty-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .chart-tabs {
    flex-direction: column;
    padding: 0.5rem;
  }

  .tab-button {
    margin-bottom: 0.5rem;
  }

  .tab-button:last-child {
    margin-bottom: 0;
  }

  .chart-content {
    height: 300px;
  }
}
</style>
