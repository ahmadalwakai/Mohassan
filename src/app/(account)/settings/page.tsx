'use client';

import { Box, Heading, VStack, Input, Button } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={6}>
          إعدادات الحساب
        </Heading>

        <VStack gap={4} align="stretch">
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>الاسم</label>
            <Input
              value={session?.user?.name || ''}
              color="text.primary"
              readOnly
              cursor="not-allowed"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>البريد الإلكتروني</label>
            <Input
              value={session?.user?.email || ''}
              color="text.primary"
              readOnly
              cursor="not-allowed"
            />
          </div>

          <Button colorScheme="red" w="fit-content" mt={4}>
            حذف الحساب
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
