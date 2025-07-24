import { ref, onMounted } from 'vue';
import { dashboardService } from '../services/dashboardService.js';

export function useIdeasData() {
  const topIdeas = ref([]);
  const isLoading = ref(true);
  const error = ref(null);

  const fetchIdeasData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Buscar unidade do usuário a partir do localStorage
      const dassOffice = localStorage.getItem("unidadeDass") || 'SEST';
      
      const data = await dashboardService.getIdeaHighlights(dassOffice);
      topIdeas.value = data || [];
    } catch (err) {
      console.error('Erro ao buscar ideias em destaque:', err);
      error.value = 'Erro ao carregar ideias em destaque';
      
      // Dados de fallback em caso de erro
      topIdeas.value = [
        {
          id: 1,
          title: 'Sistema de reaproveitamento de água',
          description: 'Implementar um sistema de captação e tratamento de água da chuva para uso nos processos industriais...',
          author: 'Marina Almeida',
          avatarColor: '#3B82F6',
          date: '2025-03-15',
          status: 'Aprovada',
          category: 'Sustentabilidade',
          sector: 'Engenharia',
          factory: 'Unidade SP',
          likes: 87,
          comments: 12
        }
      ];
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    fetchIdeasData();
  });

  return {
    topIdeas,
    isLoading,
    error,
    fetchIdeasData
  };
}
