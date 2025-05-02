<template>
  <div class="mic-container">
    <div class="mic-header">
      <span class="mic-icon"
        ><span class="mdi mdi-microphone-plus fs-3"></span
      ></span>
      <span class="mic-title">Transcrição de Voz</span>
    </div>
    <div
      class="mic-visual"
      v-if="step === 'inativo' || step === 'transcrevendo'"
    >
      <button
        class="mic-btn start"
        @click="startSimulation"
        :disabled="listening || step !== 'inativo'"
      >
        <span class="mdi mdi-play-box btn-icon fs-3"></span>
      </button>
      <button
        class="mic-btn stop"
        @click="stopSimulation"
        :disabled="!listening"
      >
        <span class="mdi mdi-stop-circle btn-icon fs-3"></span>
      </button>
      <canvas ref="canvas" class="wave-canvas"></canvas>
    </div>
    <transition name="fade">
      <div v-if="step === 'transcrevendo'" class="transcription">
        <p><strong>Texto reconhecido:</strong> {{ transcript }}</p>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="step === 'adaptando'" class="adapting-block">
        <div class="ai-animation">
          <span class="mdi mdi-cog gear"></span>
          <span class="mdi mdi-brain brain fs-3"></span>
        </div>

        <div class="adapting-text">
          Adaptando transcrição para Inteligência Artificial...
        </div>
      </div>
    </transition>
    <transition name="slide-up">
      <div v-if="step === 'resultado'" class="ai-result-block">
        <div class="ai-result-header">
          <span class="mdi mdi-robot-happy ai-icon"></span>
          <span class="ai-title">{{ aiResult.titulo }}</span>
        </div>

        <div class="ai-result-content">
          <div class="ai-section">
            <span class="ai-section-title"
              ><svg class="section-icon" viewBox="0 0 24 24">
                <path d="M4 12h16" stroke="#b0062b" stroke-width="2" />
                <circle cx="8" cy="12" r="2" fill="#b0062b" />
              </svg>
              Situação Anterior
            </span>
            <div class="ai-section-text">{{ aiResult.situacaoAnterior }}</div>
          </div>
          <div class="ai-section">
            <span class="ai-section-title"
              ><svg class="section-icon" viewBox="0 0 24 24">
                <path d="M4 12h16" stroke="#1a7f5a" stroke-width="2" />
                <circle cx="16" cy="12" r="2" fill="#1a7f5a" />
              </svg>
              Situação Atual</span
            >
            <div class="ai-section-text">{{ aiResult.situacaoAtual }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
  <Notification ref="notification" />
</template>

<script setup>
import { ref } from "vue";
import Notification from "../Notification.vue";

const notification = ref(null);
const canvas = ref(null);
const transcript = ref("");
const listening = ref(false);
const step = ref("inativo");
let drawId;
let simulationTimeout;
let simulationStart;
let adaptingTimeout;
const simulatedText =
  "Realizei uma melhoria nas máquinas de costura. Com uma adaptação no pedal, reduzi o tempo de manutenção em 30 minutos.";
const aiResult = ref({
  titulo: "Otimização do Processo de Manutenção das Máquinas de Costura",
  situacaoAnterior:
    "O tempo de manutenção das máquinas de costura era elevado devido à configuração original do pedal.",
  situacaoAtual:
    "Após a adaptação no pedal, o tempo de manutenção foi reduzido em 30 minutos, aumentando a eficiência do processo.",
});

function drawSimulatedWave() {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext("2d");
  const width = canvas.value.width;
  const height = canvas.value.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#b0062b";
  ctx.beginPath();
  const now = Date.now();
  const elapsed = (now - simulationStart) / 1000;
  const freq = 2 + Math.sin(elapsed) * 1.5;
  const amp = 8 + Math.abs(Math.sin(elapsed * 1.2)) * 10;
  const len = 64;
  const sliceWidth = width / len;
  let x = 0;
  for (let i = 0; i < len; i++) {
    const v =
      Math.sin((i / len) * Math.PI * freq + elapsed * 2) * amp + height / 2;
    if (i === 0) ctx.moveTo(x, v);
    else ctx.lineTo(x, v);
    x += sliceWidth;
  }
  ctx.stroke();
  drawId = requestAnimationFrame(drawSimulatedWave);
}

const startSimulation = () => {
  transcript.value = "";
  listening.value = true;
  step.value = "transcrevendo";
  simulationStart = Date.now();
  canvas.value.width = canvas.value.clientWidth;
  canvas.value.height = 60;
  drawSimulatedWave();
  // Simula texto aparecendo gradualmente
  let idx = 0;
  const chars = simulatedText.split("");
  function showText() {
    if (!listening.value) return;
    transcript.value = chars.slice(0, idx).join("");
    if (idx < chars.length) {
      idx++;
      setTimeout(showText, 25);
    } else {
      // Após a transcrição, inicia adaptação IA
      setTimeout(() => {
        step.value = "adaptando";
        cancelAnimationFrame(drawId);
        adaptingTimeout = setTimeout(() => {
          step.value = "resultado";
        }, 2200);
      }, 800);
    }
  }
  showText();
};

const stopSimulation = () => {
  listening.value = false;
  cancelAnimationFrame(drawId);
  clearTimeout(simulationTimeout);
  clearTimeout(adaptingTimeout);
  step.value = "inativo";
  transcript.value = "";
  notification.value.showPopup(
    "info",
    "Captura finalizada",
    "Captura inteligente finalizada com sucesso!",
    4000
  );
};
</script>

<style scoped>
.mic-container {
  max-width: 500px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.07);
  padding: 24px 18px 18px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mic-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.mic-icon {
  font-size: 1.7rem;
  margin-right: 8px;
  color: #b0062b;
}
.mic-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
  letter-spacing: 0.02em;
}
.mic-visual {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-bottom: 10px;
}
.mic-btn {
  border: none;
  background: #f3f3f3;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px 0 rgba(176, 6, 43, 0.08);
  transition: background 0.2s, box-shadow 0.2s;
  cursor: pointer;
  font-size: 1.1rem;
}
.mic-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.mic-btn.start {
  background: #eaf6f2;
  color: #1a7f5a;
}
.mic-btn.stop {
  background: #fbeaec;
  color: #b0062b;
}
.btn-icon {
  font-size: 1.1rem;
}
.wave-canvas {
  flex: 1 1 0;
  min-width: 0;
  width: 180px;
  max-width: 220px;
  height: 36px;
  background: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 1px 4px 0 rgba(176, 6, 43, 0.04);
  margin-left: 8px;
  margin-right: 8px;
  display: block;
}
.transcription {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f3f3f3;
  border-radius: 8px;
  font-size: 0.98rem;
  color: #333;
  width: 100%;
  word-break: break-word;
  box-sizing: border-box;
  min-height: 48px;
  transition: background 0.4s;
}
.adapting-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 32px 0 24px 0;
  background: linear-gradient(90deg, #fbeaec 0%, #eaf6f2 100%);
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(176, 6, 43, 0.07);
  margin-top: 18px;
  min-height: 120px;
  animation: fadeIn 0.7s;
}
.ai-animation {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}

