'use client';

import {
  Box, Heading, Text, VStack, HStack, Button, Badge,
} from '@chakra-ui/react';
import { Table, TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui/table';
import { useState, useMemo } from 'react';

// Mirror of rbac.ts — kept inline to avoid import issues in client component
const Roles = ['USER', 'MODERATOR', 'ADMIN'] as const;

const RolePermissions: Record<string, string[]> = {
  USER: [
    'CREATE_CONTENT', 'EDIT_OWN_CONTENT', 'DELETE_OWN_CONTENT', 'REPORT_CONTENT',
  ],
  MODERATOR: [
    'CREATE_CONTENT', 'EDIT_OWN_CONTENT', 'DELETE_OWN_CONTENT', 'REPORT_CONTENT',
    'VIEW_QUEUE', 'VIEW_REPORTS', 'MODERATE_CONTENT', 'WARN_USER', 'HIDE_CONTENT', 'TEMP_BAN_USER',
  ],
  ADMIN: [
    'CREATE_CONTENT', 'EDIT_OWN_CONTENT', 'DELETE_OWN_CONTENT', 'REPORT_CONTENT',
    'VIEW_QUEUE', 'VIEW_REPORTS', 'MODERATE_CONTENT', 'WARN_USER', 'HIDE_CONTENT', 'TEMP_BAN_USER',
    'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_SETTINGS', 'VIEW_AUDIT_LOGS', 'MANAGE_AI_CENTER', 'PERM_BAN_USER',
  ],
};

const departments = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    iconName: '📊',
    permissions: ['MANAGE_SETTINGS'],
  },
  {
    id: 'users',
    label: 'المستخدمين',
    iconName: '👥',
    permissions: ['MANAGE_USERS', 'MANAGE_ROLES'],
  },
  {
    id: 'content',
    label: 'المحتوى',
    iconName: '📝',
    permissions: ['MODERATE_CONTENT'],
  },
  {
    id: 'safety',
    label: 'سياسات الأمان',
    iconName: '🛡️',
    permissions: ['MANAGE_SETTINGS'],
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    iconName: '⚙️',
    permissions: ['MANAGE_SETTINGS'],
  },
  {
    id: 'audit',
    label: 'سجل المراجعة',
    iconName: '📋',
    permissions: ['VIEW_AUDIT_LOGS'],
  },
  {
    id: 'ai-center',
    label: 'مركز الذكاء الاصطناعي',
    iconName: '🤖',
    permissions: ['MANAGE_AI_CENTER'],
  },
  {
    id: 'permissions',
    label: 'الصلاحيات',
    iconName: '🔐',
    permissions: ['MANAGE_SETTINGS'],
  },
];

const allActions = [
  'CREATE_CONTENT', 'EDIT_OWN_CONTENT', 'DELETE_OWN_CONTENT', 'REPORT_CONTENT',
  'VIEW_QUEUE', 'VIEW_REPORTS', 'MODERATE_CONTENT', 'WARN_USER', 'HIDE_CONTENT',
  'TEMP_BAN_USER', 'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_SETTINGS',
  'VIEW_AUDIT_LOGS', 'MANAGE_AI_CENTER', 'PERM_BAN_USER',
];

const actionLabels: Record<string, string> = {
  CREATE_CONTENT: 'إنشاء المحتوى',
  EDIT_OWN_CONTENT: 'تعديل محتواه',
  DELETE_OWN_CONTENT: 'حذف محتواه',
  REPORT_CONTENT: 'الإبلاغ عن محتوى',
  VIEW_QUEUE: 'عرض قائمة الإشراف',
  VIEW_REPORTS: 'عرض البلاغات',
  MODERATE_CONTENT: 'إشراف المحتوى',
  WARN_USER: 'تحذير مستخدم',
  HIDE_CONTENT: 'إخفاء المحتوى',
  TEMP_BAN_USER: 'حظر مؤقت',
  MANAGE_USERS: 'إدارة المستخدمين',
  MANAGE_ROLES: 'إدارة الأدوار',
  MANAGE_SETTINGS: 'إدارة الإعدادات',
  VIEW_AUDIT_LOGS: 'عرض سجل المراجعة',
  MANAGE_AI_CENTER: 'إدارة الذكاء الاصطناعي',
  PERM_BAN_USER: 'حظر دائم',
};

