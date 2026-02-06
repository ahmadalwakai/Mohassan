/**
 * Community Guidelines Page
 * Rules and guidelines for community participation
 */

import { Box, Container, VStack, Text, SimpleGrid, HStack } from '@chakra-ui/react';
import { Metadata } from 'next';
import { Card, CardBody } from '@/components/ui';

export const metadata: Metadata = {
  title: 'إرشادات المجتمع',
  description: 'إرشادات وقواعد المشاركة في مجتمع موحسن',
};

const principles = [
  {
    icon: '🤝',
    title: 'الاحترام المتبادل',
    description: 'تعامل مع الجميع باحترام وكرامة',
  },
  {
    icon: '✅',
    title: 'المصداقية',
    description: 'شارك معلومات صحيحة وموثوقة',
  },
  {
    icon: '🛡️',
    title: 'السلامة',
    description: 'احمِ خصوصيتك وخصوصية الآخرين',
  },
  {
    icon: '🌟',
    title: 'الإيجابية',
    description: 'ساهم في بناء مجتمع إيجابي وبناء',
  },
];

const guidelines = [
  {
    title: 'كن محترماً',
    description: 'نحن مجتمع متنوع، وهذا يعني أنك ستتفاعل مع أشخاص من خلفيات مختلفة.',
    rules: [
      'تعامل مع الجميع بلطف واحترام',
      'تجنب الإهانات والشتائم والتعليقات الجارحة',
      'احترم آراء الآخرين حتى لو اختلفت معهم',
      'لا تمارس التنمر أو المضايقة بأي شكل',
      'تجنب التعميمات والصور النمطية',
    ],
  },
  {
    title: 'شارك بمسؤولية',
    description: 'محتواك يؤثر على المجتمع بأكمله، لذا كن مسؤولاً عما تنشره.',
    rules: [
      'تأكد من صحة المعلومات قبل مشاركتها',
      'اذكر المصادر عند نقل الأخبار أو المعلومات',
      'لا تنشر شائعات أو معلومات مضللة',
      'استخدم عناوين واضحة وغير مبالغ فيها',
      'احترم حقوق الملكية الفكرية',
    ],
  },
  {
    title: 'احمِ الخصوصية',
    description: 'خصوصيتك وخصوصية الآخرين أمر مهم.',
    rules: [
      'لا تشارك معلوماتك الشخصية الحساسة',
      'لا تنشر معلومات شخصية للآخرين دون إذنهم',
      'لا تشارك صور أو فيديوهات للآخرين دون موافقتهم',
      'توخَّ الحذر عند مشاركة موقعك',
      'أبلغ عن أي محاولات احتيال أو تصيد',
    ],
  },
  {
    title: 'التزم بالقوانين',
    description: 'المنصة تخضع للقوانين المعمول بها ويجب الالتزام بها.',
    rules: [
      'لا تنشر محتوى غير قانوني',
      'لا تحرض على أنشطة غير قانونية',
      'التزم بقوانين البيع والشراء في السوق',
      'لا تنشر محتوى محمي بحقوق الطبع والنشر',
      'أبلغ عن أي نشاط مشبوه أو غير قانوني',
    ],
  },
];

const prohibited = [
  {
    icon: '🚫',
    title: 'خطاب الكراهية',
    description: 'أي محتوى يحض على الكراهية أو التمييز بناءً على العرق أو الدين أو الجنس أو أي صفة أخرى',
  },
  {
    icon: '⚠️',
    title: 'المحتوى العنيف',
    description: 'المحتوى الذي يمجد العنف أو يحرض عليه أو يعرض مشاهد عنيفة صادمة',
  },
  {
    icon: '🔞',
    title: 'المحتوى الإباحي',
    description: 'أي محتوى جنسي صريح أو إباحي أو موحي بشكل غير لائق',
  },
  {
    icon: '💰',
    title: 'الاحتيال',
    description: 'محاولات الاحتيال أو النصب أو الخداع بأي شكل من الأشكال',
  },
  {
    icon: '📧',
    title: 'البريد العشوائي',
    description: 'نشر محتوى متكرر أو إعلانات غير مرغوب فيها أو روابط مضللة',
  },
  {
    icon: '🎭',
    title: 'انتحال الشخصية',
    description: 'التظاهر بأنك شخص آخر أو جهة رسمية أو ممثل لها',
  },
];

