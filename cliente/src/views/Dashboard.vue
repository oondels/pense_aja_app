<template>
  <div class="app-container">
    <div class="filter-management flex flex-row items-center w-full">
      <!-- Filtro e Relatório -->
      <div class="flex flex-row items-center w-full md:w-1/2 gap-4">
        <div class="flex flex-col w-full">
          <v-text-field v-model="startDate" label="Data Início" type="date" variant="outlined"></v-text-field>
        </div>

        <div class="flex flex-col w-full">
          <v-text-field
            v-model="endDate"
            :min="startDate"
            label="Data Início"
            type="date"
            variant="outlined"
          ></v-text-field>
        </div>
      </div>

      <v-btn
        :prepend-icon="isGeneratingReport ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-cloud-download-outline'"
        :text="isGeneratingReport ? 'Gerando Relatório...' : 'Baixar Relatório'"
        color="blue"
        :disabled="isGeneratingReport"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ml-auto"
        @click="downloadReport"
      />
    </div>

    <main class="main-content">
      <div class="dashboard-grid">
        <div class="dashboard-section" :class="{ 'animate-in': isLoaded }" style="--delay: 0.1s">
          <DashboardSummary :startDate="startDate" :endDate="endDate" />
        </div>

        <div class="dashboard-section" :class="{ 'animate-in': isLoaded }" style="--delay: 0.2s">
          <MonthlyTrendsChart :startDate="startDate" :endDate="endDate" />
        </div>

        <div class="dashboard-section" :class="{ 'animate-in': isLoaded }" style="--delay: 0.3s">
          <DimensionalAnalysis :startDate="startDate" :endDate="endDate" />
        </div>

        <div class="dashboard-section" :class="{ 'animate-in': isLoaded }" style="--delay: 0.4s">
          <IdeaHighlights />
        </div>

        <div class="dashboard-section" :class="{ 'animate-in': isLoaded }" style="--delay: 0.5s">
          <EngagementPanel />
        </div>
      </div>
    </main>
    <Notification ref="notification"/>
  </div>
</template>

<script setup>
import DashboardSummary from "@/components/Dashboard/DashboardSummary.vue";
import MonthlyTrendsChart from "@/components/Dashboard/MonthlyTrendsChart.vue";
import DimensionalAnalysis from "@/components/Dashboard/DimensionalAnalysis.vue";
import IdeaHighlights from "@/components/Dashboard/IdeaHighlights.vue";
import EngagementPanel from "@/components/Dashboard/EngagementPanel.vue";
import { ref, onMounted } from "vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { dashboardService } from "@/services/dashboardService.js";
import { reportService } from "@/services/reportService.js";
import { useUserStore } from "@/stores/userStore.js";
import { setPenseAjaStatus } from "@/services/penseAjaService.js";
import Notification from "../components/Notification.vue";

document.title = "Pense&Aja | Dashboard de Ideias";
const isLoaded = ref(false);
const userStore = useUserStore();

const notification = ref(null)

const today = new Date();
const getFirstMonth = () => {
  const currentYear = today.getFullYear();
  return `${currentYear}-01-01`;
};

const startDate = ref(getFirstMonth());
const endDate = ref(today.toISOString().split("T")[0]);
const isGeneratingReport = ref(false);

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const formatStatus = (penseAja) => {
  if (penseAja.status_gerente === "REPROVADO" || penseAja.status_analista === "REPROVADO") {
    return "REPROVADO";
  } else if (penseAja.em_espera === "1") {
    return "EM ESPERA";
  } else if (!penseAja.gerente_aprovador && !penseAja.analista_avaliador) {
    return "SEM ANÁLISE";
  } else if (penseAja.gerente_aprovador && !penseAja.analista_avaliador) {
    return "AGUARDANDO ANÁLISE";
  } else if (penseAja.status_gerente === "APROVADO" && penseAja.status_analista === "APROVADO") {
    return "APROVADO";
  } else {
    return "EM ANÁLISE";
  }
};

