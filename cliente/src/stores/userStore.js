import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const matricula = ref('')
  const nome = ref('')
  const funcao = ref('')
  const usuario = ref('')
  const haveEmail = ref(false)
  const formattedUserName = ref('')

  function carregarUsuario() {
    matricula.value = sessionStorage.getItem('matricula') || ''
    nome.value = sessionStorage.getItem('nome') || ''
    funcao.value = sessionStorage.getItem('funcao') || ''
    usuario.value = sessionStorage.getItem('usuario') || ''
    haveEmail.value = sessionStorage.getItem('haveEmail') === 'true'
    formattedUserName.value = formateUserName();
  }

  function limparUsuario() {
    matricula.value = ''
    nome.value = ''
    funcao.value = ''
    usuario.value = ''
    haveEmail.value = false
  }

  function formateUserName() {
    if (usuario.value) {
      const parts = usuario.value.split('@')[0].split('.')
      if (parts.length > 1) {
        return `${parts[0]} ${parts[1]}`
      }
      return parts[0]
    }
    return 'Usuário'
  }

  return { matricula, nome, funcao, usuario, haveEmail, carregarUsuario, limparUsuario, formattedUserName }
})
