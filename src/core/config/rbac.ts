/**
 * RBAC Configuration
 * Role-Based Access Control definitions
 */

export const Roles = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const;

export type Role = keyof typeof Roles;

export const Permissions = {
  // Content
  CREATE_CONTENT: 'CREATE_CONTENT',
  EDIT_OWN_CONTENT: 'EDIT_OWN_CONTENT',
  DELETE_OWN_CONTENT: 'DELETE_OWN_CONTENT',
  
  // Reporting
  REPORT_CONTENT: 'REPORT_CONTENT',
  
  // Moderation
  VIEW_QUEUE: 'VIEW_QUEUE',
  VIEW_REPORTS: 'VIEW_REPORTS',
  MODERATE_CONTENT: 'MODERATE_CONTENT',
  WARN_USER: 'WARN_USER',
  HIDE_CONTENT: 'HIDE_CONTENT',
  TEMP_BAN_USER: 'TEMP_BAN_USER',
  
  // Admin
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_ROLES: 'MANAGE_ROLES',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  MANAGE_AI_CENTER: 'MANAGE_AI_CENTER',
  PERM_BAN_USER: 'PERM_BAN_USER',
} as const;

export type Permission = keyof typeof Permissions;

export const RolePermissions: Record<Role, Permission[]> = {
  USER: [
    'CREATE_CONTENT',
    'EDIT_OWN_CONTENT',
    'DELETE_OWN_CONTENT',
    'REPORT_CONTENT',
  ],
  MODERATOR: [
    'CREATE_CONTENT',
    'EDIT_OWN_CONTENT',
    'DELETE_OWN_CONTENT',
    'REPORT_CONTENT',
    'VIEW_QUEUE',
    'VIEW_REPORTS',
    'MODERATE_CONTENT',
    'WARN_USER',
    'HIDE_CONTENT',
    'TEMP_BAN_USER',
  ],
  ADMIN: [
    'CREATE_CONTENT',
    'EDIT_OWN_CONTENT',
    'DELETE_OWN_CONTENT',
    'REPORT_CONTENT',
    'VIEW_QUEUE',
    'VIEW_REPORTS',
    'MODERATE_CONTENT',
    'WARN_USER',
    'HIDE_CONTENT',
    'TEMP_BAN_USER',
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'MANAGE_SETTINGS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_AI_CENTER',
    'PERM_BAN_USER',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return RolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

export function isAtLeastRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Role[] = ['USER', 'MODERATOR', 'ADMIN'];
  const userIndex = roleHierarchy.indexOf(userRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

export function getPermissionsForRole(role: Role): Permission[] {
  return RolePermissions[role] ?? [];
}
