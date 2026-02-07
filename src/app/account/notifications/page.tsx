'use client';

import { Box, Heading, Text, VStack, HStack, Button, Badge, Spinner, Center } from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" mb={6}>
        <HStack justify="space-between" align="flex-start" mb={4}>
          <VStack align="flex-start" gap={2}>
            <Heading size="lg" color="text.primary">
              الإشعارات
            </Heading>
            {unreadCount > 0 && (
              <Badge colorScheme="orange" variant="solid">
                {unreadCount} جديدة
              </Badge>
            )}
          </VStack>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={markAllAsRead}>
              تحديد الكل كمقروء
            </Button>
          )}
        </HStack>
      </Box>

      {/* Notifications List */}
      {loading ? (
        <Center py={12}>
          <Spinner color="brand.500" />
        </Center>
      ) : notifications.length === 0 ? (
        <Box bg="bg.secondary" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" textAlign="center">
          <Text color="text.secondary">
            لا توجد إشعارات
          </Text>
        </Box>
      ) : (
        <VStack gap={3} align="stretch">
          {notifications.map((notification) => (
            <Box
              key={notification.id}
              bg={notification.read ? 'bg.secondary' : 'rgba(249, 115, 22, 0.05)'}
              p={4}
              borderRadius="lg"
              borderWidth={1}
              borderColor={notification.read ? 'border.default' : 'rgba(249, 115, 22, 0.2)'}
              transition="all 200ms"
              _hover={{ borderColor: 'brand.500' }}
            >
              <HStack justify="space-between" align="flex-start">
                <VStack align="flex-start" gap={1} flex={1}>
                  <HStack gap={2}>
                    <Heading size="sm" color="text.primary">
                      {notification.title}
                    </Heading>
                    {!notification.read && (
                      <Box w={2} h={2} borderRadius="full" bg="brand.500" />
                    )}
                  </HStack>
                  <Text color="text.secondary" fontSize="sm">
                    {notification.message}
                  </Text>
                  <Text color="text.muted" fontSize="xs">
                    {new Date(notification.createdAt).toLocaleString('ar-SA')}
                  </Text>
                </VStack>
                <HStack gap={2}>
                  {!notification.read && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                    >
                      مقروء
                    </Button>
                  )}
                  {notification.link && (
                    <Link href={notification.link}>
                      <Button
                        size="xs"
                        colorScheme="brand"
                      >
                        فتح
                      </Button>
                    </Link>
                  )}
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    حذف
                  </Button>
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
