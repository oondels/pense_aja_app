<template>
  <v-dialog max-width="500" transition="dialog-bottom-transition">
    <template v-slot:activator="{ props: activatorProps }">
      <button v-bind="activatorProps" class="buy-item-action-btn">
        <span>Confirmar Resgate</span>
      </button>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card class="confirmation-card" rounded="lg" elevation="10">
        <v-card-item class="confirmation-header">
          <v-card-title class="text-h5 text-center">
            <v-icon icon="mdi-lock-check" size="large" color="red" class="mr-2"></v-icon>
            Confirmação de Identidade
          </v-card-title>
          <v-card-subtitle class="text-center mt-2">
            Entre com suas credenciais para aprovar o resgate
          </v-card-subtitle>
        </v-card-item>
        
        <v-divider class="mx-4"></v-divider>
        
        <v-card-text class="pt-4">
          <v-slide-y-transition>
            <v-form>
              <v-text-field
                label="Usuário"
                variant="outlined"
                color="red"
                v-model="user"
                prepend-inner-icon="mdi-account"
                hide-details="auto"
                class="mb-4"
              />
              <v-text-field
                label="Senha"
                variant="outlined"
                color="red"
                v-model="password"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                hide-details="auto"
              />
            </v-form>
          </v-slide-y-transition>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-row justify="space-between">
            <v-col cols="6">
              <v-btn 
                variant="outlined" 
                color="red" 
                block
                @click="isActive.value = false"
                class="cancel-button"
              >
                <v-icon start icon="mdi-close"></v-icon>
                Cancelar
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                @click="handleRedeem(isActive)"
                color="success"
                variant="elevated"
                block
                :loading="loadingPass"
                class="confirm-button"
              >
                <v-icon start icon="mdi-check"></v-icon>
                Aprovar
                <template v-slot:loader>
                  <v-progress-linear indeterminate></v-progress-linear>
                </template>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>

      <Notification ref="notification" />
    </template>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";
import { checkLogin } from "@/services/authService.js";
import Notification from "@/components/Notification.vue";
import { purchaseItem } from "@/services/storeService.js";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  colaboradorData: {
    type: Object,
    required: true,
  },
});

const notification = ref(null);
const user = ref(null);
const password = ref(null);
const showPassword = ref(false);
const loadingPass = ref(false);

const emit = defineEmits(["updatePoints"]);
const analistaName = sessionStorage.getItem("nome");
const analistaUser = sessionStorage.getItem("usuario");

async function handleRedeem(dialog) {
  const dassOffice = localStorage.getItem("unidadeDass");
  if (!dassOffice) {
    notification.value.showPopup(
      "error",
      "Erro",
      "Unidade não encontrada, entre em contato com o suporte!"
    );
    return;
  }
  if (!user.value || !password.value) {
    notification.value.showPopup("error", "Erro", "Preencha todos os campos!");
    return;
  }

  const approve = await checkLogin(user.value, password.value);
  if (approve) {
    await purchaseItem(
      props.colaboradorData,
      props.product,
      analistaName,
      analistaUser,
      dassOffice,
      notification,
      loadingPass,
      dialog,
      emit
    );

    return;
  } else {
    notification.value.showPopup(
      "error",
      "Erro",
      "Usuário ou senha inválidos!"
    );
    return;
  }
}
</script>

<style scoped>
.buy-item-action-btn {
  margin-top: 1.2rem;
  background: linear-gradient(135deg, #ef5350, #d32f2f);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 16px 0;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(239, 83, 80, 0.13);
  transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
  width: 100%;
  position: relative;
  overflow: hidden;
  outline: none;
  animation: fadeInUp 0.7s 0.2s backwards;
}

.buy-item-action-btn:hover {
  background: linear-gradient(135deg, #d32f2f, #ef5350);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 24px rgba(239, 83, 80, 0.18);
}

.buy-item-action-btn:active {
  transform: scale(0.98);
}

.confirmation-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: linear-gradient(to bottom, #fafafa, #f5f5f5);
}

.confirmation-header {
  padding-top: 24px;
  padding-bottom: 16px;
}

.confirm-button {
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.2);
}

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.25);
}

.cancel-button {
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

.cancel-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-card-item {
  animation: fadeInDown 0.5s ease;
}

.v-form {
  animation: fadeInUp 0.5s ease;
}

.v-card-actions {
  animation: fadeInUp 0.5s 0.1s both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
