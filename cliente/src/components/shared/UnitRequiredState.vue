<template>
  <section class="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700">
      <i class="mdi mdi-map-marker-alert-outline text-3xl"></i>
    </div>
    <div>
      <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
      <p class="mt-2 text-sm leading-6 text-gray-600">{{ message }}</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Unidade Dass não definida',
  },
  message: {
    type: String,
    default: 'Entre novamente para carregar a unidade e acessar este fluxo.',
  },
})
</script>
