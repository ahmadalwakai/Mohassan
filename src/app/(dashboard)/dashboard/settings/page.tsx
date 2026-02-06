/**
 * Settings Page
 * User account settings
 */

'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Heading, Text, VStack, HStack, Separator } from '@chakra-ui/react';
import { Card, CardHeader, CardBody, Button, Modal } from '@/components/ui';

// Simple toggle button component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: '48px',
        height: '26px',
        backgroundColor: checked ? 'var(--chakra-colors-brand-500, #4169E1)' : '#4A5568',
        borderRadius: '9999px',
        position: 'relative',
        transition: 'background 0.2s',
        cursor: 'pointer',
        border: 'none',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '25px' : '3px',
          width: '20px',
          height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: 'left 0.2s',
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Notification preferences (stored in localStorage for now)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل في حذف الحساب');
      }
      
      // Sign out and redirect
      await signOut({ redirect: false });
      router.push('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };
  
  return (
    <VStack gap={6} align="stretch" maxW="800px">
      {/* Header */}
      <Box>
        <Heading as="h1" size="lg" mb={1}>
          الإعدادات
        </Heading>
        <Text color="gray.400">
          إدارة إعدادات حسابك والتفضيلات
        </Text>
      </Box>
      
      {/* Notification settings */}
      <Card>
        <CardHeader>
          <Heading as="h2" size="md">الإشعارات</Heading>
        </CardHeader>
        <CardBody>
          <VStack gap={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium">إشعارات البريد الإلكتروني</Text>
                <Text fontSize="sm" color="gray.400">
                  استلم إشعارات حول نشاط حسابك
                </Text>
              </Box>
              <Toggle
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
            </Flex>
            
            <Separator />
            
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium">رسائل تسويقية</Text>
                <Text fontSize="sm" color="gray.400">
                  استلم تحديثات وعروض من موحسن
                </Text>
              </Box>
              <Toggle
                checked={marketingEmails}
                onChange={setMarketingEmails}
              />
            </Flex>
          </VStack>
        </CardBody>
      </Card>
      
      {/* Appearance settings */}
      <Card>
        <CardHeader>
          <Heading as="h2" size="md">المظهر</Heading>
        </CardHeader>
        <CardBody>
          <VStack gap={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium">الوضع المظلم</Text>
                <Text fontSize="sm" color="gray.400">
                  تفعيل الوضع المظلم للتطبيق
                </Text>
              </Box>
              <Box opacity={0.5}>
                <Toggle
                  checked={true}
                  onChange={() => {}}
                />
              </Box>
            </Flex>
            <Text fontSize="xs" color="gray.500">
              * الوضع المظلم هو الوضع الافتراضي حالياً
            </Text>
          </VStack>
        </CardBody>
      </Card>
      
      {/* Privacy settings */}
      <Card>
        <CardHeader>
          <Heading as="h2" size="md">الخصوصية</Heading>
        </CardHeader>
        <CardBody>
          <VStack gap={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium">إظهار الملف الشخصي</Text>
                <Text fontSize="sm" color="gray.400">
                  السماح للآخرين برؤية ملفك الشخصي
                </Text>
              </Box>
              <Toggle
                checked={true}
                onChange={() => {}}
              />
            </Flex>
            
            <Separator />
            
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium">إظهار البريد الإلكتروني</Text>
                <Text fontSize="sm" color="gray.400">
                  السماح للآخرين برؤية بريدك الإلكتروني
                </Text>
              </Box>
              <Toggle
                checked={false}
                onChange={() => {}}
              />
            </Flex>
          </VStack>
        </CardBody>
      </Card>
      
      {/* Session management */}
      <Card>
        <CardHeader>
          <Heading as="h2" size="md">الجلسة</Heading>
        </CardHeader>
        <CardBody>
          <VStack gap={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium">تسجيل الخروج</Text>
                <Text fontSize="sm" color="gray.400">
                  تسجيل الخروج من هذا الجهاز
                </Text>
              </Box>
              <Button variant="outline" onClick={handleSignOut}>
                تسجيل الخروج
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
      
      {/* Danger zone */}
      <Card borderColor="red.500">
        <CardHeader>
          <Heading as="h2" size="md" color="red.400">
            منطقة الخطر
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack gap={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="medium">حذف الحساب</Text>
                <Text fontSize="sm" color="gray.400">
                  حذف حسابك وجميع بياناتك نهائياً
                </Text>
              </Box>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                حذف الحساب
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
      
      {/* Delete account modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="تأكيد حذف الحساب"
        size="md"
      >
        <VStack gap={4} align="stretch">
          <Text>
            هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك ومحتواك نهائياً.
          </Text>
          <Text fontWeight="bold" color="red.400">
            لا يمكن التراجع عن هذا الإجراء.
          </Text>
          
          {deleteError && (
            <Text color="red.300" fontSize="sm">{deleteError}</Text>
          )}
          
          <HStack justify="flex-end" gap={2}>
            <Button 
              variant="ghost" 
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button 
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
              loadingText="جاري الحذف..."
            >
              نعم، احذف حسابي
            </Button>
          </HStack>
        </VStack>
      </Modal>
    </VStack>
  );
}
