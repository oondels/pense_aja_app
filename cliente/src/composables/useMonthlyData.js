import { ref, onMounted } from 'vue';

export function useMonthlyData() {
  const monthlyData = ref([]);
  const isLoading = ref(true);

  const fetchMonthlyData = () => {
    isLoading.value = true;

    setTimeout(() => {
      monthlyData.value = [
        { month: 'Jan', count: 42 },
        { month: 'Fev', count: 53 },
        { month: 'Mar', count: 68 },
        { month: 'Abr', count: 59 },
        { month: 'Mai', count: 72 },
        { month: 'Jun', count: 84 },
        { month: 'Jul', count: 92 },
        { month: 'Ago', count: 87 },
        { month: 'Set', count: 76 },
        { month: 'Out', count: 95 },
        { month: 'Nov', count: 108 },
        { month: 'Dez', count: 120 },
      ];

      isLoading.value = false;
    }, 1000);
  };

  onMounted(() => {
    fetchMonthlyData();
  });

  return {
    monthlyData,
    isLoading
  };
}
