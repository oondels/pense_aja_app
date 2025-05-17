<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#fce3e4] to-[#f7c8c9] p-4 text-gray-800">
    <div class="bg-white/90 px-6 sm:px-12 py-10 rounded-2xl shadow-lg max-w-3xl w-full text-center animate-fade-in">
      <!-- Header -->
      <header class="mb-10">
        <h1 class="text-4xl sm:text-5xl font-bold text-[#d9534f] leading-tight mb-2">Estamos de cara nova!</h1>
        <p class="text-lg text-gray-600">Confira as novidades que preparamos para você:</p>
      </header>

      <!-- Features List -->
      <section class="grid gap-6 mb-10">
        <div
          class="flex flex-col sm:flex-row sm:items-start text-left bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          v-for="(feature, index) in features"
          :key="index"
        >
          <div class="text-4xl text-[#d9534f] mb-4 sm:mb-0 sm:mr-6 leading-none">
            {{ feature.icon }}
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold text-[#d9534f] mb-1">{{ feature.title }}</h2>
            <p class="text-sm text-gray-700 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
        <span id="some-id"></span>
      </section>

      <!-- Footer -->
      <footer>
        <button
          class="bg-gradient-to-r from-[#e7716e] to-[#d9534f] text-white py-3 px-8 rounded-full text-lg font-semibold shadow-md hover:from-[#d9534f] hover:to-[#c9302c] hover:-translate-y-1 transition-all duration-300"
          @click="goToHome"
        >
          Explorar o Novo App
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useReward } from "vue-rewards";

const config = {
  startVelocity: 15,
  spread: 100,
  elementCount: 150,
  elementSize: 30,
  zIndex: 999,
};

onMounted(() => {
  const { reward, isAnimating } = useReward("some-id", "balloons", config);

  const hasSeenNews = localStorage.getItem("hasSeenNews");
  if (hasSeenNews) {
    return;
  } else {
    reward();
    localStorage.setItem("hasSeenNews", "true");
  }
});

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
    icon: "🧳",
    title: "Adaptação para uso em celulares",
    description:
      "Agora o aplicativo é totalmente responsivo, permitindo que você o utilize no celular, mantendo todas as funcionalidades e sem perder nada.",
  },
]);

const goToHome = () => {
  router.push("/pense-aja").then(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};
</script>

<style scoped>
/* Mantém apenas a animação personalizada que não tem equivalente direto em Tailwind */
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

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}
</style>