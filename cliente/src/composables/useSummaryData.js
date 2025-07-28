import { ref } from 'vue';
import { dashboardService } from '../services/dashboardService.js';
import { useUserStore } from '../stores/userStore.js';

export function useSummaryData(startDate = null, endDate = null) {
  const summaryData = ref({
    totalIdeas: 0,
    implementedIdeas: 0,
    pendingIdeas: 0,
    rejectedIdeas: 0,
    approvedByManager: 0,
    inAnalysis: 0,
    totalValue: 0,
    avgValue: 0
  });
  
  const isLoading = ref(true);
  const error = ref(null);
  const userStore = useUserStore();
  
  const fetchSummaryData = async (start = startDate, end = endDate) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Usar SEST como padrão, ou pegar da store do usuário se disponível
      const dassOffice = userStore.userData?.unidade || 'SEST';
      
      const data = await dashboardService.getSummaryData(dassOffice, start, end);
      
      summaryData.value = {
        totalIdeas: data.totalIdeas || 0,
        implementedIdeas: data.implementedIdeas || 0,
        pendingIdeas: data.pendingIdeas || 0,
        rejectedIdeas: data.rejectedIdeas || 0,
        approvedByManager: data.approvedByManager || 0,
        inAnalysis: data.inAnalysis || 0,
        totalValue: data.totalValue || 0,
        avgValue: data.avgValue || 0
      };
    } catch (err) {
      console.error('Erro ao buscar dados do resumo:', err);
      error.value = err.message || 'Erro ao carregar dados do dashboard';
      
      // Fallback para dados de exemplo em caso de erro
      summaryData.value = {
        totalIdeas: 0,
        implementedIdeas: 0,
        pendingIdeas: 0,
        rejectedIdeas: 0,
        approvedByManager: 0,
        inAnalysis: 0,
        totalValue: 0,
        avgValue: 0
      };
    } finally {
      isLoading.value = false;
    }
  };
  
  // Fetch initial data
  fetchSummaryData();
  
  return {
    summaryData,
    isLoading,
    error,
    refetch: fetchSummaryData
  };
}
