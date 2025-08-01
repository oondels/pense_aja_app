import { ref } from 'vue';
import { dashboardService } from '../services/dashboardService.js';
import { useUserStore } from '../stores/userStore.js';

export function useMonthlyData(startDate = null, endDate = null) {
  const monthlyData = ref([]);
  const isLoading = ref(true);
  const error = ref(null);
  const userStore = useUserStore();

  const fetchMonthlyData = async (start = startDate, end = endDate) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Usar SEST como padrão, ou pegar da store do usuário se disponível
      const dassOffice = userStore.userData?.unidade || 'SEST';
      
      const data = await dashboardService.getMonthlyData(dassOffice, start, end);
      
      monthlyData.value = data;
      
    } catch (err) {
      console.error('Erro ao buscar dados mensais:', err);
      error.value = err.message || 'Erro ao carregar dados mensais';
      
      // Fallback para dados de exemplo em caso de erro
      monthlyData.value = [
        { month: 'Jan', count: 0, value: 0 },
        { month: 'Fev', count: 0, value: 0 },
        { month: 'Mar', count: 0, value: 0 },
        { month: 'Abr', count: 0, value: 0 },
        { month: 'Mai', count: 0, value: 0 },
        { month: 'Jun', count: 0, value: 0 },
        { month: 'Jul', count: 0, value: 0 },
        { month: 'Ago', count: 0, value: 0 },
        { month: 'Set', count: 0, value: 0 },
        { month: 'Out', count: 0, value: 0 },
        { month: 'Nov', count: 0, value: 0 },
        { month: 'Dez', count: 0, value: 0 },
      ];
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch initial data
  fetchMonthlyData();

  return {
    monthlyData,
    isLoading,
    error,
    refetch: fetchMonthlyData
  };
}
