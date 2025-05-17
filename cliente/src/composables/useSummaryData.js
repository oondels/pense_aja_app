import { ref, onMounted } from 'vue';

export function useSummaryData() {
  const summaryData = ref({
    totalIdeas: 0,
    implementedIdeas: 0,
    pendingIdeas: 0,
    rejectedIdeas: 0
  });
  
  const isLoading = ref(true);
  
  const fetchSummaryData = () => {
    isLoading.value = true;
    setTimeout(() => {
      summaryData.value = {
        totalIdeas: 437,
        implementedIdeas: 182,
        pendingIdeas: 153,
        rejectedIdeas: 102
      };
      isLoading.value = false;
    }, 800);
  };
  
  onMounted(() => {
    fetchSummaryData();
  });
  
  return {
    summaryData,
    isLoading
  };
}
