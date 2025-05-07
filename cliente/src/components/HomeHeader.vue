<template>
  <header class="home-header">
    <div class="banner-background">
      <div class="banner-container">
        <div class="banner-content">
          <!-- Título com ícone de lâmpada -->
          <div class="title-group">
            <h1 class="main-title">
              PENSE & AJA
              <span class="idea-icon" aria-hidden="true"
                ><img src="/assets/img/icons/idea-on-brain.png" alt="Pessoa pensativa"
              /></span>
            </h1>
            <p class="description">
              Transforme suas ideias em ações concretas. Uma plataforma que valoriza sua criatividade e incentiva a
              inovação no ambiente de trabalho.
            </p>

            <div class="">
              <router-link to="/pense-aja">
                <v-btn variant="outlined" prepend-icon="mdi mdi-arrow-right-bold-circle" color="danger">
                  Acessar app
                </v-btn>
              </router-link>

              <PwaDownload />
            </div>
          </div>

          <!-- Ilustração de pessoa pensativa -->
          <div class="illustration">
            <img src="/assets/img/illustrations/3d-ide-hand.png" alt="Pessoa pensativa" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import PwaDownload from "./PwaDownload.vue";
</script>

<style scoped>
.home-header {
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.banner-background {
  background: linear-gradient(135deg, #ffe5e9 0%, #fbeaec 100%);
  position: relative;
  padding: 4rem 1rem 5rem;
}

.banner-background::before {
  content: "";
  position: absolute;
  top: -80px;
  right: -60px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle at center, #ffccd5, transparent 70%);
  border-radius: 50%;
  opacity: 0.4;
  z-index: 0;
}

.banner-container {
  max-width: 1200px;
  width: 100%;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(176, 6, 43, 0.08);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.banner-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}

.title-group {
  flex: 1;
  min-width: 280px;
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 1rem;
  background: linear-gradient(135deg, #b0062b 0%, #ffa733 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: fadeInDown 1.2s ease-out;
}

.idea-icon {
  margin-left: 20px;
  width: 80px;
  animation: pulse 1.8s infinite ease-in-out;
}

.description {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 1.7rem;
  max-width: 480px;
  line-height: 1.6;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.illustration img {
  max-width: 280px;
  height: auto;
  animation: float 5s ease-in-out infinite;
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
  background: linear-gradient(135deg, #b0062b 0%, #ff335f 100%);
  color: #fff;
  border: none;
}

.btn:hover {
  opacity: 0.95;
  box-shadow: 0 4px 16px rgba(176, 6, 43, 0.13);
}

.icon {
  width: 1.2em;
  height: 1.2em;
  fill: currentColor;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .main-title {
    justify-content: center;
    font-size: 2.4rem;
  }

  .illustration img {
    max-width: 200px;
    margin-top: 2rem;
  }
}
</style>
