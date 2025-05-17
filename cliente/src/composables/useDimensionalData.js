import { ref, onMounted } from 'vue';

export function useDimensionalData() {
  const dimensionalData = ref({
    manager: [],
    sector: [],
    factory: []
  });

  const isLoading = ref(true);

  const fetchDimensionalData = () => {
    isLoading.value = true;

    // Simulate API call with mock data
    setTimeout(() => {
      dimensionalData.value = {
        manager: [
          { label: 'Carlos Silva', count: 87 },
          { label: 'Ana Oliveira', count: 65 },
          { label: 'Roberto Pereira', count: 58 },
          { label: 'Camila Santos', count: 42 },
          { label: 'Fernando Costa', count: 39 }
        ],
        sector: [
          { label: 'Produção', count: 156 },
          { label: 'Qualidade', count: 98 },
          { label: 'Engenharia', count: 87 },
          { label: 'Logística', count: 63 },
          { label: 'Administrativo', count: 33 }
        ],
        factory: [
          { label: 'Unidade SP', count: 178 },
          { label: 'Unidade MG', count: 124 },
          { label: 'Unidade RS', count: 85 },
          { label: 'Unidade PR', count: 50 }
        ]
      };

      isLoading.value = false;
    }, 1200);
  };

  onMounted(() => {
    fetchDimensionalData();
  });

  return {
    dimensionalData,
    isLoading
  };
}