<!-- ListaPenseAja.vue -->
<template>
  <div class="list-container">
    <RecycleScroller
      :items="filteredItems"
      :item-size="130"
      key-field="id"
      class="virtual-list"
    >
      <template #default="{ item }">
        <div class="list-item" :key="item.id">
          <div class="item-content">
            <div class="item-accent"></div>
            <div class="item-main">
              <img src="/assets/img/icons/idea-on.png" alt="" class="icon-main" />
              <div>
                <h3 class="item-title">{{ item.nome_projeto }}</h3>
                <p class="item-subtitle">{{ item.setor }}</p>
              </div>
            </div>
            <div class="item-meta">
              <div class="meta-row">
                <!-- <img src="/assets/icons/user.svg" alt="" class="icon-meta" /> -->
                <span>{{ item.nome }}</span>
              </div>
              <div class="meta-row">
                <!-- <img src="/assets/icons/calendar.svg" alt="" class="icon-meta" /> -->
                <span>{{ item.criado }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import axios from 'axios'

const props = defineProps({
  filterText: { type: String, default: '' }
})

const penseAjas = ref([])

const fetchData = async () => {
  const office = 'SEST'
  const { data } = await axios.get(`http://localhost:2512/pense-aja/${office}`)
  penseAjas.value = data.dados
}
onMounted(fetchData)

const filteredItems = computed(() => {
  const term = props.filterText.trim().toLowerCase()
  if (!term) return penseAjas.value
  return penseAjas.value.filter(i =>
    i.nome_projeto.toLowerCase().includes(term) ||
    i.setor.toLowerCase().includes(term) ||
    i.gerente.toLowerCase().includes(term)
  )
})
</script>

<style scoped>
.list-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.virtual-list {
  height: 600px;
  overflow-y: auto;
}

/* cada cartão */
.list-item {
  margin-bottom: 1rem;
}
.item-content {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-card, #fff);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px var(--shadow-light);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.item-content:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px var(--shadow-strong);
}

/* barra de destaque lateral */
.item-accent {
  position: absolute;
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  background: var(--red-primary, #EF5350);
}

/* conteúdo principal */
.item-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}
.icon-main {
  width: 40px;
  height: 40px;
  filter: hue-rotate(-15deg) brightness(1.2);
}

/* títulos */
.item-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-dark, #333);
}
.item-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: var(--text-muted, #666);
}

/* metadados */
.item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted, #666);
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.icon-meta {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(0.4);
}
</style>
