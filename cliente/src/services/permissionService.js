export const getStoredPermissions = () => {
  try {
    return JSON.parse(sessionStorage.getItem('permissions') || '[]')
  } catch {
    return []
  }
}

export const hasPermission = (permission) =>
  getStoredPermissions().includes(permission)

export const hasAnyPermission = (permissions = []) =>
  permissions.some((permission) => hasPermission(permission))

export const getCurrentDassOffice = () => localStorage.getItem('unidadeDass') || ''
