/**
 * FAQ Page
 * Frequently Asked Questions
 */

import { Box, Container, VStack, Text } from '@chakra-ui/react';
import { Metadata } from 'next';
import { Card, CardBody } from '@/components/ui';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة',
  description: 'إجابات على الأسئلة الأكثر شيوعاً حول منصة موحسن',
};

const faqCategories = [
  {
    title: 'الحساب والتسجيل',
    items: [
      {
        question: 'كيف يمكنني إنشاء حساب جديد؟',
        answer: 'انقر على زر "تسجيل" في أعلى الصفحة، ثم أدخل بريدك الإلكتروني وكلمة المرور واسمك. ستتلقى رسالة تأكيد على بريدك الإلكتروني.',
      },
      {
        question: 'نسيت كلمة المرور، ماذا أفعل؟',
        answer: 'انقر على "نسيت كلمة المرور" في صفحة تسجيل الدخول، ثم أدخل بريدك الإلكتروني وستتلقى رابطاً لإعادة تعيين كلمة المرور.',
      },
      {
        question: 'كيف يمكنني تعديل معلومات حسابي؟',
        answer: 'بعد تسجيل الدخول، اذهب إلى "الإعدادات" من القائمة الجانبية لتعديل معلوماتك الشخصية وصورتك.',
      },
      {
        question: 'هل يمكنني حذف حسابي؟',
        answer: 'نعم، يمكنك طلب حذف حسابك من خلال صفحة الإعدادات. سيتم حذف جميع بياناتك بشكل نهائي.',
      },
    ],
  },
  {
    title: 'الأخبار والمحتوى',
    items: [
      {
        question: 'كيف يمكنني نشر خبر؟',
        answer: 'بعد تسجيل الدخول، اذهب إلى قسم الأخبار وانقر على "إضافة خبر". اكتب عنوان الخبر ومحتواه ثم انقر على "نشر".',
      },
      {
        question: 'هل يتم مراجعة المحتوى قبل النشر؟',
        answer: 'بعض المحتوى يتم نشره مباشرة، بينما قد يحتاج بعضه الآخر لمراجعة من فريق الإشراف للتأكد من التزامه بإرشادات المجتمع.',
      },
      {
        question: 'كيف أبلغ عن محتوى مخالف؟',
        answer: 'انقر على زر "الإبلاغ" الموجود في كل منشور، واختر سبب الإبلاغ. سيقوم فريقنا بمراجعة البلاغ واتخاذ الإجراء المناسب.',
      },
    ],
  },
  {
    title: 'السوق والإعلانات',
    items: [
      {
        question: 'كيف أنشر إعلاناً في السوق؟',
        answer: 'اذهب إلى قسم السوق، انقر على "إضافة إعلان"، ثم اختر الفئة المناسبة واكتب تفاصيل إعلانك مع إضافة الصور.',
      },
      {
        question: 'هل هناك رسوم على نشر الإعلانات؟',
        answer: 'نشر الإعلانات الأساسية مجاني. قد تتوفر خيارات مدفوعة لتمييز إعلانك في المستقبل.',
      },
      {
        question: 'كيف أتواصل مع صاحب الإعلان؟',
        answer: 'يمكنك التواصل مع صاحب الإعلان من خلال معلومات الاتصال المعروضة في الإعلان أو عبر نظام الرسائل الداخلي.',
      },
    ],
  },
  {
    title: 'الدليل',
    items: [
      {
        question: 'كيف أضيف مكاناً أو خدمة للدليل؟',
        answer: 'اذهب إلى قسم الدليل وانقر على "إضافة". اكتب اسم المكان وعنوانه ومعلومات الاتصال والوصف.',
      },
      {
        question: 'كيف يمكنني تقييم مكان في الدليل؟',
        answer: 'افتح صفحة المكان وستجد خيار التقييم والتعليق. يمكنك إضافة تقييمك ومشاركة تجربتك.',
      },
    ],
  },
  {
    title: 'المجتمع والمبادرات',
    items: [
      {
        question: 'كيف أشارك في المبادرات التطوعية؟',
        answer: 'تصفح قسم المبادرات واختر المبادرة التي تناسبك، ثم انقر على "انضم" للتسجيل كمتطوع.',
      },
      {
        question: 'كيف أنشئ مبادرة جديدة؟',
        answer: 'اذهب إلى قسم المبادرات وانقر على "إنشاء مبادرة". اكتب تفاصيل المبادرة وأهدافها واحتياجاتك من المتطوعين.',
      },
    ],
  },
  {
    title: 'الخصوصية والأمان',
    items: [
      {
        question: 'كيف تحمون بياناتي الشخصية؟',
        answer: 'نستخدم تقنيات تشفير متقدمة لحماية بياناتك. راجع سياسة الخصوصية للمزيد من التفاصيل.',
      },
      {
        question: 'من يمكنه رؤية ملفي الشخصي؟',
        answer: 'يمكنك التحكم في إعدادات الخصوصية من صفحة الإعدادات لتحديد من يمكنه رؤية معلوماتك.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="4xl">
        <VStack gap={10} align="stretch">
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
              الأسئلة الشائعة
            </Text>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="rgba(255,255,255,0.7)"
            >
              إجابات على الأسئلة الأكثر شيوعاً
            </Text>
          </VStack>

          {/* FAQ Categories */}
          <VStack gap={8} align="stretch">
            {faqCategories.map((category) => (
              <VStack key={category.title} gap={4} align="stretch">
                <Text fontSize="xl" fontWeight="bold" color="orange.400">
                  {category.title}
                </Text>
                <VStack gap={3} align="stretch">
                  {category.items.map((item) => (
                    <Card key={item.question}>
                      <CardBody>
                        <VStack gap={2} align="start">
                          <Text fontWeight="bold" color="white">
                            {item.question}
                          </Text>
                          <Text color="rgba(255,255,255,0.6)" fontSize="sm" lineHeight="tall">
                            {item.answer}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </VStack>
            ))}
          </VStack>

          {/* Contact CTA */}
          <Card>
            <CardBody>
              <VStack gap={3} textAlign="center" py={4}>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  لم تجد إجابة لسؤالك؟
                </Text>
                <Text color="rgba(255,255,255,0.6)">
                  تواصل معنا وسنكون سعداء بمساعدتك
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
