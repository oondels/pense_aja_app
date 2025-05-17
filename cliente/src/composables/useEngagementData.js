import { ref, onMounted } from 'vue';

export function useEngagementData() {
  const topContributors = ref([]);
  const isLoading = ref(true);

  const fetchEngagementData = () => {
    isLoading.value = true;

    // Simulate API call with mock data
    setTimeout(() => {
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
        },
        {
          id: 4,
          name: 'Carla Mendes',
          role: 'Analista de Logística',
          department: 'Logística',
          ideas: 16,
          implemented: 8,
          avatarColor: '#EF4444'
        },
        {
          id: 5,
          name: 'Bruno Costa',
          role: 'Engenheiro de Segurança',
          department: 'Segurança',
          ideas: 14,
          implemented: 7,
          avatarColor: '#8B5CF6'
        },
        {
          id: 6,
          name: 'Fernanda Lima',
          role: 'Analista de RH',
          department: 'Recursos Humanos',
          ideas: 13,
          implemented: 6,
          avatarColor: '#EC4899'
        }
      ];

      isLoading.value = false;
    }, 1300);
  };

  onMounted(() => {
    fetchEngagementData();
  });

  return {
    topContributors,
    isLoading
  };
}
