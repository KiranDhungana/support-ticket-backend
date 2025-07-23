import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all news with pagination and filters
export const getAllNews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', published = '' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { summary: { contains: search as string, mode: 'insensitive' } },
        { author: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (published === 'true') {
      where.isPublished = true;
    } else if (published === 'false') {
      where.isPublished = false;
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.news.count({ where })
    ]);

    res.json({
      data: news,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

// Get published news (public)
export const getPublishedNews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where: { isPublished: true },
        skip,
        take: limitNum,
        orderBy: { publishedAt: 'desc' }
      }),
      prisma.news.count({ where: { isPublished: true } })
    ]);

    res.json({
      data: news,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching published news:', error);
    res.status(500).json({ error: 'Failed to fetch published news' });
  }
};

// Get news by ID
export const getNewsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const news = await prisma.news.findUnique({
      where: { id }
    });

    if (!news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

// Create new news
export const createNews = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      summary,
      author,
      imageUrl,
      isPublished
    } = req.body;

    // Validate required fields
    if (!title || !content || !author) {
      res.status(400).json({ 
        error: 'Title, content, and author are required' 
      });
      return;
    }

    const newsData: any = {
      title,
      content,
      summary: summary || null,
      author,
      imageUrl: imageUrl || null,
      isPublished: isPublished || false
    };

    // Set publishedAt if publishing
    if (isPublished) {
      newsData.publishedAt = new Date();
    }

    const news = await prisma.news.create({
      data: newsData
    });

    res.status(201).json(news);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
};

// Update news
export const updateNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      summary,
      author,
      imageUrl,
      isPublished
    } = req.body;

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id }
    });

    if (!existingNews) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    const updateData: any = {
      title: title || undefined,
      content: content || undefined,
      summary: summary !== undefined ? summary : undefined,
      author: author || undefined,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      isPublished: isPublished !== undefined ? isPublished : undefined
    };

    // Handle publishedAt when publishing
    if (isPublished && !existingNews.isPublished) {
      updateData.publishedAt = new Date();
    } else if (!isPublished) {
      updateData.publishedAt = null;
    }

    const news = await prisma.news.update({
      where: { id },
      data: updateData
    });

    res.json(news);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
};

// Delete news
export const deleteNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id }
    });

    if (!existingNews) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    await prisma.news.delete({
      where: { id }
    });

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
};

// Publish/Unpublish news
export const togglePublishStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id }
    });

    if (!existingNews) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    const updateData: any = {
      isPublished: isPublished
    };

    // Set publishedAt when publishing
    if (isPublished && !existingNews.isPublished) {
      updateData.publishedAt = new Date();
    } else if (!isPublished) {
      updateData.publishedAt = null;
    }

    const news = await prisma.news.update({
      where: { id },
      data: updateData
    });

    res.json(news);
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ error: 'Failed to toggle publish status' });
  }
}; 