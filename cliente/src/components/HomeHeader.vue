<template>
  <header class="home-header">
    <div class="hero-card">
      <!-- Logo -->
      <div class="logo-circle">
        <img src="/assets/img/icons/dass-penseaja.png" alt="Dass Pense & Aja" class="logo-img" />
      </div>
      <!-- Títulos -->
      <h1 class="main-title">
        Pense <span class="amp">&</span> Aja
      </h1>
      <h2 class="tagline">
        Bem-vindo ao Pense & Aja
      </h2>
      <!-- Descrição -->
      <p class="description">
        Transforme suas ideias em ações concretas. Uma plataforma que valoriza sua criatividade e incentiva a inovação no ambiente de trabalho.
      </p>
      <!-- Botões -->
      <div class="button-group">
        <router-link to="/pense-aja" class="btn btn-primary">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M10 17l5-5-5-5v10z"/>
          </svg>
          Acessar app
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.home-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem 1rem 2rem 1rem;
  min-height: 100px;
  background: linear-gradient(135deg, #ffe5e9 0%, #fbeaec 100%);
}

.hero-card {
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(176, 6, 43, 0.08);
  padding: 2.5rem 2rem 2rem 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  position: relative;
  animation: fadeInUp 0.8s;
}

.logo-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbeaec 0%, #ffe5e9 100%);
  box-shadow: 0 4px 16px rgba(176, 6, 43, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.2rem auto;
  animation: float 6s ease-in-out infinite;
}

.logo-img {
  width: 70%;
  height: auto;
  filter: drop-shadow(0 2px 6px rgba(176, 6, 43, 0.10));
  transition: transform 0.4s;
}

.logo-circle:hover .logo-img {
  transform: scale(1.08) rotate(-2deg);
}

.main-title {
  font-size: 2.3rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #b0062b 0%, #ff335f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: -0.5px;
  animation: fadeInUp 0.8s;
}

.amp {
  font-weight: bold;
  font-size: 1.1em;
}

.tagline {
  font-size: 1.1rem;
  font-weight: 400;
  color: #b0062b;
  margin: 1rem 0 0.5rem;
  opacity: 0.85;
  animation: fadeInUp 0.8s 0.2s forwards;
}

.description {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1.7rem;
  line-height: 1.6;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.7rem;
  border-radius: 50px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(176, 6, 43, 0.08);
}

.btn-primary {
  background: linear-gradient(135deg, #b0062b 0%, #ff335f 100%);
  color: #fff;
  border: none;
}

.btn-primary:hover {
  opacity: 0.95;
  box-shadow: 0 4px 16px rgba(176, 6, 43, 0.13);
}

.btn-outline {
  background: transparent;
  color: #b0062b;
  border: 2px solid #b0062b;
}

.btn-outline:hover {
  background: #ffe5e9;
  color: #b0062b;
  border-color: #ff335f;
}

.icon {
  width: 1.2em;
  height: 1.2em;
  fill: currentColor;
}

@media (max-width: 480px) {
  .hero-card {
    padding: 1.5rem 0.7rem;
  }
  .main-title {
    font-size: 1.6rem;
  }
  .logo-circle {
    width: 64px;
    height: 64px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
