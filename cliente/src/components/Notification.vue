<template>
  <div
    id="notification"
    :class="[
      'fixed top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-[90%] max-w-[400px] rounded-xl shadow-2xl z-[10000] opacity-0 pointer-events-none transition-transform duration-700 ease-in-out',
      showNotification ? '!translate-y-8 opacity-100 pointer-events-auto' : '',
      notificationBg
    ]"
  >
    <div class="flex items-center p-5">
      <div class="text-[32px] mr-4 shrink-0">
        <i :class="notificationIcon"></i>
      </div>
      <div class="flex-1">
        <h3 class="m-0 text-lg font-semibold">{{ notificationTitle }}</h3>
        <p class="mt-1 text-sm leading-snug">{{ notificationMessage }}</p>
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
      notificationBg.value = "bg-green-100 text-green-800";
      break;
    case "warning":
      notificationIcon.value = "bi bi-exclamation-triangle-fill";
      notificationBg.value = "bg-yellow-100 text-yellow-800";
      break;
    case "error":
      notificationIcon.value = "bi bi-x-circle-fill";
      notificationBg.value = "bg-red-100 text-red-800";
      break;
    default:
      notificationIcon.value = "bi bi-info-circle-fill";
      notificationBg.value = "bg-blue-100 text-blue-800";
      break;
  }

  setTimeout(() => {
    showNotification.value = false;
  }, duration.value);
};

defineExpose({
  showPopup,
});
</script>

<style scoped>
/* Retido pois Tailwind não cobre essa transição complexa */
#notification {
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1),
              opacity 0.6s ease-in-out;
}
</style>