/**
 * Contact Page
 * Contact information and form
 */

import { Box, Container, VStack, Text, SimpleGrid, HStack } from '@chakra-ui/react';
import { Metadata } from 'next';
import { Card, CardBody } from '@/components/ui';

export const metadata: Metadata = {
  title: 'تواصل معنا',
  description: 'تواصل مع فريق موحسن - نحن هنا لمساعدتك',
};

const contactMethods = [
  {
    icon: '📧',
    title: 'البريد الإلكتروني',
    value: 'support@mohassansy.com',
    description: 'للاستفسارات العامة والدعم الفني',
  },
  {
    icon: '💬',
    title: 'الدردشة المباشرة',
    value: 'متاح على المنصة',
    description: 'تحدث مع فريق الدعم مباشرة',
  },
  {
    icon: '📱',
    title: 'وسائل التواصل',
    value: '@mohassan',
    description: 'تابعنا على منصات التواصل الاجتماعي',
  },
];

const faqItems = [
  {
    question: 'كيف يمكنني إنشاء حساب؟',
    answer: 'يمكنك إنشاء حساب بالنقر على "تسجيل" في أعلى الصفحة وملء البيانات المطلوبة',
  },
  {
    question: 'هل المنصة مجانية؟',
    answer: 'نعم، جميع الخدمات الأساسية مجانية للجميع',
  },
  {
    question: 'كيف أنشر إعلاناً في السوق؟',
    answer: 'بعد تسجيل الدخول، اذهب إلى قسم السوق وانقر على "إضافة إعلان"',
  },
];

export default function ContactPage() {
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="6xl">
        <VStack gap={12} align="stretch">
          {/* Hero Section */}
          <VStack gap={4} textAlign="center">
            <Text
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="bold"
              background="linear-gradient(90deg, #F97316, #7C3AED)"
              bgClip="text"
              color="transparent"
              css={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              تواصل معنا
            </Text>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="rgba(255,255,255,0.7)"
              maxW="2xl"
            >
              نحن هنا لمساعدتك. اختر الطريقة المناسبة للتواصل معنا
            </Text>
          </VStack>

          {/* Contact Methods */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            {contactMethods.map((method) => (
              <Card key={method.title}>
                <CardBody>
                  <VStack gap={4} textAlign="center" py={4}>
                    <Text fontSize="4xl">{method.icon}</Text>
                    <VStack gap={1}>
                      <Text fontWeight="bold" color="white" fontSize="lg">
                        {method.title}
                      </Text>
                      <Text color="orange.400" fontWeight="medium">
                        {method.value}
                      </Text>
                      <Text color="rgba(255,255,255,0.6)" fontSize="sm">
                        {method.description}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Quick FAQ */}
          <VStack gap={6} align="stretch">
            <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
              أسئلة شائعة
            </Text>
            <VStack gap={4} align="stretch">
              {faqItems.map((item) => (
                <Card key={item.question}>
                  <CardBody>
                    <VStack gap={2} align="start">
                      <Text fontWeight="bold" color="white">
                        {item.question}
                      </Text>
                      <Text color="rgba(255,255,255,0.6)" fontSize="sm">
                        {item.answer}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </VStack>

          {/* Response Time */}
          <Card>
            <CardBody>
              <HStack gap={4} justify="center" py={4}>
                <Text fontSize="2xl">⏱️</Text>
                <VStack gap={1} align="start">
                  <Text fontWeight="bold" color="white">
                    وقت الاستجابة
                  </Text>
                  <Text color="rgba(255,255,255,0.6)" fontSize="sm">
                    نسعى للرد على جميع الاستفسارات خلال 24-48 ساعة
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
