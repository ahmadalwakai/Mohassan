/**
 * Content Service Layer
 * Handles all content-related business logic
 */

import { prisma } from '@/core/db/prisma';
import { ContentStatus, Prisma } from '@prisma/client';

// Content types supported by the platform
export type ContentType = 'news' | 'directory' | 'market' | 'community' | 'initiative';

export interface CreateContentInput {
  type: ContentType;
  title: string;
  body: string;
  excerpt?: string;
  featuredImage?: string;
  images?: string[];
  metadata?: Record<string, unknown>;
  tags?: string[];
  authorId: string;
}

export interface UpdateContentInput {
  title?: string;
  body?: string;
  excerpt?: string;
  featuredImage?: string;
  images?: string[];
  metadata?: Record<string, unknown>;
  tags?: string[];
  status?: ContentStatus;
}

export interface ContentFilters {
  type?: ContentType;
  status?: ContentStatus;
  authorId?: string;
  tagSlug?: string;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\u0600-\u06FF\w\-]/g, '') // Keep Arabic chars, alphanumeric, and hyphens
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Make slug unique by appending a number if needed
async function makeSlugUnique(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.content.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

export const contentService = {
  /**
   * Create new content
   */
  async create(input: CreateContentInput) {
    const { tags, ...data } = input;
    
    const slug = await makeSlugUnique(generateSlug(data.title));
    
    // Create or connect tags
    const tagConnections = tags?.length
      ? await Promise.all(
          tags.map(async (tagName) => {
            const tagSlug = generateSlug(tagName);
            return prisma.tag.upsert({
              where: { slug: tagSlug },
              create: { name: tagName, slug: tagSlug },
              update: {},
            });
          })
        )
      : [];

    const content = await prisma.content.create({
      data: {
        type: data.type,
        title: data.title,
        body: data.body,
        excerpt: data.excerpt || data.body.substring(0, 200),
        image: data.featuredImage,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
        authorId: data.authorId,
        slug,
        status: ContentStatus.PENDING, // Requires moderation
        tags: tagConnections.length
          ? { 
              create: tagConnections.map((t) => ({ 
                tag: { connect: { id: t.id } } 
              })) 
            }
          : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    return content;
  },

  /**
   * Update existing content
   */
  async update(id: string, input: UpdateContentInput, userId: string, isAdmin = false) {
    const { tags, ...data } = input;

    // Get current content
    const current = await prisma.content.findUnique({
      where: { id },
      select: { authorId: true, status: true },
    });

    if (!current) {
      throw new Error('المحتوى غير موجود');
    }

    // Check ownership (unless admin)
    if (!isAdmin && current.authorId !== userId) {
      throw new Error('غير مصرح لك بتعديل هذا المحتوى');
    }

    // Handle tag updates
    let tagConnections;
    if (tags !== undefined) {
      tagConnections = tags.length
        ? await Promise.all(
            tags.map(async (tagName) => {
              const tagSlug = generateSlug(tagName);
              return prisma.tag.upsert({
                where: { slug: tagSlug },
                create: { name: tagName, slug: tagSlug },
                update: {},
              });
            })
          )
        : [];
    }

    // If content is edited after being published, set back to pending for review
    const newStatus = 
      !isAdmin && current.status === ContentStatus.PUBLISHED && Object.keys(data).length > 0
        ? ContentStatus.PENDING
        : data.status || current.status;

    // First, delete existing tags if updating
    if (tagConnections !== undefined) {
      await prisma.contentTag.deleteMany({
        where: { contentId: id },
      });
    }

    const content = await prisma.content.update({
      where: { id },
      data: {
        title: data.title,
        body: data.body,
        excerpt: data.excerpt,
        image: data.featuredImage,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
        status: newStatus,
        ...(tagConnections !== undefined && tagConnections.length > 0
          ? {
              tags: {
                create: tagConnections.map((t) => ({ 
                  tag: { connect: { id: t.id } } 
                })),
              },
            }
          : {}),
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    return content;
  },

  /**
   * Delete content (soft delete by setting status to REJECTED)
   */
  async delete(id: string, userId: string, isAdmin = false) {
    const content = await prisma.content.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!content) {
      throw new Error('المحتوى غير موجود');
    }

    if (!isAdmin && content.authorId !== userId) {
      throw new Error('غير مصرح لك بحذف هذا المحتوى');
    }

    // Soft delete
    await prisma.content.update({
      where: { id },
      data: { status: ContentStatus.REJECTED },
    });

    return { success: true };
  },

  /**
   * Get single content by ID or slug
   */
  async getOne(idOrSlug: string, incrementView = false) {
    const content = await prisma.content.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (content && incrementView) {
      await prisma.content.update({
        where: { id: content.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return content;
  },

  /**
   * List content with filters and pagination
   */
  async list(filters: ContentFilters = {}, pagination: PaginationOptions = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;

    const skip = (page - 1) * limit;

    const where: Prisma.ContentWhereInput = {
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.authorId && { authorId: filters.authorId }),
      ...(filters.tagSlug && {
        tags: { some: { tag: { slug: filters.tagSlug } } },
      }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { body: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
          tags: {
            include: { tag: true },
          },
        },
      }),
      prisma.content.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + items.length < total,
      },
    };
  },

  /**
   * Get content by type for public display (only published)
   */
  async getPublicByType(type: ContentType, pagination: PaginationOptions = {}) {
    return this.list(
      { type, status: ContentStatus.PUBLISHED },
      pagination
    );
  },

  /**
   * Get user's content (all statuses)
   */
  async getUserContent(userId: string, pagination: PaginationOptions = {}) {
    return this.list({ authorId: userId }, pagination);
  },

  /**
   * Get pending content for moderation
   */
  async getPendingForModeration(pagination: PaginationOptions = {}) {
    return this.list({ status: ContentStatus.PENDING }, pagination);
  },

  /**
   * Approve content (moderator action)
   */
  async approve(id: string, moderatorId: string) {
    const content = await prisma.content.update({
      where: { id },
      data: { 
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        type: 'UNHIDE',
        reason: 'تمت الموافقة على المحتوى',
        moderatorId,
        targetContentId: id,
        targetUserId: content.authorId,
      },
    });

    return content;
  },

  /**
   * Reject content (moderator action)
   */
  async reject(id: string, moderatorId: string, reason: string) {
    const content = await prisma.content.update({
      where: { id },
      data: { 
        status: ContentStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        type: 'HIDE',
        reason,
        moderatorId,
        targetContentId: id,
        targetUserId: content.authorId,
      },
    });

    // Notify author
    await prisma.notification.create({
      data: {
        type: 'CONTENT',
        title: 'تم رفض المحتوى',
        message: `تم رفض محتواك "${content.title}" للسبب التالي: ${reason}`,
        userId: content.authorId,
      },
    });

    return content;
  },
};
