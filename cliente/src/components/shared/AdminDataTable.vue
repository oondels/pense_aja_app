<template>
  <section class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <div v-if="loading" class="flex items-center justify-center gap-2 px-4 py-10 text-sm text-gray-600">
      <i class="mdi mdi-loading mdi-spin text-lg"></i>
      Carregando...
    </div>

    <div v-else-if="!rows.length" class="px-4 py-10 text-center text-sm text-gray-600">
      {{ emptyText }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              {{ column.label }}
            </th>
            <th v-if="$slots.actions" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr
            v-for="row in rows"
            :key="row.id || JSON.stringify(row)"
            class="hover:bg-gray-50"
            :class="{ 'cursor-pointer': clickableRows }"
            @click="$emit('row-click', row)"
          >
            <td v-for="column in columns" :key="column.key" class="whitespace-nowrap px-4 py-3 text-gray-700">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ formatValue(row[column.key]) }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="whitespace-nowrap px-4 py-3 text-right">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: 'Nenhum registro encontrado.',
  },
  clickableRows: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['row-click'])

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  return value
}
</script>
