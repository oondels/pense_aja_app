<template>
  <section class="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4">
    <label class="text-sm font-medium text-gray-700">
      Unidade
      <input
        :value="dassOffice"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
        type="text"
        placeholder="ex: matriz"
        @input="$emit('update:dassOffice', $event.target.value)"
      />
    </label>
    <label class="text-sm font-medium text-gray-700">
      Início
      <input
        :value="startDate"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
        type="date"
        @input="$emit('update:startDate', $event.target.value)"
      />
    </label>
    <label class="text-sm font-medium text-gray-700">
      Fim
      <input
        :value="endDate"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
        type="date"
        @input="$emit('update:endDate', $event.target.value)"
      />
    </label>
    <div class="flex items-end">
      <button
        class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
        type="button"
        @click="$emit('apply')"
      >
        <i class="mdi mdi-filter-outline"></i>
        Aplicar
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  dassOffice: {
    type: String,
    default: '',
  },
  startDate: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
})

defineEmits(['update:dassOffice', 'update:startDate', 'update:endDate', 'apply'])
</script>
