<template>
  <div class="min-h-screen bg-white flex flex-col">
    <HomeHeader />
    <main class="flex-1">
      <section class="py-20 bg-gray-100">
        <div class="max-w-7xl mx-auto px-4">
          <h2 class="text-center text-3xl font-bold text-gray-800 mb-12">Por que usar o Pense & Aja?</h2>

          <div class="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div
              class="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div class="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-blue-100">
                <img src="/assets/img/icons/idea-on-brain.png" alt="Inovação" class="w-3/5 h-auto" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Promova a inovação</h3>
              <p class="text-gray-600">Transforme ideias criativas em soluções reais para sua empresa</p>
            </div>

            <div
              class="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div class="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-blue-100">
                <img src="/assets/img/icons/idea-on-brain.png" alt="Colaboração" class="w-3/5 h-auto" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Incentive a colaboração</h3>
              <p class="text-gray-600">Conecte colaboradores e gestores em torno de novas ideias</p>
            </div>

            <div
              class="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div class="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-blue-100">
                <img src="/assets/img/icons/idea-on-brain.png" alt="Reconhecimento" class="w-3/5 h-auto" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Reconheça contribuições</h3>
              <p class="text-gray-600">Sistema de recompensas para os colaboradores mais inovadores</p>
            </div>

            <div
              class="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div class="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-blue-100">
                <img src="/assets/img/icons/idea-on-brain.png" alt="Melhoria Contínua" class="w-3/5 h-auto" />
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Melhore processos continuamente</h3>
              <p class="text-gray-600">
                Acompanhe ideias implementadas e mensure os resultados para promover a evolução constante do seu negócio
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 bg-gradient-to-br from-red-700 to-red-400 text-white text-center">
        <div class="max-w-3xl mx-auto px-4">
          <h2 class="text-4xl font-bold mb-4">Pronto para começar?</h2>
          <p class="text-lg opacity-90 mb-8">
            Junte-se à comunidade Pense & Aja e comece a transformar ideias em realidade.
          </p>
          <div class="flex justify-center">
            <button
              @click="goToApp"
              class="bg-white text-black px-6 py-3 rounded-full border-2 font-semibold text-lg transition hover:bg-white hover:text-blue-600"
            >
              Saiba mais
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import HomeHeader from "../components/HomeHeader.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const goToApp = () => {
  router.push("/pense-aja").then(() => {
    window.scrollTo(0, 0);
  });
};
</script>
