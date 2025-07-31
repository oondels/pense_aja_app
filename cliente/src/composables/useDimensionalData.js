import { ref, watch, toRefs } from 'vue';
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

  const fetchDimensionalData = async (start = startDate, end = endDate) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const dassOffice = userStore.userData?.unidade || 'SEST';
      const data = await dashboardService.getDimensionalData(dassOffice, start, end);
      
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

  // Fetch initial data
  fetchDimensionalData();

  return {
    dimensionalData,
    isLoading,
    error,
    refetch: fetchDimensionalData
  };
}