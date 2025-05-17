<template>
  <div class="penseaja-app">
    <main>
      <section
        class="penseaja-list-section container animate-fade-in position-relative"
        aria-label="Lista de projetos Pense&Aja"
        tabindex="-1"
        role="region"
      >
        <header class="penseaja-list-header">
          <h2 class="penseaja-list-title w-100 text-center">
            Projetos Pense&Aja
          </h2>
        </header>

        <!-- Badge de contagem de registros -->
        <div
          class="record-badge-fixed"
          v-show="penseAjaCount > 0"
          @mouseover="isTabExpanded = true"
          @mouseleave="isTabExpanded = false"
          :class="{ expanded: isTabExpanded }"
        >
          <div class="tab-content">
            <div class="tab-icon">
              <v-icon icon="mdi-clipboard-text-outline" size="small" />
              <span class="tab-number">{{ penseAjaCount }}</span>
            </div>
            <span class="tab-text" v-if="isTabExpanded">
              Registros disponíveis
            </span>
          </div>
          <div class="tab-arrow" :class="{ 'rotate-arrow': isTabExpanded }">
            <v-icon icon="mdi-chevron-right" size="small" />
          </div>
        </div>

        <ListaPenseAja @penseAjaCount="updateCount" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { defineAsyncComponent } from 'vue'
import Loading from '@/components/Loading.vue'
const ListaPenseAja = defineAsyncComponent({
  loader: () => import('@/components/ListaPenseAja.vue'),
  loadingComponent: Loading,
  delay: 1,
  timeout: 5000,
}
);
// Estado para controlar a expansão do badge
const isTabExpanded = ref(false);
const penseAjaCount = ref(0);
const updateCount = (count) => {
  penseAjaCount.value = count;
};
</script>

<style scoped>
.record-badge-fixed {
  position: absolute;
  z-index: 10;
  left: 0;
  top: 2rem;
  display: flex;
  align-items: center;
  background-color: var(--v-info-base, #2196f3);
  color: white;
  border-radius: 0 1rem 1rem 0;
  padding: 0.8rem;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
  transform-origin: left center;
  max-width: 80px;
  overflow: hidden;
}

.record-badge-fixed.expanded {
  max-width: 240px;
  background-color: var(--v-info-darken1, #1976d2);
  box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.3);
}

.tab-content {
  display: flex;
  align-items: center;
  white-space: nowrap;
  width: 100%;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-width: 36px;
}

.tab-number {
  font-weight: bold;
  font-size: 1rem;
}

.tab-text {
  margin-left: 4px;
  font-weight: 500;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease-in-out;
}

.expanded .tab-text {
  opacity: 1;
  transform: translateX(0);
}

.tab-arrow {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.tab-arrow.rotate-arrow {
  transform: rotate(180deg);
}

.penseaja-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-size: 400% 400%;
  animation: bg-move 12s ease-in-out infinite alternate;
}

@keyframes bg-move {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.penseaja-list-section.container {
  width: 100%;
  max-width: 1200px;
  margin: 2.5rem auto;
  padding: 2rem 1.5rem;
  background: var(--bg-card);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--shadow-light), 0 1.5px 8px var(--shadow-light);
  transition: box-shadow 0.3s, transform 0.3s;
}
.penseaja-list-section.container:hover {
  box-shadow: 0 12px 40px var(--shadow-strong), 0 2px 12px var(--shadow-strong);
  transform: translateY(-2px);
}

.penseaja-list-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}
.penseaja-list-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--red-primary);
  margin: 0;
}

@media screen and (max-width: 768px) {
  .penseaja-list-section.container {
    padding: 1.5rem 1rem;
    margin: 1.5rem auto;
  }
  .penseaja-list-title {
    font-size: 1.5rem;
  }

  .record-badge-fixed {
    border-radius: 0 0.7rem 0.7rem 0;
    padding: 0.5rem;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    cursor: pointer;
    transform-origin: left center;
    max-width: 70px;
    overflow: hidden;
  }

  .record-badge-fixed.expanded {
    max-width: 240px;
    background-color: var(--v-info-darken1, #1976d2);
    box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.3);
  }
}

/* toolbar de busca */
.list-toolbar {
  display: flex;
  align-items: center;
  background: var(--red-light);
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow-light);
}
.toolbar-icon {
  width: 24px;
  height: 24px;
  fill: var(--red-primary);
  margin-right: 0.75rem;
}
.toolbar-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-dark);
}
.toolbar-input::placeholder {
  color: var(--text-muted);
}
.toolbar-input:focus {
  outline: none;
}
</style>
