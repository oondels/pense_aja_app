<template>
  <header class="overflow-hidden p-0 m-0">
    <div class="relative bg-gradient-to-br from-[#ffe5e9] to-[#fbeaec] py-16 px-4">
      <div
        class="absolute -top-20 -right-16 w-[300px] h-[300px] rounded-full opacity-40 z-0"
        style="background: radial-gradient(circle at center, #ffccd5, transparent 70%)"
      ></div>

      <div class="relative z-10 w-full bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <!-- Text Content -->
          <div class="text-center lg:text-left flex-1">
            <h1
              class="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center lg:justify-start animate-fade-in-down"
            >
              PENSE & AJA
              <span class="ml-3 inline-block w-10 h-10">
                <img
                  v-lazy="'/assets/img/icons/idea-on-brain.png'"
                  loading="lazy"
                  :srcset="generateSrcSet('/assets/img/icons/idea-on-brain.png')"
                  alt="Imagem de Lâmpada Mesclado com Inteligência (Cérebro)"
                  class="w-full h-auto animate-pulse-slow"
                />
              </span>
            </h1>
            <p class="text-lg text-gray-700 mb-6 max-w-xl mx-auto lg:mx-0 animate-fade-in-up">
              Transforme suas ideias em ações concretas. Uma plataforma que valoriza sua criatividade e incentiva a
              inovação no ambiente de trabalho.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-down">
              <router-link to="/pense-aja">
                <button
                  class="flex items-center gap-2 px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition"
                >
                  <span class="mdi mdi-arrow-right-bold-circle"></span>
                  Acessar app
                </button>
              </router-link>

              <PwaDownload />
            </div>
          </div>

          <!-- Illustration -->
          <div class="flex-1 max-w-md mx-auto lg:mx-0 animate-fade-in-up">
            <img
              v-lazy="'/assets/img/illustrations/3d-ide-hand.webp'"
              loading="lazy"
              :srcset="generateSrcSet('/assets/img/illustrations/3d-ide-hand.webp')"
              alt="Mão Segurando Lâmpada"
              class="max-w-full max-h-[320px] w-auto h-auto object-contain animate-float"
            />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import PwaDownload from "./PwaDownload.vue";

const generateSrcSet = (imagePath) => {
  const lastSlashIndex = imagePath.lastIndexOf("/");
  const fileName = imagePath.substring(lastSlashIndex + 1);
  const lastDotIndex = fileName.lastIndexOf(".");
  const baseName = fileName.substring(0, lastDotIndex);
  const extension = fileName.substring(lastDotIndex);
  const basePath = imagePath.substring(0, lastSlashIndex + 1);
  return `
    ${basePath}${baseName}-small${extension} 300w,
    ${basePath}${baseName}-medium${extension} 600w,
    ${basePath}${baseName}${extension} 900w
  `;
};
</script>

<style scoped>
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

@keyframes pulseSlow {
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

.animate-fade-in-down {
  animation: fadeInDown 1.2s ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out 0.2s both;
}

.animate-float {
  animation: float 5s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulseSlow 1.8s ease-in-out infinite;
}
</style>
