<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useMonthlyData } from '../../composables/useMonthlyData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { monthlyData, isLoading } = useMonthlyData();

const chartData = computed(() => {
  return {
    labels: monthlyData.value.map(item => item.month),
    datasets: [
      {
        label: 'Ideias Registradas',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        data: monthlyData.value.map(item => item.count)
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
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        padding: 12,
        cornerRadius: 6
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
        beginAtZero: true,
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
      }
    }
  };
});

const chartRef = ref<any>(null);

// Update chart when theme changes
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

<template>
  <section class="chart-section">
    <h2 class="section-title">Tendências Mensais</h2>
    <div class="chart-container">
      <div v-if="isLoading" class="loading-indicator">Carregando dados...</div>
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

<style scoped>
.chart-section {
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
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: 400px;
  position: relative;
}

.chart {
  height: 100%;
  width: 100%;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
}
</style>