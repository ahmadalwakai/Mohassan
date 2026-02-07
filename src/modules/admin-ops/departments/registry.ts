/**
 * Admin Department Registry
 * Central configuration for all admin departments.
 * The sidebar and routing are driven from this registry.
 */

import type { Permission } from '@/core/config/rbac';

export interface AdminDepartment {
  id: string;
  label: string;
  route: string;
  iconName: string; // emoji or icon key
  description: string;
  permissions: Permission[];
  group?: 'core' | 'tools';
}

export const adminDepartments: AdminDepartment[] = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    route: '/admin',
    iconName: '📊',
    description: 'نظرة عامة على الإحصائيات والأنشطة الأخيرة',
    permissions: ['MANAGE_SETTINGS'],
    group: 'core',
  },
  {
    id: 'users',
    label: 'المستخدمين',
    route: '/admin/users',
    iconName: '👥',
    description: 'إدارة المستخدمين والأدوار والحظر والتحذيرات',
    permissions: ['MANAGE_USERS', 'MANAGE_ROLES'],
    group: 'core',
  },
  {
    id: 'content',
    label: 'المحتوى',
    route: '/admin/content',
    iconName: '📝',
    description: 'مراجعة وإدارة جميع المحتويات على المنصة',
    permissions: ['MODERATE_CONTENT'],
    group: 'core',
  },
  {
    id: 'safety',
    label: 'سياسات الأمان',
    route: '/admin/safety',
    iconName: '🛡️',
    description: 'إدارة الكلمات المحظورة والحدود وسياسات السلامة',
    permissions: ['MANAGE_SETTINGS'],
    group: 'core',
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    route: '/admin/settings',
    iconName: '⚙️',
    description: 'إعدادات النظام العامة',
    permissions: ['MANAGE_SETTINGS'],
    group: 'core',
  },
  {
    id: 'audit',
    label: 'سجل المراجعة',
    route: '/admin/audit',
    iconName: '📋',
    description: 'عرض سجل جميع الإجراءات الإدارية',
    permissions: ['VIEW_AUDIT_LOGS'],
    group: 'core',
  },
  {
    id: 'tools-ai',
    label: 'أدوات الذكاء الاصطناعي',
    route: '/admin/tools/ai',
    iconName: '🤖',
    description: 'إدارة إعدادات واستخدام الذكاء الاصطناعي',
    permissions: ['MANAGE_AI_CENTER'],
    group: 'tools',
  },
  {
    id: 'permissions',
    label: 'الصلاحيات',
    route: '/admin/permissions',
    iconName: '🔐',
    description: 'مصفوفة الصلاحيات حسب الأدوار والأقسام',
    permissions: ['MANAGE_SETTINGS'],
  },
];

/**
 * Get departments accessible by a given role's permissions.
 */
export function getDepartmentsForPermissions(
  userPermissions: Permission[]
): AdminDepartment[] {
  return adminDepartments.filter((dept) =>
    dept.permissions.some((p) => userPermissions.includes(p))
  );
}
