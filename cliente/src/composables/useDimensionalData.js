import { ref, onMounted, watch } from 'vue';
import { dashboardService } from '../services/dashboardService.js';
import { useUserStore } from '../stores/userStore.js';

export function useDimensionalData(startDate = null, endDate = null) {
  const dimensionalData = ref({
    manager: [],
    sector: [],
    factory: []
  });

  const isLoading = ref(true);
  const error = ref(null);
  const userStore = useUserStore();

  const fetchDimensionalData = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Usar SEST como padrão, ou pegar da store do usuário se disponível
      const dassOffice = userStore.userData?.unidade || 'SEST';
      
      const data = await dashboardService.getDimensionalData(dassOffice, startDate, endDate);
      
      dimensionalData.value = {
        manager: data.manager || [],
        sector: data.sector || [],
        factory: data.factory || []
      };
    } catch (err) {
      console.error('Erro ao buscar dados dimensionais:', err);
      error.value = err.message || 'Erro ao carregar dados dimensionais';
      
      // Fallback para dados de exemplo em caso de erro
      dimensionalData.value = {
        manager: [],
        sector: [],
        factory: []
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Observar mudanças nas datas para recarregar os dados
  watch([() => startDate, () => endDate], () => {
    fetchDimensionalData();
  });

  onMounted(() => {
    fetchDimensionalData();
  });

  return {
    dimensionalData,
    isLoading,
    error,
    refetch: fetchDimensionalData
  };
}