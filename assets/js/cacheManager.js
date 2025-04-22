const CacheManager = {
  // Atualiza um item específico em ambos os caches
  updatePenseAjaInCache: function (penseAjaId, updatedData) {
    // Atualiza ambos os caches
    const mainCacheUpdated = this._updateItemInCache(
      "cachedList",
      penseAjaId,
      updatedData
    );
    const filterCacheUpdated = this._updateItemInCache(
      "filterCache",
      penseAjaId,
      updatedData
    );

    // Atualiza as visualizações se algum cache foi modificado
    if (mainCacheUpdated || filterCacheUpdated) {
      this._refreshViews();
    }
  },

  // Método privado para atualizar um item em um cache específico
  _updateItemInCache: function (cacheKey, penseAjaId, updatedData) {
    const rawCache = localStorage.getItem(cacheKey);
    if (!rawCache) return false;

    let cacheModified = false;
    try {
      const cache = JSON.parse(rawCache);

      // Para cada período armazenado no cache
      Object.keys(cache).forEach((periodKey) => {
        const data = cache[periodKey];

        if (!data || !data.payload || !Array.isArray(data.payload)) return;

        const itemIndex = data.payload.findIndex(
          (item) => item.id == penseAjaId
        );
        if (itemIndex >= 0) {
          // Atualiza o item encontrado com os novos dados
          data.payload[itemIndex] = {
            ...data.payload[itemIndex],
            ...updatedData,
          };
          cacheModified = true;
          console.log(
            `Item ${penseAjaId} atualizado no cache ${cacheKey}:${periodKey}`
          );
        }
      });

      if (cacheModified) {
        localStorage.setItem(cacheKey, JSON.stringify(cache));
      }
      return cacheModified;
    } catch (err) {
      console.error(`Erro ao atualizar cache ${cacheKey}:`, err);
      return false;
    }
  },

  // Atualiza ambas as visualizações de lista
  _refreshViews: function () {
    // Atualiza se estiver com a lista visivel
    this._refreshMainList();
    this._refreshHistoryList();
  },

  // Atualiza a lista principal
  _refreshMainList: function () {
    try {
      const mesAnterior = new Date().getMonth() - 1;
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();

      const cachedKey = `${mesAnterior}-${mesAtual}-${anoAtual}`;
      const cachedList = JSON.parse(localStorage.getItem("cachedList")) || {};

      // Verifica se o elemento da tabela principal está presente
      const tbodyMain = document.getElementById("tbody");
      if (tbodyMain && cachedList[cachedKey]?.payload) {
        console.log("Atualizando lista principal");
        if (typeof window.renderListaTable === "function") {
          window.renderListaTable(cachedList[cachedKey].payload);
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar lista principal:", err);
    }
  },

  // Atualiza a lista histórica
  _refreshHistoryList: function () {
    try {
      // Verifica se a tabela de histórico está presente
      const tbodyHistory = document.getElementById("tbodyLista");
      if (!tbodyHistory) return;

      // Obtém os valores de mês e ano selecionados
      const selectMes = document.getElementById("mesLista")?.value;
      const selectAno = document.getElementById("anoLista")?.value;

      if (selectMes && selectAno) {
        const cachedListKey = `cachedListTable-${selectMes}-${selectAno}`;
        const queryCache =
          JSON.parse(localStorage.getItem("filterCache")) || {};

        if (queryCache[cachedListKey]?.payload) {
          console.log("Atualizando lista histórica");
          // Chama a função global de renderização
          if (typeof window.renderListaTableLista === "function") {
            window.renderListaTableLista(queryCache[cachedListKey].payload);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar lista histórica:", err);
    }
  },
};

export default CacheManager;
