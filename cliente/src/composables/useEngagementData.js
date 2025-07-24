import { ref, onMounted, watch } from 'vue';
import { dashboardService } from '../services/dashboardService.js';
import { useUserStore } from '../stores/userStore.js';

export function useEngagementData(startDate = null, endDate = null) {
  const topContributors = ref([]);
  const isLoading = ref(true);
  const error = ref(null);
  const userStore = useUserStore();

  const fetchEngagementData = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Usar SEST como padrão, ou pegar da store do usuário se disponível
      const dassOffice = userStore.userData?.unidade || 'SEST';
      
      const data = await dashboardService.getEngagementData(dassOffice, startDate, endDate);
      
      topContributors.value = data || [];
    } catch (err) {
      console.error('Erro ao buscar dados de engajamento:', err);
      error.value = err.message || 'Erro ao carregar dados de engajamento';
      
      // Fallback para dados mock em caso de erro
      topContributors.value = [
        {
          id: 1,
          name: 'Pedro Oliveira',
          role: 'Analista de Processos',
          department: 'Engenharia',
          ideas: 24,
          implemented: 15,
          avatarColor: '#3B82F6'
        },
        {
          id: 2,
          name: 'Amanda Silva',
          role: 'Supervisora de Produção',
          department: 'Produção',
          ideas: 21,
          implemented: 12,
          avatarColor: '#10B981'
        },
        {
          id: 3,
          name: 'Rafael Santos',
          role: 'Técnico de Qualidade',
          department: 'Qualidade',
          ideas: 19,
          implemented: 10,
          avatarColor: '#F97316'
        }
      ];
    } finally {
      isLoading.value = false;
    }
  };

  // Reagir a mudanças nas datas
  watch([() => startDate, () => endDate], fetchEngagementData, { deep: true });

  onMounted(() => {
    fetchEngagementData();
  });

  return {
    topContributors,
    isLoading,
    error,
    refetch: fetchEngagementData
  };
}
