<template>
  <main class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl space-y-6">
      <header>
        <p class="text-sm font-semibold uppercase tracking-wide text-red-700">Acompanhamento</p>
        <h1 class="mt-1 text-2xl font-bold text-gray-950">Solicitações de resgate</h1>
        <p class="mt-2 max-w-2xl text-sm text-gray-600">
          Visualização operacional das solicitações por unidade. O acompanhamento individual usa o mesmo contrato quando o backend disponibiliza consulta própria.
        </p>
      </header>

      <AdminMarketplace />
    </div>
  </main>
</template>

<script setup>
import AdminMarketplace from './AdminMarketplace.vue'
</script>
