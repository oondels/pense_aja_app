<template>
  <div class="app-container">
    <div class="filter-management">
      <div class="filter-group">
        <label for="startDate">Data Início:</label>
        <input type="date" id="startDate" v-model="startDate" min="2024-01-01">
      </div>
      
      <div class="filter-group">
        <label for="endDate">Data Fim:</label>
        <input type="date" id="endDate" v-model="endDate" :min="startDate || '2024-01-01'">
      </div>
    </div>

    <main class="main-content">
      <div class="dashboard-grid">
        <div class="dashboard-section" :class="{ 'animate-in': isLoaded }" style="--delay: 0.1s">
          <DashboardSummary />
        </div>

        <div class="dashboard-section" :class="{ 'animate-in': isLoaded }" style="--delay: 0.2s">
          <MonthlyTrendsChart />
        </div>

        <div class="dashboard-section" :class="{ 'animate-in': isLoaded }" style="--delay: 0.3s">
          <DimensionalAnalysis />
        </div>

        <div class="dashboard-section" :class="{ 'animate-in': isLoaded }" style="--delay: 0.4s">
          <IdeaHighlights />
        </div>

        <div class="dashboard-section" :class="{ 'animate-in': isLoaded }" style="--delay: 0.5s">
          <EngagementPanel />
        </div>
      </div>

      <footer class="footer">
        <p>Pense&Aja © 2025 - Plataforma de Gestão de Ideias</p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import DashboardSummary from "@/components/Dashboard/DashboardSummary.vue";
import MonthlyTrendsChart from "@/components/Dashboard/MonthlyTrendsChart.vue";
import DimensionalAnalysis from "@/components/Dashboard/DimensionalAnalysis.vue";
import IdeaHighlights from "@/components/Dashboard/IdeaHighlights.vue";
import EngagementPanel from "@/components/Dashboard/EngagementPanel.vue";
import { ref, onMounted } from 'vue';

// Set page title
document.title = 'Pense&Aja | Dashboard de Ideias';

// For animation of sections
const isLoaded = ref(false);

// Filter dates
const startDate = ref('');
const endDate = ref('');

onMounted(() => {
  isLoaded.value = true;
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.filter-management {
  display: flex;
  justify-content: flex-start; /* Aligns filter groups to the start */
  gap: 1.5rem; /* Space between filter groups */
  align-items: center; /* Vertically aligns items in the filter bar */
  padding: 1rem 2rem; /* Internal padding */
  max-width: 1400px; /* Matches main-content max-width */
  margin: 1rem auto; /* Centers the block and adds vertical spacing */
  width: 100%;
  box-sizing: border-box; /* Ensures padding is included in width calculation */
  background-color: #fff; /* Card-like background */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Subtle shadow for depth */
}

.filter-group {
  display: flex;
  align-items: center; /* Aligns label and input */
  gap: 0.5rem; /* Space between label and input */
}

.filter-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.filter-group input[type="date"] {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #fff;
  color: #333;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-section {
  opacity: 0;
  transform: translateY(20px);
}

.dashboard-section.animate-in {
  animation: fadeSlideUp 0.6s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.footer {
  margin-top: 4rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--color-border);
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .dashboard-grid {
    gap: 1.5rem;
  }

  .filter-management {
    flex-direction: column; /* Stack filter groups vertically */
    align-items: stretch; /* Make filter groups take full width */
    gap: 1rem; /* Adjust gap for column layout */
    padding: 1rem; /* Adjust padding for smaller screens */
    margin: 0.5rem auto 1rem auto; /* Adjust margins */
  }

  .filter-group {
    flex-direction: column; /* Stack label and input vertically within group */
    align-items: flex-start; /* Align label to the start */
    gap: 0.25rem; /* Smaller gap between label and input */
  }

  .filter-group input[type="date"] {
    width: 100%; /* Make date inputs take full width */
    box-sizing: border-box; /* Ensure padding/border included in width */
  }
}
</style>
