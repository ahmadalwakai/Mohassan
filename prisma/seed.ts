/**
 * Seed Script for Mohassan Platform
 * Creates sample data for testing
 */

import { PrismaClient, Role, UserStatus, ContentStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إضافة البيانات التجريبية...');

  // Clear existing data (in order due to relations)
  console.log('🧹 حذف البيانات القديمة...');
  await prisma.contentTag.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.moderationAction.deleteMany();
  await prisma.moderationLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.aIEventLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.content.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 إنشاء المستخدمين...');
  const hashedPassword = await hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'مدير النظام',
      email: 'admin@mohassan.com',
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      bio: 'مدير منصة موحسن',
      location: 'موحسن سيتي',
    },
  });

  const moderator = await prisma.user.create({
    data: {
      name: 'أحمد المشرف',
      email: 'moderator@mohassan.com',
      password: hashedPassword,
      role: Role.MODERATOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      bio: 'مشرف المحتوى في منصة موحسن',
      location: 'موحسن سيتي',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'محمد عبدالله',
      email: 'user1@mohassan.com',
      password: hashedPassword,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      bio: 'مهتم بالتقنية والأعمال',
      location: 'موحسن سيتي',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'فاطمة السعيد',
      email: 'user2@mohassan.com',
      password: hashedPassword,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      bio: 'مصممة ومبدعة',
      location: 'موحسن سيتي',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'خالد العتيبي',
      email: 'user3@mohassan.com',
      password: hashedPassword,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      bio: 'رائد أعمال ومستثمر',
      location: 'موحسن سيتي',
    },
  });

  console.log(`✅ تم إنشاء ${5} مستخدمين`);

  // Create tags
  console.log('🏷️ إنشاء الوسوم...');
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'تقنية', nameAr: 'تقنية', slug: 'technology' } }),
    prisma.tag.create({ data: { name: 'صحة', nameAr: 'صحة', slug: 'health' } }),
    prisma.tag.create({ data: { name: 'تعليم', nameAr: 'تعليم', slug: 'education' } }),
    prisma.tag.create({ data: { name: 'رياضة', nameAr: 'رياضة', slug: 'sports' } }),
    prisma.tag.create({ data: { name: 'ثقافة', nameAr: 'ثقافة', slug: 'culture' } }),
    prisma.tag.create({ data: { name: 'أعمال', nameAr: 'أعمال', slug: 'business' } }),
    prisma.tag.create({ data: { name: 'طعام', nameAr: 'طعام', slug: 'food' } }),
    prisma.tag.create({ data: { name: 'سفر', nameAr: 'سفر', slug: 'travel' } }),
    prisma.tag.create({ data: { name: 'تطوع', nameAr: 'تطوع', slug: 'volunteering' } }),
    prisma.tag.create({ data: { name: 'بيئة', nameAr: 'بيئة', slug: 'environment' } }),
  ]);

  console.log(`✅ تم إنشاء ${tags.length} وسم`);

  // Create news content
  console.log('📰 إنشاء الأخبار...');
  const newsItems = [
    {
      title: 'إطلاق منصة موحسن للمجتمع العربي',
      body: `<p>يسرنا أن نعلن عن إطلاق منصة موحسن، المنصة المجتمعية الأولى من نوعها التي تخدم المجتمع العربي.</p>
<p>تهدف المنصة إلى ربط أفراد المجتمع وتسهيل التواصل والتبادل المعرفي والتجاري بينهم.</p>
<h2>مميزات المنصة</h2>
<ul>
<li>دليل شامل للخدمات والمؤسسات</li>
<li>سوق محلي للبيع والشراء</li>
<li>منتدى مجتمعي للنقاشات</li>
<li>منصة للمبادرات التطوعية</li>
</ul>`,
      excerpt: 'منصة موحسن تجمع الأخبار والدليل والسوق والمبادرات في مكان واحد',
      authorId: admin.id,
      tags: [tags[0].id, tags[5].id],
    },
    {
      title: 'افتتاح مركز صحي جديد في الحي',
      body: `<p>تم افتتاح مركز صحي متكامل في حي النسيم يقدم خدمات طبية متنوعة للسكان.</p>
<p>يضم المركز أقسام متعددة تشمل:</p>
<ul>
<li>العيادات العامة</li>
<li>عيادات الأسنان</li>
<li>المختبر والأشعة</li>
<li>صيدلية متكاملة</li>
</ul>`,
      excerpt: 'مركز صحي جديد يقدم خدمات طبية شاملة لسكان الحي',
      authorId: moderator.id,
      tags: [tags[1].id],
    },
    {
      title: 'انطلاق البرنامج التدريبي للشباب',
      body: `<p>أعلنت جمعية التنمية المحلية عن إطلاق برنامج تدريبي مجاني للشباب في مجالات:</p>
<ul>
<li>البرمجة وتطوير المواقع</li>
<li>التسويق الرقمي</li>
<li>ريادة الأعمال</li>
<li>اللغة الإنجليزية</li>
</ul>
<p>التسجيل متاح حتى نهاية الشهر.</p>`,
      excerpt: 'برنامج تدريبي مجاني للشباب في التقنية والأعمال',
      authorId: user1.id,
      tags: [tags[2].id, tags[0].id],
    },
  ];

  for (const news of newsItems) {
    await prisma.content.create({
      data: {
        type: 'news',
        title: news.title,
        body: news.body,
        excerpt: news.excerpt,
        slug: news.title.replace(/\s+/g, '-').slice(0, 50),
        status: ContentStatus.PUBLISHED,
        authorId: news.authorId,
        publishedAt: new Date(),
        tags: {
          create: news.tags.map(tagId => ({ tagId })),
        },
      },
    });
  }

  console.log(`✅ تم إنشاء ${newsItems.length} خبر`);

  // Create directory entries
  console.log('📋 إنشاء الدليل...');
  const directoryItems = [
    {
      title: 'مطعم الأصالة للمأكولات الشعبية',
      body: `<p>مطعم متخصص في المأكولات الشعبية الأصيلة.</p>
<p>نقدم أشهى الأطباق التقليدية مثل الكبسة والمندي والمطازيز.</p>
<p>أوقات العمل: من 12 ظهراً حتى 12 منتصف الليل</p>`,
      excerpt: 'مطعم للمأكولات الشعبية الأصيلة',
      authorId: user2.id,
      metadata: { location: 'شارع الملك فهد، الرياض', contactInfo: '0501234567', category: 'مطاعم' },
      tags: [tags[6].id],
    },
    {
      title: 'مركز النور للتدريب والتطوير',
      body: `<p>مركز تدريبي معتمد يقدم دورات في:</p>
<ul>
<li>الحاسب الآلي والبرمجة</li>
<li>اللغات</li>
<li>المحاسبة والإدارة</li>
<li>التنمية البشرية</li>
</ul>
<p>شهادات معتمدة من الجهات الرسمية.</p>`,
      excerpt: 'مركز تدريبي معتمد للدورات المهنية',
      authorId: user3.id,
      metadata: { location: 'حي الروضة، جدة', contactInfo: '0507654321', category: 'تعليم' },
      tags: [tags[2].id],
    },
    {
      title: 'مكتب المحامي عبدالرحمن الشمري',
      body: `<p>مكتب محاماة متخصص في:</p>
<ul>
<li>القضايا التجارية</li>
<li>قضايا الأحوال الشخصية</li>
<li>القضايا العمالية</li>
<li>الاستشارات القانونية</li>
</ul>
<p>استشارة مجانية للزيارة الأولى.</p>`,
      excerpt: 'مكتب محاماة واستشارات قانونية',
      authorId: moderator.id,
      metadata: { location: 'برج موحسن، مدينة موحسن', contactInfo: '0509876543', category: 'خدمات قانونية' },
      tags: [tags[5].id],
    },
  ];

  for (const item of directoryItems) {
    await prisma.content.create({
      data: {
        type: 'directory',
        title: item.title,
        body: item.body,
        excerpt: item.excerpt,
        slug: item.title.replace(/\s+/g, '-').slice(0, 50),
        status: ContentStatus.PUBLISHED,
        authorId: item.authorId,
        metadata: item.metadata,
        publishedAt: new Date(),
        tags: {
          create: item.tags.map(tagId => ({ tagId })),
        },
      },
    });
  }

  console.log(`✅ تم إنشاء ${directoryItems.length} إدخال في الدليل`);

  // Create market listings
  console.log('🛒 إنشاء إعلانات السوق...');
  const marketItems = [
    {
      title: 'سيارة تويوتا كامري 2023 للبيع',
      body: `<p>سيارة تويوتا كامري موديل 2023 بحالة ممتازة.</p>
<ul>
<li>اللون: أبيض لؤلؤي</li>
<li>المسافة المقطوعة: 25,000 كم</li>
<li>فل كامل مع جميع الكماليات</li>
<li>ضمان الوكالة ساري</li>
</ul>
<p>السعر قابل للتفاوض للجادين.</p>`,
      excerpt: 'كامري 2023 فل كامل - حالة ممتازة',
      authorId: user1.id,
      metadata: { price: 95000, location: 'الرياض', contactInfo: '0501111111', category: 'سيارات' },
      tags: [tags[5].id],
    },
    {
      title: 'شقة للإيجار في حي الياسمين',
      body: `<p>شقة فاخرة للإيجار السنوي:</p>
<ul>
<li>3 غرف نوم + صالة</li>
<li>2 حمام</li>
<li>مطبخ مجهز</li>
<li>موقف سيارة خاص</li>
</ul>
<p>قريبة من المدارس والخدمات.</p>`,
      excerpt: 'شقة 3 غرف للإيجار السنوي',
      authorId: user2.id,
      metadata: { price: 35000, location: 'حي الياسمين، الرياض', contactInfo: '0502222222', category: 'عقارات' },
      tags: [tags[5].id],
    },
    {
      title: 'لابتوب MacBook Pro M3 جديد',
      body: `<p>ماك بوك برو جديد بالكرتون:</p>
<ul>
<li>شاشة 14 بوصة</li>
<li>معالج M3 Pro</li>
<li>رام 18 جيجا</li>
<li>تخزين 512 SSD</li>
</ul>
<p>ضمان أبل سنة كاملة. السعر نهائي.</p>`,
      excerpt: 'ماك بوك برو M3 جديد بالضمان',
      authorId: user3.id,
      metadata: { price: 8500, location: 'جدة', contactInfo: '0503333333', category: 'إلكترونيات' },
      tags: [tags[0].id],
    },
  ];

  for (const item of marketItems) {
    await prisma.content.create({
      data: {
        type: 'market',
        title: item.title,
        body: item.body,
        excerpt: item.excerpt,
        slug: item.title.replace(/\s+/g, '-').slice(0, 50),
        status: ContentStatus.PUBLISHED,
        authorId: item.authorId,
        metadata: item.metadata,
        publishedAt: new Date(),
        tags: {
          create: item.tags.map(tagId => ({ tagId })),
        },
      },
    });
  }

  console.log(`✅ تم إنشاء ${marketItems.length} إعلان في السوق`);

  // Create community posts
  console.log('👥 إنشاء منشورات المجتمع...');
  const communityItems = [
    {
      title: 'نصائح للحفاظ على الصحة في الصيف',
      body: `<p>مع ارتفاع درجات الحرارة، إليكم بعض النصائح المهمة:</p>
<ol>
<li>شرب كميات كافية من الماء</li>
<li>تجنب التعرض المباشر للشمس</li>
<li>ارتداء ملابس قطنية فاتحة اللون</li>
<li>تناول الفواكه والخضروات الطازجة</li>
<li>استخدام واقي الشمس عند الخروج</li>
</ol>
<p>شاركونا نصائحكم في التعليقات!</p>`,
      excerpt: 'نصائح صحية مهمة لفصل الصيف',
      authorId: user1.id,
      tags: [tags[1].id],
    },
    {
      title: 'تجربتي مع العمل عن بعد',
      body: `<p>بعد سنتين من العمل عن بعد، أشارككم تجربتي:</p>
<h3>الإيجابيات</h3>
<ul>
<li>مرونة في أوقات العمل</li>
<li>توفير وقت وتكاليف المواصلات</li>
<li>قضاء وقت أكثر مع العائلة</li>
</ul>
<h3>التحديات</h3>
<ul>
<li>صعوبة الفصل بين العمل والحياة الشخصية</li>
<li>قلة التواصل المباشر مع الزملاء</li>
</ul>
<p>ما هي تجاربكم؟</p>`,
      excerpt: 'مشاركة تجربة العمل عن بعد - الإيجابيات والتحديات',
      authorId: user2.id,
      tags: [tags[5].id, tags[0].id],
    },
    {
      title: 'أفضل الأماكن السياحية في موحسن',
      body: `<p>أشارككم قائمة بأجمل الأماكن التي زرتها:</p>
<ol>
<li><strong>العلا</strong> - مدائن صالح والطبيعة الخلابة</li>
<li><strong>جدة التاريخية</strong> - البلد القديمة</li>
<li><strong>أبها</strong> - جمال الطبيعة والجبال</li>
<li><strong>الدرعية</strong> - التاريخ والتراث</li>
</ol>
<p>شاركونا وجهاتكم المفضلة!</p>`,
      excerpt: 'قائمة بأجمل الوجهات السياحية في موحسن',
      authorId: user3.id,
      tags: [tags[7].id, tags[4].id],
    },
  ];

  for (const item of communityItems) {
    await prisma.content.create({
      data: {
        type: 'community',
        title: item.title,
        body: item.body,
        excerpt: item.excerpt,
        slug: item.title.replace(/\s+/g, '-').slice(0, 50),
        status: ContentStatus.PUBLISHED,
        authorId: item.authorId,
        publishedAt: new Date(),
        tags: {
          create: item.tags.map(tagId => ({ tagId })),
        },
      },
    });
  }

  console.log(`✅ تم إنشاء ${communityItems.length} منشور مجتمعي`);

  // Create initiatives
  console.log('🌟 إنشاء المبادرات...');
  const initiativeItems = [
    {
      title: 'مبادرة تشجير الحي',
      body: `<p>ندعوكم للمشاركة في مبادرة تشجير حينا:</p>
<h3>الهدف</h3>
<p>زراعة 100 شجرة في الحي خلال شهر واحد.</p>
<h3>كيف تشارك؟</h3>
<ul>
<li>التبرع بشتلات أو أموال لشراء الشتلات</li>
<li>المشاركة في أيام الزراعة</li>
<li>تبني شجرة والعناية بها</li>
</ul>
<p>معاً نجعل حينا أخضر وجميل!</p>`,
      excerpt: 'مبادرة تطوعية لزراعة الأشجار في الحي',
      authorId: user1.id,
      metadata: { location: 'حي النسيم، الرياض', contactInfo: '0504444444', targetAmount: 10000, currentAmount: 3500 },
      tags: [tags[8].id, tags[9].id],
    },
    {
      title: 'مبادرة إفطار صائم',
      body: `<p>مبادرة إفطار صائم في رمضان المبارك:</p>
<h3>نحتاج دعمكم في:</h3>
<ul>
<li>التبرع بوجبات إفطار</li>
<li>التطوع في التوزيع</li>
<li>الدعم المالي</li>
</ul>
<h3>الهدف</h3>
<p>توفير 1000 وجبة يومياً طوال الشهر الكريم.</p>`,
      excerpt: 'مبادرة تطوعية لإفطار الصائمين في رمضان',
      authorId: moderator.id,
      metadata: { location: 'جميع مناطق الرياض', contactInfo: '0505555555', targetAmount: 50000, currentAmount: 28000 },
      tags: [tags[8].id],
    },
    {
      title: 'مبادرة محو الأمية الرقمية',
      body: `<p>تعليم كبار السن استخدام التقنية:</p>
<h3>البرنامج يشمل:</h3>
<ul>
<li>استخدام الجوال الذكي</li>
<li>تطبيقات الدفع الإلكتروني</li>
<li>التواصل عبر الإنترنت</li>
<li>الحماية من الاحتيال الإلكتروني</li>
</ul>
<h3>نحتاج متطوعين:</h3>
<p>لتدريب كبار السن بصبر ومحبة.</p>`,
      excerpt: 'تعليم كبار السن استخدام التقنية الحديثة',
      authorId: user3.id,
      metadata: { location: 'مراكز الأحياء المختلفة', contactInfo: '0506666666' },
      tags: [tags[8].id, tags[0].id, tags[2].id],
    },
  ];

  for (const item of initiativeItems) {
    await prisma.content.create({
      data: {
        type: 'initiative',
        title: item.title,
        body: item.body,
        excerpt: item.excerpt,
        slug: item.title.replace(/\s+/g, '-').slice(0, 50),
        status: ContentStatus.PUBLISHED,
        authorId: item.authorId,
        metadata: item.metadata,
        publishedAt: new Date(),
        tags: {
          create: item.tags.map(tagId => ({ tagId })),
        },
      },
    });
  }

  console.log(`✅ تم إنشاء ${initiativeItems.length} مبادرة`);

  // Create some pending content for moderation testing
  console.log('⏳ إنشاء محتوى في انتظار المراجعة...');
  await prisma.content.create({
    data: {
      type: 'news',
      title: 'خبر في انتظار الموافقة',
      body: '<p>هذا خبر تجريبي في انتظار موافقة المشرفين.</p>',
      excerpt: 'خبر تجريبي للمراجعة',
      slug: 'pending-news-test',
      status: ContentStatus.PENDING,
      authorId: user1.id,
    },
  });

  await prisma.content.create({
    data: {
      type: 'market',
      title: 'إعلان في انتظار المراجعة',
      body: '<p>إعلان تجريبي للاختبار.</p>',
      excerpt: 'إعلان تجريبي',
      slug: 'pending-market-test',
      status: ContentStatus.PENDING,
      authorId: user2.id,
      metadata: { price: 100, location: 'الرياض' },
    },
  });

  console.log('✅ تم إنشاء محتوى للمراجعة');

  // Summary
  console.log('\n📊 ملخص البيانات المضافة:');
  console.log('---------------------------');
  
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.tag.count(),
    prisma.content.count({ where: { type: 'news' } }),
    prisma.content.count({ where: { type: 'directory' } }),
    prisma.content.count({ where: { type: 'market' } }),
    prisma.content.count({ where: { type: 'community' } }),
    prisma.content.count({ where: { type: 'initiative' } }),
    prisma.content.count({ where: { status: ContentStatus.PENDING } }),
  ]);

  console.log(`👥 المستخدمين: ${counts[0]}`);
  console.log(`🏷️ الوسوم: ${counts[1]}`);
  console.log(`📰 الأخبار: ${counts[2]}`);
  console.log(`📋 الدليل: ${counts[3]}`);
  console.log(`🛒 السوق: ${counts[4]}`);
  console.log(`👥 المجتمع: ${counts[5]}`);
  console.log(`🌟 المبادرات: ${counts[6]}`);
  console.log(`⏳ في انتظار المراجعة: ${counts[7]}`);

  console.log('\n✨ تمت إضافة البيانات التجريبية بنجاح!');
  console.log('\n🔑 بيانات الدخول:');
  console.log('---------------------------');
  console.log('مدير: admin@mohassan.com / password123');
  console.log('مشرف: moderator@mohassan.com / password123');
  console.log('مستخدم: user1@mohassan.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