const roleLabels: Record<string, string> = {
  USER: 'مستخدم',
  MODERATOR: 'مشرف',
  ADMIN: 'مسؤول',
};

const roleColors: Record<string, string> = {
  USER: 'blue',
  MODERATOR: 'yellow',
  ADMIN: 'red',
};

export default function AdminPermissionsPage() {
  const [view, setView] = useState<'matrix' | 'departments'>('matrix');

  const exportData = useMemo(() => ({
    exportedAt: new Date().toISOString(),
    roles: Roles.map((r) => ({ role: r, permissions: RolePermissions[r] })),
    departments: departments.map((d) => ({
      id: d.id,
      label: d.label,
      requiredPermissions: d.permissions,
      accessibleBy: Roles.filter((r) =>
        d.permissions.some((p) => RolePermissions[r].includes(p))
      ),
    })),
  }), []);

  function handleExport() {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-snapshot-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <HStack justify="space-between" mb={6}>
          <Heading size="lg" color="text.primary">مصفوفة الصلاحيات</Heading>
          <HStack gap={2}>
            <Button size="sm" variant={view === 'matrix' ? 'solid' : 'outline'}
              colorScheme="blue" onClick={() => setView('matrix')}>مصفوفة الأدوار</Button>
            <Button size="sm" variant={view === 'departments' ? 'solid' : 'outline'}
              colorScheme="blue" onClick={() => setView('departments')}>حسب الأقسام</Button>
            <Button size="sm" colorScheme="green" onClick={handleExport}>
              تصدير JSON
            </Button>
          </HStack>
        </HStack>

        {view === 'matrix' && (
          <Box overflowX="auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeadCell align="right">الصلاحية</TableHeadCell>
                  {Roles.map((role) => (
                    <TableHeadCell key={role} align="center">
                      <Badge colorScheme={roleColors[role]}>{roleLabels[role]}</Badge>
                    </TableHeadCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allActions.map((action) => (
                  <TableRow key={action}>
                    <TableCell align="right">
                      <Text color="text.primary" fontSize="sm">
                        {actionLabels[action] || action}
                      </Text>
                      <Text color="text.secondary" fontSize="xs" fontFamily="mono">
                        {action}
                      </Text>
                    </TableCell>
                    {Roles.map((role) => {
                      const has = RolePermissions[role].includes(action);
                      return (
                        <TableCell key={`${role}-${action}`} align="center">
                          <Text fontSize="lg" color={has ? 'green.400' : 'red.400'}>
                            {has ? '✓' : '✗'}
                          </Text>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {view === 'departments' && (
          <VStack gap={4} align="stretch">
            {departments.map((dept) => {
              const accessibleRoles = Roles.filter((r) =>
                dept.permissions.some((p) => RolePermissions[r].includes(p))
              );
              return (
                <Box key={dept.id} bg="bg.elevated" p={4} borderRadius="md" borderWidth={1} borderColor="border.default">
                  <HStack justify="space-between" mb={2}>
                    <HStack gap={2}>
                      <Text fontSize="xl">{dept.iconName}</Text>
                      <Heading size="sm" color="text.primary">{dept.label}</Heading>
                    </HStack>
                    <HStack gap={1}>
                      {accessibleRoles.map((r) => (
                        <Badge key={r} colorScheme={roleColors[r]}>{roleLabels[r]}</Badge>
                      ))}
                    </HStack>
                  </HStack>
                  <HStack gap={2} flexWrap="wrap">
                    <Text color="text.secondary" fontSize="sm">الصلاحيات المطلوبة:</Text>
                    {dept.permissions.map((p) => (
                      <Badge key={p} variant="outline" fontSize="xs">
                        {actionLabels[p] || p}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      {/* Summary */}
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="md" color="text.primary" mb={4}>ملخص الصلاحيات</Heading>
        <HStack gap={8} flexWrap="wrap">
          {Roles.map((role) => (
            <Box key={role} textAlign="center">
              <Badge colorScheme={roleColors[role]} mb={2} fontSize="md" px={3} py={1}>
                {roleLabels[role]}
              </Badge>
              <Text color="text.primary" fontSize="2xl" fontWeight="bold">
                {RolePermissions[role].length}
              </Text>
              <Text color="text.secondary" fontSize="sm">صلاحية</Text>
            </Box>
          ))}
        </HStack>
      </Box>
    </VStack>
  );
}
