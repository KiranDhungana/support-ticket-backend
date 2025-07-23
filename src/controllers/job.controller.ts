import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all active jobs with pagination and filtering
export const getJobs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const type = req.query.type as string;
    const isRemote = req.query.isRemote as string;
    const isUrgent = req.query.isUrgent as string;

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (isRemote !== undefined) {
      where.isRemote = isRemote === 'true';
    }

    if (isUrgent !== undefined) {
      where.isUrgent = isUrgent === 'true';
    }

    // Get jobs with pagination
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isUrgent: 'desc' },
          { postedDate: 'desc' }
        ]
      }),
      prisma.job.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get a single job by ID
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

// Create a new job (admin only)
export const createJob = async (req: Request, res: Response) => {
  try {
    const {
      title,
      company,
      location,
      type,
      category,
      salary,
      experience,
      description,
      requirements,
      benefits,
      isRemote,
      isUrgent
    } = req.body;

    // Validate required fields
    if (!title || !company || !location || !type || !category || !salary || !experience || !description) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const job = await prisma.job.create({
      data: {
        title,
        company,
        location,
        type,
        category,
        salary,
        experience,
        description,
        requirements: requirements || [],
        benefits: benefits || [],
        isRemote: isRemote || false,
        isUrgent: isUrgent || false
      }
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

// Update a job (admin only)
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      company,
      location,
      type,
      category,
      salary,
      experience,
      description,
      requirements,
      benefits,
      isRemote,
      isUrgent,
      isActive
    } = req.body;

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id }
    });

    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        title,
        company,
        location,
        type,
        category,
        salary,
        experience,
        description,
        requirements: requirements || [],
        benefits: benefits || [],
        isRemote: isRemote || false,
        isUrgent: isUrgent || false,
        isActive: isActive !== undefined ? isActive : existingJob.isActive
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

// Delete a job (admin only)
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id }
    });

    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    await prisma.job.delete({
      where: { id }
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

// Toggle job active status (admin only)
export const toggleJobStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingJob = await prisma.job.findUnique({
      where: { id }
    });

    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        isActive: !existingJob.isActive
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error toggling job status:', error);
    res.status(500).json({ error: 'Failed to toggle job status' });
  }
};

// Get job categories
export const getJobCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.job.findMany({
      select: {
        category: true
      },
      where: {
        isActive: true
      },
      distinct: ['category']
    });

    const categoryList = categories.map(cat => cat.category);
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching job categories:', error);
    res.status(500).json({ error: 'Failed to fetch job categories' });
  }
};

// Get job types
export const getJobTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.job.findMany({
      select: {
        type: true
      },
      where: {
        isActive: true
      },
      distinct: ['type']
    });

    const typeList = types.map(t => t.type);
    res.json(typeList);
  } catch (error) {
    console.error('Error fetching job types:', error);
    res.status(500).json({ error: 'Failed to fetch job types' });
  }
}; 