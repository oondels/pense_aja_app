import { ref, onMounted, watch } from 'vue';
import { dashboardService } from '../services/dashboardService.js';
import { useUserStore } from '../stores/userStore.js';

export function useMonthlyData(startDate = null, endDate = null) {
  const monthlyData = ref([]);
  const isLoading = ref(true);
  const error = ref(null);
  const userStore = useUserStore();

  const fetchMonthlyData = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Usar SEST como padrão, ou pegar da store do usuário se disponível
      const dassOffice = userStore.userData?.unidade || 'SEST';
      
      const data = await dashboardService.getMonthlyData(dassOffice, startDate, endDate);
      
      // Se não há dados para o período filtrado, mostrar dados do último ano
      if (data.length === 0 && (startDate || endDate)) {
        // Buscar dados do último ano como fallback
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        const fallbackData = await dashboardService.getMonthlyData(dassOffice, lastYear, new Date());
        monthlyData.value = fallbackData;
      } else {
        monthlyData.value = data;
      }
      
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

  // Observar mudanças nas datas para recarregar os dados
  watch([() => startDate, () => endDate], () => {
    fetchMonthlyData();
  });

  onMounted(() => {
    fetchMonthlyData();
  });

  return {
    monthlyData,
    isLoading,
    error,
    refetch: fetchMonthlyData
  };
}
