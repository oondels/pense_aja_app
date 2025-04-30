<template>
  <footer class="app-footer">
    <div class="footer-container">

      <!-- Linha principal -->
      <div class="footer-main">
        <p class="footer-company">
          Desenvolvido por <strong>{{ company }}</strong> © {{ currentYear }}
        </p>
        <p class="footer-support">
          Suporte: 
          <a :href="`mailto:${supportEmail}`" class="footer-link">{{ supportEmail }}</a>
        </p>
      </div>

      <!-- Links úteis -->
      <div class="footer-links">
        <a href="/privacy-policy" class="footer-link">Política de Privacidade</a>
        <a href="/terms-of-use"    class="footer-link">Termos de Uso</a>
      </div>

      <!-- Redes sociais -->
      <div class="footer-social">
        <a v-for="(item, i) in social" :key="i" :href="item.url" target="_blank" rel="noopener" class="social-icon">
          <img :src="item.icon" :alt="item.name" />
        </a>
      </div>

      <!-- Back to top -->
      <button class="back-to-top" @click="scrollToTop" aria-label="Voltar ao topo">
        ↑
      </button>

    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props configuráveis
const props = defineProps({
  company:     { type: String, default: 'Dass Santo Estêvão' },
  supportEmail:{ type: String, default: 'suporte@dassse.com.br' },
  social: {
    type: Array,
    default: () => [
      { name: 'LinkedIn',    url: 'https://linkedin.com/company/dassse', icon: '/assets/icons/linkedin.svg' },
      { name: 'Instagram',   url: 'https://instagram.com/dassse',    icon: '/assets/icons/instagram.svg' },
      { name: 'Facebook',    url: 'https://facebook.com/dassse',     icon: '/assets/icons/facebook.svg' }
    ]
  }
})

// Ano corrente
const currentYear = new Date().getFullYear()

// Scroll suave ao topo
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.app-footer {
  background-color: #111;
  color: #eee;
  padding: 2rem 1rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  position: relative;
}

/* Área principal */
.footer-main {
  text-align: center;
}
.footer-company {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.footer-support {
  font-size: 0.9rem;
}

/* Links de políticas */
.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}
.footer-link {
  color: #aaf;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.footer-link:hover {
  color: #fff;
}

/* Ícones sociais */
.footer-social {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.social-icon img {
  width: 24px;
  height: 24px;
  filter: invert(1);
  transition: transform 0.2s;
}
.social-icon:hover img {
  transform: scale(1.1);
}

/* Botão voltar ao topo */
.back-to-top {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  background: rgba(255,255,255,0.1);
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s, transform 0.2s;
}
.back-to-top:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-2px);
}

/* Responsividade */
@media (min-width: 640px) {
  .footer-container {
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }
  .footer-main {
    text-align: left;
  }
  .footer-links {
    order: 2;
  }
  .footer-social {
    justify-content: flex-end;
  }
}
</style>
