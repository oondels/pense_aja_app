<template>
  <div class="inline-flex rounded-md border border-gray-200 bg-white p-1 shadow-sm">
    <button
      v-for="option in options"
      :key="option.value"
      class="inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-semibold"
      :class="modelValue === option.value ? 'bg-red-700 text-white' : 'text-gray-600 hover:bg-gray-50'"
      type="button"
      @click="$emit('update:modelValue', option.value)"
    >
      <i :class="option.icon"></i>
      {{ option.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: 'list',
  },
})

defineEmits(['update:modelValue'])

const options = [
  { value: 'list', label: 'Lista', icon: 'mdi mdi-format-list-bulleted' },
  { value: 'cards', label: 'Cards', icon: 'mdi mdi-view-grid-outline' },
]
</script>
