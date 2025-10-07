<template>
  <div class="maintenance-overlay">
    <!-- Círculos decorativos de fundo -->
    <div class="maintenance-bg-circles">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="circle circle-4"></div>
    </div>

    <!-- Container principal -->
    <div class="maintenance-container">
      <!-- Ícone principal animado -->
      <div class="maintenance-icon-container">
        <div class="maintenance-icon-bg">
          <i class="mdi mdi-tools maintenance-icon"></i>
        </div>
        <div class="pulse-ring"></div>
      </div>

      <!-- Conteúdo principal -->
      <div class="maintenance-content">
        <h1 class="maintenance-title">
          Sistema em Manutenção
        </h1>
        
        <p class="maintenance-subtitle">
          Estamos trabalhando para melhorar sua experiência
        </p>

        <div class="maintenance-message">
          <div class="message-icon">
            <i class="mdi mdi-information-outline"></i>
          </div>
          <div class="message-text">
            <p>Nosso sistema está temporariamente indisponível para manutenção programada.</p>
            <p>Em breve estaremos de volta!</p>
          </div>
        </div>

        <!-- Barra de progresso animada -->
        <div class="progress-container">
          <div class="progress-label">
            <i class="mdi mdi-cog-clockwise progress-icon"></i>
            <span>Aplicando melhorias e correções...</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>

        <!-- Informações adicionais -->
        <!-- <div class="maintenance-info">
          <div class="info-item">
            <i class="mdi mdi-clock-outline info-icon"></i>
            <span>Tempo estimado: Em breve</span>
          </div>
          <div class="info-item">
            <i class="mdi mdi-email-outline info-icon"></i>
            <span>Dúvidas? Entre em contato conosco</span>
          </div>
        </div> -->
      </div>

      <!-- Logo da empresa -->
      <div class="maintenance-logo">
        <img src="/assets/img/icons/dass-penseaja.png" alt="Logo Dass Pense & Aja" class="logo-img" />
        <p class="logo-text">Pense <span class="logo-highlight">&</span> Aja</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente apenas visual, sem interações
</script>

<style scoped>
.maintenance-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 50%, #fdf2f8 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

/* Círculos decorativos de fundo */
.maintenance-bg-circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(239, 83, 80, 0.08), rgba(244, 67, 54, 0.12));
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.circle-4 {
  width: 80px;
  height: 80px;
  bottom: 15%;
  right: 25%;
  animation-delay: 1s;
}

/* Container principal */
.maintenance-container {
  position: relative;
  z-index: 10;
  max-width: 600px;
  width: 90%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 3rem 2rem;
  box-shadow: 
    0 20px 25px -5px rgba(239, 83, 80, 0.1),
    0 10px 10px -5px rgba(239, 83, 80, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.8);
  text-align: center;
  animation: slideInUp 0.8s ease-out;
}

/* Ícone principal */
.maintenance-icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.maintenance-icon-bg {
  width: 120px;
  height: 120px;
  background: linear-gradient(145deg, #ef5350, #f44336);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 
    0 20px 25px -5px rgba(239, 83, 80, 0.4),
    0 10px 10px -5px rgba(239, 83, 80, 0.2);
  position: relative;
  z-index: 2;
}

.maintenance-icon {
  font-size: 3.5rem;
  color: white;
  animation: rotate 3s linear infinite;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border: 3px solid rgba(239, 83, 80, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

/* Conteúdo */
.maintenance-content {
  margin-bottom: 2rem;
}

.maintenance-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ef5350, #f44336);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.title-highlight {
  color: #c0392b;
}

.maintenance-subtitle {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
  font-weight: 400;
}

.maintenance-message {
  background: linear-gradient(145deg, #fff, #fafafa);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 
    inset 0 2px 4px rgba(239, 83, 80, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05);
}

.message-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(145deg, #ef5350, #f44336);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.2rem;
}

.message-text {
  text-align: left;
  line-height: 1.6;
}

.message-text p {
  margin: 0;
  color: #555;
  font-size: 1rem;
}

.message-text p:first-child {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

/* Barra de progresso */
.progress-container {
  margin-bottom: 2rem;
}

.progress-label {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #ef5350;
  font-weight: 500;
  font-size: 1rem;
}

.progress-icon {
  animation: spin 2s linear infinite;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, #fde2e2, #fee2e2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  width: 60%;
  background: linear-gradient(90deg, #ef5350, #f44336);
  border-radius: 4px;
  animation: progress 3s ease-in-out infinite;
}

/* Informações adicionais */
.maintenance-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.info-icon {
  color: #ef5350;
  font-size: 1.1rem;
}

/* Logo */
.maintenance-logo {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(239, 83, 80, 0.1);
}

.logo-img {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(239, 83, 80, 0.2);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ef5350;
  margin: 0;
}

.logo-highlight {
  color: #c0392b;
}

/* Animações */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 60%;
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .maintenance-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .maintenance-title {
    font-size: 2rem;
  }

  .maintenance-subtitle {
    font-size: 1.1rem;
  }

  .maintenance-icon-bg {
    width: 100px;
    height: 100px;
  }

  .maintenance-icon {
    font-size: 3rem;
  }

  .pulse-ring {
    width: 100px;
    height: 100px;
  }

  .maintenance-message {
    flex-direction: column;
    text-align: center;
  }

  .message-text {
    text-align: center;
  }

  .maintenance-info {
    gap: 0.8rem;
  }

  .circle-1, .circle-2 {
    width: 120px;
    height: 120px;
  }

  .circle-3, .circle-4 {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .maintenance-container {
    padding: 1.5rem 1rem;
  }

  .maintenance-title {
    font-size: 1.75rem;
  }

  .maintenance-subtitle {
    font-size: 1rem;
  }

  .maintenance-icon-bg {
    width: 80px;
    height: 80px;
  }

  .maintenance-icon {
    font-size: 2.5rem;
  }

  .pulse-ring {
    width: 80px;
    height: 80px;
  }
}
</style>