.gear {
  display: inline-block;
  font-size: 2rem; /* ou o tamanho que você estiver usando */
  animation: spin 1.2s linear infinite;
  transform-origin: center center;
}
.brain {
  width: 38px;
  height: 38px;
  animation: pulse 1.2s infinite alternate;
}
.arrow {
  width: 32px;
  height: 32px;
  animation: arrowMove 1.2s infinite alternate;
}
.adapting-text {
  font-size: 1.08rem;
  color: #b0062b;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-align: center;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes pulse {
  0% {
    opacity: 0.7;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1.08);
  }
}
@keyframes arrowMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(10px);
  }
}
.ai-result-block {
  width: 100%;
  background: linear-gradient(90deg, #eaf6f2 0%, #fbeaec 100%);
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(176, 6, 43, 0.09);
  padding: 24px 18px 18px 18px;
  margin-top: 18px;
  animation: fadeInUp 0.7s;
}
.ai-result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.ai-icon {
  width: 38px;
  height: 38px;
  filter: drop-shadow(0 2px 6px #eaf6f2);
}
.ai-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a7f5a;
  letter-spacing: 0.01em;
}
.ai-result-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.ai-section {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px 0 rgba(176, 6, 43, 0.04);
  padding: 14px 12px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: box-shadow 0.3s;
}
.ai-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 1.01rem;
  font-weight: 600;
  color: #b0062b;
}
.ai-section-title svg {
  width: 18px;
  height: 18px;
}
.ai-section-text {
  color: #333;
  font-size: 0.98rem;
  line-height: 1.5;
}
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active {
  animation: fadeInUp 0.7s;
}
.slide-up-leave-active {
  transition: opacity 0.4s;
  opacity: 0;
}
@media (max-width: 500px) {
  .mic-container {
    padding: 14px 4vw 10px 4vw;
  }
  .wave-canvas {
    width: 100px;
    max-width: 120px;
    height: 28px;
  }
  .mic-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  .ai-result-block {
    padding: 14px 4vw 10px 4vw;
  }
}
</style>
