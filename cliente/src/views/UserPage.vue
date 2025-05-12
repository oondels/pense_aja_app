<template>
  <div class="user-page">
    <div class="container">
      <h1 class="page-title">Perfil do Usuário</h1>

      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            <span class="avatar-initials">{{ getUserInitials }}</span>
          </div>
          <div class="profile-info">
            <h2>{{ userData?.nome || "Nome do Usuário" }}</h2>
            <p class="user-role" v-if="dassOffice">
              {{ userData?.setor || "Setor" }} -
              {{ dassOffice }}
            </p>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-card">
            <div class="stat-value">
              {{ userData?.pontos - userData?.pontos_resgatados || 0 }}
            </div>
            <div class="stat-label">Pontuação</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" v-if="userData?.classificacoes_pense_aja">
              {{
                Object.values(userData.classificacoes_pense_aja).reduce(
                  (a, b) => a + b
                )
              }}
            </div>
            <div class="stat-label">Pense Aja Registrados</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ userData?.classificacoes_pense_aja.A || 0 }}
            </div>
            <div class="stat-label">Aprovados A</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ userData?.classificacoes_pense_aja.B || 0 }}
            </div>
            <div class="stat-label">Aprovados B</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ userData?.classificacoes_pense_aja.C || 0 }}
            </div>
            <div class="stat-label">Aprovados C</div>
          </div>
        </div>

        <div class="profile-edit-section">
          <h3>Informações Pessoais</h3>

          <div class="info-display">
            <div class="info-group">
              <label>Nome</label>
              <div class="info-value">
                {{ userData?.nome || "Não informado" }}
              </div>
            </div>

            <div class="info-group">
              <label>Unidade DASS</label>
              <div class="info-value">
                {{ dassOffice || "Não informada" }}
              </div>
            </div>

            <div class="info-group">
              <label>Setor</label>
              <div class="info-value">
                {{ userData?.setor || "Não informado" }}
              </div>
            </div>
          </div>

          <h3>Configurações de Email e Notificações</h3>
          <form @submit.prevent="updateUserInfo">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                placeholder="Seu email"
                required
              />
            </div>

            <div class="notification-settings">
              <div class="form-check">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  v-model="formData.notificacaoEmail"
                />
                <label for="emailNotifications">
                  Receber notificações por email
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="primary-button"
                :disabled="isSubmitting || !formChanged"
              >
                {{ isSubmitting ? "Salvando..." : "Salvar Alterações" }}
              </button>
              <button type="button" class="secondary-button" @click="resetForm">
                Resetar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <Notification ref="notification" />
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { getUserData, updateUserData } from "../services/userService";
import Notification from "../components/Notification.vue";

const isSubmitting = ref(false);
const userData = ref(null);
const notification = ref(null);
const dassOffice = localStorage.getItem("unidadeDass");
const initialFormData = ref({});

const formData = reactive({
  email: "",
  notificacaoEmail: false,
  authorized_notifications_apps: []
});

// Watch para atualizar authorized_notifications_apps quando notificacaoEmail mudar
watch(() => formData.notificacaoEmail, (newValue) => {
  if (newValue) {
    if (!formData.authorized_notifications_apps.includes('pense_aja')) {
      formData.authorized_notifications_apps.push('pense_aja');
    }
  } else {
    const index = formData.authorized_notifications_apps.indexOf('pense_aja');
    if (index !== -1) {
      formData.authorized_notifications_apps.splice(index, 1);
    }
  }
});

const formChanged = computed(() => {
  if (!initialFormData.value) return false;
  
  return formData.email !== initialFormData.value.email || 
         formData.notificacaoEmail !== initialFormData.value.notificacaoEmail ||
         !areArraysEqual(formData.authorized_notifications_apps, initialFormData.value.authorized_notifications_apps);
});

// Função auxiliar para comparar arrays
const areArraysEqual = (arr1, arr2) => {
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
};

const getUserInitials = computed(() => {
  if (!userData?.value?.nome) return "?";
  return userData?.value?.nome
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
});

const loadUserData = async () => {
  try {
    const registration = sessionStorage.getItem("matricula");
    if (!registration) {
      notification.value.showPopup(
        "error",
        "Erro",
        "Você não está logado. Por favor, faça login novamente.",
        4000
      );

      setTimeout(() => {
        window.location.href = "/";
      }, 4100);
      return;
    }

    await getUserData(registration, userData, null, notification);
    formData.email = userData.value.email || "";
    
    // if (!Array.isArray(userData.value.authorized_notifications_apps)) {
    //   userData.value.authorized_notifications_apps = [];
    // }
    formData.notificacaoEmail = userData?.value?.authorized_notifications_apps?.includes("pense_aja") || false;
    formData.authorized_notifications_apps = [...(userData.value.authorized_notifications_apps || [])];

    // Armazenar os valores iniciais para comparação
    initialFormData.value = {
      email: formData.email,
      notificacaoEmail: formData.notificacaoEmail,
      authorized_notifications_apps: [...formData.authorized_notifications_apps]
    };
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
  }
};

const updateUserInfo = async () => {
  await updateUserData(userData.value, isSubmitting, notification, formData, dassOffice);
};

const resetForm = () => {
  loadUserData();
};

onMounted(async () => {
  await loadUserData();
});
</script>

<style scoped>
.user-page {
  background-color: #f8f9fc;
  background-image: radial-gradient(circle at 50% 0, rgba(255, 255, 255, 0.8), transparent 60%),
    radial-gradient(circle at 100% 100%, rgba(176, 6, 43, 0.05), transparent 40%);
  min-height: 100vh;
  padding: 1.5rem 0;
  font-family: 'Poppins', sans-serif;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.2rem;
}

