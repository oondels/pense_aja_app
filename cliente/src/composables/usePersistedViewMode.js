import { ref, watch } from 'vue'

export const usePersistedViewMode = (storageKey, defaultMode = 'list') => {
  const stored = localStorage.getItem(storageKey)
  const viewMode = ref(stored === 'cards' || stored === 'list' ? stored : defaultMode)

  watch(viewMode, (value) => {
    localStorage.setItem(storageKey, value)
  })

  return viewMode
}
