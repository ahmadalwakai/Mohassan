'use client';

import { Box, Heading, Text, VStack, HStack, Button } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <VStack gap={6} align="stretch">
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default">
        <Heading size="lg" color="text.primary" mb={6}>
          الملف الشخصي
        </Heading>
        <HStack gap={6}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            {session?.user?.name?.[0] || 'U'}
          </div>
          <VStack align="start" gap={2}>
            <Heading size="md" color="text.primary">
              {session?.user?.name}
            </Heading>
            <Text color="text.secondary">{session?.user?.email}</Text>
            <Text color="text.muted" fontSize="sm">
              {session?.user?.role}
            </Text>
          </VStack>
        </HStack>
      </Box>
      <Button colorScheme="blue" w="fit-content">
        تعديل الملف الشخصي
      </Button>
    </VStack>
  );
}