.page-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
}

.page-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #c62828, #ef5350);
  border-radius: 3px;
}

.profile-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef5350, #c62828);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  box-shadow: 0 4px 15px rgba(239, 83, 80, 0.3);
  position: relative;
  overflow: hidden;
}

.profile-avatar::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom right, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
  top: 0;
  left: 0;
}

.avatar-initials {
  font-size: 2.2rem;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.profile-info h2 {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.user-role {
  color: #666;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-role::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #4caf50;
  border-radius: 50%;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: #fafbfd;
  border-radius: 12px;
  padding: 1.2rem 0.8rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #c62828;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #ef5350, #c62828);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.9rem;
  color: #546e7a;
  font-weight: 500;
}

.profile-edit-section {
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.profile-edit-section h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
  position: relative;
  padding-left: 1rem;
}

.profile-edit-section h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #ef5350, #c62828);
  border-radius: 3px;
}

/* Novo estilo para exibição de informações */
.info-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-group {
  margin-bottom: 1rem;
  background-color: #fafbfd;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
}

.info-group label {
  display: block;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-value {
  font-size: 1.1rem;
  color: #333;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #fdfdfd;
  color: #333;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-group input:focus {
  border-color: #ef5350;
  outline: none;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(239, 83, 80, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.notification-settings {
  margin-bottom: 2rem;
  background-color: #f8f9fc;
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
}

.form-check {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.form-check input[type="checkbox"] {
  position: relative;
  width: 20px;
  height: 20px;
  margin-right: 0.7rem;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  background-color: white;
  border: 2px solid #b0b9c0;
  border-radius: 5px;
  transition: all 0.25s;
  flex-shrink: 0;
}

.form-check input[type="checkbox"]:checked {
  background-color: #c62828;
  border-color: #c62828;
}

.form-check input[type="checkbox"]:checked::after {
  content: "\2713";
  position: absolute;
  left: 5px;
  top: -1px;
  font-size: 13px;
  color: white;
  font-weight: bold;
}

.form-check label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #546e7a;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.primary-button {
  background: linear-gradient(145deg, #ef5350, #c62828);
  color: white;
  padding: 0.7rem 1.8rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(198, 40, 40, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-button:hover {
  background: linear-gradient(145deg, #d32f2f, #b71c1c);
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(198, 40, 40, 0.35);
}

.primary-button:active {
  transform: translateY(-1px);
}

.primary-button:disabled {
  background: linear-gradient(145deg, #9e9e9e, #bdbdbd);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.secondary-button {
  background-color: #f8f9fa;
  color: #333;
  padding: 0.7rem 1.8rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.secondary-button:hover {
  background-color: #eee;
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.08);
}

/* Tablets */
@media (max-width: 1024px) {
  .page-title {
    font-size: 1.75rem;
    margin-bottom: 1.2rem;
    padding-bottom: 0.8rem;
  }
  
  .profile-card {
    padding: 1.5rem;
  }
  
  .profile-stats {
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    padding: 1.2rem 0.8rem;
  }
  
  .stat-value {
    font-size: 1.7rem;
  }
  
  .stat-label {
    font-size: 0.85rem;
  }
  
  .profile-edit-section h3 {
    font-size: 1.3rem;
    margin-bottom: 1.2rem;
  }
  
  .info-group {
    padding: 0.8rem;
  }
  
  .info-value {
    font-size: 1rem;
  }
}

/* Medium devices (tablets, less than 768px) */
@media (max-width: 768px) {
  .user-page {
    padding: 1.5rem 0;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .profile-card {
    padding: 1.2rem;
    border-radius: 12px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .profile-avatar {
    width: 90px;
    height: 90px;
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .avatar-initials {
    font-size: 2rem;
  }
  
  .profile-info h2 {
    font-size: 1.4rem;
  }
  
  .user-role {
    font-size: 0.9rem;
    justify-content: center;
  }

  .form-actions {
    flex-direction: column;
    margin-top: 1.5rem;
  }

  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    margin-bottom: 1.8rem;
  }
  
  .stat-card {
    padding: 1rem 0.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
    margin-bottom: 0.3rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }

  .info-display {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .notification-settings {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    font-size: 0.9rem;
  }
  
  .form-group input {
    padding: 0.7rem 0.8rem;
    font-size: 0.95rem;
  }
  
  .primary-button, 
  .secondary-button {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
  }
}

/* Small devices (phones, less than 576px) */
@media (max-width: 480px) {
  .user-page {
    padding: 1rem 0;
  }
  
  .container {
    padding: 0 0.8rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .profile-card {
    padding: 1rem;
    border-radius: 10px;
  }
  
  .profile-avatar {
    width: 80px;
    height: 80px;
  }
  
  .avatar-initials {
    font-size: 1.7rem;
  }
  
  .profile-info h2 {
    font-size: 1.2rem;
  }
  
  .profile-edit-section h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  
  .profile-stats {
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }
  
  .stat-value {
    font-size: 1.4rem;
  }
  
  .info-group label {
    font-size: 0.8rem;
  }
  
  .info-value {
    font-size: 0.9rem;
    padding: 0.4rem 0;
  }
  
  .form-group {
    margin-bottom: 1.2rem;
  }
  
  .form-check label {
    font-size: 0.9rem;
  }
  
  .primary-button, 
  .secondary-button {
    width: 100%;
    justify-content: center;
    padding: 0.65rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>
