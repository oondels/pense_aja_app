import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getSessionContext } from '@/services/sessionService.js'

const readPermissions = () => {
  try {
    const stored = sessionStorage.getItem('permissions')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const readRoles = () => {
  try {
    const stored = sessionStorage.getItem('roles')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const readUnitConfig = (unit = localStorage.getItem('unidadeDass')) => {
  if (!unit) return null
  try {
    const stored = localStorage.getItem(`unitConfig:${unit}`)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const matricula = ref('')
  const nome = ref('')
  const setor = ref('')
  const funcao = ref('')
  const usuario = ref('')
  const gerente = ref('')
  const haveEmail = ref(false)
  const formattedUserName = ref('')
  const dassOffice = ref(localStorage.getItem('unidadeDass') || '')
  const permissions = ref(readPermissions())
  const roles = ref(readRoles())
  const sessionContextLoading = ref(false)
  const sessionContextError = ref('')
  const unitConfig = ref(readUnitConfig(dassOffice.value))
  const isAdminMaster = computed(() => roles.value.some((role) => role.code === 'admin_master'))

  const userData = computed(() => ({
    matricula: matricula.value,
    nome: nome.value,
    setor: setor.value,
    funcao: funcao.value,
    usuario: usuario.value,
    gerente: gerente.value,
    unidade: dassOffice.value,
    permissions: permissions.value,
    roles: roles.value,
    unitConfig: unitConfig.value,
  }))

  function carregarUsuario() {
    matricula.value = sessionStorage.getItem('matricula') || ''
    nome.value = sessionStorage.getItem('nome') || ''
    funcao.value = sessionStorage.getItem('funcao') || ''
    usuario.value = sessionStorage.getItem('usuario') || ''
    setor.value = sessionStorage.getItem('setor') || ''
    gerente.value = sessionStorage.getItem('gerente') || ''
    haveEmail.value = sessionStorage.getItem('haveEmail') === 'true'
    dassOffice.value = localStorage.getItem('unidadeDass') || ''
    permissions.value = readPermissions()
    roles.value = readRoles()
    unitConfig.value = readUnitConfig(dassOffice.value)
    formattedUserName.value = formateUserName();
  }

  function limparUsuario() {
    matricula.value = ''
    nome.value = ''
    funcao.value = ''
    usuario.value = ''
    haveEmail.value = false
    permissions.value = []
    roles.value = []
    sessionStorage.removeItem('permissions')
    sessionStorage.removeItem('roles')
    if (dassOffice.value) {
      localStorage.removeItem(`unitConfig:${dassOffice.value}`)
    }
    unitConfig.value = null
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

  function hasPermission(permission) {
    return permissions.value.includes(permission)
  }

  function hasAnyPermission(permissionList = []) {
    return permissionList.some((permission) => hasPermission(permission))
  }

  async function loadSessionContext(unit = localStorage.getItem('unidadeDass')) {
    if (!matricula.value || !unit) {
      return null
    }

    sessionContextLoading.value = true
    sessionContextError.value = ''

    try {
      const context = await getSessionContext(unit)
      dassOffice.value = context.dassOffice
      permissions.value = context.permissions || []
      roles.value = context.roles || []
      unitConfig.value = context.unitConfig || null
      sessionStorage.setItem('permissions', JSON.stringify(permissions.value))
      sessionStorage.setItem('roles', JSON.stringify(roles.value))
      if (unitConfig.value) {
        localStorage.setItem(`unitConfig:${dassOffice.value}`, JSON.stringify(unitConfig.value))
      }
      return context
    } catch (error) {
      sessionContextError.value =
        error.response?.data?.message || 'Não foi possível carregar permissões.'
      permissions.value = []
      roles.value = []
      sessionStorage.removeItem('permissions')
      sessionStorage.removeItem('roles')
      return null
    } finally {
      sessionContextLoading.value = false
    }
  }

  return {
    matricula,
    nome,
    funcao,
    usuario,
    setor,
    gerente,
    haveEmail,
    dassOffice,
    permissions,
    roles,
    isAdminMaster,
    sessionContextLoading,
    sessionContextError,
    unitConfig,
    userData,
    carregarUsuario,
    limparUsuario,
    formattedUserName,
    hasPermission,
    hasAnyPermission,
    loadSessionContext,
  }
})
