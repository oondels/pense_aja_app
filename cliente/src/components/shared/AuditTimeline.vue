<template>
  <section class="space-y-3">
    <article
      v-for="event in events"
      :key="event.id"
      class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-sm font-semibold text-gray-950">{{ event.eventType }}</p>
          <p class="mt-1 text-xs text-gray-500">
            {{ formatDate(event.createdAt) }} • {{ event.actorRegistration || 'sistema' }}
            <span v-if="event.actorRole">• {{ event.actorRole }}</span>
          </p>
        </div>
        <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
          {{ event.correlationId || event.aggregateId }}
        </span>
      </div>

      <p v-if="event.reason" class="mt-3 text-sm text-gray-700">{{ event.reason }}</p>

      <details class="mt-3 rounded-md bg-gray-50 p-3 text-xs text-gray-700">
        <summary class="cursor-pointer font-semibold text-gray-800">Estados e metadados</summary>
        <pre class="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words">{{ stringify(event) }}</pre>
      </details>
    </article>

    <div v-if="!events.length" class="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
      <i class="mdi mdi-history text-3xl text-gray-400"></i>
      <p class="mt-2 text-sm font-medium text-gray-700">Nenhum evento encontrado.</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  events: {
    type: Array,
    default: () => [],
  },
})

const formatDate = (value) => {
  if (!value) return 'Sem data'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

const stringify = (event) => JSON.stringify(
  {
    beforeState: event.beforeState,
    afterState: event.afterState,
    metadata: event.metadata,
  },
  null,
  2,
)
</script>
