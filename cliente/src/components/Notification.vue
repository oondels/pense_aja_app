<template>
  <div
    id="notification"
    :class="`notification ${notificationBg} ${
      showNotification ? 'show' : 'hidden'
    }`"
  >
    <div class="notification-inner">
      <div class="notification-icon">
        <i :class="notificationIcon"></i>
      </div>
      <div class="notification-content">
        <h3 class="notification-title">{{ notificationTitle }}</h3>
        <p class="notification-message">{{ notificationMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const notificationType = ref("");
const notificationTitle = ref("");
const notificationMessage = ref("");
const showNotification = ref(false);
const notificationIcon = ref("");
const notificationBg = ref("");
const duration = ref(3000);

const showPopup = (type, title, message, time) => {
  notificationType.value = type;
  notificationTitle.value = title;
  notificationMessage.value = message;
  showNotification.value = true;
  if (time) duration.value = time;

  switch (type) {
    case "success":
      notificationIcon.value = "bi bi-check-circle-fill";
      notificationBg.value = "bg-success-subtle text-success-emphasis";
      break;
    case "warning":
      notificationIcon.value = "bi bi-exclamation-triangle-fill";
      notificationBg.value = "bg-warning-subtle text-warning-emphasis";
      break;
    case "error":
      notificationIcon.value = "bi bi-x-circle-fill";
      notificationBg.value = "bg-danger-subtle text-danger-emphasis";
      break;
    default:
      notificationIcon.value = "bi bi-info-circle-fill";
      notificationBg.value = "bg-primary-subtle text-primary-emphasis";
      break;
  }

  setTimeout(() => {
    showNotification.value = false;
  }, duration.value);
  return;
};

defineExpose({
  showPopup,
});
</script>

<style scoped>
.notification {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  width: 90%;
  max-width: 400px;
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  opacity: 0;
  pointer-events: none;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1),
    opacity 0.6s ease-in-out;
}

.notification.show {
  transform: translateX(-50%) translateY(30px);
  opacity: 1;
  pointer-events: auto;
}

.notification.hidden {
  transform: translateX(-50%) translateY(-100%);
  opacity: 0;
  pointer-events: none;
}

.notification-inner {
  display: flex;
  align-items: center;
  padding: 20px;
}

.notification-icon {
  font-size: 32px;
  margin-right: 16px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.notification-message {
  margin: 4px 0 0;
  font-size: 15px;
  line-height: 1.4;
}

/* Regras responsivas para dispositivos móveis */
@media (max-width: 768px) {
  .notification {
    width: 95%;
    max-width: 100%;
    z-index: 10010 !important; /* Garantindo que está acima de outros elementos */
  }

  .notification.show {
    transform: translateX(-50%) translateY(20px) !important;
  }
  
  .notification-inner {
    padding: 15px;
  }
  
  .notification-icon {
    font-size: 24px;
    margin-right: 12px;
  }
  
  .notification-title {
    font-size: 16px;
  }
  
  .notification-message {
    font-size: 14px;
  }
}
</style>
