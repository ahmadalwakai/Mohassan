/**
 * Dashboard Home Page
 * Overview of user's activity and quick actions
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Box, Flex, Heading, Text, SimpleGrid, VStack, HStack, Container } from '@chakra-ui/react';
import { auth } from '@/lib/auth';
import { Card, CardHeader, CardBody, Button, Avatar, Badge, ContentCardSkeleton } from '@/components/ui';
import { ContentCard } from '@/components/content';
import { prisma } from '@/lib/prisma';

// Quick action cards data
const quickActions = [
  { href: '/create', label: 'إنشاء محتوى', icon: '✏️', description: 'شارك محتوى جديد' },
  { href: '/dashboard/content', label: 'محتواي', icon: '📄', description: 'إدارة منشوراتك' },
  { href: '/dashboard/profile', label: 'الملف الشخصي', icon: '👤', description: 'تعديل بياناتك' },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: '⚙️', description: 'تخصيص حسابك' },
];

// Stats card component
function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <Card>
      <CardBody>
        <HStack justify="space-between" align="start">
          <Box>
            <Text fontSize="sm" color="gray.400">{label}</Text>
            <Text fontSize="2xl" fontWeight="bold">{value}</Text>
          </Box>
          <Text fontSize="2xl">{icon}</Text>
        </HStack>
      </CardBody>
    </Card>
  );
}

// User stats fetcher
async function getUserStats(userId: string) {
  const [
    totalContent,
    publishedContent,
    pendingContent,
    totalViews,
  ] = await Promise.all([
    prisma.content.count({ where: { authorId: userId } }),
    prisma.content.count({ where: { authorId: userId, status: 'PUBLISHED' } }),
    prisma.content.count({ where: { authorId: userId, status: 'PENDING' } }),
    prisma.content.aggregate({
      where: { authorId: userId },
      _sum: { viewCount: true },
    }),
  ]);
  
  return {
    totalContent,
    publishedContent,
    pendingContent,
    totalViews: totalViews._sum.viewCount || 0,
  };
}

// Recent content fetcher
async function getRecentContent(userId: string) {
  return prisma.content.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
    },
  });
}

// Stats section component
async function StatsSection({ userId }: { userId: string }) {
  const stats = await getUserStats(userId);
  
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
      <StatCard label="إجمالي المحتوى" value={stats.totalContent} icon="📊" />
      <StatCard label="منشور" value={stats.publishedContent} icon="✅" />
      <StatCard label="قيد المراجعة" value={stats.pendingContent} icon="⏳" />
      <StatCard label="المشاهدات" value={stats.totalViews.toLocaleString('ar-SA')} icon="👁️" />
    </SimpleGrid>
  );
}

// Recent content section
async function RecentContentSection({ userId }: { userId: string }) {
  const content = await getRecentContent(userId);
  
  if (content.length === 0) {
    return (
      <Card>
        <CardBody textAlign="center" py={8}>
          <Text fontSize="4xl" mb={4}>📝</Text>
          <Text color="gray.400" mb={4}>لم تنشر أي محتوى بعد</Text>
          <Link href="/create">
            <Button variant="primary">ابدأ بنشر محتواك الأول</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
      {content.map((item) => (
        <ContentCard
          key={item.id}
          id={item.id}
          title={item.title}
          type={item.type}
          status={item.status}
          excerpt={item.body?.substring(0, 100)}
          image={item.image}
          viewCount={item.viewCount}
          createdAt={item.createdAt}
          author={{
            id: item.author.id,
            name: item.author.name,
            image: item.author.image,
          }}
          variant="compact"
          showStatus
        />
      ))}
    </SimpleGrid>
  );
}

export const metadata = {
  title: 'لوحة التحكم | موحسن',
  description: 'إدارة حسابك ومحتواك في منصة موحسن',
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;
  
  return (
    <VStack gap={8} align="stretch">
      {/* Welcome section */}
      <Card
        bg="linear-gradient(135deg, rgba(0, 123, 255, 0.2), rgba(0, 255, 0, 0.1))"
        borderColor="blue.500"
      >
        <CardBody>
          <Flex 
            direction={{ base: 'column', sm: 'row' }} 
            align={{ base: 'center', sm: 'start' }}
            gap={4}
          >
            <Avatar
              src={user.image || undefined}
              name={user.name || 'مستخدم'}
              size="xl"
            />
            <Box textAlign={{ base: 'center', sm: 'start' }}>
              <Heading as="h1" size="lg" mb={1}>
                مرحباً، {user.name || 'مستخدم'}
              </Heading>
              <Text color="gray.400" mb={2}>
                {user.email}
              </Text>
              <Badge colorScheme={user.role === 'ADMIN' ? 'red' : user.role === 'MODERATOR' ? 'blue' : 'gray'}>
                {user.role === 'ADMIN' ? 'مدير' : user.role === 'MODERATOR' ? 'مشرف' : 'عضو'}
              </Badge>
            </Box>
          </Flex>
        </CardBody>
      </Card>
      
      {/* Quick actions */}
      <Box>
        <Heading as="h2" size="md" mb={4}>
          إجراءات سريعة
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card
                h="100%"
                _hover={{
                  borderColor: 'brand.500',
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.2s"
              >
                <CardBody textAlign="center">
                  <Text fontSize="2xl" mb={2}>{action.icon}</Text>
                  <Text fontWeight="bold" mb={1}>{action.label}</Text>
                  <Text fontSize="sm" color="gray.400">{action.description}</Text>
                </CardBody>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      </Box>
      
      {/* Stats */}
      <Box>
        <Heading as="h2" size="md" mb={4}>
          إحصائياتك
        </Heading>
        <Suspense fallback={
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardBody>
                  <Box h="60px" />
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        }>
          <StatsSection userId={user.id!} />
        </Suspense>
      </Box>
      
      {/* Recent content */}
      <Box>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading as="h2" size="md">
            آخر محتواك
          </Heading>
          <Link href="/dashboard/content">
            <Button variant="ghost" size="sm">
              عرض الكل ←
            </Button>
          </Link>
        </Flex>
        <Suspense fallback={
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {[1, 2, 3, 4].map((i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </SimpleGrid>
        }>
          <RecentContentSection userId={user.id!} />
        </Suspense>
      </Box>
    </VStack>
  );
}
