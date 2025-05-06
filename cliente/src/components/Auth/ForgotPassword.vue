<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <div class="login-extra">
        <span role="button" class="forgot-password" v-bind="activatorProps">
          Esqueci minha senha
        </span>
      </div>
    </template>

    <template v-slot:default="{ isActive }">
      <div class="forgot-container">
        <div class="forgot-header position-relative">
          <h2>Recuperar Senha</h2>

          <span
            role="button"
            @click="isActive.value = false"
            class="position-absolute top-0 end-0 m-3 mdi mdi-close-circle"
          ></span>
        </div>

        <div class="forgot-form">
          <div class="row">
            <label for="forgot-unidade">Unidade e Matrícula</label>
            <v-text-field
              v-model="user.registration"
              label="Matrícula"
              prepend-inner-icon="mdi mdi-card-account-details"
              type="number"
              variant="outlined"
              color="red"
              class="col-sm-6"
            />

            <v-text-field
              v-model="user.barCode"
              label="Cod. Barras"
              prepend-inner-icon="mdi mdi-barcode"
              variant="outlined"
              color="red"
              class="col-sm-6"
            />
          </div>

          <div class="row">
            <label for="forgot-unidade">Senha</label>
            <v-text-field
              v-model="user.password"
              label="Senha"
              prepend-inner-icon="mdi mdi-lock"
              variant="outlined"
              color="red"
              class="col-sm-6"
              type="password"
            />

            <v-text-field
              v-model="user.repeatPassword"
              label="Repita sua senha"
              prepend-inner-icon="mdi mdi-lock"
              variant="outlined"
              color="red"
              class="col-sm-6"
              type="password"
            />
          </div>

          <div class="forgot-actions">
            <button
              @click="handleChangePass"
              class="forgot-btn"
              id="changePassButton"
            >
              Redefinir Senha
              <span class="spinner" v-if="loading"></span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </v-dialog>

  <Notification ref="notification" />
</template>

<script setup>
import { ref } from "vue";
import Notification from "@/components/Notification.vue";
import { authApi } from "@/services/httpClient.js";

const dassOffice = localStorage.getItem("unidadeDass");
if (!dassOffice) {
  window.location.href = "/";
}

const emit = defineEmits(["notify"]);

const loading = ref(false);
const notification = ref(null);
const user = ref({
  registration: null,
  barCode: null,
  password: null,
  repeatPassword: null,
});

const handleChangePass = async () => {
  const { registration, barCode, password, repeatPassword } = user.value;

  if (!registration || !barCode || !password || !repeatPassword) {
    emit("notify", {
      type: "warning",
      title: "Aviso!",
      message: "Preencha todos os campos.",
    });

    return;
  }

  if (password !== repeatPassword) {
    emit("notify", {
      type: "warning",
      title: "Aviso!",
      message: "As senhas não conferem.",
    });

    return;
  }

  let message;
  authApi
    .post(`/auth/change-pass/${dassOffice}`, {
      newPass: password,
      repeatPassword: repeatPassword,
      barCode: barCode,
    })
    .then((response) => {
      message = response.data?.message || "Senha alterada com sucesso!";
      sessionStorage.clear();
      emit("notify", {
        type: "success",
        title: "Sucesso",
        message,
      });

      user.value = {
        registration: null,
        barCode: null,
        password: null,
        repeatPassword: null,
      };
    })
    .catch((error) => {
      message =
        error?.response?.data?.message ||
        "Erro ao alterar senha, tente novamente!";
      console.error("Erro ao trocar senha: ", error);
      emit("notify", {
        type: "warning",
        title: "Aviso!",
        message,
      });
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>

<style scoped>
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-left: 8px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top-color: #fff;
  border-radius: 50%;
  animation: loading 0.6s linear infinite;
  vertical-align: middle;
}
@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.login-extra {
  text-align: right;
}

.login-extra .forgot-password {
  font-size: 13px;
  color: #e74c3c;
  text-decoration: none;
  transition: opacity 0.3s;
}

.login-extra .forgot-password:hover {
  opacity: 0.8;
}

.forgot-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  background: #fff;
  border-radius: 12px;
  width: 450px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

@media screen and (max-width: 600px) {
  .forgot-container {
    width: 90%;
  }
}

.forgot-header {
  background: linear-gradient(135deg, #d9534f, #e74c3c);
  padding: 20px;
  text-align: center;
  position: relative;
  color: #fff;
}

.forgot-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.forgot-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  padding: 2px 8px;
  transition: background 0.3s;
}

.forgot-close:hover {
  background: rgba(255, 255, 255, 0.6);
}

.forgot-form {
  padding: 25px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

#forgot-password-confirm.diff {
  background-color: rgb(253, 217, 217);
}

#forgot-password.diff {
  background-color: rgb(253, 217, 217);
}

#changePassButton.diff {
  cursor: not-allowed;
  opacity: 0.5;
}

.forgot-field label {
  font-size: 14px;
  color: #555;
  margin-bottom: 6px;
  display: block;
}

.forgot-field input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.forgot-field input:focus {
  outline: none;
  border-color: #e74c3c;
}

.forgot-actions {
  text-align: center;
}

.forgot-btn {
  background: linear-gradient(135deg, #e74c3c, #d9534f);
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.3s;
}

.forgot-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}
</style>
