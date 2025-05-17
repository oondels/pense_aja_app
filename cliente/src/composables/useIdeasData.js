import { ref, onMounted } from 'vue';

export function useIdeasData() {
  const topIdeas = ref([]);
  const isLoading = ref(true);

  const fetchIdeasData = () => {
    isLoading.value = true;

    // Simula chamada de API com dados mockados
    setTimeout(() => {
      topIdeas.value = [
        {
          id: 1,
          title: 'Sistema de reaproveitamento de água',
          description: 'Implementar um sistema de captação e tratamento de água da chuva para uso nos processos industriais, reduzindo o consumo de água potável.',
          author: 'Marina Almeida',
          avatarColor: '#3B82F6',
          date: '2025-03-15',
          status: 'Aprovada',
          category: 'Sustentabilidade',
          sector: 'Engenharia',
          factory: 'Unidade SP',
          likes: 87,
          comments: 12
        },
        {
          id: 2,
          title: 'Otimização do fluxo de montagem',
          description: 'Reorganizar as estações de trabalho na linha de montagem para reduzir movimentações desnecessárias e aumentar a eficiência operacional.',
          author: 'Ricardo Ferreira',
          avatarColor: '#10B981',
          date: '2025-03-10',
          status: 'Pendente',
          category: 'Produção',
          sector: 'Logística',
          factory: 'Unidade MG',
          likes: 65,
          comments: 8
        },
        {
          id: 3,
          title: 'Programa de mentoria interna',
          description: 'Criar um programa onde colaboradores mais experientes compartilham conhecimentos com novos funcionários, acelerando a curva de aprendizado.',
          author: 'Juliana Costa',
          avatarColor: '#F97316',
          date: '2025-03-05',
          status: 'Aprovada',
          category: 'Desenvolvimento',
          sector: 'RH',
          factory: 'Unidade SP',
          likes: 74,
          comments: 15
        },
        {
          id: 4,
          title: 'Sistema de manutenção preditiva',
          description: 'Implementar sensores IoT para monitoramento contínuo dos equipamentos críticos, permitindo prever falhas antes que ocorram.',
          author: 'Eduardo Martins',
          avatarColor: '#8B5CF6',
          date: '2025-02-28',
          status: 'Pendente',
          category: 'Tecnologia',
          sector: 'Manutenção',
          factory: 'Unidade RS',
          likes: 62,
          comments: 9
        }
      ];

      isLoading.value = false;
    }, 1500);
  };

  onMounted(() => {
    fetchIdeasData();
  });

  return {
    topIdeas,
    isLoading
  };
}
