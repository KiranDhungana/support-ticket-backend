import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all announcements
export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', priority = '' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { author: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.announcement.count({ where })
    ]);

    res.json({
      data: announcements,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// Get announcement by ID
export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
};

// Create new announcement
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      category,
      priority,
      author,
      imageUrl,
      isActive
    } = req.body;

    // Validate required fields
    if (!title || !content || !category || !priority || !author) {
      return res.status(400).json({ 
        error: 'Title, content, category, priority, and author are required' 
      });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        category,
        priority,
        author,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

// Update announcement
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      category,
      priority,
      author,
      imageUrl,
      isActive
    } = req.body;

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!existingAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title: title || undefined,
        content: content || undefined,
        category: category || undefined,
        priority: priority || undefined,
        author: author || undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    res.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!existingAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    await prisma.announcement.delete({
      where: { id }
    });

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

// Get active announcements
export const getActiveAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(announcements);
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    res.status(500).json({ error: 'Failed to fetch active announcements' });
  }
};

// Get categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.announcement.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories
      .map(c => c.category)
      .filter(Boolean)
      .sort();

    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}; 