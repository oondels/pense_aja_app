<template>
  <div class="home-page ">
    <HomeHeader />
    <main class="home-main">
      <section class="features-section">
        <div class="container">
          <h2 class="section-title">Por que usar o Pense & Aja?</h2>
          
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <img src="/assets/img/ideiaOn.png" alt="Inovação" class="feature-img" />
              </div>
              <h3>Promova a inovação</h3>
              <p>Transforme ideias criativas em soluções reais para sua empresa</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <img src="/assets/img/ideiaOn.png" alt="Colaboração" class="feature-img" />
              </div>
              <h3>Incentive a colaboração</h3>
              <p>Conecte colaboradores e gestores em torno de novas ideias</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">
                <img src="/assets/img/ideiaOn.png" alt="Reconhecimento" class="feature-img" />
              </div>
              <h3>Reconheça contribuições</h3>
              <p>Sistema de recompensas para os colaboradores mais inovadores</p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Pronto para começar?</h2>
            <p>Junte-se à comunidade Pense & Aja e comece a transformar ideias em realidade.</p>
            <div class="cta-buttons">
              <button class="primary-button">Registrar agora</button>
              <button class="text-button">Saiba mais</button>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <footer class="home-footer">
      <div class="container">
        <p>&copy; 2025 Pense & Aja. Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import HomeHeader from '../components/HomeHeader.vue'
</script>

<style scoped>
.home-page {
  /* fundo “normal” da página: branco puro */
  background-color: #FFFFFF;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.home-main {
  flex: 1;
}

.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.features-section {
  padding: 5rem 0;
  background-color: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 3rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(52, 152, 219, 0.1);
}

.feature-img {
  width: 60%;
  height: auto;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  color: #333;
}

.feature-card p {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
}

.cta-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, #3498db 0%, #8e44ad 100%);
  color: white;
  text-align: center;
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.primary-button {
  background-color: white;
  color: #3498db;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
}

.text-button {
  background-color: transparent;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.text-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.home-footer {
  background-color: #333;
  color: white;
  padding: 1.5rem 0;
  text-align: center;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-content h2 {
    font-size: 2rem;
  }
}
</style>