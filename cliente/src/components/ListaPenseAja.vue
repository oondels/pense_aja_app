<template>
  <div class="list-container">
    <RecycleScroller
      class="virtual-list"
      :items="penseAjas"
      :item-size="120"
      key-field="id"
    >
      <template #default="{ item }">
        <div class="list-item">
          <div class="item-content">
            <div class="item-main">
              <div class="item-icon">
                <img src="/assets/img/icons/idea-on.png" alt="ícone do projeto" />
              </div>
              <div class="item-info">
                <h3 class="item-title">{{ item.nome_projeto }}</h3>
                <p class="item-subtitle">Setor: {{ item.setor }}</p>
              </div>
            </div>
            <div class="item-meta">
              <p>Gerente: {{ item.gerente }}</p>
              <p>{{ item.criado }}</p>
            </div>
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'
import { ref, reactive, computed, onMounted } from "vue";
import axios from "axios";

const penseAjas = ref([]);

const options = reactive({
  nome: [],
  setor: [],
  gerente: [],
  nome_projeto: [],
  turno: [],
});

const queryPenseAja = async () => {
  const dassOffice = "SEST";
  const res = await axios.get(`http://localhost:2512/pense-aja/${dassOffice}`);
  penseAjas.value = res.data.dados;
  // Atualiza opções únicas
  // options.nome = [...new Set(items.value.map((i) => i.nome))];
  // options.setor = [...new Set(items.value.map((i) => i.setor))];
  // options.gerente = [...new Set(items.value.map((i) => i.gerente))];
  // options.nome_projeto = [...new Set(items.value.map((i) => i.nome_projeto))];
  // options.turno = [...new Set(items.value.map((i) => i.turno))];

  console.log(penseAjas.value);
};
onMounted(queryPenseAja);

const filteredItems = computed(() =>
penseAjas.value.filter(
    (i) =>
      (!filters.nome.length || filters.nome.includes(i.nome)) &&
      (!filters.setor.length || filters.setor.includes(i.setor)) &&
      (!filters.gerente.length || filters.gerente.includes(i.gerente)) &&
      (!filters.nome_projeto.length ||
        filters.nome_projeto.includes(i.nome_projeto)) &&
      (!filters.turno.length || filters.turno.includes(i.turno))
  )
);

function filterRows() {

}

</script>

<style scoped>
.list-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

/* Área scrollável virtualizada */
.virtual-list {
  height: 500px;           /* ajuste conforme necessidade */
  overflow-y: auto;
}

/* Cada item (wrapper para espaçamento) */
.list-item + .list-item {
  margin-top: 12px;
}

/* cartão interno de cada item */
.item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 11px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

/* efeito hover: leve elevação */
.item-content:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

/* lado esquerdo: ícone + informações principais */
.item-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* container do ícone */
.item-icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
}

/* imagem do ícone */
.item-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* título e subtítulo */
.item-info .item-title {
  margin: 0;
  font-size: 1.25rem;
  color: #222;
}
.item-info .item-subtitle {
  margin: 4px 0 0;
  font-size: 0.95rem;
  color: #555;
}

/* lado direito: metadados */
.item-meta {
  text-align: right;
}
.item-meta p {
  margin: 2px 0;
  font-size: 0.85rem;
  color: #666;
}
</style>