const consequences = [
  { level: 'تحذير', description: 'للمخالفات البسيطة أو الأولى' },
  { level: 'تعليق مؤقت', description: 'للمخالفات المتكررة أو المتوسطة' },
  { level: 'حظر دائم', description: 'للمخالفات الجسيمة أو المتكررة' },
  { level: 'إبلاغ الجهات المختصة', description: 'للأنشطة غير القانونية' },
];

export default function GuidelinesPage() {
  return (
    <Box py={{ base: 8, md: 12 }}>
      <Container maxW="5xl">
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
              إرشادات المجتمع
            </Text>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="rgba(255,255,255,0.7)"
              maxW="3xl"
            >
              نعمل معاً لبناء مجتمع آمن ومحترم وبنّاء للجميع
            </Text>
          </VStack>

          {/* Core Principles */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            {principles.map((principle) => (
              <Card key={principle.title}>
                <CardBody>
                  <VStack gap={2} textAlign="center">
                    <Text fontSize="3xl">{principle.icon}</Text>
                    <Text fontWeight="bold" color="white" fontSize="sm">
                      {principle.title}
                    </Text>
                    <Text color="rgba(255,255,255,0.5)" fontSize="xs">
                      {principle.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Main Guidelines */}
          <VStack gap={6} align="stretch">
            <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
              الإرشادات الرئيسية
            </Text>
            {guidelines.map((guideline) => (
              <Card key={guideline.title}>
                <CardBody>
                  <VStack gap={4} align="start">
                    <VStack gap={1} align="start">
                      <Text fontWeight="bold" color="orange.400" fontSize="lg">
                        {guideline.title}
                      </Text>
                      <Text color="rgba(255,255,255,0.6)" fontSize="sm">
                        {guideline.description}
                      </Text>
                    </VStack>
                    <VStack gap={2} align="start" ps={4}>
                      {guideline.rules.map((rule) => (
                        <HStack key={rule} gap={2} align="start">
                          <Text color="green.400">•</Text>
                          <Text color="rgba(255,255,255,0.7)" fontSize="sm">
                            {rule}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>

          {/* Prohibited Content */}
          <VStack gap={6} align="stretch">
            <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
              المحتوى المحظور
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
              {prohibited.map((item) => (
                <Card key={item.title}>
                  <CardBody>
                    <HStack gap={3} align="start">
                      <Text fontSize="2xl">{item.icon}</Text>
                      <VStack gap={1} align="start">
                        <Text fontWeight="bold" color="red.400" fontSize="sm">
                          {item.title}
                        </Text>
                        <Text color="rgba(255,255,255,0.5)" fontSize="xs">
                          {item.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>

          {/* Consequences */}
          <Card>
            <CardBody>
              <VStack gap={4} align="stretch">
                <Text fontWeight="bold" color="white" fontSize="lg" textAlign="center">
                  العواقب المترتبة على المخالفات
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
                  {consequences.map((item, index) => (
                    <VStack key={item.level} gap={1} textAlign="center">
                      <Text
                        fontWeight="bold"
                        color={
                          index === 0
                            ? 'yellow.400'
                            : index === 1
                            ? 'orange.400'
                            : index === 2
                            ? 'red.400'
                            : 'purple.400'
                        }
                      >
                        {item.level}
                      </Text>
                      <Text color="rgba(255,255,255,0.5)" fontSize="xs">
                        {item.description}
                      </Text>
                    </VStack>
                  ))}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Reporting */}
          <Card>
            <CardBody>
              <VStack gap={4} textAlign="center" py={4}>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  كيفية الإبلاغ عن المخالفات
                </Text>
                <Text color="rgba(255,255,255,0.6)" maxW="2xl">
                  إذا رأيت محتوى يخالف إرشاداتنا، انقر على زر "إبلاغ" الموجود في كل منشور
                  أو تواصل معنا مباشرة. سيقوم فريقنا بمراجعة البلاغ واتخاذ الإجراء المناسب.
                </Text>
                <Text color="rgba(255,255,255,0.5)" fontSize="sm">
                  شكراً لمساعدتك في الحفاظ على مجتمع آمن للجميع
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
