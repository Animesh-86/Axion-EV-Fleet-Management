/** Last-opened vehicle for “Digital Twin” sidebar shortcut */
export const LAST_VEHICLE_STORAGE_KEY = 'axion_last_vehicle_id';

export const paths = {
  landing: '/',
  login: '/login',
  signup: '/signup',
  architecture: '/architecture',
  dashboard: '/dashboard',
  vehicles: '/vehicles',
  vehicle: (id: string) => `/vehicles/${encodeURIComponent(id)}`,
  ota: '/ota',
  analytics: '/analytics',
  alerts: '/alerts',
  system: '/system',
  auditLogs: '/audit-logs',
  settings: '/settings',
  adminAddVehicle: '/admin/add-vehicle',
} as const;
