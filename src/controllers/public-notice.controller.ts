import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllPublicNotices = async (req: any, res: any) => {
  try {
    const notices = await prisma.publicNotice.findMany({
      orderBy: {
        date: 'desc'
      }
    });

    res.json(notices);
  } catch (error) {
    console.error('Error fetching public notices:', error);
    res.status(500).json({ error: 'Failed to fetch public notices' });
  }
};

export const getPublicNoticeById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const notice = await prisma.publicNotice.findUnique({
      where: { id }
    });

    if (!notice) {
      return res.status(404).json({ error: 'Public notice not found' });
    }

    res.json(notice);
  } catch (error) {
    console.error('Error fetching public notice:', error);
    res.status(500).json({ error: 'Failed to fetch public notice' });
  }
};

export const createPublicNotice = async (req: any, res: any) => {
  try {
    const { title, description, category, author, pdfUrl, fileSize } = req.body;

    if (!title || !description || !category || !author || !pdfUrl || !fileSize) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const notice = await prisma.publicNotice.create({
      data: {
        title,
        description,
        category,
        author,
        pdfUrl,
        fileSize,
        date: new Date()
      }
    });

    res.status(201).json(notice);
  } catch (error) {
    console.error('Error creating public notice:', error);
    res.status(500).json({ error: 'Failed to create public notice' });
  }
};

export const updatePublicNotice = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, description, category, author, pdfUrl, fileSize } = req.body;

    const existingNotice = await prisma.publicNotice.findUnique({
      where: { id }
    });

    if (!existingNotice) {
      return res.status(404).json({ error: 'Public notice not found' });
    }

    const updatedNotice = await prisma.publicNotice.update({
      where: { id },
      data: {
        title: title || existingNotice.title,
        description: description || existingNotice.description,
        category: category || existingNotice.category,
        author: author || existingNotice.author,
        pdfUrl: pdfUrl || existingNotice.pdfUrl,
        fileSize: fileSize || existingNotice.fileSize
      }
    });

    res.json(updatedNotice);
  } catch (error) {
    console.error('Error updating public notice:', error);
    res.status(500).json({ error: 'Failed to update public notice' });
  }
};

export const deletePublicNotice = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const existingNotice = await prisma.publicNotice.findUnique({
      where: { id }
    });

    if (!existingNotice) {
      return res.status(404).json({ error: 'Public notice not found' });
    }

    await prisma.publicNotice.delete({
      where: { id }
    });

    res.json({ message: 'Public notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting public notice:', error);
    res.status(500).json({ error: 'Failed to delete public notice' });
  }
};

export const getPublicNoticesByCategory = async (req: any, res: any) => {
  try {
    const { category } = req.params;

    const notices = await prisma.publicNotice.findMany({
      where: {
        category: {
          equals: category,
          mode: 'insensitive'
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(notices);
  } catch (error) {
    console.error('Error fetching public notices by category:', error);
    res.status(500).json({ error: 'Failed to fetch public notices by category' });
  }
}; 