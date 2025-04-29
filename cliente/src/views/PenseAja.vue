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
          <h2 class="penseaja-list-title gradient-text">Projetos Pense&Aja</h2>
        </header>
        <ListaPenseAja />
      </section>
    </main>
  </div>
</template>

<script setup>
import ListaPenseAja from '../components/ListaPenseAja.vue';
</script>

<style scoped>
.penseaja-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* background: linear-gradient(120deg, #f3f4f6 0%, #e0e7ff 100%); */
  animation: bg-move 12s ease-in-out infinite alternate;
}
@keyframes bg-move {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

.animate-fade-in {
  animation: fadeInUp 0.8s cubic-bezier(.23,1.01,.32,1) both;
}
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.penseaja-list-section.container {
  width: 100%;
  max-width: 1200px;
  margin: 2.5rem auto;
  padding: 2.5rem 1.5rem;
  background: var(--bg-card, #fff);
  border-radius: 2rem;
  box-shadow: 0 8px 32px 0 rgba(76, 110, 245, 0.10), 0 1.5px 8px 0 rgba(16,185,129,0.07);
  outline: none;
  transition: box-shadow 0.3s, transform 0.3s;
  position: relative;
  overflow: hidden;
  border: 1.5px solid var(--border, #e5e7eb);
}
.penseaja-list-section.container:focus {
  box-shadow: 0 0 0 4px #6366f1aa;
  transform: scale(1.01);
}
.penseaja-list-section.container:hover {
  box-shadow: 0 12px 40px 0 rgba(76, 110, 245, 0.18), 0 2px 12px 0 rgba(16,185,129,0.10);
  transform: translateY(-2px) scale(1.012);
}
.penseaja-list-header {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.7rem;
}
.penseaja-list-title {
  font-size: 2.1rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -1px;
  line-height: 1.1;
  background: none;
  color: #3730a3;
  text-shadow: 0 2px 8px #e0e7ff88;
  transition: color 0.2s;
}
.gradient-text {
  background: linear-gradient(90deg, #6366f1 30%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
@media (max-width: 900px) {
  .penseaja-list-section.container {
    max-width: 100%;
    padding: 1.2rem 0.3rem;
    border-radius: 1.2rem;
  }
  .penseaja-list-title {
    font-size: 1.3rem;
  }
}
@media (max-width: 600px) {
  .penseaja-list-section.container {
    border-radius: 0.7rem;
    padding: 0.7rem 0.1rem;
  }
  .penseaja-list-header {
    margin-bottom: 0.7rem;
  }
}
</style>
