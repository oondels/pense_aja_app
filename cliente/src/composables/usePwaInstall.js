import { ref, onMounted } from 'vue'

export function usePwaInstall() {
  const deferredPrompt = ref(null)
  const isInstallable = ref(false)

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
      isInstallable.value = true
    })
  })

  const installApp = async () => {
    if (deferredPrompt.value) {
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      deferredPrompt.value = null
      isInstallable.value = false
    }
  }

  return {
    isInstallable,
    installApp
  }
}
