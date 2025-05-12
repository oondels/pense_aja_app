<template>
  <div class="news-page">
    <div class="container">
      <header class="news-header">
        <h1 class="main-title">Estamos de cara nova!</h1>
        <p class="subtitle">Confira as novidades que preparamos para você:</p>
      </header>

      <section class="features-list">
        <div class="feature-item" v-for="(feature, index) in features" :key="index">
          <div class="feature-icon">
            <span class="icon">{{ feature.icon }}</span>
          </div>
          <div class="feature-content">
            <h2 class="feature-title">{{ feature.title }}</h2>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <footer class="news-footer">
        <button class="cta-button" @click="goToHome">Explorar o Novo App</button>
      </footer>
    </div>


  </div>

</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const features = ref([
  {
    icon: "🚀",
    title: "Remodelagem completa do aplicativo",
    description: "O app foi refeito por completo, pensando em velocidade, desempenho e na sua experiência.",
  },
  {
    icon: "⚡️",
    title: "Agora mais rápido",
    description:
      "O ajuste de desempenho e modernização do aplicativo permitiu reduzir em 50% a lentidão, os carregamentos 'infinitos' e erros recorrentes.",
  },
  {
    icon: "💡",
    title: "Novos recursos com Inteligência Artificial",
    description:
      "O aplicativo conta com sistema de inteligência artificial para melhorar ainda mais a sua experiência e a dos avaliadores.",
  },
  {
    icon: "🔔",
    title: "Sistema de notificações em tempo real",
    description: "Agora você pode ficar por dentro do status de seu Pense & Aja assim que ele for avaliado.",
  },
  {
    icon: "📱",
    title: "Instalação do aplicativo",
    description: "Instale o app em seu tablet, PC ou celular para acesso rápido e prático.",
  },
  {
    icon: "🤳",
    title: "Adaptação para uso em celulares",
    description:
      "Agora o aplicativo é totalmente responsivo, permitindo que você o utilize no celular, mantendo todas as funcionalidades e sem perder nada.",
  },
]);

const goToHome = () => {
  router.push("/");
};
</script>

<style scoped>
.news-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fce3e4 0%, #f7c8c9 100%);
  padding: 2rem;
  font-family: "Poppins", sans-serif;
  color: #333;
  box-sizing: border-box;
}

.container {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2.5rem 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.news-header {
  margin-bottom: 2.5rem;
}

.main-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #d9534f; /* Vermelho suave mais escuro */
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 0;
}

.features-list {
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  text-align: left;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.07);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(217, 83, 79, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  margin-right: 1.5rem;
  color: #d9534f;
  line-height: 1; /* Alinha melhor o emoji */
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #d9534f;
  margin-bottom: 0.5rem;
}

.feature-description {
  font-size: 0.95rem;
  color: #444;
  line-height: 1.6;
}

.news-footer {
  margin-top: 1rem;
}

.cta-button {
  background: linear-gradient(145deg, #e7716e, #d9534f);
  color: white;
  padding: 0.9rem 2.5rem;
  border-radius: 50px; /* Botão mais arredondado */
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(217, 83, 79, 0.3);
}

.cta-button:hover {
  background: linear-gradient(145deg, #d9534f, #c9302c);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(217, 83, 79, 0.4);
}

.cta-button:active {
  transform: translateY(-1px);
}

/* Responsividade */
@media (max-width: 768px) {
  .container {
    padding: 2rem 1.5rem;
  }

  .main-title {
    font-size: 2.2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .feature-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .feature-icon {
    margin-right: 0;
    margin-bottom: 1rem;
    font-size: 2.2rem;
  }

  .feature-title {
    font-size: 1.15rem;
  }

  .feature-description {
    font-size: 0.9rem;
  }

  .cta-button {
    padding: 0.8rem 2rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 1.5rem 1rem;
    margin: 1rem; /* Adiciona margem para não colar nas bordas */
  }

  .news-page {
    padding: 1rem 0.5rem; /* Reduz padding da página em telas muito pequenas */
  }

  .main-title {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .feature-icon {
    font-size: 2rem;
  }

  .feature-title {
    font-size: 1.05rem;
  }

  .feature-description {
    font-size: 0.85rem;
  }
}
</style>
