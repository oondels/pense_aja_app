<script setup lang="ts">
import { computed } from 'vue';
import { useEngagementData } from '../../composables/useEngagementData.js';

// Props para filtros de data
const props = defineProps<{
  startDate?: string;
  endDate?: string;
}>();

const { topContributors, isLoading, error } = useEngagementData(props.startDate, props.endDate);

// Calculate rank percentages and styles
const getContributorStyle = (index: number) => {
  const baseSize = 100;
  const sizeFactor = 1 - (index * 0.1);
  const size = baseSize * sizeFactor;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    zIndex: 10 - index
  };
};
</script>

<template>
  <section class="engagement-section shadow p-3 rounded-lg">
    <h2 class="section-title mb-5">Colaboradores em Destaque</h2>
    
    <div class="engagement-container">
      <div v-if="isLoading" class="loading-indicator">Carregando dados de engajamento...</div>
      
      <div v-else class="contributors-grid">
        <div class="top-contributors">
          <div 
            v-for="(contributor, index) in topContributors.slice(0, 3)" 
            :key="contributor.id" 
            class="contributor-podium"
            :class="`rank-${index + 1}`"
          >
            <div class="contributor-avatar" :style="getContributorStyle(index)">
              <span>{{ contributor.name.charAt(0).toUpperCase() }}</span>
              <div class="rank-badge">{{ index + 1 }}</div>
            </div>
            <div class="contributor-info">
              <h3 class="contributor-name">{{ contributor.name }}</h3>
              <p class="contributor-role">{{ contributor.role }}</p>
              <div class="contributor-stats">
                <div class="stat">
                  <span class="stat-value">{{ contributor.ideas }}</span>
                  <span class="stat-label">Ideias</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ contributor.implemented }}</span>
                  <span class="stat-label">Implementadas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="other-contributors">
          <div 
            v-for="(contributor, index) in topContributors.slice(3)" 
            :key="contributor.id" 
            class="contributor-card"
          >
            <div class="contributor-rank">{{ index + 4 }}</div>
            <div class="contributor-avatar small">
              {{ contributor.name.charAt(0).toUpperCase() }}
            </div>
            <div class="contributor-details">
              <h4 class="contributor-name">{{ contributor.name }}</h4>
              <p class="contributor-dept">{{ contributor.department }}</p>
            </div>
            <div class="contributor-count">
              <span>{{ contributor.ideas }}</span>
              <small>ideias</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.engagement-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.engagement-container {
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

.contributors-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.top-contributors {
  display: flex;
  justify-content: space-around;
  padding-bottom: 2rem;
}

.contributor-podium {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transform-origin: center bottom;
  transition: transform 0.3s ease;
}

.contributor-podium:hover {
  transform: translateY(-8px);
}

.rank-1 {
  order: 2;
  transform: scale(1.1);
}

.rank-2 {
  order: 1;
  transform: scale(0.9);
}

.rank-3 {
  order: 3;
  transform: scale(0.9);
}

.contributor-avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 2rem;
  margin-bottom: 1rem;
  position: relative;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.rank-1 .contributor-avatar {
  background-color: #ffd700; /* Gold */
  color: #000;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4);
}

.rank-2 .contributor-avatar {
  background-color: #c0c0c0; /* Silver */
  color: #000;
  box-shadow: 0 6px 16px rgba(192, 192, 192, 0.4);
}

.rank-3 .contributor-avatar {
  background-color: #cd7f32; /* Bronze */
  color: #fff;
  box-shadow: 0 6px 16px rgba(205, 127, 50, 0.4);
}

.contributor-avatar.small {
  width: 40px;
  height: 40px;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.rank-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: white;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid;
}

.rank-1 .rank-badge {
  border-color: #ffd700;
}

.rank-2 .rank-badge {
  border-color: #c0c0c0;
}

.rank-3 .rank-badge {
  border-color: #cd7f32;
}

.contributor-info {
  text-align: center;
}

.contributor-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: var(--color-text-primary);
}

.contributor-role {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0 0 0.75rem;
}

.contributor-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.other-contributors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.contributor-card {
  background-color: var(--color-bg-elevated);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.contributor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.contributor-rank {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  width: 24px;
  text-align: center;
}

.contributor-details {
  flex: 1;
}

.contributor-details .contributor-name {
  font-size: 0.95rem;
  text-align: left;
}

.contributor-dept {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.contributor-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-hover);
  padding: 0.5rem;
  border-radius: 8px;
  min-width: 50px;
}

.contributor-count span {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-primary);
}

.contributor-count small {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .top-contributors {
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }
  
  .contributor-podium {
    width: 100%;
    order: initial !important;
    transform: none !important;
  }
  
  .rank-1, .rank-2, .rank-3 {
    margin-bottom: 1.5rem;
  }
  
  .other-contributors {
    grid-template-columns: 1fr;
  }
}
</style>