const downloadReport = async () => {
  if (isGeneratingReport.value) return;

  try {
    isGeneratingReport.value = true;
    console.log("Iniciando download do relatório...");

    const dassOffice = userStore.userData?.unidade || localStorage.getItem("unidadeDass") || "SEST";

    if (!startDate.value || !endDate.value) {
      alert("Por favor, selecione as datas de início e fim para gerar o relatório.");
      return;
    }
    if (new Date(startDate.value) > new Date(endDate.value)) {
      alert("A data de início deve ser anterior à data de fim.");
      return;
    }

    const reportData = await reportService.getAggregatedData(dassOffice, startDate.value, endDate.value);
    const penseAjaData = reportData.rawData;
    const aggregations = reportData.aggregations;

    const [summaryData, monthlyData, ideaHighlights, engagementData] = await Promise.all([
      dashboardService.getSummaryData(dassOffice, startDate.value, endDate.value).catch(() => ({})),
      dashboardService.getMonthlyData(dassOffice, startDate.value, endDate.value).catch(() => []),
      dashboardService.getIdeaHighlights(dassOffice).catch(() => []),
      dashboardService.getEngagementData(dassOffice, startDate.value, endDate.value).catch(() => []),
    ]);

    // Aba 1: Resumo Geral
    const resumoData = [
      { Métrica: "Total de Ideias", Valor: aggregations.totalMetrics.total },
      { Métrica: "Ideias Aprovadas", Valor: aggregations.totalMetrics.aprovados },
      { Métrica: "Ideias Reprovadas", Valor: aggregations.totalMetrics.reprovados },
      { Métrica: "Ideias Pendentes", Valor: aggregations.totalMetrics.pendentes },
      { Métrica: "Ideias em Espera", Valor: aggregations.totalMetrics.emEspera },
      {
        Métrica: "Taxa de Aprovação (%)",
        Valor:
          aggregations.totalMetrics.total > 0
            ? ((aggregations.totalMetrics.aprovados / aggregations.totalMetrics.total) * 100).toFixed(2)
            : "0.00",
      },
      { Métrica: "Período do Relatório", Valor: `${formatDate(startDate.value)} até ${formatDate(endDate.value)}` },
      { Métrica: "Unidade", Valor: dassOffice },
    ];

    // Aba 2: Detalhes dos Pense&Aja (otimizada)
    const penseAjaDetalhado = penseAjaData.map((item) => ({
      ID: item.id,
      "Nome do Colaborador": item.nome,
      Matrícula: item.matricula,
      Setor: item.setor,
      Gerente: item.gerente,
      Fábrica: item.fabrica,
      "Nome do Projeto": item.nome_projeto,
      Turno:
        item.turno === "A"
          ? "1° Turno"
          : item.turno === "B"
          ? "2° Turno"
          : item.turno === "C"
          ? "3° Turno"
          : "Comercial",
      "Data de Criação": formatDate(item.criado || item.createdat),
      "Situação Anterior": item.situacao_anterior,
      "Situação Atual": item.situacao_atual,
      "Status Final": formatStatus(item),
      "Gerente Aprovador": item.gerente_aprovador || "Não avaliado",
      "Analista Avaliador": item.analista_avaliador || "Não avaliado",
      "Em Espera": item.em_espera === "1" ? "Sim" : "Não",
      Classificação: item.classificacao || "Não classificado",
    }));

    // Aba 3: Análise por Setor (usando agregações)
    const setorData = Object.entries(aggregations.bySetor).map(([setor, dados]) => ({
      Setor: setor,
      "Total de Ideias": dados.total,
      "Ideias Aprovadas": dados.aprovados,
      "Ideias Reprovadas": dados.reprovados,
      "Ideias Pendentes": dados.pendentes,
      "Ideias em Espera": dados.emEspera,
      "Taxa de Aprovação (%)": dados.total > 0 ? ((dados.aprovados / dados.total) * 100).toFixed(2) : "0.00",
    }));

    // Aba 4: Análise por Gerente (usando agregações)
    const gerenteData = Object.entries(aggregations.byGerente).map(([gerente, dados]) => ({
      Gerente: gerente,
      "Total de Ideias": dados.total,
      "Ideias Aprovadas": dados.aprovados,
      "Ideias Reprovadas": dados.reprovados,
      "Ideias Pendentes": dados.pendentes,
      "Ideias em Espera": dados.emEspera,
      "Taxa de Aprovação (%)": dados.total > 0 ? ((dados.aprovados / dados.total) * 100).toFixed(2) : "0.00",
    }));

    // Aba 5: Análise por Fábrica (usando agregações)
    const fabricaData = Object.entries(aggregations.byFabrica).map(([fabrica, dados]) => ({
      Fábrica: fabrica,
      "Total de Ideias": dados.total,
      "Ideias Aprovadas": dados.aprovados,
      "Ideias Reprovadas": dados.reprovados,
      "Ideias Pendentes": dados.pendentes,
      "Ideias em Espera": dados.emEspera,
      "Taxa de Aprovação (%)": dados.total > 0 ? ((dados.aprovados / dados.total) * 100).toFixed(2) : "0.00",
    }));

    // Aba 6: Análise por Turno (usando agregações)
    const turnoData = Object.entries(aggregations.byTurno).map(([turno, dados]) => ({
      Turno: turno === "A" ? "1° Turno" : turno === "B" ? "2° Turno" : turno === "C" ? "3° Turno" : turno,
      "Total de Ideias": dados.total,
      "Ideias Aprovadas": dados.aprovados,
      "Ideias Reprovadas": dados.reprovados,
      "Ideias Pendentes": dados.pendentes,
      "Ideias em Espera": dados.emEspera,
      "Taxa de Aprovação (%)": dados.total > 0 ? ((dados.aprovados / dados.total) * 100).toFixed(2) : "0.00",
    }));

    // Aba 7: Engajamento por Colaborador
    const engajamentoData = engagementData.map((item) => ({
      "Nome do Colaborador": item.nome,
      Setor: item.setor,
      "Total de Ideias": item.total_ideas,
      "Ideias Implementadas": item.implemented_ideas,
      "Taxa de Implementação (%)":
        item.total_ideas > 0 ? ((item.implemented_ideas / item.total_ideas) * 100).toFixed(2) : "0.00",
    }));

    // Aba 8: Ideias em Destaque
    const destaquesData = ideaHighlights.map((item) => ({
      "Nome do Projeto": item.nome_projeto,
      "Nome do Colaborador": item.nome,
      Setor: item.setor,
      Gerente: item.gerente,
      "Data de Criação": formatDate(item.criado),
      "Situação Anterior": item.situacao_anterior,
      "Situação Atual": item.situacao_atual,
      Classificação: item.classificacao || "Não classificado",
      "Valor Estimado": item.valor_estimado
        ? `R$ ${item.valor_estimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        : "Não informado",
    }));

    // Aba 9: Dados Mensais
    const mensalData = monthlyData.map((item) => ({
      "Mês/Ano": `${item.month}/${item.year}`,
      "Total de Ideias": item.total_ideas,
      "Ideias Aprovadas": item.approved_ideas,
      "Valor Estimado": `R$ ${(item.estimated_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    }));

    const workBook = XLSX.utils.book_new();
    if (resumoData.length > 0) {
      const resumoSheet = XLSX.utils.json_to_sheet(resumoData);
      XLSX.utils.book_append_sheet(workBook, resumoSheet, "Resumo Geral");
    }

    if (penseAjaDetalhado.length > 0) {
      const penseAjaSheet = XLSX.utils.json_to_sheet(penseAjaDetalhado);
      XLSX.utils.book_append_sheet(workBook, penseAjaSheet, "Detalhes Pense&Aja");
    }

    if (setorData.length > 0) {
      const setorSheet = XLSX.utils.json_to_sheet(setorData);
      XLSX.utils.book_append_sheet(workBook, setorSheet, "Análise por Setor");
    }

    if (gerenteData.length > 0) {
      const gerenteSheet = XLSX.utils.json_to_sheet(gerenteData);
      XLSX.utils.book_append_sheet(workBook, gerenteSheet, "Análise por Gerente");
    }

    if (fabricaData.length > 0) {
      const fabricaSheet = XLSX.utils.json_to_sheet(fabricaData);
      XLSX.utils.book_append_sheet(workBook, fabricaSheet, "Análise por Fábrica");
    }

    if (turnoData.length > 0) {
      const turnoSheet = XLSX.utils.json_to_sheet(turnoData);
      XLSX.utils.book_append_sheet(workBook, turnoSheet, "Análise por Turno");
    }

    if (engajamentoData.length > 0) {
      const engajamentoSheet = XLSX.utils.json_to_sheet(engajamentoData);
      XLSX.utils.book_append_sheet(workBook, engajamentoSheet, "Engajamento");
    }

    if (destaquesData.length > 0) {
      const destaquesSheet = XLSX.utils.json_to_sheet(destaquesData);
      XLSX.utils.book_append_sheet(workBook, destaquesSheet, "Ideias em Destaque");
    }

    if (mensalData.length > 0) {
      const mensalSheet = XLSX.utils.json_to_sheet(mensalData);
      XLSX.utils.book_append_sheet(workBook, mensalSheet, "Dados Mensais");
    }

    // Gerar arquivo
    const xlsxBuffer = XLSX.write(workBook, {
      bookType: "xlsx",
      type: "array",
    });

    const currentDate = new Date();
    const fileName = `relatorio-dashboard-penseaja-${formatDate(currentDate).replace(/\//g, "-")}.xlsx`;

    saveAs(
      new Blob([xlsxBuffer], {
        type: "application/octet-stream",
      }),
      fileName
    );

    notification.value.showPopup(
      "success",
      "Sucesso.",
      "Relatório gerado com sucesso!",
      3000
    );
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);

    let errorMessage = "Entre em contato com a equipe de automação. Tente novamente.";
    if (error.response?.status === 401) {
      errorMessage = "Sessão expirada. Faça login novamente.";
    } else if (error.response?.status === 403) {
      errorMessage = "Você não tem permissão para gerar este relatório.";
    } else if (error.response?.status >= 500) {
      errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
    }

    notification.value.showPopup(
      "error",
      "Erro ao Gerar Relatório.",
      errorMessage,
      4000
    );
  } finally {
    isGeneratingReport.value = false;
  }
};

onMounted(() => {
  isLoaded.value = true;
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.filter-management {
  display: flex;
  justify-content: flex-start; /* Aligns filter groups to the start */
  gap: 1.5rem; /* Space between filter groups */
  align-items: center; /* Vertically aligns items in the filter bar */
  padding: 1rem 2rem; /* Internal padding */
  max-width: 1400px; /* Matches main-content max-width */
  margin: 1rem auto; /* Centers the block and adds vertical spacing */
  width: 100%;
  box-sizing: border-box; /* Ensures padding is included in width calculation */
  background-color: #fff; /* Card-like background */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

.filter-group {
  display: flex;
  align-items: center; /* Aligns label and input */
  gap: 0.5rem; /* Space between label and input */
}

.filter-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.filter-group input[type="date"] {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #fff;
  color: #333;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-section {
  opacity: 0;
  transform: translateY(20px);
}

.dashboard-section.animate-in {
  animation: fadeSlideUp 0.6s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.footer {
  margin-top: 4rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--color-border);
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .dashboard-grid {
    gap: 1.5rem;
  }

  .filter-management {
    flex-direction: column; /* Stack filter groups vertically */
    align-items: stretch; /* Make filter groups take full width */
    gap: 1rem; /* Adjust gap for column layout */
    padding: 1rem; /* Adjust padding for smaller screens */
    margin: 0.5rem auto 1rem auto; /* Adjust margins */
  }

  .filter-group {
    flex-direction: column; /* Stack label and input vertically within group */
    align-items: flex-start; /* Align label to the start */
    gap: 0.25rem; /* Smaller gap between label and input */
  }

  .filter-group input[type="date"] {
    width: 100%; /* Make date inputs take full width */
    box-sizing: border-box; /* Ensure padding/border included in width */
  }
}
</style>
