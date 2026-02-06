/**
 * Profile Page
 * User profile view and edit
 */

'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Flex, Heading, Text, VStack, HStack, Separator } from '@chakra-ui/react';
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Textarea, Avatar } from '@/components/ui';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  
  // Load profile data on mount
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setName(data.name || '');
        setBio(data.bio || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }, []);
  
  useState(() => {
    loadProfile();
  });
  
  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, phone, location }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل في حفظ الملف الشخصي');
      }
      
      // Update session
      await update({ name });
      
      setSuccess('تم حفظ الملف الشخصي بنجاح');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    loadProfile();
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <VStack gap={6} align="stretch" maxW="800px">
      {/* Header */}
      <Box>
        <Heading as="h1" size="lg" mb={1}>
          الملف الشخصي
        </Heading>
        <Text color="gray.400">
          عرض وتعديل معلوماتك الشخصية
        </Text>
      </Box>
      
      {/* Success/Error messages */}
      {success && (
        <Card bg="green.900/20" borderColor="green.500">
          <CardBody>
            <Text color="green.300">{success}</Text>
          </CardBody>
        </Card>
      )}
      
      {error && (
        <Card bg="red.900/20" borderColor="red.500">
          <CardBody>
            <Text color="red.300">{error}</Text>
          </CardBody>
        </Card>
      )}
      
      {/* Profile card */}
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading as="h2" size="md">معلومات الحساب</Heading>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                تعديل
              </Button>
            )}
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack gap={6} align="stretch">
            {/* Avatar section */}
            <Flex 
              direction={{ base: 'column', sm: 'row' }} 
              align={{ base: 'center', sm: 'start' }}
              gap={4}
            >
              <Avatar
                src={user.image || undefined}
                name={name || 'مستخدم'}
                size="xl"
              />
              <Box textAlign={{ base: 'center', sm: 'start' }}>
                <Text fontWeight="bold" mb={1}>{name || 'مستخدم'}</Text>
                <Text fontSize="sm" color="gray.400" mb={2}>{user.email}</Text>
                <Text fontSize="xs" color="gray.500">
                  يتم تحديث الصورة تلقائياً من حساب Google
                </Text>
              </Box>
            </Flex>
            
            <Separator />
            
            {/* Profile fields */}
            {isEditing ? (
              <VStack gap={4} align="stretch">
                <Input
                  label="الاسم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك الكامل"
                />
                
                <Textarea
                  label="نبذة عنك"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة قصيرة عنك..."
                  rows={4}
                />
                
                <Input
                  label="رقم الهاتف"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم هاتفك (اختياري)"
                />
                
                <Input
                  label="الموقع"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="مدينتك أو منطقتك (اختياري)"
                />
              </VStack>
            ) : (
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontSize="sm" color="gray.400" mb={1}>الاسم</Text>
                  <Text>{name || 'غير محدد'}</Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.400" mb={1}>نبذة عنك</Text>
                  <Text color={bio ? 'white' : 'gray.500'}>
                    {bio || 'لم يتم إضافة نبذة'}
                  </Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.400" mb={1}>رقم الهاتف</Text>
                  <Text color={phone ? 'white' : 'gray.500'}>
                    {phone || 'غير محدد'}
                  </Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.400" mb={1}>الموقع</Text>
                  <Text color={location ? 'white' : 'gray.500'}>
                    {location || 'غير محدد'}
                  </Text>
                </Box>
              </VStack>
            )}
          </VStack>
        </CardBody>
        
        {isEditing && (
          <CardFooter>
            <HStack justify="flex-end" gap={2}>
              <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
                إلغاء
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                isLoading={isSaving}
                loadingText="جاري الحفظ..."
              >
                حفظ التغييرات
              </Button>
            </HStack>
          </CardFooter>
        )}
      </Card>
      
      {/* Account info card */}
      <Card>
        <CardHeader>
          <Heading as="h2" size="md">معلومات الحساب</Heading>
        </CardHeader>
        <CardBody>
          <VStack gap={4} align="stretch">
            <Flex justify="space-between">
              <Text color="gray.400">البريد الإلكتروني</Text>
              <Text>{user.email}</Text>
            </Flex>
            
            <Separator />
            
            <Flex justify="space-between">
              <Text color="gray.400">نوع الحساب</Text>
              <Text>
                {user.role === 'ADMIN' ? 'مدير' : user.role === 'MODERATOR' ? 'مشرف' : 'عضو'}
              </Text>
            </Flex>
            
            <Separator />
            
            <Flex justify="space-between">
              <Text color="gray.400">طريقة تسجيل الدخول</Text>
              <Text>Google</Text>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
