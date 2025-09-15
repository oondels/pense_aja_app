import { api } from "./httpClient"
import axios from "axios";

export const purchaseItem = async (colaboradorData, product, analistaName, analistaUser, dassOffice, notification, loadingPass, dialog, emit) => {
  try {
    loadingPass.value = true;
    let message;
    const response = await api.put(`/pense-aja/purchase/${colaboradorData?.matricula}`, {
      product,
      colaboradorData,
      analista: { analistaName, analistaUser },
      dassOffice
    });
    message = response.data?.message || "Item resgatado com sucesso!";

    notification.value.showPopup('success', 'Sucesso', message, 1500);
    emit("updatePoints", true);
    // Fecha popup de resgate de premio
    setTimeout(() => {
      dialog.value = false;
    }, 1600);
  } catch (error) {
    message = error.response?.data?.message || "Erro ao resgatar item! Tente novamente.";
    console.error("Error purchasing item:", error);
    notification.value.showPopup('error', 'Erro', message, 1500);
    throw error;
  } finally {
    loadingPass.value = false;
  }
}

export const createProduct = async (data, files, dassOffice) => {
  try {
    data.processType = "product"
    const form = new FormData();
    form.append("data", JSON.stringify(data));
    files.forEach(file => {
      if (file instanceof File) {
        form.append("files", file);
      } else {
        console.warn("Item não é um arquivo válido:", file);
        return;
      }
    })

    const response = await axios.post("http://10.100.1.43:3020/", form, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-service": "pense_aja",
        "x-subfolder": dassOffice,
        "x-dass-office": dassOffice
      }
    })

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);

    throw new Error("Erro ao criar produto: " + error.response.data.message);
  }
}

export const editProducts = async (dassOffice, data) => {
  try {
    const response = await commonApi.put(`/pense-aja/products/${dassOffice}`, data);
    return response.data;
  } catch (error) {
    console.error("Error editing product:", error);
    throw new Error("Erro ao editar produto: " + (error.response?.data?.message || error.message));
  }
}

export const fetchStoreProducts = async (dassOffice) => {
  try {
    console.log('buscando produtos para', dassOffice);
    
    const response = await commonApi.get(`/pense-aja/products/${dassOffice}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Erro ao buscar produtos: " + (error.response?.data?.message || error.message));
  }
}
