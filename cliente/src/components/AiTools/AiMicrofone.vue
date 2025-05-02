<template>
  <div class="mic-container">
    <h2>Transcrição de Voz com Visualizador</h2>
    <div class="mic-visual">
      <button @click="startListening" :disabled="listening">🎙️ Iniciar</button>
      <button @click="stopListening" :disabled="!listening">⏹️ Parar</button>
      <canvas ref="canvas" class="wave-canvas"></canvas>
    </div>
    <div v-if="transcript" class="transcription">
      <p><strong>Texto reconhecido:</strong> {{ transcript }}</p>
    </div>
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
let recognition = null;
let audioCtx, analyser, dataArray, sourceNode, drawId;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let finalTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];

      if (result.isFinal) {
        finalTranscript += result[0].transcript + " ";
      }
    }
    transcript.value = finalTranscript.trim();
  };

  recognition.onerror = (event) => {
    notification.value.showPopup(
      "error",
      "Erro no reconhecimento de fala",
      "Ocorreu um erro ao tentar reconhecer a fala. Por favor, tente novamente.",
      5000
    );
    transcript.value = "";
    listening.value = false;

    if (event.error === "no-speech") {
      notification.value.showPopup(
        "warning",
        "Nenhum áudio detectado",
        "Nenhum áudio foi detectado. Por favor, fale mais alto ou verifique seu microfone.",
        5000
      );
    } else if (event.error === "audio-capture") {
      notification.value.showPopup(
        "error",
        "Erro de captura de áudio",
        "Não foi possível capturar o áudio. Verifique seu microfone.",
        5000
      );
    } else if (event.error === "not-allowed") {
      notification.value.showPopup(
        "error",
        "Permissão negada",
        "Permissão para usar o microfone foi negada.",
        5000
      );
    }
    console.error("Erro no reconhecimento de fala:", event.error);
  };

  recognition.onend = () => {
    listening.value = false;
  };
} else {
  notification.value.showPopup(
    "error",
    "Falta de suporte!",
    "Seu navegador não suporta reconhecimento de fala.",
    5000
  );
}

function drawWave() {
  const ctx = canvas.value.getContext("2d");
  const width = canvas.value.width;
  const height = canvas.value.height;
  analyser.getByteTimeDomainData(dataArray);

  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#b0062b";
  ctx.beginPath();
  const sliceWidth = width / dataArray.length;
  let x = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * (height / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    x += sliceWidth;
  }
  ctx.lineTo(width, height / 2);
  ctx.stroke();
  drawId = requestAnimationFrame(drawWave);
}

const startListening = async () => {
  if (!recognition) return;

  audioCtx = new AudioContext()
  analyser = audioCtx.createAnalyser()
  analyser.fftSize = 2048
  dataArray = new Uint8Array(analyser.fftSize)

  // pega o microfone
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  sourceNode = audioCtx.createMediaStreamSource(stream)
  sourceNode.connect(analyser)

  // inicia desenho
  canvas.value.width  = canvas.value.clientWidth
  canvas.value.height = 60
  drawWave()

  notification.value.showPopup(
    "success",
    "Gravação iniciada.",
    "Seu navegador não suporta reconhecimento de fala.",
    5000
  );

  recognition.start();
  listening.value = true;
};

const stopListening = () => {
  if (!recognition)  return

    // para Web Audio
  sourceNode.disconnect()
  cancelAnimationFrame(drawId)
  audioCtx.close()

  recognition.stop();
  listening.value = false;
};
</script>

<style scoped>
.wave-canvas {
  width: 100%;
  height: 60px;
  background: #f8f8f8;
  border-radius: 8px;
}
.wave-canvas {
  width: 100%;
  height: 60px;
  background: #f8f8f8;
  border-radius: 8px;
}
.transcription {
  margin-top: 20px;
  padding: 10px;
  background: #f3f3f3;
  border-radius: 6px;
}
</style>
