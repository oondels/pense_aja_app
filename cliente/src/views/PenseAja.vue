<!-- PenseAja.vue -->
<template>
  <div class="penseaja-app">
    <main>
      <section
        class="penseaja-list-section container animate-fade-in"
        aria-label="Lista de projetos Pense&Aja"
        tabindex="-1"
        role="region"
      >
        <header class="penseaja-list-header">
          <h2 class="penseaja-list-title">Projetos Pense&Aja</h2>
        </header>

        <!-- toolbar de busca -->
        <div class="list-toolbar">
          <svg class="toolbar-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 3A6.5 6.5 0 1 0 16 9.5C16 11.11 15.47 12.61 14.55 13.8L19.707 19L18.293 20.414L13.138 15.257A6.472 6.472 0 0 0 9.5 16A6.5 6.5 0 0 0 9.5 3M9.5 5A4.5 4.5 0 1 1 5 9.5A4.505 4.505 0 0 1 9.5 5Z" /></svg>
          <input
            type="search"
            v-model="search"
            placeholder="Buscar projeto..."
            class="toolbar-input"
          />
        </div>

        <ListaPenseAja
          :filter-text="search"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ListaPenseAja from '../components/ListaPenseAja.vue'

const search = ref('')
</script>

<style scoped>
.penseaja-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-size: 400% 400%;
  animation: bg-move 12s ease-in-out infinite alternate;
}

@keyframes bg-move {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
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
