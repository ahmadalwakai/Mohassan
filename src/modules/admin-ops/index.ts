/**
 * Admin Operations Module
 * Administrative functions
 */

export const ADMIN_OPS_MODULE = 'admin-ops';

export { adminDepartments, getDepartmentsForPermissions } from './departments/registry';
export type { AdminDepartment } from './departments/registry';
