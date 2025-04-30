import {api} from "./httpClient"

export const purchaseItem = async (product, userData) => {
    try {
        const response = await api.post('/purchase', {
            product,
            userData
        });
        return response.data;
    } catch (error) {
        console.error("Error purchasing item:", error);
        throw error;
    }
}